# KOACHER Club · E4 Ciblage & prospection (motion design)

Vidéo 1920×1080, 30 i/s, sans son, qui déroule tout le diaporama de la phase 1 de l'oral E4.
Style repris de la vidéo KOACHER Entreprise (bordeaux `#71001d`, framboise `#d62d5a`, Plus Jakarta Sans).

- `out/KOACHER_E4_ciblage_prospection.mp4` : la vidéo complète, avec des transitions entre les scènes.
- `out/slides/*.mp4` : une vidéo par diapositive, sans transition de sortie. Chaque clip se termine sur
  l'écran complet, prêt à être figé dans PowerPoint (« Lire automatiquement », sans boucle).
- `out/chapitres.txt` : les timecodes de chaque scène dans la vidéo complète.

## PowerPoint

`pptx/KOACHER_E4_ciblage_prospection.pptx` : 32 diapositives, une par scène, chacune étant l'image finale
de la scène rendue en 3840×2160. Fondu entre les diapositives, texte à dire (avec un minutage) dans les
notes du présentateur. Sections : « 01 · L’entreprise » et « 02 · Ciblage & prospection » (phase 1),
« Phase 3 · Information commerciale » (12 scènes, styles dans `p3.css`), « Clôture ».

Un seul thème pour toutes les diapositives (`theme.css`) : fond clair avec un terrain de padel en
filigrane et un disque bordeaux, cartes en verre dépoli clair. Le fond est généré par `engine.js`.

```bash
node render.js --stills --scale 2     # images 4K dans out/stills@2x
python3 pptx/to_jpg.py                # conversion en JPEG pour le deck
node pptx/build.js                    # nécessite pptxgenjs (npm install pptxgenjs)
python3 pptx/transitions.py pptx/KOACHER_E4_ciblage_prospection.pptx
```

Les notes et le texte alternatif de chaque diapositive sont dans `pptx/build.js`.

## Modifier

- Textes et mise en page : `index.html` (une `<section>` par scène, `data-dur` = durée en secondes).
- Chiffres (CA, rétroplanning, entonnoir, tableau objectifs/résultats) : `data.js`.
  Les valeurs `null` du CA s'affichent hachurées avec un badge « À compléter ».

## Rendu

```bash
node render.js --stills          # une image par scène dans out/stills (relecture rapide)
node render.js                   # toutes les scènes + vidéo complète
node render.js --scenes 7,18     # ne refaire que certaines scènes, puis réassembler
```

Aperçu dans un navigateur : `index.html?scene=11&t=4` (scène 11 à 4 s) ou `index.html?play`.
Prérequis : Node.js, Playwright (Chromium) et ffmpeg.
