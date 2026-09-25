# Prompt à donner à une IA ayant accès à WordPress

Version 2 — alignée sur la marque réelle KOACHER (koacher.app).

Copier-coller le bloc ci-dessous tel quel. Joindre les trois fichiers médias listés en fin de prompt.

---

## RÔLE

Tu es intégrateur web et directeur artistique. Tu as accès à mon site WordPress et tu peux y créer des pages, des blocs et du CSS. Tu vas créer **une landing page de réservation** pour la marque **KOACHER**, destinée à recevoir le trafic d'une publicité Instagram (Reel) déjà produite.

## PREMIÈRE ÉTAPE, OBLIGATOIRE : RELEVER LA DIRECTION ARTISTIQUE DE LA MARQUE

Avant d'écrire la moindre ligne de code, ouvre et analyse ces pages :

- `https://koacher.app/` — le site grand public
- `https://go.koacher.app/fr/search` — l'outil de réservation
- `https://pro.koacher.app/` — la partie professionnels

Relève et note explicitement, avant de commencer :

1. **Couleurs** : code hexadécimal du fond, du texte, de la couleur d'accent principale, des couleurs secondaires, des états de survol. Prends-les dans le CSS, pas à l'œil.
2. **Typographies** : nom exact des polices de titre et de texte, graisses utilisées, tailles, hauteurs de ligne, capitales ou non, espacement des lettres.
3. **Composants** : rayon des coins, style des boutons (plein, contour, pilule ou rectangle), ombres, style des cartes, style des champs de formulaire.
4. **Iconographie et photo** : illustrations ou photos ? Photos en situation, recadrage, filtre, traitement colorimétrique ?
5. **Logo** : version exacte, zone de protection, déclinaison claire et sombre.
6. **Ton éditorial** : tutoiement ou vouvoiement, longueur des phrases, vocabulaire récurrent. **Aligne-toi dessus.**
7. **Vocabulaire produit** : comment la marque nomme ses éléments (« séance », « session », « activité », « pro », « coach », « structure »). Reprends ses mots, pas les miens.

**Règle d'arbitrage, importante.** La direction artistique du site fait loi pour l'ensemble de la page : couleurs, typographies, boutons, cartes, champs. Une seule exception, le **hero** et la section **« La campagne »**, qui doivent conserver les codes de la publicité (fond noir, titre en capitales condensées légèrement penchées, accent rouge) : c'est ce qui permet au visiteur de reconnaître en une seconde la pub sur laquelle il vient de cliquer. Le reste de la page fait la transition vers l'univers du site. Si les deux univers jurent franchement, garde la palette du site et ne conserve du Reel que la composition et la typographie du titre.

Si une page est inaccessible, dis-le-moi et demande-moi des captures d'écran plutôt que d'inventer une charte.

## CE QU'EST KOACHER (à ne pas réinventer)

Application de réservation d'activités sportives et de bien-être. Elle met en relation les sportifs avec des coachs indépendants, des salles, des clubs et des studios.

- Plus de **35 disciplines** : fitness, yoga, pilates, boxe, tennis, padel, golf, running, natation, renforcement…
- Séances **individuelles ou en groupe**.
- **Partout en France**, avec des tarifs préférentiels.
- Séances **où le sportif veut** : à domicile, en salle, en extérieur, en visio, ou sur le lieu de travail.
- Communauté de plus de **200 000 sportifs** et plus de **2 000 professionnels**.
- Réservation **24 h/24, 7 j/7**, sur le web et sur les applications iOS et Android.
- Trois univers distincts : grand public (koacher.app), professionnels (pro.koacher.app), entreprises (b2b.koacher.app). **Cette landing page ne s'adresse qu'au grand public.**

**Points à respecter absolument** : KOACHER est une place de marché, pas un studio de coaching. Les prix sont fixés par les professionnels, donc **n'invente aucun tarif**. Ne promets rien que la marque ne promette pas. Si tu as besoin d'un chiffre que je ne t'ai pas donné, laisse un repère visible du type `[À COMPLÉTER]` plutôt que d'inventer.

## OBJECTIF DE LA PAGE

Un seul objectif : **faire réserver une séance**. Tout élément qui ne sert pas cette action est à supprimer. Le clic sortant se fait vers `https://go.koacher.app/fr/search` (ou vers le formulaire que je te préciserai), avec les liens de téléchargement des applications en objectif secondaire.

Contexte : la personne vient de voir un Reel de 10 secondes sur son téléphone, dans les transports ou au bureau. Elle arrive avec 3 secondes d'attention et doit comprendre en une phrase ce qu'elle peut faire ici.

