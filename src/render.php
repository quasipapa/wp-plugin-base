<?php
/**
 * Render the example block.
 *
 * @var array $attributes Block attributes.
 *
 * @package {{NAMESPACE}}
 */

defined( 'ABSPATH' ) || exit;

${{PREFIX}}_message = isset( $attributes['message'] ) ? (string) $attributes['message'] : '';
?>
<div <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wrapper attributes are escaped by WordPress. ?>><?php echo esc_html( ${{PREFIX}}_message ); ?></div>
