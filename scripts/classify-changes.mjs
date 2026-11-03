import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const editorialFiles = new Set( [
	'AGENTS.md',
	'README.md',
	'SECURITY.md',
	'.github/pull_request_template.md',
	'.github/ISSUE_TEMPLATE/config.yml',
	'.github/ISSUE_TEMPLATE/bug-report.yml',
	'.github/ISSUE_TEMPLATE/work-item.yml',
] );
const metadataFiles = new Set( [
	'readme.txt',
	'LICENSE',
	'THIRD_PARTY_NOTICES.md',
] );

export function classifyChanges( paths, forceFull = false ) {
	if ( forceFull || paths.length === 0 ) return 'full';
	let result = 'docs-only';
	for ( const path of paths ) {
		if (
			path
				.split( '/' )
				.some( ( part ) => ! part || part === '.' || part === '..' )
		)
			return 'full';
		if (
			editorialFiles.has( path ) ||
			/^docs\/(?:[^/]+\/)*[^/]+\.md$/.test( path )
		)
			continue;
		if ( metadataFiles.has( path ) ) {
			result = 'metadata';
			continue;
		}
		return 'full';
	}
	return result;
}

export function classifyEvent( eventName, event, diff ) {
	// Pushes and manual dispatches deliberately retain complete verification.
	if ( eventName !== 'pull_request' ) return 'full';
	if ( event.pull_request.labels.some( ( { name } ) => name === 'ci:full' ) )
		return 'full';
	const { base, head } = event.pull_request;
	if (
		! [ base.sha, head.sha ].every( ( sha ) =>
			/^[0-9a-f]{40}$/.test( sha )
		)
	)
		throw new Error( 'Invalid PR revisions' );
	// Disable rename detection so both old and new paths affect the result.
	return classifyChanges( diff( base.sha, head.sha, base.ref ) );
}

if (
	process.argv[ 1 ] &&
	import.meta.url === pathToFileURL( process.argv[ 1 ] ).href
) {
	let classification = 'full';
	try {
		classification = classifyEvent(
			process.env.GITHUB_EVENT_NAME,
			JSON.parse( readFileSync( process.env.GITHUB_EVENT_PATH, 'utf8' ) ),
			( base, head, baseRef ) => {
				const actualBase = execFileSync(
					'git',
					[
						'rev-parse',
						'--verify',
						`refs/remotes/origin/${ baseRef }^{commit}`,
					],
					{ encoding: 'utf8' }
				).trim();
				if ( actualBase !== base )
					throw new Error(
						'PR base SHA differs from fetched target branch'
					);
				return execFileSync(
					'git',
					[
						'diff',
						'--name-only',
						'--no-renames',
						'-z',
						`${ base }...${ head }`,
						'--',
					],
					{ encoding: 'utf8' }
				)
					.split( '\0' )
					.filter( Boolean );
			}
		);
	} catch ( error ) {
		console.warn(
			`Could not classify changes; running full CI: ${ error.message }`
		);
	}
	console.log( `Change class: ${ classification }` );
	appendFileSync(
		process.env.GITHUB_OUTPUT,
		`classification=${ classification }\n`
	);
}
