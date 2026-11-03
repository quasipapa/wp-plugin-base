<?php
/**
 * Smoke tests for the example plugin bootstrap.
 *
 * @package {{NAMESPACE}}
 */

/**
 * Tests the example plugin bootstrap.
 */
class Test_Example extends \PHPUnit\Framework\TestCase {

	/**
	 * The version constant matches the plugin header version.
	 *
	 * @return void
	 */
	public function test_version_constant_is_defined(): void {
		$this->assertSame( '0.1.0', {{NAMESPACE}}_VERSION );
	}

	/**
	 * The block registration callback exists after loading the bootstrap.
	 *
	 * @return void
	 */
	public function test_register_block_function_exists(): void {
		$this->assertTrue(
			function_exists( '{{PREFIX}}_register_block' )
		);
	}
}
