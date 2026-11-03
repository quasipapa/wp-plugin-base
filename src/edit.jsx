import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

export default function Edit( { attributes, setAttributes } ) {
	return (
		<div { ...useBlockProps() }>
			<TextControl
				label={ __( 'Message', '{{TEXT_DOMAIN}}' ) }
				value={ attributes.message }
				onChange={ ( message ) => setAttributes( { message } ) }
			/>
		</div>
	);
}
