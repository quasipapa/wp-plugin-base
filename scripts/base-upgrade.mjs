#!/usr/bin/env node
/**
 * Upgrades the base-managed files of a derived wp-plugin-base project to a
 * target base release on a new branch and opens a pull request.
 *
 * Usage: node scripts/base-upgrade.mjs --to v1.2.0 [--base quasipapa/wp-plugin-base]
 *
 * - fetches the managed files from the base repo at the target tag
 * - locally modified managed files are kept and listed as conflicts
 * - template-meta/base-lock.json is updated to the new base version + hashes
 * - creates branch base/upgrade-<tag> and a PR via gh
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadBaseLock, moduleRoot } from './lib/config.mjs';

const args = process.argv.slice( 2 );
const to = args[ args.indexOf( '--to' ) + 1 ];
const baseRepo =
	args[ args.indexOf( '--base' ) + 1 ] ?? 'quasipapa/wp-plugin-base';

if ( ! to || ! /^v\d+\.\d+\.\d+$/.test( to ) ) {
	console.error( 'Usage: node scripts/base-upgrade.mjs --to vX.Y.Z' );
	process.exit( 1 );
}

const run = ( cmd, cmdArgs, opts = {} ) =>
	execFileSync( cmd, cmdArgs, {
		encoding: 'utf8',
		stdio: 'inherit',
		...opts,
	} );

const lock = loadBaseLock( moduleRoot );
const managed = Object.keys( lock.managedFiles );

run( 'git', [ 'fetch', `https://github.com/${ baseRepo }.git`, to ] );
run( 'git', [ 'switch', '-c', `base/upgrade-${ to }` ] );

const conflicts = [];
for ( const file of managed ) {
	const localHash = existsSync( join( moduleRoot, file ) )
		? createHash( 'sha256' )
				.update( readFileSync( join( moduleRoot, file ) ) )
				.digest( 'hex' )
		: null;
	if ( localHash && localHash !== lock.managedFiles[ file ] ) {
		conflicts.push( file );
		continue; // keep the local modification
	}
	run( 'git', [ 'checkout', `FETCH_HEAD`, '--', file ] );
}

// Rewrite the lock to the new base version with the new hashes.
const newManaged = {};
for ( const file of managed ) {
	const path = join( moduleRoot, file );
	if ( existsSync( path ) )
		newManaged[ file ] = createHash( 'sha256' )
			.update( readFileSync( path ) )
			.digest( 'hex' );
}
writeFileSync(
	join( moduleRoot, 'template-meta/base-lock.json' ),
	JSON.stringify(
		{ baseRepo, baseVersion: to, managedFiles: newManaged },
		null,
		'\t'
	) + '\n'
);

run( 'git', [ 'add', '-A' ] );
run( 'git', [
	'commit',
	'-m',
	`chore(base): upgrade wp-plugin-base to ${ to }\n\nManaged files updated from ${ baseRepo }@${ to }.` +
		( conflicts.length
			? `\n\nLocally modified and kept: ${ conflicts.join( ', ' ) }`
			: '' ),
] );
run( 'git', [ 'push', '-u', 'origin', `base/upgrade-${ to }` ] );
run( 'gh', [
	'pr',
	'create',
	'--title',
	`chore(base): upgrade wp-plugin-base to ${ to }`,
	'--body',
	`Upgrades base-managed files from ${ baseRepo } to ${ to }.` +
		( conflicts.length
			? `\n\nLocally modified files kept unchanged: ${ conflicts.join( ', ' ) }`
			: '' ),
	'--head',
	`base/upgrade-${ to }`,
] );

console.log( `Upgrade to ${ to } prepared on branch base/upgrade-${ to }.` );
