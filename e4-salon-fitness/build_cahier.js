// Cahier des charges: KOACHER at a fitness trade show (support for the E4 simulation, fiche n°2).
//   NODE_PATH=$(npm root -g) node build_cahier.js
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  AlignmentType, LevelFormat, Footer, PageNumber, PageBreak, VerticalAlign, TableLayoutType,
} = require('docx');

const BDX = '71001D', PINK = 'D62D5A', INK = '1F1A1C', MUTED = '6B6266', ROW = 'F8F0F3', LINE = 'E6D3DA';
const W = 9866; // A4 width minus 2 × 1020 margins (DXA)

const t = (text, o = {}) => new TextRun({ text, font: 'Calibri', size: o.size || 20, bold: o.bold, color: o.color || INK, italics: o.italics });
const p = (runs, o = {}) => new Paragraph({
  children: (Array.isArray(runs) ? runs : [runs]).map(r => (typeof r === 'string' ? t(r, o) : r)),
  spacing: { before: o.before || 0, after: o.after ?? 100, line: 276 }, alignment: o.align,
  numbering: o.bullet ? { reference: 'dash', level: 0 } : undefined,
  keepNext: o.keepNext,
});
const lead = (b, rest) => [t(b, { bold: true }), t(rest)];
let secN = 0;
const h = title => new Paragraph({
  children: [t(`${++secN}. `, { bold: true, color: PINK, size: 26 }), t(title, { bold: true, color: BDX, size: 26 })],
  spacing: { before: 280, after: 120 }, keepNext: true,
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LINE, space: 4 } },
});

const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: border, bottom: border, left: border, right: border };
function table(widths, header, rows, o = {}) {
  const cell = (content, w, i, isHead, rowIdx, bold) => new TableCell({
    width: { size: w, type: WidthType.DXA }, borders, verticalAlign: VerticalAlign.CENTER,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    shading: isHead ? { fill: BDX, type: ShadingType.CLEAR, color: 'auto' }
      : (o.totalLast && rowIdx === rows.length - 1) ? { fill: 'F1DDE4', type: ShadingType.CLEAR, color: 'auto' }
        : rowIdx % 2 ? { fill: ROW, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    children: (Array.isArray(content) ? content : [content]).map(c => new Paragraph({
      spacing: { before: 0, after: 0, line: 252 },
      alignment: o.align && o.align[i] ? o.align[i] : AlignmentType.LEFT,
      children: (Array.isArray(c) ? c : [c]).map(r => typeof r === 'string'
        ? t(r, { size: 18, bold: isHead || bold || (o.boldFirst && i === 0) || (o.totalLast && rowIdx === rows.length - 1), color: isHead ? 'FFFFFF' : INK })
        : r),
    })),
  });
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: header.map((c, i) => cell(c, widths[i], i, true, -1)) }),
      ...rows.map((r, ri) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, widths[i], i, false, ri)) })),
    ],
  });
}
const gap = () => p('', { after: 60 });

