<?php
/**
 * Plugin Name:       Koacher — Landing page
 * Plugin URI:        https://example.com/koacher
 * Description:       Landing page de réservation de séances de sport, pensée pour recevoir le trafic d'une publicité Meta (Instagram Reels). Fournit un modèle de page, un shortcode et le suivi Meta Pixel.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Koacher
 * License:           GPL-2.0-or-later
 * Text Domain:       koacher-landing
 *
 * @package Koacher_Landing
 */

defined( 'ABSPATH' ) || exit;

define( 'KOACHER_LP_VERSION', '1.0.0' );
define( 'KOACHER_LP_PATH', plugin_dir_path( __FILE__ ) );
define( 'KOACHER_LP_URL', plugin_dir_url( __FILE__ ) );

require_once KOACHER_LP_PATH . 'inc/settings.php';

/**
 * Récupère une option du plugin.
 *
 * @param string $key     Clé de l'option.
 * @param string $default Valeur par défaut.
 * @return string
 */
function koacher_lp_opt( $key, $default = '' ) {
	$options = wp_parse_args(
		get_option( 'koacher_lp_options', array() ),
		array(
			'pixel_id'         => '',
			'booking_endpoint' => '',
			'city'             => 'Lyon & agglo',
		)
	);

	return isset( $options[ $key ] ) && '' !== $options[ $key ] ? $options[ $key ] : $default;
}

/**
 * Enregistre feuille de style et script.
 */
function koacher_lp_register_assets() {
	// Les polices sont auto-hébergées dans assets/fonts (aucun appel à Google Fonts : conformité RGPD).
	wp_register_style(
		'koacher-landing',
		KOACHER_LP_URL . 'assets/css/koacher.css',
		array(),
		KOACHER_LP_VERSION
	);

	wp_register_script(
		'koacher-landing',
		KOACHER_LP_URL . 'assets/js/koacher.js',
		array(),
		KOACHER_LP_VERSION,
		true
	);
}
add_action( 'init', 'koacher_lp_register_assets' );

/**
 * Charge les assets et les attributs de suivi sur les pages qui utilisent la landing.
 */
function koacher_lp_enqueue_assets() {
	wp_enqueue_style( 'koacher-landing' );
	wp_enqueue_script( 'koacher-landing' );

	wp_add_inline_script(
		'koacher-landing',
		'window.KOACHER_CONFIG = ' . wp_json_encode(
			array(
				'pixelId'         => koacher_lp_opt( 'pixel_id' ),
				'bookingEndpoint' => koacher_lp_opt( 'booking_endpoint', rest_url( 'koacher/v1/lead' ) ),
			)
		) . ';',
		'before'
	);
}

/**
 * Ajoute les attributs de configuration sur la balise <body> (utilisés par koacher.js).
 *
 * @param string $extra Attributs supplémentaires éventuels.
 * @return string
 */
function koacher_lp_body_attributes( $extra = '' ) {
	return trim(
		sprintf(
			'data-pixel-id="%s" data-booking-endpoint="%s" %s',
			esc_attr( koacher_lp_opt( 'pixel_id' ) ),
			esc_url( koacher_lp_opt( 'booking_endpoint' ) ),
			$extra
		)
	);
}

/**
 * Rend le corps de la landing page.
 *
 * @return string
 */
function koacher_lp_render() {
	koacher_lp_enqueue_assets();

	ob_start();
	include KOACHER_LP_PATH . 'templates/partials/landing-body.php';

	return ob_get_clean();
}

/**
 * Charge les assets en amont lorsque le shortcode est présent dans le contenu,
 * afin que la feuille de style parte dans le <head> et non dans le pied de page.
 */
function koacher_lp_maybe_enqueue() {
	if ( ! is_singular() ) {
		return;
	}
	$post = get_post();
	if ( $post && has_shortcode( $post->post_content, 'koacher_landing' ) ) {
		koacher_lp_enqueue_assets();
	}
}
add_action( 'wp_enqueue_scripts', 'koacher_lp_maybe_enqueue' );

/**
 * Shortcode [koacher_landing] — pour insérer la landing dans une page existante.
 */
function koacher_lp_shortcode() {
	return koacher_lp_render();
}
add_shortcode( 'koacher_landing', 'koacher_lp_shortcode' );

/**
 * Déclare le modèle de page « Koacher — Landing page ».
 *
 * @param array $templates Modèles existants.
 * @return array
 */
