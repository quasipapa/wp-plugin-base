#!/usr/bin/env node
/**
 * Initializes a freshly generated wp-plugin-base project:
 * 1. replaces {{PLACEHOLDER}} tokens in all text files,
 * 2. renames the bootstrap file to <slug>.php,
 * 3. writes template-meta/base-lock.json with the hashes of all managed files.
 *
 * Usage:
 *   node scripts/init-template.mjs --name "My Plugin" --slug my-plugin \
 *     --author quasipapa --repo quasipapa/my-plugin [--license GPL-2.0-or-later]
 */
import { createHash } from 'node:crypto';
import {
	existsSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	statSync,
	writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve( dirname( fileURLToPath( import.meta.url ) ), '..' );

function arg( name, fallback ) {
	const index = process.argv.indexOf( `--${ name }` );
	if ( index !== -1 ) return process.argv[ index + 1 ];
	return fallback;
}

function constantPrefix( slug ) {
	return slug.replace( /[-_]/g, '' ).toUpperCase();
}

const slug = arg( 'slug' );
if ( ! slug || ! /^[a-z0-9-]+$/.test( slug ) ) {
	console.error( 'Missing or invalid --slug (lowercase, digits, dashes).' );
	process.exit( 1 );
}

const values = {
	NAME: arg( 'name', slug ),
	SLUG: slug,
	TEXT_DOMAIN: arg( 'text-domain', slug ),
	NAMESPACE: arg( 'namespace', constantPrefix( slug ) ),
	PREFIX: arg( 'prefix', slug.replace( /-/g, '_' ) ),
	AUTHOR: arg( 'author', '' ),
	REPO: arg( 'repo', '' ),
	LICENSE: arg( 'license', 'GPL-2.0-or-later' ),
};

if ( ! values.AUTHOR || ! values.REPO ) {
	console.error( 'Missing --author or --repo.' );
	process.exit( 1 );
}

const skipDirs = new Set( [
	'.git',
	'node_modules',
	'vendor',
	'build',
	'dist',
] );
const binaryExtensions = new Set( [
	'.png',
	'.jpg',
	'.jpeg',
	'.gif',
	'.webp',
	'.zip',
	'.mo',
	'.ico',
] );

function* walk( dir ) {
	for ( const entry of readdirSync( dir ) ) {
		if ( skipDirs.has( entry ) ) continue;
		const path = join( dir, entry );
		if ( statSync( path ).isDirectory() ) {
			yield* walk( path );
		} else {
			yield path;
		}
	}
}

const tokenPattern =
	/\{\{(NAME|SLUG|TEXT_DOMAIN|NAMESPACE|PREFIX|AUTHOR|REPO|LICENSE)\}\}/g;

// Write the concrete plugin configuration (the template ships example values).
const config = {
	$schema: './template-meta/plugin.config.schema.json',
	name: values.NAME,
	slug,
	textDomain: values.TEXT_DOMAIN,
	namespace: values.NAMESPACE,
	prefix: values.PREFIX,
	author: values.AUTHOR,
	repo: values.REPO,
	license: values.LICENSE,
	mainFile: `${ slug }.php`,
	readme: 'readme.txt',
	blockName: `${ slug }/example`,
	i18nUseMap: {
		'src/edit.jsx': 'build/index.js',
		'src/index.js': 'build/index.js',
		'src/view.js': 'build/view.js',
	},
	packageFiles: [
		`${ slug }.php`,
		'readme.txt',
		'LICENSE',
		'THIRD_PARTY_NOTICES.md',
	],
	packageDirs: [ 'build', 'includes', 'languages' ],
	requiredPackageEntries: [
		'build/block.json',
		'build/render.php',
		'build/index.js',
		'build/index.asset.php',
		'build/index.css',
		'build/view.js',
		'build/view.asset.php',
		'build/style-index.css',
	],
	docsRootFiles: [
		'AGENTS.md',
		'README.md',
		'SECURITY.md',
		'THIRD_PARTY_NOTICES.md',
	],
};
writeFileSync(
	join( root, 'plugin.config.json' ),
	JSON.stringify( config, null, '\t' ) + '\n'
);

// Rewrite the package names in package.json / package-lock.json.
for ( const manifest of [ 'package.json', 'package-lock.json' ] ) {
	const path = join( root, manifest );
	if ( ! existsSync( path ) ) continue;
	const json = JSON.parse( readFileSync( path, 'utf8' ) );
	json.name = slug;
	if ( json.packages?.[ '' ] ) json.packages[ '' ].name = slug;
	writeFileSync( path, JSON.stringify( json, null, '\t' ) + '\n' );
}

// Rename and rewrite the shipped language catalogs to the new slug/domain.
const languagesDir = join( root, 'languages' );
if ( existsSync( languagesDir ) ) {
	for ( const entry of readdirSync( languagesDir ) ) {
		const path = join( languagesDir, entry );
		const content = readFileSync( path, 'utf8' );
		writeFileSync( path, content.replaceAll( 'example-plugin', slug ) );
		if ( entry.includes( 'example-plugin' ) ) {
			renameSync(
				path,
				join( languagesDir, entry.replaceAll( 'example-plugin', slug ) )
			);
		}
	}
}

let replaced = 0;
for ( const path of walk( root ) ) {
	const ext = path.slice( path.lastIndexOf( '.' ) );
	if ( binaryExtensions.has( ext ) ) continue;
	if (
		path.endsWith( 'plugin.config.json' ) ||
		path.endsWith( 'base-lock.json' )
	)
		continue;
	if ( path.includes( `${ sep }languages${ sep }` ) ) continue;
	const content = readFileSync( path, 'utf8' );
	if ( ! tokenPattern.test( content ) ) continue;
	tokenPattern.lastIndex = 0;
	const next = content.replace( tokenPattern, ( _, key ) => values[ key ] );
	writeFileSync( path, next );
	replaced++;
}

// Rename the bootstrap file to <slug>.php.
const bootstrap = join( root, 'plugin-main.php' );
if ( existsSync( bootstrap ) ) {
	renameSync( bootstrap, join( root, `${ slug }.php` ) );
}

// Project-scope root files replace the base-scope ones; base-only
// documentation (template-docs/) is removed from the derived project.
for ( const file of [ 'README.md', 'AGENTS.md' ] ) {
	const skeleton = join( root, 'template-meta/project', file );
	if ( existsSync( skeleton ) ) {
		renameSync( skeleton, join( root, file ) );
	}
}
rmSync( join( root, 'template-docs' ), { recursive: true, force: true } );

// Re-format after placeholder replacement when dependencies are installed.
const prettier = join( root, 'node_modules/.bin/prettier' );
if ( existsSync( prettier ) ) {
	const { execFileSync } = await import( 'node:child_process' );
	execFileSync(
		prettier,
		[
			'--config',
			'node_modules/@wordpress/prettier-config/lib/index.js',
			'--write',
			'**/*.{cjs,js,json,mjs,yml,yaml}',
		],
		{ cwd: root, stdio: 'inherit' }
	);
}

// Write the base lock for audit/upgrade.
const managedList = readFileSync(
	join( root, 'template-meta/managed-files.txt' ),
	'utf8'
)
	.split( '\n' )
	.map( ( line ) => line.trim() )
	.filter( ( line ) => line && ! line.startsWith( '#' ) );

const managedFiles = {};
for ( const file of managedList ) {
	const path = join( root, file );
	if ( ! existsSync( path ) ) continue;
	managedFiles[ file ] = createHash( 'sha256' )
		.update( readFileSync( path ) )
		.digest( 'hex' );
}

const baseVersion = arg( 'base-version', 'v0.0.0' );
writeFileSync(
	join( root, 'template-meta/base-lock.json' ),
	JSON.stringify(
		{
			baseRepo: 'quasipapa/wp-plugin-base',
			baseVersion,
			managedFiles,
		},
		null,
		'\t'
	) + '\n'
);

console.log(
	`Initialized ${ values.NAME } (${ slug }) from wp-plugin-base ${ baseVersion }: ` +
		`${ replaced } files templated, ${ Object.keys( managedFiles ).length } managed files locked.`
);