## LA PUBLICITÉ DONT LA PAGE EST LE PROLONGEMENT

Reel vertical 9:16, 10 secondes, sous-titres incrustés, ambiance urbaine :

1. Un homme en costume court à toute vitesse dans une rue de ville.
2. Sous-titre : « Cet homme n'est pas en retard au travail. »
3. Sous-titre : « Il va juste faire sa séance de sport. »
4. Cartons noirs qui s'empilent : « MÉTRO. » « BOULOT. » « KOACHER. »
5. Carton final : « ➜ Réserve ta séance maintenant sur KOACHER »
6. Logo KOACHER blanc sur fond noir.

**Règle de continuité publicitaire** : le titre de la page doit être la signature de la pub, et l'accroche doit reprendre mot pour mot les sous-titres. C'est ce qui évite le décrochage après le clic.

## STRUCTURE À CRÉER

### 1. Hero — plein écran
- La vidéo MP4 en fond, **en boucle, sans son, lecture automatique, `playsinline`**, avec image de poster pour l'affichage immédiat, et un voile sombre dégradé pour garder le texte lisible.
- Surtitre : `RÉSERVATION DE SÉANCES DE SPORT — [VILLE]`, avec une pastille d'accent clignotante.
- Titre en trois lignes empilées, très grand : **MÉTRO.** / **BOULOT.** / **KOACHER.** — le troisième mot dans la couleur d'accent de la marque.
- Accroche : « Cet homme n'est pas en retard au travail. Il va juste faire sa séance de sport. **Réserve la tienne en 30 secondes** — plus de 35 disciplines, des coachs et des salles partout en France. »
- Trois pastilles de réassurance : « Plus de 35 disciplines », « Réservation 24 h/24 », « Sans abonnement ».
- À droite (en dessous sur mobile), **la carte de réservation**, reprenant les champs de la recherche du site :
  - Activité ou discipline (liste déroulante alimentée par les disciplines réelles du site)
  - Ville ou code postal
  - Moment (Avant le boulot 6 h/9 h · Pause déj 12 h/14 h · Après le boulot 18 h/21 h · Week-end)
  - Bouton d'accent pleine largeur : « Voir les créneaux dispo → » pointant vers `https://go.koacher.app/fr/search`
  - Mention sous le bouton : « Gratuit, sans carte bancaire. Tu choisis ton pro et ton créneau. »

### 2. Bandeau défilant
Texte en boucle dans la couleur d'accent : « Métro. Boulot. Koacher. • 35 disciplines • Partout en France • Zéro excuse • »

### 3. Chiffres clés
Quatre chiffres, repris du site, pas inventés : **200 000+ sportifs** · **2 000+ professionnels** · **35+ disciplines** · **Réservation 24 h/24**.

### 4. Les 3 objections
Titre : « ON LES A TOUTES ENTENDUES. **ON LES A TOUTES RÉGLÉES.** » Trois cartes, chacune ouvrant sur l'objection en italique :
- « J'ai pas le temps. » → **Tu réserves quand tu veux.** 24 h/24, 7 j/7, et tu choisis le créneau qui rentre dans ta journée.
- « J'ai pas la motivation. » → **Quelqu'un t'attend.** Un rendez-vous avec un pro, pas un abonnement qui dort.
- « J'ai pas de salle. » → **Le lieu, c'est toi qui le choisis.** À domicile, en salle, en extérieur, en visio ou sur ton lieu de travail.

### 5. Comment ça marche
Titre : « TROIS ÉTAPES. ZÉRO FRICTION. » Trois colonnes numérotées 01 / 02 / 03 :
1. **Tu cherches** — discipline, ville, moment. Trois champs, trente secondes.
2. **Tu compares** — profils de coachs et de salles, avis, tarifs affichés, disponibilités en temps réel.
3. **Tu réserves** — confirmation immédiate, et tu n'as plus qu'à enfiler tes baskets.
Bouton en dessous : « Trouver ma séance ».

### 6. Disciplines
Grille des disciplines réelles relevées sur le site (au moins 12 visibles, avec un lien « et 20 autres »). Chaque case renvoie vers la recherche filtrée sur cette discipline.

### 7. Où tu veux
Cinq cartes ou pictogrammes : à domicile · en salle · en extérieur · en visio · sur ton lieu de travail.

### 8. Preuve sociale
Avis clients réels, repris du site ou des fiches des applications iOS et Android. Si je ne t'en fournis pas, mets des emplacements marqués `[AVIS À INSÉRER]` — n'invente aucun témoignage.

