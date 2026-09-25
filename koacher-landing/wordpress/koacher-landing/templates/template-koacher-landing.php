<?php
/**
 * Modèle de page « Koacher — Landing page ».
 *
 * Document autonome : on n'appelle pas l'en-tête ni le pied de page du thème,
 * pour garantir un rendu identique quel que soit le thème actif et éviter
 * toute fuite de CSS sur une page dont le seul objectif est la conversion.
 *
 * @package Koacher_Landing
 */

defined( 'ABSPATH' ) || exit;
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#0A0A0A">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?> <?php echo koacher_lp_body_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php include KOACHER_LP_PATH . 'templates/partials/landing-body.php'; ?>
	<?php wp_footer(); ?>
</body>
</html>
