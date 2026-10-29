# Fills the official "Annexe V-2 · Fiche sujet candidat" template with the modified parameters
# (KOACHER at a fitness trade show) while keeping the template's own formatting.
#   python3 fill_fiche_sujet.py <unpacked template dir>
import re
import sys
from xml.sax.saxutils import escape

root = sys.argv[1]
path = f'{root}/word/document.xml'
xml = open(path, encoding='utf-8').read()

FONT = '<w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/>'


def run(text, bold=False, size=17):
    b = '<w:b w:val="1"/><w:bCs w:val="1"/>' if bold else ''
    return (f'<w:r><w:rPr>{FONT}{b}<w:color w:val="000000"/><w:sz w:val="{size}"/><w:szCs w:val="{size}"/></w:rPr>'
            f'<w:t xml:space="preserve">{escape(text)}</w:t></w:r>')


def para(item, size=17):
    """item: plain string, or (bold lead, text), or ('–', text) for a dash line."""
    ind = ''
    if isinstance(item, tuple) and item[0] == '–':
        runs = run('– ', size=size) + run(item[1], size=size)
        ind = '<w:ind w:left="198" w:hanging="198"/>'
    elif isinstance(item, tuple):
        runs = run(item[0], bold=True, size=size) + run(item[1], size=size)
    else:
        runs = run(item, size=size)
    return (f'<w:p><w:pPr><w:spacing w:before="0" w:after="24" w:line="235" w:lineRule="auto"/>{ind}'
            f'<w:rPr>{FONT}<w:sz w:val="{size}"/><w:szCs w:val="{size}"/></w:rPr></w:pPr>{runs}</w:p>')


ROWS = {
    1: [  # Objet de l'activité
        'Participation de KOACHER comme exposant à un salon du fitness et du bien-être, pour vendre KOACHER Pro '
        'aux coachs et structures sportives, et repérer des entreprises et des CSE (KOACHER Entreprise).',
        ('Paramètres modifiés : ', 'un salon de 2 jours remplace l’afterwork ; la cible devient les professionnels '
         'du sport ; l’offre phare devient KOACHER Pro.'),
    ],
    2: [  # Date(s) et durée
        ('Salon : ', 'samedi 20 et dimanche 21 mars 2027, de 10 h à 19 h ; installation le vendredi 19 mars, de 16 h à 20 h.'),
        ('Entretien simulé : ', 'lundi 25 janvier 2027 à 9 h 30, environ 20 minutes ; stand à réserver avant le 31 janvier 2027.'),
    ],
    3: [  # Lieu
        ('Salon : ', 'Eurexpo Lyon (Chassieu), espace fitness & bien-être, stand équipé de 9 m² (3 m × 3 m).'),
        ('Entretien : ', 'bureau de KOACHER, 1 place Giovanni da Verrazzano, 69009 Lyon.'),
    ],
    4: [  # Délimitation de séquence(s)
        ('Séquence simulée : ', 'je présente à Hugo le cahier des charges de la participation au salon et je négocie '
         'sa validation : budget, moyens humains et matériels, objectifs.'),
        ('Hors simulation : ', 'la réservation du stand, l’animation du salon et le suivi des contacts.'),
    ],
    5: [  # Historique de la relation
        'Alternant commercial B2B chez KOACHER depuis août 2026, sous la responsabilité d’Hugo, j’ai organisé le '
        'KOACHER Club : 9 RDV démo, 4 devis et 1 signature pour 350 €. Hugo est satisfait, mais le budget marketing reste limité.',
        'L’organisateur du salon a proposé un stand à KOACHER. Hugo hésite : il juge les salons coûteux et doute d’y '
        'rencontrer des professionnels qualifiés. Il m’a demandé un cahier des charges.',
        ('Mon intervention : ', 'au moment de la décision ; je dois convaincre Hugo de valider la participation et '
         'obtenir ses arbitrages sur le budget.'),
    ],
    6: [  # Objectifs de la communication
        ('–', 'Présenter le cahier des charges de façon claire et chiffrée.'),
        ('–', 'Démontrer l’intérêt du salon pour recruter des coachs et des structures sur KOACHER Pro.'),
        ('–', 'Faire valider un budget de 2 500 € HT maximum, en ajustant le devis initial de 3 000 € HT.'),
        ('–', 'Obtenir les moyens humains : Hugo le samedi après-midi et 2 coachs ambassadeurs.'),
        ('–', 'Faire valider les objectifs, les indicateurs de suivi et le rétroplanning.'),
    ],
    7: [  # Informations à exploiter
        ('–', 'Cahier des charges joint : objectifs, concept du stand, budget, rétroplanning, indicateurs.'),
        ('–', 'Devis de l’organisateur : stand équipé de 9 m² à 1 800 € HT, option angle à 250 € HT ; '
              '10 % de remise sur le stand si réservation avant le 31 janvier 2027.'),
        ('–', 'Fréquentation annoncée : 12 000 visiteurs sur 2 jours, dont environ 15 % de professionnels du sport.'),
        ('–', 'KOACHER Pro, sans engagement : 20 % de commission, ou 39 € / 49 € par mois (coach / structure), '
              'ou 328 € / 412 € par an.'),
        ('–', 'Résultats du KOACHER Club ; 200 000 sportifs, 2 000 pros, 50+ disciplines, note de 4,9/5.'),
    ],
    8: [  # Contrainte(s)
        ('–', 'Enveloppe maximale fixée par Hugo : 2 500 € HT, tout compris.'),
        ('–', 'Réservation avant le 31 janvier 2027 : moins d’une semaine pour décider.'),
        ('–', '2 personnes minimum sur le stand les 2 jours ; Hugo n’est disponible que le samedi.'),
        ('–', 'Règlement du salon : démonstrations dans l’espace du stand, sans musique amplifiée ; collecte des contacts conforme au RGPD.'),
    ],
}
VOUS = ['Kylian Leroy, alternant commercial B2B chez KOACHER, chef de projet du salon '
        '(cahier des charges, budget, prospection, animation du stand).']
