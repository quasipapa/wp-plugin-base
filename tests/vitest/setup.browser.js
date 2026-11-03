import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Browser Mode runs in a real browser, so the jsdom setup file does not
// apply; only the React cleanup is needed between tests.
afterEach( () => {
	cleanup();
} );
