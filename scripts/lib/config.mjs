import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const moduleRoot = resolve(
	dirname( fileURLToPath( import.meta.url ) ),
	'../..'
);

const cache = new Map();

export function loadConfig( root = moduleRoot ) {
	if ( ! cache.has( root ) ) {
		cache.set(
			root,
			JSON.parse(
				readFileSync( resolve( root, 'plugin.config.json' ), 'utf8' )
			)
		);
	}
	return cache.get( root );
}

export function loadBaseLock( root = moduleRoot ) {
	return JSON.parse(
		readFileSync( resolve( root, 'template-meta/base-lock.json' ), 'utf8' )
	);
}
