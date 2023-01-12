import './admin.scss';
import api from '@wordpress/api';
import {
    Button,
    Icon,
    Panel,
    PanelBody,
    PanelRow,
    Placeholder,
    SelectControl,
    Spinner,
    TextControl,
    ToggleControl,
} from '@wordpress/components';
import {
    Fragment,
    render,
    Component,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { SnackbarList } from '@wordpress/components';
import {
    dispatch,
    useDispatch,
    useSelect,
} from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

const Notices = () => {
    const notices = useSelect(
        ( select ) =>
            select( noticesStore )
                .getNotices()
                .filter( ( notice ) => notice.type === 'snackbar' ),
        []
    );
    const { removeNotice } = useDispatch( noticesStore );
    return (
        <SnackbarList
            className="edit-site-notices"
            notices={ notices }
            onRemove={ removeNotice }
        />
    );
};

class App extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            publicationId: '',
            productId: '',
            defaultContentAccessStrategy: '',
            autopromptType: '',
            language: '',
            theme: '',
            isAPILoaded: false,
        };
    }

    componentDidMount() {

        api.loadPromise.then( () => {
            this.settings = new api.models.Settings();

            const { isAPILoaded } = this.state;
            if ( isAPILoaded === false ) {
                this.settings.fetch().then( ( response ) => {
                    this.setState( {
                        publicationId: response[ 'reader_revenue_manager_plugin_publication_id' ],
                        productId: response[ 'reader_revenue_manager_plugin_product_id' ],
                        defaultContentAccessStrategy: response[ 'reader_revenue_manager_plugin_default_content_access_strategy' ],
                        autopromptType: response[ 'reader_revenue_manager_plugin_autoprompt_type' ],
                        language: response[ 'reader_revenue_manager_plugin_language' ],
                        theme: response[ 'reader_revenue_manager_plugin_theme' ],
                        isAPILoaded: true,
                    } );
                } );
            }
        } );
    }

    render() {
        const {
            publicationId,
            productId,
            defaultContentAccessStrategy,
            autopromptType,
            language,
            theme,
            isAPILoaded,
        } = this.state;

        if ( ! isAPILoaded ) {
            return (
                <Placeholder>
                    <Spinner />
                </Placeholder>
            );
        }

        return (
            <Fragment>
                <div className="reader-revenue-manager-plugin__header">
                    <div className="reader-revenue-manager-plugin__container">
                        <div className="reader-revenue-manager-plugin__title">
                            <h1>{ __( 'Reader Revenue Manager Plugin Settings', 'reader-revenue-manager-plugin' ) } <Icon icon="admin-plugins" /></h1>
                        </div>
                    </div>
                </div>

                <div className="reader-revenue-manager-plugin__main">
                    <Panel>
                        <PanelBody
                            title={ __( 'Main Settings', 'reader-revenue-manager-plugin' ) }
                            icon="admin-plugins"
                        >
                            <TextControl
                                help={ __( 'Publication ID can be found in your Reader Revenue Manager Dashboard.', 'reader-revenue-manager-plugin' ) }
                                label={ __( 'Your Publication ID', 'reader-revenue-manager-plugin' ) }
                                onChange={ ( publicationId ) => this.setState( { publicationId } ) }
                                value={ publicationId }
                            />
                            <TextControl
                                help={ __( 'Default Product ID for your pages.', 'reader-revenue-manager-plugin' ) }
                                label={ __( 'Default Product ID', 'reader-revenue-manager-plugin' ) }
                                onChange={ ( productId ) => this.setState( { productId } ) }
                                value={ productId }
                                placeholder="openaccess"
                            />
                            <SelectControl
                                help={ __( 'Default strategy for all posts. Free articles will not be locked behind a paywall.', 'reader-revenue-manager-plugin' ) }
                                label={ __( 'Default content access strategy', 'reader-revenue-manager-plugin' ) }
                                onChange={ ( defaultContentAccessStrategy ) => this.setState( { defaultContentAccessStrategy } ) }
                                options={ [
                                    {
                                        label: __( 'Accessible for free', 'reader-revenue-manager-plugin' ),
                                        value: 'free',
                                    },
                                    {
                                        label: __( 'Locked', 'reader-revenue-manager-plugin' ),
                                        value: 'locked',
                                    },
                                ] }
                                value={ defaultContentAccessStrategy }
                            />
                            <TextControl
                                help={ __( 'Language to use for prompts. Reference https://developers.google.com/admin-sdk/directory/v1/languages.', 'reader-revenue-manager-plugin' ) }
                                label={ __( 'Language', 'reader-revenue-manager-plugin' ) }
                                onChange={ ( language ) => this.setState( { language } ) }
                                placeholder="en"
                                value={ language }
                            />
                            <SelectControl
                                help={ __( 'Adjusts how the prompt will be sized on your page.', 'reader-revenue-manager-plugin' ) }
                                label={ __( 'Paywall prompt type', 'reader-revenue-manager-plugin' ) }
                                onChange={ ( autopromptType ) => this.setState( { autopromptType } ) }
                                options={ [
                                    {
                                        label: __( 'Contribution', 'reader-revenue-manager-plugin' ),
                                        value: 'contribution',
                                    },
                                    {
                                        label: __( 'Contribution (Large)', 'reader-revenue-manager-plugin' ),
                                        value: 'contribution_large',
                                    },
                                    {
                                        label: __( 'Subscription', 'reader-revenue-manager-plugin' ),
                                        value: 'subscription',
                                    },
                                ] }
                                value={ autopromptType }
                            />
                            <SelectControl
                                help={ __( 'Light or Dark theme.', 'reader-revenue-manager-plugin' ) }
                                label={ __( 'Theme', 'reader-revenue-manager-plugin' ) }
                                onChange={ ( theme ) => this.setState( { theme } ) }
                                options={ [
                                    {
                                        label: __( 'Light', 'reader-revenue-manager-plugin' ),
                                        value: 'light',
                                    },
                                    {
                                        label: __( 'Dark', 'reader-revenue-manager-plugin' ),
                                        value: 'dark',
                                    },
                                ] }
                                value={ theme }
                            />

                        </PanelBody>
                        <Button
                            isPrimary
                            isLarge
                            onClick={ () => {
                                const {
                                publicationId,
                                defaultContentAccessStrategy,
                                autopromptType,
                                language,
                                theme,
                                } = this.state;

                                const settings = new api.models.Settings( {
                                [ 'reader_revenue_manager_plugin_publication_id' ]: publicationId,
                                [ 'reader_revenue_manager_plugin_product_id' ]: productId || 'openaccess',
                                [ 'reader_revenue_manager_plugin_default_content_access_strategy' ]: defaultContentAccessStrategy,
                                [ 'reader_revenue_manager_plugin_autoprompt_type' ]: autopromptType,
                                [ 'reader_revenue_manager_plugin_language' ]: language,
                                [ 'reader_revenue_manager_plugin_theme' ]: theme,
                                } );
                                settings.save();
                                dispatch('core/notices').createNotice(
                                    'success',
                                    __( 'Settings Saved', 'reader-revenue-manager-plugin' ),
                                    {
                                      type: 'snackbar',
                                      isDismissible: true,
                                    }
                                );
                            }}
                            >
                            { __( 'Save', 'reader-revenue-manager-plugin' ) }
                        </Button>
                    </Panel>
                </div>
                <div className="reader-revenue-manager-plugin__notices">
                    <Notices/>
                </div>
            </Fragment>
        )
    }
}

document.addEventListener( 'DOMContentLoaded', () => {
    const htmlOutput = document.getElementById( 'reader-revenue-manager-settings' );

    if ( htmlOutput ) {
        render(
            <App />,
            htmlOutput
        );
    }
});