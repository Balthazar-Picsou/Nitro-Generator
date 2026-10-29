# E4 · Fiche n° 2 · Simulation « salon du fitness »

Paramètres modifiés de la fiche d'activité KOACHER Club pour la simulation de l'épreuve E4 :
KOACHER expose à un salon du fitness et du bien-être (Eurexpo Lyon, 20 et 21 mars 2027).

- `Fiche_sujet_E4_Salon_fitness.docx` : le modèle officiel Annexe V-2 (`ANNEXE_V-2_modele.docx`) rempli.
- `Cahier_des_charges_Salon_fitness.docx` : le cahier des charges présenté à Hugo pendant la simulation
  (la dernière page, « Mes réponses aux objections », est une préparation personnelle à ne pas remettre).

```bash
# fiche sujet : remplir le modèle décompressé, puis recompresser
mkdir un && cd un && unzip -q ../ANNEXE_V-2_modele.docx && cd ..
python3 fill_fiche_sujet.py un && (cd un && zip -qXr ../Fiche_sujet_E4_Salon_fitness.docx .)
# cahier des charges (nécessite le paquet npm docx)
node build_cahier.js
```
