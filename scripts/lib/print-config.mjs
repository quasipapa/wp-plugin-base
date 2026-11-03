#!/usr/bin/env node
/**
 * Prints plugin.config.json as shell assignments for eval:
 *   eval "$(node scripts/lib/print-config.mjs)"
 * Keys: NAME, SLUG, TEXT_DOMAIN, NAMESPACE, PREFIX, AUTHOR, REPO, LICENSE,
 * MAIN_FILE, BLOCK_NAME, I18N_USE_MAP (JSON), PACKAGE_FILES (JSON),
 * PACKAGE_DIRS (JSON), DOCS_ROOT_FILES (JSON).
 */
import { loadConfig } from './config.mjs';

const cfg = loadConfig();

const shellQuote = ( value ) =>
	`'${ String( value ).replace( /'/g, `'\\''` ) }'`;

console.log( `NAME=${ shellQuote( cfg.name ) }` );
console.log( `SLUG=${ shellQuote( cfg.slug ) }` );
console.log( `TEXT_DOMAIN=${ shellQuote( cfg.textDomain ) }` );
console.log( `NAMESPACE=${ shellQuote( cfg.namespace ) }` );
console.log( `PREFIX=${ shellQuote( cfg.prefix ) }` );
console.log( `AUTHOR=${ shellQuote( cfg.author ) }` );
console.log( `REPO=${ shellQuote( cfg.repo ) }` );
console.log( `LICENSE=${ shellQuote( cfg.license ) }` );
console.log(
	`MAIN_FILE=${ shellQuote( cfg.mainFile ?? `${ cfg.slug }.php` ) }`
);
console.log( `BLOCK_NAME=${ shellQuote( cfg.blockName ?? '' ) }` );
console.log(
	`I18N_USE_MAP=${ shellQuote( JSON.stringify( cfg.i18nUseMap ?? {} ) ) }`
);
// List fields are emitted as double-quoted, space-separated words (the
// values are slug/file names without spaces or shell metacharacters).
const shellList = ( values ) => ( values ?? [] ).join( ' ' );
console.log( `PACKAGE_FILES="${ shellList( cfg.packageFiles ) }"` );
console.log( `PACKAGE_DIRS="${ shellList( cfg.packageDirs ) }"` );
console.log( `DOCS_ROOT_FILES="${ shellList( cfg.docsRootFiles ) }"` );