function koacher_lp_add_template( $templates ) {
	$templates['koacher-landing'] = __( 'Koacher — Landing page', 'koacher-landing' );

	return $templates;
}
add_filter( 'theme_page_templates', 'koacher_lp_add_template' );

/**
 * Charge le fichier du modèle depuis le plugin.
 *
 * @param string $template Chemin du modèle choisi par WordPress.
 * @return string
 */
function koacher_lp_load_template( $template ) {
	if ( is_singular() && 'koacher-landing' === get_page_template_slug( get_queried_object_id() ) ) {
		$file = KOACHER_LP_PATH . 'templates/template-koacher-landing.php';
		if ( file_exists( $file ) ) {
			koacher_lp_enqueue_assets();

			return $file;
		}
	}

	return $template;
}
add_filter( 'template_include', 'koacher_lp_load_template' );

/**
 * Pixel Meta côté <head> : version <noscript> pour les navigateurs sans JS.
 * (La partie JavaScript est initialisée par assets/js/koacher.js.)
 */
function koacher_lp_noscript_pixel() {
	$pixel = koacher_lp_opt( 'pixel_id' );
	if ( ! $pixel ) {
		return;
	}
	printf(
		'<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=%s&ev=PageView&noscript=1" /></noscript>',
		esc_attr( $pixel )
	);
}
add_action( 'wp_footer', 'koacher_lp_noscript_pixel' );

/**
 * Endpoint REST de secours pour enregistrer une demande de réservation
 * lorsqu'aucun outil externe (Calendly, HubSpot, CRM…) n'est branché.
 * Les demandes sont stockées en custom post type privé.
 */
function koacher_lp_register_cpt() {
	register_post_type(
		'koacher_lead',
		array(
			'label'           => __( 'Demandes Koacher', 'koacher-landing' ),
			'public'          => false,
			'show_ui'         => true,
			'show_in_menu'    => true,
			'menu_icon'       => 'dashicons-universal-access',
			'supports'        => array( 'title', 'custom-fields' ),
			'capability_type' => 'post',
		)
	);
}
add_action( 'init', 'koacher_lp_register_cpt' );

/**
 * Enregistre la route REST /wp-json/koacher/v1/lead.
 */
function koacher_lp_register_rest() {
	register_rest_route(
		'koacher/v1',
		'/lead',
		array(
			'methods'             => 'POST',
			'permission_callback' => '__return_true',
			'callback'            => 'koacher_lp_handle_lead',
			'args'                => array(
				'email'   => array( 'required' => true ),
				'sport'   => array( 'required' => false ),
				'ville'   => array( 'required' => false ),
				'creneau' => array( 'required' => false ),
			),
		)
	);
}
add_action( 'rest_api_init', 'koacher_lp_register_rest' );

/**
 * Enregistre une demande de réservation.
 *
 * @param WP_REST_Request $request Requête.
 * @return WP_REST_Response
 */
function koacher_lp_handle_lead( WP_REST_Request $request ) {
	$email = sanitize_email( $request->get_param( 'email' ) );

	if ( ! is_email( $email ) ) {
		return new WP_REST_Response( array( 'ok' => false, 'error' => 'invalid_email' ), 400 );
	}

	$post_id = wp_insert_post(
		array(
			'post_type'   => 'koacher_lead',
			'post_status' => 'private',
			'post_title'  => $email . ' — ' . current_time( 'd/m/Y H:i' ),
			'meta_input'  => array(
				'email'    => $email,
				'sport'    => sanitize_text_field( (string) $request->get_param( 'sport' ) ),
				'ville'    => sanitize_text_field( (string) $request->get_param( 'ville' ) ),
				'creneau'  => sanitize_text_field( (string) $request->get_param( 'creneau' ) ),
				'utm'      => sanitize_text_field( (string) $request->get_param( 'utm' ) ),
				'referer'  => esc_url_raw( (string) $request->get_header( 'referer' ) ),
			),
		),
		true
	);

	if ( is_wp_error( $post_id ) ) {
		return new WP_REST_Response( array( 'ok' => false, 'error' => 'insert_failed' ), 500 );
	}

	/**
	 * Permet de brancher un CRM, un envoi d'email ou l'API Conversions de Meta.
	 *
	 * @param int             $post_id ID de la demande enregistrée.
	 * @param WP_REST_Request $request Requête d'origine.
	 */
	do_action( 'koacher_lp_lead_created', $post_id, $request );

	return new WP_REST_Response( array( 'ok' => true ), 201 );
}
