const { defineConfig } = require( '@playwright/test' );

module.exports = defineConfig( {
	testDir: './tests',
	testMatch: '**/*.pw.js',
	workers: 1,
	use: { browserName: 'chromium', headless: true },
} );
