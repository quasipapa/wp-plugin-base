import { fileURLToPath } from 'node:url';

import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const styleMock = fileURLToPath(
	new URL( './tests/vitest/style-mock.js', import.meta.url )
);

// The Playwright browser server can be provided externally (for example the
// Docker container used by scripts/local-tests.sh); otherwise Vitest launches
// a local Chromium.
const playwrightProviderOptions = process.env.PW_TEST_CONNECT_WS_ENDPOINT
	? {
			connectOptions: {
				wsEndpoint: process.env.PW_TEST_CONNECT_WS_ENDPOINT,
			},
		}
	: {};

export default defineConfig( {
	plugins: [
		{
			name: 'style-mock',
			enforce: 'pre',
			resolveId( id, importer ) {
				// Only mock style imports coming from script files. In Browser
				// Mode the tester HTML must keep real styles.
				if (
					/\.(scss|css)$/.test( id ) &&
					importer &&
					/\.[jt]sx?(\?|$)/.test( importer )
				) {
					return styleMock;
				}
				return null;
			},
		},
	],
	oxc: {
		include: /\/(src|assets|tests)\/.*\.[jt]sx?$/,
		exclude: /\/node_modules\//,
		jsx: { runtime: 'automatic' },
	},
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: 'jsdom',
					environment: 'jsdom',
					server: {
						deps: {
							// Inline WordPress packages so vi.mock() applies to
							// their named exports in test files as well.
							inline: [ /@wordpress\// ],
						},
					},
					setupFiles: [ './tests/vitest/setup.js' ],
					include: [
						'src/**/*.test.{js,jsx}',
						'assets/js/**/*.test.{js,jsx}',
					],
					exclude: [
						'**/node_modules/**',
						'**/build/**',
						'**/dist/**',
						'**/vendor/**',
						'**/test-results/**',
						'**/*.browser.test.{js,jsx}',
					],
				},
			},
			{
				extends: true,
				test: {
					name: 'browser',
					setupFiles: [ './tests/vitest/setup.browser.js' ],
					include: [ 'src/**/*.browser.test.{js,jsx}' ],
					browser: {
						enabled: true,
						headless: true,
						provider: playwright( playwrightProviderOptions ),
						instances: [ { browser: 'chromium' } ],
					},
				},
			},
		],
	},
} );
