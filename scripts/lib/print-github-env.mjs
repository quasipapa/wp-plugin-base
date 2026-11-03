#!/usr/bin/env node
/**
 * Prints plugin.config.json as GITHUB_ENV lines so workflows can use
 * ${{ env.SLUG }} etc.
 */
import { appendFileSync } from 'node:fs';
import { loadConfig } from './config.mjs';

const cfg = loadConfig();
const envFile = process.env.GITHUB_ENV;

const lines = {
	PLUGIN_NAME: cfg.name,
	SLUG: cfg.slug,
	TEXT_DOMAIN: cfg.textDomain,
	NAMESPACE: cfg.namespace,
	PREFIX: cfg.prefix,
	AUTHOR: cfg.author,
	REPO: cfg.repo,
	MAIN_FILE: cfg.mainFile ?? `${ cfg.slug }.php`,
	BLOCK_NAME: cfg.blockName ?? '',
	PACKAGE_ZIP: `dist/${ cfg.slug }.zip`,
};

const body = Object.entries( lines )
	.map( ( [ key, value ] ) => `${ key }=${ value }` )
	.join( '\n' );

if ( envFile ) {
	appendFileSync( envFile, body + '\n' );
} else {
	console.log( body );
}
