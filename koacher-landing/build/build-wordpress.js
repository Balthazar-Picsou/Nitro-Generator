#!/usr/bin/env node
/**
 * Génère le partial PHP du plugin WordPress à partir de index.html.
 * Source unique de vérité : index.html — on ne duplique jamais le markup à la main.
 *
 *   node build/build-wordpress.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PLUGIN = path.join(ROOT, 'wordpress', 'koacher-landing');

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// 1. On extrait uniquement le contenu du <body>, sans la balise <script> finale.
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) throw new Error('Impossible de trouver le <body> dans index.html');
let body = bodyMatch[1].replace(/<script[\s\S]*?<\/script>\s*/gi, '').trim();

// 2. Les chemins d'assets deviennent des URL WordPress.
body = body.replace(/(src|poster|href)="assets\//g, '$1="<?php echo esc_url( KOACHER_LP_URL ); ?>assets/');

// 3. Les contenus éditables deviennent des options du plugin.
const tokens = [
  ['Lyon &amp; agglo', "<?php echo esc_html( koacher_lp_opt( 'city' ) ); ?>"],
];
tokens.forEach(([from, to]) => { body = body.split(from).join(to); });

const header = `<?php
/**
 * Corps de la landing page Koacher.
 *
 * FICHIER GÉNÉRÉ — ne pas éditer à la main.
 * Source : koacher-landing/index.html · Régénérer : node build/build-wordpress.js
 *
 * @package Koacher_Landing
 */

defined( 'ABSPATH' ) || exit;
?>
`;

fs.mkdirSync(path.join(PLUGIN, 'templates', 'partials'), { recursive: true });
fs.writeFileSync(path.join(PLUGIN, 'templates', 'partials', 'landing-body.php'), header + body + '\n');

// 4. Copie des assets dans le plugin.
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}
copyDir(path.join(ROOT, 'assets'), path.join(PLUGIN, 'assets'));

console.log('✓ templates/partials/landing-body.php généré');
console.log('✓ assets copiés dans le plugin');
