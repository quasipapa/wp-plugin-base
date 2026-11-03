import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
	mkdtempSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { classifyChanges, classifyEvent } from './classify-changes.mjs';
import { gateErrors } from './ci-gate.mjs';
import { checkVersions, checkPackage } from './check-delivery.mjs';
import { inspectMarkdown } from './markdown-contract.mjs';
import { loadConfig } from './lib/config.mjs';

const cfg = loadConfig();

for ( const paths of [
	[ 'AGENTS.md' ],
	[ 'README.md' ],
	[ 'SECURITY.md' ],
	[ 'docs/operations/ci.md' ],
	[
		'docs/architecture/decisions/0007-test.md',
		'.github/pull_request_template.md',
	],
	[ '.github/ISSUE_TEMPLATE/bug-report.yml' ],
] )
	test( `Editorial paths: ${ paths }`, () =>
		assert.equal( classifyChanges( paths ), 'docs-only' ) );

for ( const path of [ 'readme.txt', 'LICENSE', 'THIRD_PARTY_NOTICES.md' ] ) {
	test( `Metadata with documentation: ${ path }`, () =>
		assert.equal(
			classifyChanges( [ 'docs/index.md', path ] ),
			'metadata'
		) );
}

for ( const path of [
	'src/index.js',
	'src/block.json',
	cfg.mainFile,
	'includes/test.php',
	'tests/unit/test.php',
	'package.json',
	'package-lock.json',
	'composer.json',
	'composer.lock',
	'.wp-env.json',
	'.github/workflows/ci.yml',
	'.github/dependabot.yml',
	'scripts/check-docs.mjs',
	'docs/mcp/config.toml',
	'docs/executable.js',
	'languages/code.php',
	'languages/test.po',
	'languages/test.pot',
	'languages/test.mo',
	'languages/test.json',
	'.markdownlint.json',
	'unknown',
	'../docs/test.md',
	'docs/../code.md',
	'/README.md',
] ) {
	test( `Full CI for ${ path }`, () =>
		assert.equal(
			classifyChanges( [ 'README.md', 'readme.txt', path ] ),
			'full'
		) );
}

test( 'Empty changes and explicit override select full CI', () => {
	assert.equal( classifyChanges( [] ), 'full' );
	assert.equal( classifyChanges( [ 'README.md' ], true ), 'full' );
} );

test( 'Event policy compares PR revisions; pushes and dispatches always run full', () => {
	const event = {
		pull_request: {
			labels: [],
			base: { sha: 'a'.repeat( 40 ) },
			head: { sha: 'b'.repeat( 40 ) },
		},
	};
	assert.equal(
		classifyEvent( 'pull_request', event, ( base, head ) => {
			assert.equal( base, event.pull_request.base.sha );
			assert.equal( head, event.pull_request.head.sha );
			return [ 'README.md' ];
		} ),
		'docs-only'
	);
	event.pull_request.labels.push( { name: 'ci:full' } );
	assert.equal(
		classifyEvent( 'pull_request', event, () => {
			throw new Error( 'must not diff' );
		} ),
		'full'
	);
	for ( const type of [ 'push', 'workflow_dispatch' ] )
		assert.equal(
			classifyEvent( type, {}, () => [] ),
			'full'
		);
} );

test( 'Git diff accounts for deleted and renamed executable files', ( t ) => {
	const root = mkdtempSync( join( tmpdir(), 'wppb-ci-git-' ) );
	t.after( () => rmSync( root, { recursive: true, force: true } ) );
	const git = ( ...args ) =>
		execFileSync( 'git', args, { cwd: root, encoding: 'utf8' } ).trim();
	git( 'init', '-q' );
	git( 'config', 'user.name', 'CI fixture' );
	git( 'config', 'user.email', 'ci@example.invalid' );
	writeFileSync( join( root, 'code.js' ), 'code\n' );
	git( 'add', '.' );
	git( 'commit', '-qm', 'base' );
	const base = git( 'rev-parse', 'HEAD' );
	git( 'mv', 'code.js', 'README.md' );
	git( 'commit', '-qm', 'rename' );
	const paths = git(
		'diff',
		'--name-only',
		'--no-renames',
		`${ base }...HEAD`
	).split( '\n' );
	assert.deepEqual( paths.sort(), [ 'README.md', 'code.js' ] );
	assert.equal( classifyChanges( paths ), 'full' );
} );

