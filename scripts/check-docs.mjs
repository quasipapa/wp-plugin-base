import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectMarkdown } from './markdown-contract.mjs';
import { loadConfig } from './lib/config.mjs';
import { lint } from 'markdownlint/sync';

const root = resolve( dirname( fileURLToPath( import.meta.url ) ), '..' );
const config = loadConfig( root );
const readIfExists = ( path ) =>
	existsSync( join( root, path ) )
		? readFileSync( join( root, path ), 'utf8' )
		: null;
const roots = [ 'docs', '.github' ].map( ( path ) => join( root, path ) );
if ( existsSync( join( root, 'template-docs' ) ) )
	roots.push( join( root, 'template-docs' ) );
if ( existsSync( join( root, 'template-meta/project' ) ) )
	roots.push( join( root, 'template-meta/project' ) );
const files = (
	config.docsRootFiles ?? [
		'AGENTS.md',
		'README.md',
		'SECURITY.md',
		'THIRD_PARTY_NOTICES.md',
	]
).map( ( path ) => join( root, path ) );

function collectMarkdown( path ) {
	if ( ! existsSync( path ) ) {
		return;
	}
	if ( statSync( path ).isDirectory() ) {
		for ( const entry of readdirSync( path ) ) {
			collectMarkdown( join( path, entry ) );
		}
		return;
	}
	if ( extname( path ) === '.md' ) {
		files.push( path );
	}
}

for ( const path of roots ) {
	collectMarkdown( path );
}

// Documentation scope markers: base-scope files describe wp-plugin-base itself
// (template-docs/, root README/AGENTS in the base repo), project-scope files
// are the skeleton derived plugins inherit.
const isBaseRepo = existsSync( join( root, 'template-docs' ) );
const expectedScope = ( file ) => {
	const rel = relative( root, file );
	if ( rel.startsWith( `template-docs${ sep }` ) ) return 'base';
	if (
		rel.startsWith( `docs${ sep }` ) ||
		rel.startsWith( `template-meta${ sep }project${ sep }` )
	)
		return 'project';
	if ( rel === 'README.md' || rel === 'AGENTS.md' )
		return isBaseRepo ? 'base' : 'project';
	return null;
};

const errors = [];
for ( const file of files ) {
	const scope = expectedScope( file );
	if ( ! scope ) continue;
	const head = readFileSync( file, 'utf8' ).slice( 0, 200 );
	const marker = head.match( /^---\n[\s\S]*?scope:\s*(\w+)/ )?.[ 1 ];
	if ( marker !== scope )
		errors.push(
			`${ relative( root, file ) }: expected frontmatter scope: ${ scope }, found ${ marker ?? 'none' }`
		);
}

const markdownErrors = lint( {
	files,
	config: JSON.parse(
		readFileSync( join( root, '.markdownlint.json' ), 'utf8' )
	),
} );
for ( const [ file, violations ] of Object.entries( markdownErrors ) ) {
	for ( const violation of violations ) {
		errors.push(
			`${ relative( root, file ) }:${ violation.lineNumber }: ${ violation.ruleNames.join( '/' ) } ${ violation.errorDetail ?? '' }`
		);
	}
}
const anchorsByFile = new Map();
const stableIds = new Map();

const linksByFile = new Map();

// Skeleton files under template-meta/project/ land at the project root after
// init, so their relative links resolve from the root, not their template path.
const linkBaseDir = ( file ) => {
	const rel = relative( root, file );
	if ( rel.startsWith( `template-meta${ sep }project${ sep }` ) ) return root;
	return dirname( file );
};

for ( const file of files ) {
	const source = readFileSync( file, 'utf8' );
	const { anchors, explicitIds, links } = inspectMarkdown( source );
	if ( explicitIds.length !== new Set( explicitIds ).size )
		errors.push( `${ relative( root, file ) }: duplicate explicit ID` );
	anchorsByFile.set( file, anchors );
	linksByFile.set( file, links );

	for ( const anchor of anchors ) {
		if (
			! /^(?:rm|idea|fr|man|nfr(?:-priv|-a11y)?)-\d{3}$/.test( anchor )
		) {
			continue;
		}
		if ( stableIds.has( anchor ) ) {
			errors.push(
				`Duplicate stable ID ${ anchor }: ${ relative( root, stableIds.get( anchor ) ) } and ${ relative( root, file ) }`
			);
		} else {
			stableIds.set( anchor, file );
		}
	}
}