const children = [
  // ---------- title block ----------
  p(t('KOACHER · BTS NDRC · ÉPREUVE E4 · FICHE D’ACTIVITÉ N° 2 · DOCUMENT JOINT À LA FICHE SUJET', { size: 16, bold: true, color: PINK }), { after: 120 }),
  p(t('Cahier des charges', { size: 52, bold: true, color: BDX }), { after: 40 }),
  p(t('Participation de KOACHER au salon du fitness et du bien-être', { size: 30, bold: true, color: INK }), { after: 60 }),
  p(t('Eurexpo Lyon · samedi 20 et dimanche 21 mars 2027 · opération « Testez KOACHER »', { size: 22, color: MUTED }), { after: 120 }),
  p([t('Rédigé par ', { color: MUTED }), t('Kylian Leroy', { bold: true }), t(', alternant commercial B2B · présenté à ', { color: MUTED }),
    t('Hugo', { bold: true }), t(', fondateur-dirigeant, le lundi 25 janvier 2027', { color: MUTED })], { after: 200,
    }),

  // ---------- 1 ----------
  h('Contexte et besoin'),
  p('KOACHER, start-up lyonnaise, réunit 200 000 sportifs, plus de 2 000 coachs et structures et plus de 50 disciplines sur une seule plateforme. '
    + 'Après le KOACHER Club, l’afterwork organisé pour les dirigeants (9 RDV démo, 4 devis et 1 signature pour 350 €), l’organisateur '
    + 'd’un salon du fitness et du bien-être à Lyon propose un stand à KOACHER.'),
  p(lead('Besoin : ', 'recruter de nouveaux professionnels sur KOACHER Pro (coachs indépendants, salles, studios) pour enrichir l’offre '
    + 'proposée aux sportifs et aux entreprises, et générer du chiffre d’affaires récurrent. Le salon annonce 12 000 visiteurs sur 2 jours, '
    + 'dont environ 15 % de professionnels du sport, soit près de 1 800 personnes.')),
  p(lead('Intitulé de l’opération : ', '« Testez KOACHER », le stand KOACHER au salon du fitness et du bien-être.')),

  // ---------- 2 ----------
  h('Paramètres modifiés par rapport au KOACHER Club'),
  table([2000, 3700, 4166], ['Paramètre', 'Fiche initiale : KOACHER Club', 'Paramètre modifié : salon fitness'], [
    ['Type d’événement', 'Afterwork sport & networking organisé par KOACHER', 'Participation comme exposant à un salon du fitness et du bien-être'],
    ['Date et durée', 'Une soirée en semaine, de 18 h 30 à 20 h 45', '2 jours : samedi 20 et dimanche 21 mars 2027, de 10 h à 19 h'],
    ['Lieu', 'Salle partenaire, Lyon 9e', 'Eurexpo Lyon (Chassieu), stand équipé de 9 m²'],
    ['Cible principale', 'Dirigeants, DRH et élus CSE de PME', 'Coachs indépendants et structures sportives (salles, studios)'],
    ['Cible secondaire', '—', 'Entreprises et CSE en visite ; grand public (téléchargement de l’appli)'],
    ['Offre mise en avant', 'KOACHER Entreprise', 'KOACHER Pro, puis KOACHER Entreprise'],
    ['Objectif principal', '8 RDV démo sous 7 jours', '30 professionnels inscrits sur KOACHER Pro sous 30 jours'],
    ['Budget', '350 €', '2 500 € HT maximum'],
    ['Équipe', 'Hugo et moi', 'Moi les 2 jours, Hugo le samedi après-midi, 2 coachs ambassadeurs'],
    ['Animation', 'Séance de padel, pitch, networking', 'Démos de 10 min sur le stand, inscription sur tablette, jeu concours'],
    ['Préparation', '30 jours', '8 semaines (décision le 25 janvier 2027)'],
  ], { boldFirst: true }),

  // ---------- 3 ----------
  h('Objectifs'),
  table([1700, 4766, 3400], ['Type', 'Objectif', 'Mesure'], [
    ['Principal', '30 professionnels inscrits sur KOACHER Pro dans les 30 jours suivant le salon, dont 10 inscrits sur le stand', 'Espace Pro et champ « source » dans Pipedrive'],
    ['Quantitatif', '150 contacts qualifiés saisis dans Pipedrive', 'Tableau de bord Pipedrive'],
    ['Quantitatif', '10 RDV démo KOACHER Entreprise avec des entreprises ou des CSE', 'Agenda Pipedrive'],
    ['Quantitatif', '300 téléchargements de l’appli via le QR code du stand', 'QR code dédié'],
    ['Quantitatif', '+100 abonnés sur LinkedIn et Instagram', 'Statistiques des réseaux'],
    ['Qualitatif', 'Faire connaître KOACHER Pro auprès des professionnels lyonnais', 'Retours des visiteurs et des coachs'],
    ['Qualitatif', 'Nouer 2 partenariats avec des salles ou studios pour de futurs événements', 'Accords conclus'],
    ['Rentabilité', 'Coût par contact ≤ 16,50 € ; coût par inscription ≤ 83 €', 'Budget réel ÷ résultats'],
    ['Repli', '15 inscriptions Pro, 80 contacts qualifiés, 5 RDV entreprises', '—'],
  ], { boldFirst: true }),

  // ---------- 4 ----------
  h('Cibles et offres'),
  table([2300, 3300, 4266], ['Cible', 'Profil et attentes', 'Ce que je propose'], [
    ['Coachs indépendants (cœur de cible)', 'Gagner en visibilité et en clients, gérer simplement les réservations',
      'KOACHER Pro : visibilité auprès de 200 000 sportifs, réservations et paiements en ligne ; 20 % de commission, ou 39 €/mois, ou 328 €/an'],
    ['Structures (salles, studios)', 'Remplir les créneaux, gérer agenda, facturation et statistiques',
      'KOACHER Pro structure : 20 % de commission, ou 49 €/mois, ou 412 €/an, sans engagement'],
    ['Entreprises et CSE (secondaire)', 'QVCT, fidélisation, marque employeur, avantage fiscal',
      'KOACHER Entreprise : budget libre, paiement à l’usage, exonération jusqu’à 200,25 €/salarié/an ; RDV démo'],
    ['Grand public', 'Tester de nouvelles activités', 'Téléchargement de l’appli par QR code, jeu concours'],
  ], { boldFirst: true }),

  // ---------- 5 ----------
  h('Le stand « Testez KOACHER »'),
  p(lead('Zone démo : ', 'mini-séances de 10 minutes animées par les coachs ambassadeurs (mobilité, gainage, yoga express) pour attirer les visiteurs.'), { bullet: true, after: 60 }),
  p(lead('Zone pro : ', 'tablette pour créer un profil KOACHER Pro en 5 minutes, panneau comparatif des 3 formules, fiche découverte dédiée aux professionnels.'), { bullet: true, after: 60 }),
  p(lead('Zone entreprises : ', 'fiche argumentaire avec simulation fiscale, prise de RDV démo par QR code.'), { bullet: true, after: 60 }),
  p(lead('Jeu concours : ', '3 bons cadeaux KOACHER à gagner, participation par QR code avec consentement RGPD, tirage chaque soir à 18 h 30.'), { bullet: true, after: 140 }),
  p(t('Déroulé type d’une journée', { bold: true, color: BDX }), { after: 80, keepNext: true }),
  table([2200, 7666], ['Horaire', 'Activité'], [
    ['9 h 00', 'Arrivée de l’équipe, brief, vérification du matériel et des tablettes'],
    ['10 h 00', 'Ouverture : accueil et découverte des besoins en continu, inscriptions et prises de RDV'],
    ['10 h 30 → 17 h 30', 'Une démo de 10 minutes toutes les heures, animée par un coach ambassadeur'],
    ['12 h 30 → 14 h 00', 'Pauses déjeuner en relais : 2 personnes toujours présentes sur le stand'],
    ['18 h 30', 'Tirage au sort du jeu concours'],
    ['19 h 00', 'Fermeture, point d’équipe, export des contacts vers Pipedrive'],
  ], { boldFirst: true }),

  // ---------- 6 ----------
  h('Moyens humains'),
  table([2300, 3566, 2000, 2000], ['Personne', 'Rôle', 'Samedi 20 mars', 'Dimanche 21 mars'], [
    ['Kylian Leroy (moi)', 'Chef de projet : accueil, découverte, inscriptions, RDV', '10 h – 19 h', '10 h – 19 h'],
    ['Hugo, fondateur', 'Rencontres avec les gérants de salles et les entreprises', '14 h – 19 h', '—'],
    ['Coach ambassadeur A', 'Démos, conseils aux coachs visiteurs', '10 h – 14 h', '14 h – 19 h'],
    ['Coach ambassadeur B', 'Démos, conseils aux coachs visiteurs', '14 h – 19 h', '10 h – 14 h'],
    ['Coach de réserve', 'Remplacement en cas d’absence', 'Sur appel', 'Sur appel'],
  ], { boldFirst: true }),
  p(t('Les coachs ambassadeurs sont choisis parmi les partenaires KOACHER et défrayés 80 € chacun. Le planning garantit au moins 2 personnes sur le stand à tout moment.', { size: 18, color: MUTED }), { before: 80 }),

  // ---------- 7 ----------
  h('Moyens matériels'),
  ...[
    'Stand équipé de 9 m² fourni par l’organisateur : cloisons, moquette, enseigne, électricité',
    '2 tablettes avec l’appli et l’espace Pro, sur support, et une connexion 4G de secours',
    'Kakémono et panneau des formules KOACHER Pro, créés sur Canva',
    '1 000 flyers et 300 cartes avec QR code (appli, inscription Pro, RDV démo)',
    'Fiches découverte pour les professionnels et fiche argumentaire avec simulation fiscale pour les entreprises',
    'Tapis et petit matériel de démonstration prêtés par les coachs ambassadeurs',
    'Multiprise, chargeurs, formulaire papier de secours, 3 bons cadeaux pour le jeu concours',
  ].map((x, i, a) => p(x, { bullet: true, after: i === a.length - 1 ? 120 : 40 })),

  // ---------- 8 ----------
  h('Budget prévisionnel'),
  table([3500, 1650, 1650, 3066], ['Poste', 'Devis initial (€ HT)', 'Budget proposé (€ HT)', 'Ajustement'], [
    ['Stand équipé de 9 m²', '1 800', '1 620', 'Remise de 10 % si réservation avant le 31 janvier'],
    ['Option stand d’angle', '250', '0', 'Supprimée : les démos assurent la visibilité'],
    ['Signalétique (kakémono, panneau des formules)', '220', '220', '—'],
    ['Supports imprimés (flyers, cartes QR code)', '180', '180', '—'],
    ['Jeu concours (bons cadeaux KOACHER)', '250', '150', '3 bons de 50 € au lieu de 5'],
    ['Défraiement des 2 coachs ambassadeurs', '160', '160', '2 × 80 €'],
    ['Restauration et déplacements de l’équipe', '140', '140', '—'],
    ['Total', '3 000', '2 470', 'Sous l’enveloppe de 2 500 € HT'],
  ], { totalLast: true, align: [null, AlignmentType.RIGHT, AlignmentType.RIGHT, null] }),
  p(lead('Point mort : ', '8 abonnements annuels de coach (8 × 328 € = 2 624 €) suffisent à couvrir le coût du salon. '
    + 'Si les 30 professionnels visés choisissent l’abonnement mensuel coach, le salon génère 1 170 € de chiffre d’affaires par mois (30 × 39 €).'), { before: 100 }),
  p(lead('Coût par contact visé : ', '16,50 € (2 470 € ÷ 150 contacts), proche des 14,60 € du KOACHER Club.')),

  // ---------- 9 ----------
  h('Plan de communication'),
  table([2000, 5266, 2600], ['Période', 'Actions', 'Outils'], [
    ['Avant · 22 février → 19 mars', 'Annonce du stand sur LinkedIn et Instagram ; e-mailing aux coachs et structures de la base Pipedrive non encore partenaires ; messages LinkedIn aux gérants de salles ; RDV pré-fixés sur le stand ; relais par les coachs partenaires', 'LinkedIn, Instagram, Gmail, Pipedrive, Canva'],
    ['Pendant · 20 et 21 mars', 'Stories et posts en direct des démos ; QR codes sur le stand ; jeu concours', 'Instagram, LinkedIn, QR codes, tablettes'],
    ['Après · 22 mars → 19 avril', 'E-mail de remerciement avec lien d’inscription ; relances à J+3 et J+10 ; RDV démo avec les entreprises ; publication du bilan', 'Gmail, téléphone, Pipedrive, LinkedIn'],
  ], { boldFirst: true }),

  // ---------- 10 ----------
  h('Rétroplanning'),
  table([2000, 1100, 4766, 2000], ['Date', 'Repère', 'Action', 'Responsable'], [
    ['Lun. 25 janvier', 'J-54', 'Présentation du cahier des charges à Hugo et validation', 'Moi, Hugo'],
    ['Ven. 29 janvier', 'J-50', 'Réservation du stand, avec la remise de 10 %', 'Moi (signature d’Hugo)'],
    ['1er → 5 février', 'J-47', 'Recrutement des 2 coachs ambassadeurs et d’un coach de réserve', 'Moi'],
    ['8 → 19 février', 'J-40', 'Création des supports sur Canva, commande d’impression', 'Moi'],
    ['Lun. 22 février', 'J-26', 'Lancement de la communication (LinkedIn, Instagram, e-mailing)', 'Moi'],
    ['Lun. 8 mars', 'J-12', 'Relances, prise de RDV sur le stand', 'Moi'],
    ['Lun. 15 mars', 'J-5', 'Brief d’équipe, planning, check-list logistique', 'Moi, équipe'],
    ['Ven. 19 mars', 'J-1', 'Installation du stand, de 16 h à 20 h', 'Moi, coach A'],
    ['Sam. 20 – dim. 21 mars', 'J', 'Salon', 'Équipe'],
    ['Lun. 22 mars', 'J+2', 'Saisie et qualification des contacts dans Pipedrive (source « Salon fitness »)', 'Moi'],
    ['23 mars → 2 avril', 'J+3 → J+13', 'Relances à J+3 et J+10, RDV démo, aide à l’inscription', 'Moi'],
    ['Lun. 19 avril', 'J+30', 'Réunion bilan avec le tableau de bord Pipedrive', 'Moi, Hugo'],
  ], { boldFirst: true }),

  // ---------- 11 ----------
  h('Suivi et évaluation'),
  table([3800, 3066, 3000], ['Indicateur', 'Objectif', 'Outil'], [
    ['Inscriptions KOACHER Pro', '30 sous 30 jours, dont 10 sur le stand', 'Espace Pro, Pipedrive'],
    ['Contacts qualifiés', '150', 'Pipedrive, champ « source »'],
    ['RDV démo entreprises', '10', 'Agenda Pipedrive'],
    ['Taux de transformation contacts → inscriptions', '20 %', 'Tableau de bord Pipedrive'],
    ['Coût par contact / par inscription', '≤ 16,50 € / ≤ 83 €', 'Budget réel'],
    ['Téléchargements de l’appli', '300', 'QR code dédié'],
    ['Abonnés LinkedIn et Instagram', '+100', 'Statistiques des réseaux'],
  ], { boldFirst: true }),
  p(t('Le bilan est présenté à Hugo le lundi 19 avril 2027 avec le tableau de bord Pipedrive partagé.', { size: 18, color: MUTED }), { before: 80 }),

  // ---------- 12 ----------
  h('Risques et solutions'),
  table([3800, 6066], ['Risque', 'Solution prévue'], [
    ['Peu de professionnels sur le stand', 'RDV pré-fixés avant le salon ; une démo toutes les heures pour attirer'],
    ['Beaucoup de grand public, peu de décideurs', 'Questions de découverte rapides ; QR code de l’appli pour le grand public, priorité aux professionnels'],
    ['Absence d’un membre de l’équipe', 'Coach de réserve et planning en relais'],
    ['Dépassement du budget', 'Options supprimées, dépenses validées par Hugo et suivies chaque semaine'],
    ['Inscriptions non finalisées après le salon', 'Relances à J+3 et J+10, aide à l’inscription par téléphone'],
    ['Panne de tablette ou de connexion', '2 tablettes, partage de connexion 4G, formulaire papier de secours'],
  ], { boldFirst: true }),

  // ---------- preparation sheet ----------
  new Paragraph({ children: [new PageBreak()] }),
  p(t('PRÉPARATION PERSONNELLE · NON REMISE AU JURY', { size: 16, bold: true, color: PINK }), { after: 80 }),
  p(t('Mes réponses aux objections probables d’Hugo', { size: 34, bold: true, color: BDX }), { after: 160 }),
  table([3300, 6566], ['Objection probable', 'Ma réponse'], [
    ['« Un salon, c’est cher pour ce que ça rapporte. »', '2 470 € HT, couverts par 8 abonnements annuels de coach. 30 inscriptions au mois rapporteraient 1 170 € chaque mois, de façon récurrente.'],
    ['« Il y aura surtout du grand public. »', '15 % de professionnels annoncés, soit près de 1 800 personnes. Je pré-fixe des RDV, et le grand public télécharge l’appli, ce qui sert aussi KOACHER.'],
    ['« Ton devis dépasse mon enveloppe. »', 'Budget ramené à 2 470 € : remise de 10 % en réservant avant le 31 janvier, option d’angle supprimée, 3 bons cadeaux au lieu de 5.'],
    ['« Je ne peux être là que le samedi. »', 'Le planning prévoit toujours 2 personnes : moi les 2 jours, avec 2 coachs ambassadeurs en relais et un coach de réserve.'],
    ['« Pourquoi pas un 2e afterwork ? »', 'L’afterwork vise les dirigeants ; le salon touche les professionnels du sport, que l’afterwork n’atteint pas. Les deux sont complémentaires.'],
    ['« Comment saura-t-on si ça a marché ? »', 'Champ « source » dans Pipedrive, tableau de bord partagé, bilan le 19 avril avec les mêmes indicateurs que les objectifs.'],
  ], { boldFirst: true }),
  p(lead('Conclure : ', 'proposer de réserver dès cette semaine pour profiter de la remise, avec un point d’étape à J-14.'), { before: 160 }),
  p(lead('Solution de repli si Hugo refuse le budget : ', 'partager le stand avec une structure partenaire pour diviser son coût.')),
];

const doc = new Document({
  creator: 'Kylian Leroy',
  title: 'Cahier des charges – KOACHER au salon du fitness et du bien-être',
  styles: { default: { document: { run: { font: 'Calibri', size: 20 } } } },
  numbering: { config: [{ reference: 'dash', levels: [{ level: 0, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 300, hanging: 220 } }, run: { color: PINK } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1020, bottom: 1020, left: 1020, right: 1020 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
      t('KOACHER · Cahier des charges · Salon du fitness et du bien-être · ', { size: 16, color: MUTED }),
      new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 16, color: MUTED }),
    ] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  const out = path.join(__dirname, 'Cahier_des_charges_Salon_fitness.docx');
  fs.writeFileSync(out, buf);
  console.log(out);
});
