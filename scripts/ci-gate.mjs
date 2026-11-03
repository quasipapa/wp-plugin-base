import { pathToFileURL } from 'node:url';

export function gateErrors( needs ) {
	const classification = needs.changes?.outputs?.classification;
	const expected = {
		'docs-only': [ 'changes', 'docs' ],
		metadata: [ 'changes', 'docs', 'metadata' ],
		full: [
			'changes',
			'docs',
			'build-and-version',
			'php',
			'javascript',
			'wordpress',
			'ci-artifact',
		],
	}[ classification ];
	if ( ! expected ) return [ 'Missing or unknown change classification' ];
	const errors = expected
		.filter( ( job ) => needs[ job ]?.result !== 'success' )
		.map(
			( job ) =>
				`${ job }: expected success, got ${ needs[ job ]?.result ?? 'missing' }`
		);
	for ( const [ job, { result } ] of Object.entries( needs ) ) {
		if ( ! expected.includes( job ) && result !== 'skipped' )
			errors.push( `${ job }: expected skipped, got ${ result }` );
	}
	return errors;
}

if (
	process.argv[ 1 ] &&
	import.meta.url === pathToFileURL( process.argv[ 1 ] ).href
) {
	const errors = gateErrors( JSON.parse( process.env.CI_NEEDS ) );
	if ( errors.length ) {
		console.error( errors.join( '\n' ) );
		process.exitCode = 1;
	} else {
		console.log(
			'All required jobs passed; unused jobs were deliberately skipped.'
		);
	}
}
