<?php
/**
 * Page de réglages « Koacher Landing ».
 *
 * @package Koacher_Landing
 */

defined( 'ABSPATH' ) || exit;

/**
 * Ajoute la page dans Réglages.
 */
function koacher_lp_settings_menu() {
	add_options_page(
		__( 'Koacher Landing', 'koacher-landing' ),
		__( 'Koacher Landing', 'koacher-landing' ),
		'manage_options',
		'koacher-landing',
		'koacher_lp_settings_page'
	);
}
add_action( 'admin_menu', 'koacher_lp_settings_menu' );

/**
 * Déclare les réglages.
 */
function koacher_lp_settings_init() {
	register_setting(
		'koacher_lp',
		'koacher_lp_options',
		array( 'sanitize_callback' => 'koacher_lp_sanitize_options' )
	);

	add_settings_section( 'koacher_lp_main', __( 'Configuration', 'koacher-landing' ), '__return_false', 'koacher-landing' );

	$fields = array(
		'pixel_id'         => array(
			__( 'ID du Pixel Meta', 'koacher-landing' ),
			__( 'Identifiant numérique trouvé dans Gestionnaire d\'événements → Sources de données. Laisser vide désactive le pixel.', 'koacher-landing' ),
		),
		'booking_endpoint' => array(
			__( 'URL de réception du formulaire', 'koacher-landing' ),
			__( 'Laisser vide pour utiliser l\'endpoint interne : /wp-json/koacher/v1/lead', 'koacher-landing' ),
		),
		'city'             => array(
			__( 'Zone géographique affichée', 'koacher-landing' ),
			__( 'Exemple : « Lyon & agglo ». Doit correspondre au ciblage de la campagne.', 'koacher-landing' ),
		),
	);

	foreach ( $fields as $key => $meta ) {
		add_settings_field(
			$key,
			$meta[0],
			'koacher_lp_render_field',
			'koacher-landing',
			'koacher_lp_main',
			array(
				'key'         => $key,
				'description' => $meta[1],
			)
		);
	}
}
add_action( 'admin_init', 'koacher_lp_settings_init' );

/**
 * Nettoie les options avant enregistrement.
 *
 * @param array $input Valeurs soumises.
 * @return array
 */
function koacher_lp_sanitize_options( $input ) {
	return array(
		'pixel_id'         => preg_replace( '/[^0-9]/', '', (string) ( $input['pixel_id'] ?? '' ) ),
		'booking_endpoint' => esc_url_raw( (string) ( $input['booking_endpoint'] ?? '' ) ),
		'city'             => sanitize_text_field( (string) ( $input['city'] ?? '' ) ),
	);
}

/**
 * Affiche un champ.
 *
 * @param array $args Arguments du champ.
 */
function koacher_lp_render_field( $args ) {
	$value = koacher_lp_opt( $args['key'] );
	printf(
		'<input type="text" class="regular-text" name="koacher_lp_options[%1$s]" value="%2$s" /><p class="description">%3$s</p>',
		esc_attr( $args['key'] ),
		esc_attr( $value ),
		esc_html( $args['description'] )
	);
}

/**
 * Affiche la page de réglages.
 */
function koacher_lp_settings_page() {
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Koacher — Landing page', 'koacher-landing' ); ?></h1>
		<p>
			<?php esc_html_e( 'Créez une page, choisissez le modèle « Koacher — Landing page », publiez, puis pointez la publicité Meta vers son URL.', 'koacher-landing' ); ?>
			<?php esc_html_e( 'Vous pouvez aussi insérer le shortcode [koacher_landing] dans n\'importe quelle page.', 'koacher-landing' ); ?>
		</p>
		<form action="options.php" method="post">
			<?php
			settings_fields( 'koacher_lp' );
			do_settings_sections( 'koacher-landing' );
			submit_button();
			?>
		</form>
	</div>
	<?php
}