test( 'Classification CLI defaults safely to full on missing comparison data', ( t ) => {
	const root = mkdtempSync( join( tmpdir(), 'wppb-ci-event-' ) );
	t.after( () => rmSync( root, { recursive: true, force: true } ) );
	const eventPath = join( root, 'event.json' );
	const output = join( root, 'output' );
	writeFileSync( eventPath, '{}' );
	execFileSync( process.execPath, [ 'scripts/classify-changes.mjs' ], {
		env: {
			...process.env,
			GITHUB_EVENT_NAME: 'pull_request',
			GITHUB_EVENT_PATH: eventPath,
			GITHUB_OUTPUT: output,
		},
	} );
	assert.equal( readFileSync( output, 'utf8' ), 'classification=full\n' );
} );

test( 'Classification rejects stale base SHAs after retargeting and accepts matching docs diffs', ( t ) => {
	const root = mkdtempSync( join( tmpdir(), 'wppb-ci-retarget-' ) );
	t.after( () => rmSync( root, { recursive: true, force: true } ) );
	const git = ( ...args ) =>
		execFileSync( 'git', args, { cwd: root, encoding: 'utf8' } ).trim();
	git( 'init', '-q' );
	git( 'config', 'user.name', 'CI fixture' );
	git( 'config', 'user.email', 'ci@example.invalid' );
	writeFileSync( join( root, 'code.js' ), 'initial\n' );
	git( 'add', '.' );
	git( 'commit', '-qm', 'main' );
	const main = git( 'rev-parse', 'HEAD' );
	writeFileSync( join( root, 'code.js' ), 'changed\n' );
	git( 'add', '.' );
	git( 'commit', '-qm', 'feature' );
	const previousTarget = git( 'rev-parse', 'HEAD' );
	writeFileSync( join( root, 'README.md' ), '# Docs\n' );
	git( 'add', '.' );
	git( 'commit', '-qm', 'docs' );
	const head = git( 'rev-parse', 'HEAD' );
	git( 'update-ref', 'refs/remotes/origin/main', main );
	const eventPath = join( root, 'event.json' );
	const output = join( root, 'output' );
	writeFileSync(
		eventPath,
		JSON.stringify( {
			pull_request: {
				labels: [],
				base: { ref: 'main', sha: previousTarget },
				head: { sha: head },
			},
		} )
	);
	const run = () =>
		execFileSync(
			process.execPath,
			[ resolve( 'scripts/classify-changes.mjs' ) ],
			{
				cwd: root,
				env: {
					...process.env,
					GITHUB_EVENT_NAME: 'pull_request',
					GITHUB_EVENT_PATH: eventPath,
					GITHUB_OUTPUT: output,
				},
				stdio: [ 'pipe', 'pipe', 'pipe' ],
			}
		);
	run();
	assert.equal( readFileSync( output, 'utf8' ), 'classification=full\n' );
	git( 'update-ref', 'refs/remotes/origin/main', previousTarget );
	run();
	assert.equal(
		readFileSync( output, 'utf8' ),
		'classification=full\nclassification=docs-only\n'
	);
} );

const jobs = [
	'changes',
	'docs',
	'metadata',
	'build-and-version',
	'php',
	'javascript',
	'wordpress',
	'ci-artifact',
];
for ( const [ classification, selected ] of Object.entries( {
	'docs-only': [ 'changes', 'docs' ],
	metadata: [ 'changes', 'docs', 'metadata' ],
	full: jobs.filter( ( job ) => job !== 'metadata' ),
} ) ) {
	test( `Gate accepts intentional skips and rejects missing, failed or cancelled required jobs: ${ classification }`, () => {
		const needs = Object.fromEntries(
			jobs.map( ( job ) => [
				job,
				{ result: selected.includes( job ) ? 'success' : 'skipped' },
			] )
		);
		needs.changes.outputs = { classification };
		assert.deepEqual( gateErrors( needs ), [] );
		for ( const job of selected ) {
			for ( const result of [
				'failure',
				'cancelled',
				'skipped',
				undefined,
			] ) {
				const invalid = structuredClone( needs );
				invalid[ job ].result = result;
				assert.ok(
					gateErrors( invalid ).length,
					`${ job }: ${ result }`
				);
			}
		}
	} );
}
test( 'Gate rejects unknown classification', () =>
	assert.ok(
		gateErrors( { changes: { outputs: { classification: 'unknown' } } } )
			.length
	) );

