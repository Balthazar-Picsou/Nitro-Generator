# KOACHER — Landing page de réservation de séances de sport

Landing page conçue pour recevoir le trafic de la publicité Instagram (Reel 9:16)
fournie : *« Cet homme n'est pas en retard au travail. Il va juste faire sa séance
de sport. » → MÉTRO. BOULOT. KOACHER. → Réserve ta séance maintenant sur KOACHER.*

Deux livrables dans un seul dossier :

1. **Une page statique** (`index.html`) — pour prévisualiser, présenter, ou héberger telle quelle.
2. **Un plugin WordPress** (`wordpress/koacher-landing/`) — la même page, installable en deux minutes
   sur n'importe quel thème, avec réglages, Pixel Meta et collecte des demandes.

---

## 1. Ce que j'ai repris de la publicité

| Élément | Valeur retenue | Source |
|---|---|---|
| Marque | **KOACHER** | carton final de la vidéo |
| Signature | **Métro. Boulot. Koacher.** | cartons 5 → 7 s |
| Promesse | Réserver une séance de sport, tout de suite | carton CTA à 9 s |
| Ton | Tutoiement, phrases courtes, humour pince-sans-rire | sous-titres |
| Couleurs | Noir `#0A0A0A`, blanc, rouge signal `#FF3B2F` | fond des cartons + flèche du CTA |
| Typo d'affichage | Sans serif condensée très grasse, légèrement italique (Anton + `skewX(-5deg)`) | logo KOACHER |
| Format | Vertical 9:16, 10 s, sous-titres incrustés | fichier source |

La vidéo est réutilisée à deux endroits : en fond de hero (muette, en boucle) et
dans la section « La campagne », dans un mockup de téléphone, lisible avec le son.

### Hypothèses à confirmer

Tout ce qui suit est du **contenu de démonstration** — cohérent et crédible, mais à remplacer
par tes vraies données avant toute mise en ligne :

- ville de lancement (« Lyon & agglo »), quartiers et noms des coachs ;
- tarifs (19 € / 39 € / 25 €), durées, conditions d'annulation ;
- chiffres de preuve sociale (12 480 séances, 4,9/5, 140 coachs, 92 %) ;
- témoignages clients ;
- KPI de campagne, laissés volontairement à `—` dans la section « La campagne ».

> ⚠️ Les chiffres et avis inventés ne peuvent pas être publiés tels quels : en France,
> une allégation chiffrée ou un avis client non vérifiable est une pratique commerciale
> trompeuse (art. L121-2 du Code de la consommation). Pour un rendu d'exercice, c'est sans
> conséquence ; pour une mise en ligne réelle, il faut des données réelles.

---

## 2. Structure

```
koacher-landing/
├── index.html                  # la page (source unique de vérité du markup)
├── assets/
│   ├── css/koacher.css         # design system complet, responsive, dark/light
│   ├── js/koacher.js           # interactions + tracking Meta Pixel / dataLayer
│   ├── fonts/                  # Anton + Inter auto-hébergés (RGPD : zéro appel Google)
│   └── media/                  # vidéo ré-encodée pour le web + poster + image OG
├── wordpress/koacher-landing/  # le plugin WordPress
│   ├── koacher-landing.php     # modèle de page, shortcode, Pixel, endpoint REST
│   ├── inc/settings.php        # Réglages → Koacher Landing
│   └── templates/              # modèle + partial généré depuis index.html
├── build/build-wordpress.js    # regénère le partial PHP + copie les assets
├── dist/koacher-landing.zip    # plugin prêt à téléverser dans WordPress
└── docs/meta-ads-playbook.md   # plan de campagne Meta (structure, créas, tracking, KPI)
```

Le markup n'existe qu'**une seule fois**, dans `index.html`. Après toute modification :

```bash
node build/build-wordpress.js   # régénère templates/partials/landing-body.php
bash build/zip-plugin.sh        # régénère dist/koacher-landing.zip
```

---

## 3. Prévisualiser en local

```bash
cd koacher-landing
python3 -m http.server 8765
# puis http://localhost:8765
```

Un simple double-clic sur `index.html` fonctionne aussi, à ceci près que les polices
auto-hébergées sont bloquées par la politique CORS du navigateur sur `file://`.

---

## 4. Installer sur WordPress

**Option A — le ZIP (recommandé)**
1. Extensions → Ajouter → Téléverser une extension → `dist/koacher-landing.zip` → Installer → Activer.
2. Pages → Ajouter : titre « Réserver ma séance », **Attributs de page → Modèle → « Koacher — Landing page »**, publier.
3. Réglages → Koacher Landing : coller l'ID du Pixel Meta et la zone géographique.
4. Pointer la publicité vers l'URL de cette page.

