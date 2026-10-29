# E4 · Fiche n° 2 · Simulation « salon du fitness »

Paramètres modifiés de la fiche d'activité KOACHER Club pour la simulation de l'épreuve E4 :
KOACHER expose à un salon du fitness et du bien-être (Eurexpo Lyon, 20 et 21 mars 2027).

- `Fiche_sujet_E4_Salon_fitness.docx` : le modèle officiel Annexe V-2 (`ANNEXE_V-2_modele.docx`) rempli.
- `Cahier_des_charges_Salon_fitness.pptx` : le cahier des charges présenté à Hugo pendant la simulation,
  15 diapositives au design Liquid Glass du deck E4. Le texte à dire et les réponses aux objections
  d'Hugo sont dans les notes du présentateur.

```bash
# fiche sujet : remplir le modèle décompressé, puis recompresser
mkdir un && cd un && unzip -q ../ANNEXE_V-2_modele.docx && cd ..
python3 fill_fiche_sujet.py un && (cd un && zip -qXr ../Fiche_sujet_E4_Salon_fitness.docx .)

# cahier des charges : les scènes sont dans ../koacher-motion/salon.html (styles salon.css)
cd ../koacher-motion && node render.js --page salon.html --stills --scale 2
python3 ../e4-salon-fitness/to_jpg.py
node ../e4-salon-fitness/build_pptx.js            # nécessite pptxgenjs
python3 pptx/transitions.py ../e4-salon-fitness/Cahier_des_charges_Salon_fitness.pptx
```
