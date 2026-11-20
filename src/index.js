import { registerBlockType } from '@wordpress/blocks';

import Edit from './edit.jsx';
import metadata from './block.json';
import './editor.scss';
import './style.scss';

export const settings = {
	edit: Edit,
	save: () => null,
};

registerBlockType( metadata.name, settings );