for ( const file of files ) {
	for ( const rawTarget of linksByFile.get( file ) ) {
		if ( /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test( rawTarget ) ) {
			continue;
		}
		const [ rawPath, rawFragment = '' ] = rawTarget.split( '#', 2 );
		const target = rawPath
			? resolve( linkBaseDir( file ), decodeURI( rawPath ) )
			: file;
		if ( ! existsSync( target ) ) {
			errors.push(
				`${ relative( root, file ) }: missing ${ rawTarget }`
			);
			continue;
		}
		if (
			! rawFragment ||
			statSync( target ).isDirectory() ||
			extname( target ) !== '.md'
		) {
			continue;
		}
		const anchor = decodeURIComponent( rawFragment );
		if ( ! anchorsByFile.get( target )?.has( anchor ) ) {
			errors.push(
				`${ relative( root, file ) }: missing anchor ${ rawTarget }`
			);
		}
	}
}

const traceabilitySource = readIfExists( 'docs/traceability.md' );
if ( traceabilitySource ) {
	for ( const stableId of stableIds.keys() ) {
		if (
			/^(?:rm|idea)-\d{3}$/.test( stableId ) &&
			! traceabilitySource.includes( `#${ stableId })` )
		) {
			errors.push(
				`Traceability index does not reference ${ stableId }`
			);
		}
	}
}
const adrNumbers = new Set();
const overviewSource = readIfExists( 'docs/architecture/overview.md' ) ?? '';
const decisionsDir = join( root, 'docs/architecture/decisions' );
for ( const name of existsSync( decisionsDir )
	? readdirSync( decisionsDir )
	: [] ) {
	const number = name.match( /^(\d{4})-.+\.md$/ )?.[ 1 ];
	if ( ! number ) continue;
	if ( adrNumbers.has( number ) )
		errors.push( `Invalid or duplicate ADR number: ${ name }` );
	adrNumbers.add( number );
	if ( ! overviewSource.includes( `decisions/${ name })` ) )
		errors.push( `Architecture overview does not reference ${ name }` );
}

const coverageSource = readIfExists( 'docs/testing/coverage.md' );
if ( coverageSource ) {
	for ( const stableId of stableIds.keys() ) {
		if ( /^(?:fr|nfr(?:-priv|-a11y)?)-\d{3}$/.test( stableId ) ) {
			if ( ! coverageSource.includes( `#${ stableId })` ) ) {
				errors.push(
					`Coverage matrix does not reference ${ stableId }`
				);
			}
		}
		if ( /^man-\d{3}$/.test( stableId ) ) {
			if (
				! coverageSource.includes(
					`manual-acceptance.md#${ stableId }`
				)
			) {
				errors.push(
					`Coverage matrix does not reference ${ stableId }`
				);
			}
		}
	}
}

const versionMatrix = readFileSync(
	join( root, 'docs/development/versions.md' ),
	'utf8'
);

function matrixValue( label ) {
	const escapedLabel = label.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
	return versionMatrix.match(
		new RegExp( '^\\| ' + escapedLabel + ' \\| `([^`]+)` \\|', 'm' )
	)?.[ 1 ];
}

function checkVersion( label, expected, references ) {
	const documented = matrixValue( label );
	if ( documented !== expected ) {
		errors.push(
			`Version matrix ${ label }: expected ${ expected }, found ${ documented ?? 'no value' }`
		);
	}
	for ( const [ name, value ] of references ) {
		if ( value !== expected ) {
			errors.push(
				`${ name }: expected ${ expected }, found ${ value ?? 'no value' }`
			);
		}
	}
}

function capture( source, pattern ) {
	return source.match( pattern )?.[ 1 ];
}

function minimum( versionRange ) {
	return versionRange?.replace( /^[<>=~^\s]+/, '' );
}

const packageJson = JSON.parse(
	readFileSync( join( root, 'package.json' ), 'utf8' )
);
const composerJson = JSON.parse(
	readFileSync( join( root, 'composer.json' ), 'utf8' )
);
const wpEnv = JSON.parse(
	readFileSync( join( root, '.wp-env.json' ), 'utf8' )
);
const wpEnvTest = JSON.parse(
	readFileSync( join( root, '.wp-env.test.json' ), 'utf8' )
);
const ciWorkflow = readFileSync(
	join( root, '.github/workflows/ci.yml' ),
	'utf8'
);
const releaseWorkflow = readFileSync(
	join( root, '.github/workflows/release.yml' ),
	'utf8'
);
const composerScript = readFileSync(
	join( root, 'scripts/composer.sh' ),
	'utf8'
);
const localTests = readFileSync(
	join( root, 'scripts/local-tests.sh' ),
	'utf8'
);
const pluginHeader = readFileSync(
	join( root, config.mainFile ?? `${ config.slug }.php` ),
	'utf8'
);
const pluginReadme = readFileSync( join( root, 'readme.txt' ), 'utf8' );
const qualityRequirements = readIfExists( 'docs/requirements/quality.md' );
const platformDecision = readIfExists(
	'docs/architecture/decisions/0002-minimum-wordpress-and-dynamic-rendering.md'
);

