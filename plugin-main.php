<?php
/**
 * Plugin Name:       {{NAME}}
 * Description:       {{NAME}} — generated from wp-plugin-base.
 * Version:           0.1.0
 * Requires at least: 6.1
 * Requires PHP:      8.0
 * Author:            {{AUTHOR}}
 * Copyright:         2026 {{AUTHOR}}
 * License:           {{LICENSE}}
 * License URI:       https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * Text Domain:       {{TEXT_DOMAIN}}
 * Domain Path:       /languages
 * Update URI:        https://github.com/{{REPO}}
 *
 * @package {{NAMESPACE}}
 */

defined( 'ABSPATH' ) || exit;

define(
	'{{NAMESPACE}}_VERSION',
	'0.1.0'
);

define(
	'{{NAMESPACE}}_PLUGIN_DIR',
	plugin_dir_path( __FILE__ )
);

/**
 * Register the example block and its metadata-defined assets.
 *
 * @return void
 */
function {{PREFIX}}_register_block(): void {
	load_plugin_textdomain(
		'{{TEXT_DOMAIN}}',
		false,
		dirname( plugin_basename( __FILE__ ) ) . '/languages'
	);

	$block_type     = register_block_type( {{NAMESPACE}}_PLUGIN_DIR . 'build' );
	$script_handles = array_merge(
		$block_type && isset( $block_type->editor_script_handles ) ? $block_type->editor_script_handles : array(),
		$block_type && isset( $block_type->view_script_handles ) ? $block_type->view_script_handles : array()
	);

	foreach ( $script_handles as $script_handle ) {
		wp_set_script_translations(
			$script_handle,
			'{{TEXT_DOMAIN}}',
			{{NAMESPACE}}_PLUGIN_DIR . 'languages'
		);
	}
}

add_action( 'init', '{{PREFIX}}_register_block' );
