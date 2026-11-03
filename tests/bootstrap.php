<?php
/**
 * Lightweight bootstrap for tests that do not require a WordPress installation.
 *
 * @package {{NAMESPACE}}
 */

require dirname( __DIR__ ) . '/vendor/autoload.php';

define( 'ABSPATH', dirname( __DIR__ ) . '/' );

/**
 * Minimal replacement used while loading the plugin in isolated unit tests.
 *
 * @param string $file Plugin file path.
 * @return string
 */
function plugin_dir_url( string $file ): string {
	return 'https://example.test/wp-content/plugins/{{SLUG}}/';
}

/**
 * Minimal replacement used while loading the plugin in isolated unit tests.
 *
 * @param string $file Plugin file path.
 * @return string
 */
function plugin_dir_path( string $file ): string {
	return dirname( $file ) . '/';
}

/**
 * Return the plugin path relative to the plugins directory in isolated tests.
 *
 * @param string $file Plugin file path.
 * @return string
 */
function plugin_basename( string $file ): string {
	return '{{SLUG}}/' . basename( $file );
}

/**
 * Minimal replacement used while loading the plugin in isolated unit tests.
 *
 * @param string   $hook_name Hook name.
 * @param callable $callback  Registered callback.
 * @return void
 */
function add_action( string $hook_name, callable $callback ): void {
}

/**
 * Apply a test callback to a filter without loading WordPress.
 *
 * @param string $hook_name Filter name.
 * @param mixed  $value     Filtered value.
 * @param mixed  ...$args   Additional filter arguments.
 * @return mixed
 */
function apply_filters( string $hook_name, $value, ...$args ) {
	$callback = $GLOBALS['{{PREFIX}}_test_filters'][ $hook_name ] ?? null;
	return $callback ? $callback( $value, ...$args ) : $value;
}

/**
 * Record block registrations without loading WordPress.
 *
 * @param string $block_type Block metadata directory.
 * @return object
 */
function register_block_type( string $block_type ): object {
	$registered_block = (object) array(
		'path'                  => $block_type,
		'editor_script_handles' => array( '{{SLUG}}-example-editor-script' ),
		'view_script_handles'   => array( '{{SLUG}}-example-view-script' ),
	);
	$GLOBALS['{{PREFIX}}_test_registered_blocks'][] = $registered_block;

	return $registered_block;
}

/**
 * Record text-domain registration in isolated tests.
 *
 * @param string       $domain          Text domain.
 * @param string|false $deprecated      Deprecated path argument.
 * @param string|false $plugin_rel_path Relative language directory.
 * @return bool
 */
function load_plugin_textdomain( string $domain, $deprecated = false, $plugin_rel_path = false ): bool {
	$GLOBALS['{{PREFIX}}_test_textdomains'][] = compact( 'domain', 'deprecated', 'plugin_rel_path' );

	return true;
}

/**
 * Record JavaScript translation registration in isolated tests.
 *
 * @param string $handle Script handle.
 * @param string $domain Text domain.
 * @param string $path   Translation directory.
 * @return bool
 */
function wp_set_script_translations( string $handle, string $domain = 'default', string $path = '' ): bool {
	$GLOBALS['{{PREFIX}}_test_script_translations'][] = compact( 'handle', 'domain', 'path' );

	return true;
}

/**
 * Return a local administration URL for isolated tests.
 *
 * @param string $path Relative administration path.
 * @return string
 */
function admin_url( string $path ): string {
	return 'https://example.test/wp-admin/' . ltrim( $path, '/' );
}

/**
 * Build a URL with query arguments for isolated tests.
 *
 * @param array  $arguments Query arguments.
 * @param string $url       Base URL.
 * @return string
 */
function add_query_arg( array $arguments, string $url ): string {
	return $url . '?' . http_build_query( $arguments, '', '&', PHP_QUERY_RFC3986 );
}

/**
 * Return a deterministic nonce for isolated tests.
 *
 * @param string $action Nonce action.
 * @return string
 */
function wp_create_nonce( string $action ): string {
	return 'test-nonce-' . $action;
}

/**
 * Encode data as JSON for isolated tests.
 *
 * @param mixed $value Value to encode.
 * @return string|false
 */
function wp_json_encode( $value ) {
	return json_encode( $value );
}

/**
 * Record inline scripts without loading WordPress.
 *
 * @param string $handle   Script handle.
 * @param string $data     Script data.
 * @param string $position Relative position.
 * @return bool
 */
function wp_add_inline_script( string $handle, string $data, string $position = 'after' ): bool {
	$GLOBALS['{{PREFIX}}_test_inline_scripts'][] = compact( 'handle', 'data', 'position' );

	return true;
}

/**
 * Minimal text sanitization for isolated renderer tests.
 *
 * @param string $value Untrusted value.
 * @return string
 */
function sanitize_text_field( string $value ): string {
	return trim( strip_tags( $value ) );
}

/**
 * Parse a URL for isolated parser tests.
 *
 * @param string $url URL to parse.
 * @return array|false
 */
function wp_parse_url( string $url ) {
	return parse_url( $url );
}

/**
 * Build escaped wrapper attributes for isolated renderer tests.
 *
 * @param array $attributes Wrapper attributes.
 * @return string
 */
function get_block_wrapper_attributes( array $attributes = array() ): string {
	$parts = array();

	foreach ( $attributes as $name => $value ) {
		$parts[] = sprintf(
			'%s="%s"',
			htmlspecialchars( (string) $name, ENT_QUOTES, 'UTF-8' ),
			htmlspecialchars( (string) $value, ENT_QUOTES, 'UTF-8' )
		);
	}

	return implode( ' ', $parts );
}

/**
 * Echo escaped translated text for isolated renderer tests.
 *
 * @param string $text Source text.
 * @return void
 */
function esc_html_e( string $text ): void {
	echo htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
}

/**
 * Return escaped text for isolated renderer tests.
 *
 * @param string $text Untrusted text.
 * @return string
 */
function esc_html( string $text ): string {
	return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
}

/**
 * Echo an escaped translated attribute for isolated renderer tests.
 *
 * @param string $text Source text.
 * @return void
 */
function esc_attr_e( string $text ): void {
	echo htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
}

/**
 * Return escaped translated attribute text for isolated tests.
 *
 * @param string $text Source text.
 * @return string
 */
function esc_attr__( string $text ): string {
	return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
}

/**
 * Escape an absolute URL for isolated tests.
 *
 * @param string $url URL to escape.
 * @return string
 */
function esc_url( string $url ): string {
	return htmlspecialchars( $url, ENT_QUOTES, 'UTF-8' );
}

require dirname( __DIR__ ) . '/{{SLUG}}.php';
