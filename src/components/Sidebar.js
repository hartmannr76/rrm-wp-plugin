import api from '@wordpress/api';
import { compose } from '@wordpress/compose';
import { SelectControl, TextControl } from '@wordpress/components';
import { dispatch, select, withDispatch, withSelect } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';



export const Sidebar = ({postType, postMeta, setPostMeta}) => { 
  if (postType !== 'post') { return null; }

  const contentAccessStrategy = postMeta['_content_access_strategy'];
  const productId = postMeta['_product_id'];
  const [defaultStrategy, setDefaultStrategy] = useState(undefined);
  const [defaultProductId, setDefaultProductId] = useState(undefined);

  useEffect(() => {
    api.loadPromise.then( () => {
      const settings = new api.models.Settings();
      settings.fetch().then( ( response ) => {
        setDefaultStrategy(response[ 'reader_revenue_manager_plugin_default_content_access_strategy' ]);
        setDefaultProductId(response[ 'reader_revenue_manager_plugin_product_id' ] || 'openaccess');
      } );
  } );
  }, []);

  const defaultLabel = defaultStrategy ? `Default (${defaultStrategy})` : 'Default';

  return (
    <PluginDocumentSettingPanel
      name="reader-revenue-manager-plugin-sidebar"
      title={ __( 'Reader Revenue Manager', 'reader-revenue-manager-plugin' ) }
      >
        <TextControl
            help={ __( 'Product ID to use for unlocking this page.', 'reader-revenue-manager-plugin' ) }
            label={ __( 'Product ID', 'reader-revenue-manager-plugin' ) }
            onChange={ ( value ) => {
              setPostMeta( {
                  '_product_id': value,
              } );
            }}
            placeholder={defaultProductId}
            value={ productId }
        />
        <SelectControl
            help={ __( 'Determines if the article is accessible for free or displays a paywall.', 'reader-revenue-manager-plugin' ) }
            label={ __( 'Content Access Strategy', 'reader-revenue-manager-plugin' ) }
            onChange={ ( value ) => {
              setPostMeta( {
                  '_content_access_strategy': value,
              } );
            }}
            options={ [
                {
                    label: __( defaultLabel, 'reader-revenue-manager-plugin' ),
                    value: '',
                },
                {
                    label: __( 'Accessible for Free', 'reader-revenue-manager-plugin' ),
                    value: 'free',
                },
                {
                    label: __( 'Locked', 'reader-revenue-manager-plugin' ),
                    value: 'locked',
                },
            ] }
            value={ contentAccessStrategy }
        />
    </PluginDocumentSettingPanel>
  );
}

export default compose( [
	withSelect( ( select ) => {		
		return {
			postMeta: select( 'core/editor' ).getEditedPostAttribute( 'meta' ),
			postType: select( 'core/editor' ).getCurrentPostType(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		return {
			setPostMeta( newMeta ) {
				dispatch( 'core/editor' ).editPost( { meta: newMeta } );
			}
		};
	} )
] )( Sidebar );
