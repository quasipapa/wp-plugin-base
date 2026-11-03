#!/usr/bin/env node
/**
 * Audits a derived wp-plugin-base project against its base lock:
 * - unchanged / locally modified / upgrade-available per managed file
 * - latest available base release vs. the locked baseVersion
 *
 * Usage: node scripts/base-audit.mjs [--json]
 * Exit code 0 always; the report is the output. (CI uses --json for gating
 * on unexpected drift when desired.)
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadBaseLock, loadConfig, moduleRoot } from './lib/config.mjs';

const args = process.argv.slice( 2 );
const asJson = args.includes( '--json' );

const cfg = loadConfig( moduleRoot );
const lock = loadBaseLock( moduleRoot );

const hash = ( path ) =>
	createHash( 'sha256' ).update( readFileSync( path ) ).digest( 'hex' );

const report = {
	baseRepo: lock.baseRepo,
	baseVersion: lock.baseVersion,
	files: {},
};

for ( const [ file, lockedHash ] of Object.entries( lock.managedFiles ) ) {
	const path = join( moduleRoot, file );
	if ( ! existsSync( path ) ) {
		report.files[ file ] = { status: 'missing' };
		continue;
	}
	const local = hash( path );
	if ( local === lockedHash ) {
		report.files[ file ] = { status: 'unchanged' };
	} else {
		report.files[ file ] = { status: 'locally-modified', sha256: local };
	}
}

// Latest base release (best effort; offline runs skip this).
let latestBase = null;
try {
	const { execFileSync } = await import( 'node:child_process' );
	latestBase = execFileSync(
		'gh',
		[
			'api',
			`repos/${ lock.baseRepo }/releases/latest`,
			'--jq',
			'.tag_name',
		],
		{ encoding: 'utf8', stdio: [ 'ignore', 'pipe', 'ignore' ] }
	).trim();
} catch {
	latestBase = null;
}
report.latestBase = latestBase;
report.upgradeAvailable =
	latestBase && latestBase !== lock.baseVersion ? latestBase : null;

if ( asJson ) {
	console.log( JSON.stringify( report, null, 2 ) );
} else {
	const counts = { unchanged: 0, 'locally-modified': 0, missing: 0 };
	for ( const entry of Object.values( report.files ) )
		counts[ entry.status ]++;
	console.log(
		`Base: ${ report.baseRepo } @ ${ report.baseVersion }` +
			( report.latestBase ? ` (latest: ${ report.latestBase })` : '' )
	);
	console.log(
		`Managed files: ${ counts.unchanged } unchanged, ` +
			`${ counts[ 'locally-modified' ] } locally modified, ${ counts.missing } missing.`
	);
	for ( const [ file, entry ] of Object.entries( report.files ) ) {
		if ( entry.status !== 'unchanged' )
			console.log( `  ${ entry.status }: ${ file }` );
	}
	if ( report.upgradeAvailable )
		console.log(
			`Upgrade available: ${ report.baseVersion } -> ${ report.upgradeAvailable } ` +
				`(run: node scripts/base-upgrade.mjs --to ${ report.upgradeAvailable })`
		);
}
