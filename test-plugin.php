<?php
/**
 * Plugin Name:       Test Plugin
 * Description:       Example block scaffolded with Create Block tool.
 * Requires at least: 5.9
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       test-plugin
 *
 * @package           test-plugin
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function test_plugin_test_plugin_block_init() {
	register_block_type( __DIR__ . '/build' );

	register_post_meta( 'post', '_content_access_strategy', [
		'auth_callback' => function() {
            return current_user_can('edit_posts');
        },
		'default'       => '',
		'show_in_rest' => true,
		'single' => true,
		'type' => 'string',
	] );

    register_post_meta( 'post', '_product_id', [
		'auth_callback' => function() {
            return current_user_can('edit_posts');
        },
		'default'       => '',
		'show_in_rest' => true,
		'single' => true,
		'type' => 'string',
	] );

    register_setting(
        'reader_revenue_manager_plugin_settings',
        'reader_revenue_manager_plugin_publication_id',
        [
            'default'      => '',
            'show_in_rest' => true,
            'type'         => 'string',
        ]
    );

    register_setting(
        'reader_revenue_manager_plugin_settings',
        'reader_revenue_manager_plugin_product_id',
        [
            'default'      => '',
            'show_in_rest' => true,
            'type'         => 'string',
        ]
    );
	
    register_setting(
        'reader_revenue_manager_plugin_settings',
        'reader_revenue_manager_plugin_default_content_access_strategy',
        [
            'default'      => 'free',
            'show_in_rest' => true,
            'type'         => 'string',
        ]
    );

    register_setting(
        'reader_revenue_manager_plugin_settings',
        'reader_revenue_manager_plugin_autoprompt_type',
        [
            'default'      => 'contribution_large',
            'show_in_rest' => true,
            'type'         => 'string',
        ]
    );

    register_setting(
        'reader_revenue_manager_plugin_settings',
        'reader_revenue_manager_plugin_language',
        [
            'default'      => '',
            'show_in_rest' => true,
            'type'         => 'string',
        ]
    );

    register_setting(
        'reader_revenue_manager_plugin_settings',
        'reader_revenue_manager_plugin_theme',
        [
            'default'      => 'light',
            'show_in_rest' => true,
            'type'         => 'string',
        ]
    );

	// Add a new capability to admin by default.
	$role = get_role( 'administrator' );
	$role->add_cap( 'view_locked_posts', true );
}

function reader_revenue_manager_plugin_toggle_preview_callback() {
?>
<script>
    var restRoute = document.head.querySelector('link[rel="https://api.w.org/"]').getAttribute('href');
    function rrmTogglePreview() {
        fetch(restRoute + 'rrm/v1/preview').then(() => {window.location.reload()});
    }
</script>
<?php
}

function reader_revenue_manager_plugin_require_login() {
	global $post, $wp_query;
	
    $bypass_post_lock = current_user_can('view_locked_posts') 
        && isset($_COOKIE['rrm-preview-toggle']) 
        && boolval($_COOKIE['rrm-preview-toggle']);
    if ( ! is_singular() || ! $post  || $bypass_post_lock) {
		return;
    }
	
    $page_content_access_strategy = get_post_meta( $post->ID, '_content_access_strategy', true);
	$default_content_access_strategy = get_option('reader_revenue_manager_plugin_default_content_access_strategy', '');
	$default_product_id = get_option('reader_revenue_manager_plugin_product_id', 'openaccess');
	
	$out = $page_content_access_strategy != '' ? $page_content_access_strategy : $default_content_access_strategy;

    $publication_id =  get_option('reader_revenue_manager_plugin_publication_id', '');
    $product_id = get_post_meta( $post->ID, '_product_id', true);
    $product_id = $product_id != '' ? $product_id : $default_product_id;
    $autoprompt_type = get_option('reader_revenue_manager_plugin_autoprompt_type', 'contribution_large');
    $language = get_option('reader_revenue_manager_plugin_language', '');
    $theme = get_option('reader_revenue_manager_plugin_theme', 'light');
	?>
<p>Publication: <?= $publication_id ?></p>
<p>product_id: <?= $product_id ?></p>
<p>autoprompt_type: <?= $autoprompt_type ?></p>
<p>language: <?= $language ?></p>
<p>theme: <?= $theme ?></p>
<!-- <script async type="application/javascript"
        src="https://news.google.com/swg/js/v1/swg-basic.js"></script>
<script>
  (self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
    basicSubscriptions.init({
      type: "NewsArticle",
      isAccessibleForFree: false,
      isPartOfType: ["Product"],
      isPartOfProductId: "CAow1dzDCw:basic",
      autoPromptType: "subscription",
      clientOptions: { theme: "light", lang: "" },
    });
  });
</script> -->

<?php
}

function reader_revenue_manager_plugin_settings_link( $links ) : array {
    if (!current_user_can('manage_options')) {
        return $links;
    }

	$label = esc_html__( 'Settings', 'reader-revenue-manager-plugin' );
    $slug  = 'reader_revenue_manager_plugin_settings';
	
    array_unshift( $links, "<a href='options-general.php?page=$slug'>$label</a>" );
	
    return $links;
}


function reader_revenue_manager_plugin_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

	add_options_page(
		__( 'Reader Revenue Manager Plugin Settings', 'reader-revenue-manager' ),
        __( 'Reader Revenue Manager Plugin Settings', 'reader-revenue-manager' ),
        'manage_options',
        'reader_revenue_manager_plugin_settings',
        function() {
			?>
            <div id="reader-revenue-manager-settings"></div>
            <?php
        },
    );
}

function reader_revenue_manager_plugin_admin_scripts() {
	$dir = __DIR__;
	
    $script_asset_path = "$dir/build/admin.asset.php";
    if ( ! file_exists( $script_asset_path ) ) {
		throw new Error(
			'You need to run `npm start` or `npm run build` for the plugin block first.'
        );
    }
    $admin_js     = 'build/admin.js';
    $script_asset = require( $script_asset_path );
    wp_enqueue_script(
		'reader-revenue-manager-plugin-admin-editor',
        plugins_url( $admin_js, __FILE__ ),
        $script_asset['dependencies'],
        $script_asset['version']
    );
    wp_set_script_translations( 'reader-revenue-manager-plugin-block-editor', 'reader-revenue-manager-plugin' );
	
    $admin_css = 'build/admin.css';
    wp_enqueue_style(
		'reader-revenue-manager-plugin-admin',
        plugins_url( $admin_css, __FILE__ ),
        ['wp-components'],
        filemtime( "$dir/$admin_css" )
    );
}

function reader_revenue_manager_plugin_admin_bar($admin_bar) {
    if (current_user_can('view_locked_posts') && current_user_can('manage_options')) {
        $root_node = array(
            'parent' => 'site-name',
            'id' => 'reader-revenue-manager',
            'title' => 'Reader Revenue Manager',
            'href'  => '#',
            'meta'  => array(
                'class' => 'menupop',
            ),
        );
        $preview_node = array(
            'parent' => 'reader-revenue-manager',
            'id' => 'reader-revenue-manager-preview',
            'title' => 'Toggle Preview',
            'href'  => '#',
            'meta'  => array(
                'class' => 'menupop reader-revenue-manager-wp-adminbar',
                'onclick' => 'rrmTogglePreview()'
            ),
        );
        $admin_bar->add_node($root_node);
        $admin_bar->add_node($preview_node);
    }
}

function rrm_preview() {
    if(!isset($_COOKIE['rrm-preview-toggle'])) {
        setcookie('rrm-preview-toggle', 'true', time()+86400); 
    } else {
        setcookie('rrm-preview-toggle', null, -1); 
    }

    return new WP_REST_Response(null, 200);
}

add_action( 'init', 'test_plugin_test_plugin_block_init' );
add_action( 'wp_head', 'reader_revenue_manager_plugin_require_login' );
add_action( 'wp_head', 'reader_revenue_manager_plugin_toggle_preview_callback' );
add_action( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'reader_revenue_manager_plugin_settings_link', 10 );
add_action( 'admin_menu', 'reader_revenue_manager_plugin_settings_page', 10 );
add_action( 'admin_enqueue_scripts', 'reader_revenue_manager_plugin_admin_scripts', 10 );
add_action('admin_bar_menu', 'reader_revenue_manager_plugin_admin_bar', 999);
add_action('rest_api_init', function() {
    register_rest_route('rrm/v1', '/preview', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'rrm_preview',
        'permission_callback' => function () {
            return true;
        }
    ]);
});