JURY = ['Hugo, fondateur-dirigeant de KOACHER, qui valide les budgets. Satisfait du KOACHER Club mais prudent, '
        'il attend des chiffres précis et un retour sur investissement.']

# ---- header fields ----
def fill_field(dots, value):
    """Replace a dotted placeholder run by a value, without the placeholder's subscript."""
    global xml
    pat = re.compile(r'<w:r><w:rPr>((?:(?!</w:rPr>).)*)</w:rPr><w:t xml:space="preserve">' + re.escape(dots) + '</w:t></w:r>', re.S)
    found = pat.findall(xml)
    assert len(found) == 1, dots
    xml = pat.sub(lambda m: '<w:r><w:rPr>' + m.group(1).replace('<w:vertAlign w:val="subscript"/>', '')
                  + f'</w:rPr><w:t xml:space="preserve">{escape(value)}</w:t></w:r>', xml)

fill_field('………………………………………………………………………………', 'LEROY        ')
fill_field('…………………………………………….…………………………', 'Kylian')
fill_field('………………………………………………………………….             ', '2             ')
fill_field('……………………………………………………………………………………………………………',
           'KOACHER Club : networking auprès des dirigeants pour promouvoir et vendre l’offre B2B')

# ---- activity type: tick "Organisation et Animation d'un Évènement commercial" ----
boxes = list(re.finditer(r'<w:r><w:rPr><w:rFonts w:ascii="Wingdings"[^>]*/>(.*?)</w:rPr><w:t[^>]*>⚪</w:t></w:r>', xml, re.S))
assert len(boxes) == 2, len(boxes)
for m, mark in reversed(list(zip(boxes, ['☐', '☒']))):
    rpr = m.group(1)
    new = ('<w:r><w:rPr><w:rFonts w:ascii="Segoe UI Symbol" w:cs="Segoe UI Symbol" w:eastAsia="Segoe UI Symbol" '
           f'w:hAnsi="Segoe UI Symbol"/>{rpr}</w:rPr><w:t xml:space="preserve">{mark}</w:t></w:r>')
    xml = xml[:m.start()] + new + xml[m.end():]

# ---- parameters table ----
tbl_m = re.search(r'<w:tbl>.*?</w:tbl>', xml, re.S)
tbl = tbl_m.group(0)
rows = re.findall(r'<w:tr[ >].*?</w:tr>', tbl, re.S)
new_rows = []
for ri, row in enumerate(rows):
    cells = re.findall(r'<w:tc>.*?</w:tc>', row, re.S)
    if ri in ROWS:
        c = cells[1]
        tcpr = re.match(r'<w:tc>(<w:tcPr>.*?</w:tcPr>|<w:tcPr/>)', c, re.S).group(1)
        cells[1] = f'<w:tc>{tcpr}{"".join(para(it) for it in ROWS[ri])}</w:tc>'
    elif ri == 9:
        for k, content in ((1, VOUS), (2, JURY)):
            c = cells[k]
            first_p = re.search(r'<w:p [^>]*>.*?</w:p>', c, re.S).group(0)  # "VOUS :" / "JURY :"
            tcpr = re.match(r'<w:tc>(<w:tcPr>.*?</w:tcPr>|<w:tcPr/>)', c, re.S).group(1)
            cells[k] = f'<w:tc>{tcpr}{first_p}{"".join(para(it) for it in content)}</w:tc>'
    else:
        new_rows.append(row)
        continue
    # rebuild the row with the new cells
    head = re.match(r'<w:tr[ >].*?(?=<w:tc>)', row, re.S).group(0)
    new_rows.append(head + ''.join(cells) + '</w:tr>')

tbl_head = tbl[:tbl.index(rows[0])]
xml = xml[:tbl_m.start()] + tbl_head + ''.join(new_rows) + '</w:tbl>' + xml[tbl_m.end():]
open(path, 'w', encoding='utf-8').write(xml)
print('fiche sujet filled')
