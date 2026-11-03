const wpPlugin = require( '@wordpress/eslint-plugin' );
const vitestPlugin = require( '@vitest/eslint-plugin' );

module.exports = [
	{ ignores: [ '**/build/**', '**/node_modules/**', '**/vendor/**' ] },
	...wpPlugin.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				requireConfigFile: false,
				babelOptions: {
					presets: [
						require.resolve( '@wordpress/babel-preset-default' ),
					],
				},
			},
		},
	},
	{
		...vitestPlugin.configs.recommended,
		files: [
			'**/@(test|__tests__)/**/*.{js,jsx,ts,tsx,mjs,cjs}',
			'**/*.@(test|spec).{js,jsx,ts,tsx,mjs,cjs}',
		],
	},
];
