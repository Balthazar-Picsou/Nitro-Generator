// Chiffres affichés dans la vidéo. Modifier ici puis relancer `node render.js`.
window.DATA = {
  // Historique du CA (en k€). null = valeur à compléter (barre hachurée + badge « À compléter »).
  caUnit: 'k€',
  ca: [
    { year: '2024', value: null },
    { year: '2025', value: null },
    { year: '2026', value: null },
  ],
  // Répartition du CA (en %). null = à compléter.
  repartition: [
    { label: 'Sportifs (B2C)', value: null, color: '#d62d5a' },
    { label: 'Coachs & structures', value: null, color: '#71001d' },
    { label: 'Entreprises & CSE', value: null, color: '#141214' },
  ],

  // Rétroplanning (jours relatifs à l'afterwork, J = 0).
  gantt: [
    { label: 'Cadrage avec le tuteur & rétroplanning', start: -30, end: -28 },
    { label: 'Négociation de la salle', start: -30, end: -25 },
    { label: 'Constitution & qualification du fichier', start: -25, end: -21, note: 'Pipedrive · Sales Navigator' },
    { label: 'Création des supports', start: -21, end: -19, note: 'Canva · invitation, visuel, formulaire, flyer, QR code' },
    { label: 'Prospection multicanale', start: -19, end: -1, kind: 'p', text: 'LinkedIn · SMS · mail · téléphone · prescripteurs' },
    { label: 'Relances', ms: [-7, -1] },
    { label: 'Brief équipe & check-list logistique', ms: [-2], dark: true },
    { label: 'Afterwork KOACHER Club', star: 0 },
    { label: 'RDV démo (objectif : sous 7 jours)', start: 1, end: 7, kind: 'a' },
    { label: 'Réunion bilan · tableau de bord Pipedrive', ms: [10], dark: true },
  ],
  ganttTicks: [-30, -25, -21, -14, -7, 0, 7, 10],

  // Entonnoir des résultats.
  funnel: [
    { n: 30, label: 'contacts ciblés' },
    { n: 21, label: 'inscrits', rate: 'des ciblés' },
    { n: 14, label: 'présents', rate: 'des inscrits' },
    { n: 9, label: 'RDV démo', rate: 'des présents' },
    { n: 4, label: 'devis', rate: 'des RDV' },
    { n: 1, label: 'signature', rate: 'des devis' },
  ],

  // Objectifs vs résultats (mêmes indicateurs). status : good | mid | bad
  kpis: [
    { icon: 'calendar-check', label: 'RDV démo sous 7 jours', obj: '8', res: '9', pct: 113, status: 'good' },
    { icon: 'users', label: 'Présents à l’afterwork', obj: '25', res: '14', pct: 56, status: 'bad' },
    { icon: 'kanban', label: 'Contacts qualifiés dans le CRM', obj: '25', res: '24', pct: 96, status: 'mid' },
    { icon: 'linkedin', label: 'Abonnés LinkedIn', obj: '+50', res: '+60', pct: 120, status: 'good' },
    { icon: 'user-check', label: 'Décideurs parmi les présents', obj: '≥ 70 %', res: '80 %', pct: 114, status: 'good' },
    { icon: 'star', label: 'Satisfaction des participants', obj: '≥ 4/5', res: '4,5/5', pct: 113, status: 'good' },
    { icon: 'handshake', label: 'Relations avec des prescripteurs', obj: 'Qualitatif', res: 'CCI · partenaires', pct: null, status: 'good' },
  ],
};