const wordpressMinimum = capture(
	pluginHeader,
	/Requires at least:\s*([^\s*]+)/
);
const wordpressChecks = [
	[
		'readme.txt WordPress minimum',
		capture( pluginReadme, /Requires at least:\s*(\S+)/ ),
	],
];
if ( qualityRequirements ) {
	wordpressChecks.push( [
		'NFR WordPress minimum',
		capture(
			qualityRequirements,
			/minimum platform is WordPress ([\d.]+)/
		),
	] );
}
if ( platformDecision ) {
	wordpressChecks.push( [
		'Platform ADR WordPress minimum',
		capture( platformDecision, /Require WordPress ([\d.]+)/ ),
	] );
}
checkVersion(
	'Supported WordPress minimum',
	wordpressMinimum,
	wordpressChecks
);

const phpMinimum = minimum( composerJson.require.php );
const phpChecks = [
	[
		'composer.json PHP platform',
		minimum( composerJson.config.platform.php )
			.split( '.' )
			.slice( 0, 2 )
			.join( '.' ),
	],
	[
		'plugin header PHP minimum',
		capture( pluginHeader, /Requires PHP:\s*([^\s*]+)/ ),
	],
	[
		'readme.txt PHP minimum',
		capture( pluginReadme, /Requires PHP:\s*(\S+)/ ),
	],
];
if ( qualityRequirements ) {
	phpChecks.push( [
		'NFR PHP minimum',
		capture(
			qualityRequirements,
			/minimum platform is WordPress [\d.]+ and PHP (\d+\.\d+)/
		),
	] );
}
if ( platformDecision ) {
	phpChecks.push( [
		'Platform ADR PHP minimum',
		capture( platformDecision, /Require PHP ([\d.]+)/ ),
	] );
}
checkVersion( 'Supported PHP minimum', phpMinimum, phpChecks );

const nodeMinimum = minimum( packageJson.engines.node );
checkVersion( 'Node.js minimum and CI selection', nodeMinimum, [
	[
		'CI Node.js version',
		capture( ciWorkflow, /NODE_VERSION:\s*'([^']+)'/ ),
	],
	[
		'Release Node.js version',
		capture( releaseWorkflow, /NODE_VERSION:\s*'([^']+)'/ ),
	],
] );

checkVersion( 'npm minimum', minimum( packageJson.engines.npm ), [] );

const composerVersion = capture(
	composerScript,
	/COMPOSER_IMAGE='composer:([^']+)'/
);
const composerFixtureReferences = [
	'tests/accessibility/player.pw.js',
	'tests/responsive/layout.pw.js',
]
	.filter( ( path ) => existsSync( join( root, path ) ) )
	.flatMap( ( path ) =>
		[
			...readFileSync( join( root, path ), 'utf8' ).matchAll(
				/composer:([\d.]+)/g
			),
		].map( ( match, index ) => [
			`${ path } Composer reference ${ index + 1 }`,
			match[ 1 ],
		] )
	);
checkVersion( 'Composer', composerVersion, [
	[ 'CI Composer version', capture( ciWorkflow, /tools:\s*composer:(\S+)/ ) ],
	...composerFixtureReferences,
] );

const playwrightVersion = packageJson.devDependencies[ '@playwright/test' ];
checkVersion( 'Playwright', playwrightVersion, [
	[
		'local-tests.sh Playwright version',
		capture( localTests, /playwright_version="([^"]+)"/ ),
	],
] );

checkVersion( 'Daily PHP', wpEnv.phpVersion, [] );
checkVersion(
	'Integration WordPress',
	capture( wpEnvTest.core, /#([\d.]+)-branch$/ ),
	[]
);
checkVersion( 'Integration PHP', wpEnvTest.phpVersion, [] );

const phpMatrix = capture( ciWorkflow, /php:\s*\[([^\]]+)\]/ )
	?.match( /['"]([^'"]+)['"]/g )
	?.map( ( value ) => value.slice( 1, -1 ) )
	.join( ', ' );
checkVersion( 'CI PHP matrix', phpMatrix, [] );

const ciRunners = [
	...ciWorkflow.matchAll( /^\s*runs-on:\s*(\S+)/gm ),
	...releaseWorkflow.matchAll( /^\s*runs-on:\s*(\S+)/gm ),
].map( ( match ) => match[ 1 ] );
const githubRunner = ciRunners[ 0 ];
checkVersion(
	'GitHub runner',
	githubRunner,
	ciRunners.map( ( runner, index ) => [
		`Workflow runner ${ index + 1 }`,
		runner,
	] )
);

if ( wpEnv.core !== null ) {
	errors.push(
		'.wp-env.json: Daily WordPress must select the current release'
	);
}

if ( errors.length > 0 ) {
	console.error( errors.join( '\n' ) );
	process.exitCode = 1;
} else {
	console.log(
		`Documentation check passed (${ files.length } Markdown files, ${ stableIds.size } stable IDs).`
	);
}
