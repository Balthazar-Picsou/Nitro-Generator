#!/usr/bin/env node
/**
 * Génère une version « bloc HTML WordPress » de la landing page :
 * un seul fichier, CSS inclus et préfixé, sans JavaScript, sans plugin.
 *
 * À coller dans un bloc « HTML personnalisé » de l'éditeur WordPress.
 *
 *   node build/build-wordpress-block.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCOPE = '.koacher-lp';

/* ------------------------------------------------------------------ *
 * 1. CSS : on préfixe chaque sélecteur pour ne pas déborder sur le thème
 * ------------------------------------------------------------------ */
function prefixSelector(sel) {
  return sel
    .split(',')
    .map((s) => {
      s = s.trim();
      if (!s) return s;
      // body / html deviennent le conteneur lui-même.
      if (s === 'body' || s === 'html' || s === ':root') return SCOPE;
      if (s.startsWith('html.js') || s.startsWith('.js ')) return SCOPE + ' ' + s.replace(/^html\.js\s*|^\.js\s*/, '');
      if (s.startsWith(SCOPE)) return s;
      if (s.startsWith('@')) return s;
      return SCOPE + ' ' + s;
    })
    .join(', ');
}

function scopeCss(css) {
  let out = '';
  let i = 0;

  function readBlockBody(start) {
    let depth = 1;
    let j = start;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    return { body: css.slice(start, j - 1), end: j };
  }

  while (i < css.length) {
    // Espaces : recopiés tels quels.
    if (/\s/.test(css[i])) { out += css[i]; i++; continue; }

    // Commentaires : conservés, jamais avalés par un sélecteur.
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i + 2);
      if (end === -1) { out += css.slice(i); break; }
      out += css.slice(i, end + 2);
      i = end + 2;
      continue;
    }

    const brace = css.indexOf('{', i);
    if (brace === -1) { out += css.slice(i); break; }

    const prelude = css.slice(i, brace).trim();
    const { body, end } = readBlockBody(brace + 1);

    if (/^@(media|supports)/i.test(prelude)) {
      out += prelude + '{' + scopeCss(body) + '}';
    } else if (/^@(font-face|keyframes|-webkit-keyframes|page|layer|import|charset)/i.test(prelude)) {
      out += prelude + '{' + body + '}';
    } else {
      out += prefixSelector(prelude) + '{' + body.trim() + '}';
    }
    i = end;
  }
  return out;
}

let css = fs.readFileSync(path.join(ROOT, 'assets/css/koacher.css'), 'utf8');

// Les polices locales ne sont pas téléversables sur un WordPress sans accès FTP :
// on bascule sur Google Fonts pour cette version-là uniquement.
css = css.replace(/\/\* -+ Polices auto-hébergées[\s\S]*?(?=\n\s*:root\s*\{)/, '');
css = css.replace(/--body:'Inter',\s*/, '--body:');
css = scopeCss(css);

// Les règles qui ne peuvent pas vivre dans un bloc : on les neutralise.
css = css.replace(/\.koacher-lp\s*\{\s*scroll-behavior:smooth;[^}]*\}/g, '');

// Anton (le caractère de la marque) est embarqué en base64 : aucun fichier à téléverser,
// aucun appel à un CDN, donc rien à déclarer côté RGPD. Le texte courant utilise la pile
// système, indiscernable d'Inter à cette taille et gratuite en poids de page.
const antonB64 = fs.readFileSync(path.join(ROOT, 'assets/fonts/anton-400-latin.woff2')).toString('base64');
const fontImport =
  "@font-face{font-family:'Anton';font-style:normal;font-weight:400;font-display:swap;" +
  "src:url(data:font/woff2;base64," + antonB64 + ") format('woff2')}\n";

/* ------------------------------------------------------------------ *
 * 2. HTML : on retire la navigation (le thème a la sienne) et les scripts
 * ------------------------------------------------------------------ */
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
let body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)[1];

body = body.replace(/<!-- ={4,} NAV ={4,} -->[\s\S]*?<\/header>\s*/i, '');
body = body.replace(/<script[\s\S]*?<\/script>\s*/gi, '');

// Les médias vivront dans la médiathèque WordPress : on laisse des repères explicites.
body = body.replace(/assets\/media\/koacher-ad\.mp4/g, 'URL_DE_LA_VIDEO');
body = body.replace(/assets\/media\/ad-poster\.jpg/g, 'URL_DE_L_IMAGE_POSTER');
css = css.replace(/url\(["']\.\.\/media\/ad-logo-frame\.jpg["']\)/g, 'url("URL_IMAGE_DE_FOND_CTA")');

// Le formulaire a besoin d'un traitement côté serveur : sans JS on renvoie vers l'outil de réservation.
body = body.replace(
  /<form class="booking__form"[\s\S]*?<\/form>/,
  `<div class="booking__form">
          <!-- ▼▼▼ REMPLACE CE BLOC ▼▼▼
               Deux possibilités :
               1. Colle ici le code court de ton formulaire WordPress
                  (Contact Form 7, WPForms, Formulaire Jetpack…) : [contact-form-7 id="123"]
               2. Ou garde le bouton ci-dessous et remplace le lien par ton Calendly,
                  ton Simplybook, ou ton numéro WhatsApp.
               ▲▲▲ REMPLACE CE BLOC ▲▲▲ -->
          <a class="btn btn--accent btn--block" href="URL_DE_RESERVATION">Voir les créneaux dispo →</a>
          <p class="booking__legal">Gratuit, sans carte bancaire. Tu confirmes après avoir vu les créneaux.</p>
        </div>`
);

// Sans JS, le bouton de lecture de la pub ne sert à rien : la vidéo devient un lecteur natif.
body = body.replace(/<button class="phone__play"[\s\S]*?<\/button>\s*/, '');
body = body.replace(/<video class="phone__video" id="ad-video" loop playsinline preload="none"/, '<video class="phone__video" controls loop playsinline preload="none"');

const notice = `<!-- =============================================================
     KOACHER — Landing page, version « bloc HTML » WordPress
     -------------------------------------------------------------
     MODE D'EMPLOI
     1. Médias → Ajouter : téléverse koacher-ad.mp4, ad-poster.jpg
        et ad-logo-frame.jpg, puis copie l'URL de chacun.
     2. Dans ce code, remplace les 4 repères en majuscules :
          URL_DE_LA_VIDEO            → l'URL du .mp4
          URL_DE_L_IMAGE_POSTER      → l'URL de ad-poster.jpg
          URL_IMAGE_DE_FOND_CTA      → l'URL de ad-logo-frame.jpg
          URL_DE_RESERVATION         → ton Calendly / ton formulaire
     3. Pages → Ajouter, bloc « HTML personnalisé », colle tout ce
        fichier, publie. Choisis un modèle de page « pleine largeur ».
     ============================================================= -->
`;

const out = `${notice}<style>
${fontImport}${css.trim()}
</style>

<div class="koacher-lp">
${body.trim()}
</div>
`;

const dest = path.join(ROOT, 'wordpress-bloc-html', 'koacher-bloc-html.html');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log(`✓ wordpress-bloc-html/koacher-bloc-html.html (${Math.round(out.length / 1024)} Ko)`);
