import { describe, expect, it, vi } from 'vitest';

import metadata from './block.json';

vi.mock( '@wordpress/blocks', () => ( {
	registerBlockType: vi.fn(),
} ) );
vi.mock( './edit.jsx', () => ( { default: () => null } ) );

describe( 'example block registration', () => {
	it( 'registers the block using its metadata name', async () => {
		const { registerBlockType } = await import( '@wordpress/blocks' );
		const { settings } = await import( './index' );

		expect( registerBlockType ).toHaveBeenCalledWith(
			metadata.name,
			settings
		);
	} );

	it( 'uses dynamic server-side rendering', async () => {
		const { settings } = await import( './index' );

		expect( settings.save() ).toBeNull();
	} );
} );