**Option B — FTP / SFTP**
Copier le dossier `wordpress/koacher-landing/` dans `wp-content/plugins/`, puis activer.

**Option C — l'intégrer dans une page existante**
Insérer le shortcode `[koacher_landing]` dans n'importe quelle page (bloc « Code court »).
Le rendu dépendra alors du thème ; le modèle de page dédié donne un résultat identique partout.

### Réglages disponibles

| Réglage | Rôle | Si laissé vide |
|---|---|---|
| ID du Pixel Meta | active le Pixel et les événements | aucun script de tracking n'est chargé |
| URL de réception du formulaire | Calendly, HubSpot, Zapier, CRM… | l'endpoint interne `/wp-json/koacher/v1/lead` est utilisé |
| Zone géographique | texte affiché en hero | « Lyon & agglo » |

Les demandes reçues par l'endpoint interne s'affichent dans l'admin, menu **Demandes Koacher**
(type de contenu privé). Le hook `koacher_lp_lead_created` permet de brancher un email,
un CRM ou l'API Conversions de Meta.

---

## 5. Événements envoyés à Meta

Le script n'est chargé **que** si un ID de Pixel est renseigné.

| Moment | Événement Meta | Paramètres |
|---|---|---|
| Chargement de la page | `PageView` | — |
| Clic sur un CTA | `ViewContent` | `content_name` = id du bouton |
| Première saisie dans le formulaire | `InitiateCheckout` | `booking_form_start` |
| Envoi du formulaire | `Lead` | `value: 19`, `currency: EUR`, discipline |
| Lecture de la pub dans la section « La campagne » | `ViewContent` | `meta_ad_creative` |
| 70 % de la page atteints | `ViewContent` | `scroll_70` — utile pour une audience de reciblage |

Chaque événement est aussi poussé dans `window.dataLayer` (préfixe `koacher_`),
pour GTM ou GA4 si tu les utilises.

Le plan de campagne complet — structure du compte, ciblage, budgets, variantes de
créas et de textes, UTM, API Conversions — est dans **[docs/meta-ads-playbook.md](docs/meta-ads-playbook.md)**.

---

## 6. Ce dont j'ai besoin de toi pour finaliser

Rien n'est bloquant : la page tourne telle quelle. Chaque élément ci-dessous remplace
du contenu de démonstration.

**Indispensable avant mise en ligne**
1. **Logo KOACHER** en SVG ou PNG transparent (le pictogramme actuel est une reconstitution vectorielle d'après la vidéo).
2. **Ville / zone de lancement** réelle, pour aligner la page et le ciblage de la campagne.
3. **Offre réelle** : prix, durée des séances, conditions d'annulation, modes de paiement.
4. **Ce qui se passe après le clic** : Calendly, Simplybook, formulaire interne, numéro WhatsApp… C'est le seul point qui change vraiment le taux de conversion.
5. **Mentions légales, CGV, politique de confidentialité** + bandeau de consentement (le Pixel Meta impose un consentement préalable en France).
6. **ID du Pixel Meta** et accès au Gestionnaire d'événements.

**Fortement recommandé**
7. 3 à 6 **photos réelles** de coachs et de séances (les cartes coachs ont des placeholders).
8. 3 **vrais témoignages** clients, même courts, avec prénom et ville.
9. Les **chiffres réels** : nombre de coachs, de séances, note moyenne.
10. L'accès **WordPress** (ou juste l'hébergeur) si tu veux que je l'installe et le configure moi-même.

**Pour la partie « cas d'école »**
11. Les **captures du Gestionnaire de publicités** une fois la campagne lancée (CTR, CPM, CPL, dépense) pour remplir les KPI de la section « La campagne ».
12. Le **brief d'origine** ou les rushes du tournage, si tu veux enrichir la partie « making-of ».

---

## 7. Performance et accessibilité

- Aucune dépendance externe : pas de jQuery, pas de framework, pas de CDN. CSS 14 Ko, JS 6 Ko.
- Polices auto-hébergées et préchargées, `font-display: swap`.
- Vidéo ré-encodée en 480p H.264 `faststart` (703 Ko) avec image de poster : le hero s'affiche avant que la vidéo ne charge.
- Animations désactivées si `prefers-reduced-motion` est actif ; le contenu reste visible sans JavaScript.
- Navigation au clavier, libellés de formulaire explicites, contrastes conformes AA sur les textes principaux.
