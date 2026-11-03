// Stand-in for style imports in unit tests: class names are kebab-cased
// property names, matching the former @wordpress/jest-preset-default mock.
const styles = new Proxy(
	{},
	{
		get( target, property ) {
			if ( typeof property === 'string' && property !== '__esModule' ) {
				return property
					.replace( /([a-z0-9])([A-Z])/g, '$1-$2' )
					.toLowerCase();
			}

			return Reflect.get( target, property );
		},
	}
);

export default styles;
