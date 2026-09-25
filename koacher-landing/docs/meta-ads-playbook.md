# Plan de campagne Meta — KOACHER

Document de travail pour la partie « mise en valeur de la publicité » du cas d'école.
Il décrit comment la créa fournie est diffusée sur Instagram et comment elle se connecte
à la landing page.

---

## 1. La créa

**Fichier** : Reel vertical 9:16, 10,5 s, 480 × 848, sous-titres incrustés.

**Découpage**

| Temps | Ce qu'on voit | Fonction |
|---|---|---|
| 0 – 0,5 s | Un homme en costume court en pleine rue | Hook visuel : l'anomalie attire l'œil avant que le texte ne soit lu |
| 0,5 – 3,5 s | « Cet homme n'est pas en retard au travail. » | Crée la question |
| 3,5 – 6,5 s | « Il va juste faire sa séance de sport. » | Répond, et installe l'idée que le sport tient dans une journée de bureau |
| 6,5 – 8 s | « MÉTRO. BOULOT. KOACHER. » qui s'empile | Mémorisation de marque par détournement d'une expression connue |
| 8 – 9,5 s | « ➜ Réserve ta séance maintenant sur KOACHER » | Call-to-action explicite |
| 9,5 – 10,5 s | Logo KOACHER | Signature |

**Ce qui fonctionne** : une seule idée, un hook non verbal (donc efficace en lecture sans son,
soit environ 85 % des vues de Reels), des sous-titres incrustés, une marque révélée tard
mais répétée trois fois en trois secondes.

**Ce qu'il faut tester contre** : la marque n'apparaît qu'à 6,5 s. Sur un compte sans notoriété,
la variante B ci-dessous (logo présent dès 2 s) donne souvent un meilleur taux de mémorisation.

---

## 2. Structure du compte

Objectif **Prospects** (`Leads`) si le formulaire de la landing page fait foi, ou **Ventes**
avec l'événement `Lead` en optimisation si le Pixel remonte assez de signaux
(> 50 événements / semaine / ad set).

```
Campagne — KOACHER · Acquisition · [Ville]         (budget au niveau campagne, Advantage+)
│
├── Ad set A — Large                 25-45 ans · rayon 15 km · pas de centres d'intérêt
├── Ad set B — Intérêts fitness      fitness, running, salle de sport, coaching sportif
└── Ad set C — Reciblage             visiteurs 30 j + vues vidéo ≥ 50 % + interactions IG
```

Démarrer avec A et C. N'ouvrir B que si A plafonne : sur une zone de 15 km,
multiplier les ad sets fragmente l'apprentissage.

**Placements** : Reels Instagram et Facebook, Stories, fil Instagram. Désactiver Audience Network
et les colonnes de droite — la créa 9:16 y est recadrée et le trafic y convertit mal.

**Budget de départ** : 20 à 30 €/jour pendant 7 jours, soit assez pour ~50 événements
d'optimisation si le coût par lead visé est autour de 5 €. Ne rien toucher pendant 72 h
(phase d'apprentissage).

---

## 3. Variantes à tester

Trois hooks, même corps de vidéo — c'est la première seconde qui fait le CTR.

| Variante | Première seconde | Hypothèse |
|---|---|---|
| **A** (fournie) | Homme en costume qui court, texte « Cet homme n'est pas en retard au travail. » | Curiosité |
| **B** | Même plan + logo KOACHER en surimpression dès 2 s | Meilleure attribution de marque |
| **C** | Ouverture sur le carton « MÉTRO. BOULOT. » puis la course | Reconnaissance immédiate de l'expression |

### Textes principaux

1. *Ta séance de sport, réservée en 30 secondes. Un coach certifié, près de chez toi, au créneau qui t'arrange. Première séance à 19 €, sans engagement.*
2. *« J'ai pas le temps. » 45 minutes. Avant le boulot, sur la pause déj ou en sortant. C'est toi qui choisis l'heure, le coach s'adapte.*
3. *Trois abonnements en salle jamais utilisés ? Ici tu réserves une séance, pas un an. Et quelqu'un t'attend en bas de chez toi.*

### Titres (headlines)

- Réserve ta séance en 30 secondes
- Un coach près de chez toi, dès demain
- Première séance à 19 € — sans engagement

### Descriptions

- Coachs certifiés · Annulation gratuite 4 h avant
- Paiement après la séance

**CTA du bouton** : « Réserver » (préférable à « En savoir plus » : la page est déjà une page de réservation).

---

## 4. Du clic à la page

**URL de destination** : la page WordPress portant le modèle « Koacher — Landing page ».

**Paramètres d'URL** (à coller dans le champ « Paramètres d'URL » de la publicité) :

```
utm_source=meta&utm_medium=paid_social&utm_campaign=koacher_acquisition&utm_content={{ad.name}}&utm_term={{adset.name}}
```

**Correspondance créa → page** : la promesse de la pub doit se retrouver telle quelle au-dessus
de la ligne de flottaison. C'est le cas ici — le titre de la page *est* la signature de la vidéo,
et la phrase des sous-titres est reprise mot pour mot en accroche. Un visiteur qui arrive doit
reconnaître en moins d'une seconde ce sur quoi il vient de cliquer.

---

## 5. Mesure

| Étape | Événement | Où il se déclenche |
|---|---|---|
| Arrivée | `PageView` | chargement |
| Intérêt | `ViewContent` (`scroll_70`) | 70 % de la page |
| Intention | `InitiateCheckout` | première saisie dans le formulaire |
| Conversion | `Lead` (valeur 19 €) | envoi du formulaire |

**API Conversions** : le Pixel seul perd 20 à 40 % des conversions (iOS, bloqueurs).
Brancher l'envoi serveur sur le hook `koacher_lp_lead_created` du plugin, ou passer par
l'extension officielle *Facebook for WooCommerce* / un connecteur Zapier. Penser à envoyer
le même `event_id` des deux côtés pour la déduplication.

**Consentement** : en France, le Pixel ne doit se charger qu'après acceptation. Laisser le champ
« ID du Pixel » vide tant que la bannière de consentement n'est pas branchée, ou conditionner
`koacher_lp_opt('pixel_id')` à l'état du consentement.

---

## 6. Repères de lecture des résultats

Ordres de grandeur pour du coaching sportif local en France, à titre indicatif seulement —
seules les données réelles de la campagne comptent.

| Indicateur | Zone correcte | Signal d'alerte |
|---|---|---|
| Taux de clic (lien) | 1 – 2 % | < 0,7 % → la créa ou le ciblage ne prend pas |
| Taux de rétention vidéo à 3 s | > 40 % | < 25 % → le hook est à refaire |
| CPM | 6 – 15 € | > 25 € → audience trop étroite |
| Conversion de la landing | 5 – 12 % | < 3 % → friction sur le formulaire ou promesse mal alignée |
| Coût par lead | 4 – 10 € | à comparer à la marge d'une séance, pas dans l'absolu |

**Arbitrage utile** : un CTR faible mais une bonne conversion de page → changer la créa.
Un bon CTR mais une conversion de page faible → changer la page, pas la pub.

---

## 7. Sur la semaine 1

| Jour | Action |
|---|---|
| J0 | Mise en ligne, vérification du Pixel avec l'outil *Test d'événements* |
| J1 – J3 | Ne rien toucher (apprentissage) |
| J4 | Couper la variante dont le CTR est le plus bas si l'écart est net |
| J5 | Créer l'audience de reciblage (visiteurs 30 j sans `Lead`) |
| J7 | Bilan : remplir les KPI de la section « La campagne » de la landing page |
