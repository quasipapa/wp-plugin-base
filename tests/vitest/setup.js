import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, expect, vi } from 'vitest';

// Mirrors the browser globals previously provided by
// @wordpress/jest-preset-default's setup-globals script.
globalThis.SCRIPT_DEBUG = true;

if ( typeof window !== 'undefined' ) {
	window.setImmediate = ( callback ) => setTimeout( callback, 0 );

	window.requestIdleCallback = ( callback ) => {
		const start = Date.now();

		return setTimeout(
			() =>
				callback( {
					didTimeout: false,
					timeRemaining: () =>
						Math.max( 0, 50 - ( Date.now() - start ) ),
				} ),
			0
		);
	};

	window.cancelIdleCallback = ( handle ) => clearTimeout( handle );

	window.matchMedia = () => ( {
		matches: false,
		addListener: () => {},
		addEventListener: () => {},
		removeListener: () => {},
		removeEventListener: () => {},
	} );
}

// Replacement for @wordpress/jest-console: unexpected console output fails
// the test. Calls are captured in arrays because test files may restore all
// mocks in their own afterEach hooks.
let consoleErrors = [];
let consoleWarnings = [];

beforeEach( () => {
	consoleErrors = [];
	consoleWarnings = [];
	vi.spyOn( console, 'error' ).mockImplementation( ( ...args ) => {
		consoleErrors.push( args );
	} );
	vi.spyOn( console, 'warn' ).mockImplementation( ( ...args ) => {
		consoleWarnings.push( args );
	} );
} );

afterEach( () => {
	cleanup();
	vi.restoreAllMocks();
	expect( consoleErrors ).toEqual( [] );
	expect( consoleWarnings ).toEqual( [] );
} );