### 9. Tarifs
**Pas de grille tarifaire inventée.** Un bloc court qui explique le modèle : les prix sont fixés par chaque professionnel et affichés avant la réservation, séance à l'unité ou en formule, tarifs préférentiels sur la plateforme, aucun abonnement imposé. Bouton : « Voir les tarifs près de chez moi ».

### 10. L'application
Bloc court avec les deux badges de téléchargement (App Store et Google Play) et un visuel de l'application. Objectif secondaire de la page.

### 11. La campagne — section « coulisses »
Deux colonnes. À gauche, **la vidéo de la publicité dans un mockup de téléphone**, lisible avec le son au clic, avec une fausse interface Instagram (« koacher · Sponsorisé » et un bouton « Réserver »). À droite, titre « LA PUB INSTAGRAM, **DE L'IDÉE AU CLIC.** » puis quatre entrées : Le concept / Le tournage / Le montage / La diffusion. Dessous, une rangée de 4 encadrés en pointillés pour les indicateurs (CTR, CPM, coût par lead, taux de conversion), laissés vides avec un tiret.

### 12. FAQ
Six questions en accordéon, avec `<details>` natif et sans JavaScript : niveau débutant, lieux des séances, annulation, matériel, sélection des professionnels, moment du paiement. **Reprends les réponses réelles du site ou de son centre d'aide** ; pour toute réponse que tu ne trouves pas, écris `[RÉPONSE À VALIDER]`.

### 13. Appel à l'action final
Fond : une image extraite de la vidéo, très assombrie. Titre centré : « TON PROCHAIN CRÉNEAU EST DANS **30 SECONDES**. » et un gros bouton d'accent « Réserver ma séance ».

### 14. Barre fixe mobile
Sur mobile uniquement, une barre collée en bas : « 35+ disciplines / Sans abonnement » à gauche, bouton d'accent « Réserver » à droite.

## CONTRAINTES TECHNIQUES

- **Mobile d'abord** : 80 % du trafic vient d'Instagram, donc d'un téléphone. Vérifie le rendu en 390 px de large avant tout.
- Page en **pleine largeur**, sans barre latérale. Si le thème impose un en-tête, garde-le, mais ne duplique pas la navigation dans la page.
- **Aucun plugin payant.** Si le formulaire a besoin d'une extension, utilise celle déjà installée ou le formulaire natif du thème.
- **Pas de framework, pas de jQuery.** La page doit rester lisible et cliquable si le JavaScript ne se charge pas : accordéons en HTML natif, aucun contenu masqué par défaut.
- **Vitesse** : vidéo en 480p H.264 avec `preload="metadata"` et image de poster, images en WebP, polices en `font-display: swap`. Objectif : titre affiché en moins de 1,5 s en 4G.
- **Accessibilité** : contrastes AA, navigation au clavier, libellés de formulaire explicites, `prefers-reduced-motion` respecté.
- **RGPD** : aucune police ni script chargé depuis un domaine tiers tant que le bandeau de consentement n'est pas validé. Le Pixel Meta ne se déclenche qu'après acceptation.
- **Marque** : n'utilise que le logo officiel récupéré sur le site. Ne redessine pas le logo, ne crée pas de variante de couleur, ne modifie pas la baseline.

## SUIVI DE PERFORMANCE

Prévois les déclencheurs suivants, à brancher sur le Pixel Meta :
- chargement de la page → `PageView`
- première saisie dans le formulaire → `InitiateCheckout`
- clic sortant vers la recherche → `Lead`
- clic sur la vidéo de la section « La campagne » → `ViewContent`
- clic sur un badge de téléchargement → `ViewContent` (`app_download`)

## CE QUE JE TE FOURNIS

- `koacher-ad.mp4` — la publicité (vertical 9:16, 10 s)
- `ad-poster.jpg` — image de poster pour le hero
- `ad-logo-frame.jpg` — carton de fin, pour le fond de l'appel à l'action final

## CE QUE J'ATTENDS EN RETOUR

1. **D'abord**, avant toute création : la fiche de direction artistique relevée sur koacher.app (couleurs hexadécimales, polices, composants, ton), que je valide.
2. Ensuite la page créée et publiée **en brouillon**, avec son URL.
3. La liste de tout ce que tu as laissé en `[À COMPLÉTER]` ou en `[AVIS À INSÉRER]`.
4. Les questions bloquantes : ville de lancement, destination exacte du bouton de réservation, identifiant du Pixel.

**Ne publie pas la page en ligne sans me la montrer.**