test( 'Markdown links include reference links and images, excluding fenced examples', () => {
	const doc = inspectMarkdown(
		'# A *heading*\n\n# A *heading*\n\n[reference][r]\n\n[r]: target.md#anchor\n\n![image](img.png)\n\n```md\n# Fake\n[broken](missing.md)\n```\n'
	);
	assert.deepEqual( [ ...doc.anchors ], [ 'a-heading', 'a-heading-1' ] );
	assert.deepEqual( doc.links, [ 'target.md#anchor', 'img.png' ] );
} );

test( 'Versions reject invalid tags and inconsistent project metadata', ( t ) => {
	const root = mkdtempSync( join( tmpdir(), 'wppb-ci-version-' ) );
	t.after( () => rmSync( root, { recursive: true, force: true } ) );
	for ( const name of [
		'package.json',
		'composer.json',
		'src/block.json',
		cfg.mainFile,
		'plugin.config.json',
		'readme.txt',
	] ) {
		mkdirSync( dirname( join( root, name ) ), { recursive: true } );
		writeFileSync( join( root, name ), readFileSync( name ) );
	}
	assert.doesNotThrow( () => checkVersions( root, 'v0.1.0' ) );
	for ( const tag of [ 'v9.9.9', 'v0.1', '' ] )
		assert.throws( () => checkVersions( root, tag ) );
	writeFileSync(
		join( root, 'readme.txt' ),
		readFileSync( 'readme.txt', 'utf8' ).replace(
			'Stable tag: 0.1.0',
			'Stable tag: 9.9.9'
		)
	);
	assert.throws( () => checkVersions( root ), /Version mismatch/ );
} );

test( 'Raw HTML destinations are checked while HTML comments are ignored', () => {
	const doc = inspectMarkdown(
		'<a href="missing.md#anchor">Broken</a>\n\n<img src=missing.png alt="Image">\n\n<!-- <a href="example.md"> -->'
	);
	assert.deepEqual( doc.links, [ 'missing.md#anchor', 'missing.png' ] );
} );

test( 'Package checks reject corruption, unexpected content and missing required files', ( t ) => {
	const root = mkdtempSync( join( tmpdir(), 'wppb-ci-package-' ) );
	t.after( () => rmSync( root, { recursive: true, force: true } ) );
	const zip = join( root, 'fixture.zip' );
	const files = [
		cfg.mainFile,
		'readme.txt',
		'LICENSE',
		'THIRD_PARTY_NOTICES.md',
		'build/block.json',
		'build/render.php',
		'build/index.js',
		'build/index.asset.php',
		'build/index.css',
		'build/view.js',
		'build/view.asset.php',
		'build/style-index.css',
		'includes/example-a.php',
		'includes/example-b.php',
		'includes/example-c.php',
	];
	const build = ( names ) => {
		rmSync( zip, { force: true } );
		for ( const name of names ) {
			const path = join( root, cfg.slug, name );
			mkdirSync( dirname( path ), { recursive: true } );
			writeFileSync( path, 'fixture' );
		}
		execFileSync(
			'python3',
			[
				'-c',
				'import sys, zipfile\nwith zipfile.ZipFile(sys.argv[1], "w") as z:\n for name in sys.argv[2:]: z.write(name, name)',
				zip,
				...names.map( ( name ) => `${ cfg.slug }/${ name }` ),
			],
			{ cwd: root }
		);
		writeFileSync(
			`${ zip }.sha256`,
			createHash( 'sha256' )
				.update( readFileSync( zip ) )
				.digest( 'hex' ) + '  fixture.zip\n'
		);
	};
	build( files );
	assert.doesNotThrow( () => checkPackage( zip ) );
	writeFileSync( `${ zip }.sha256`, '0'.repeat( 64 ) );
	assert.throws( () => checkPackage( zip ), /checksum/ );
	build( [ ...files, 'src/code.js' ] );
	assert.throws( () => checkPackage( zip ), /Unexpected package entry/ );
	for ( const missing of [
		'build/block.json',
		'build/index.js',
		'build/view.asset.php',
		'build/style-index.css',
		cfg.mainFile,
	] ) {
		build( files.filter( ( name ) => name !== missing ) );
		assert.throws( () => checkPackage( zip ), /Missing package entry/ );
	}
} );
