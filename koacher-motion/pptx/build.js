// Builds the PowerPoint from the motion's end-of-scene images (out/stills@2x -> pptx/images).
//   node render.js --stills --scale 2 && python3 pptx/to_jpg.py && node pptx/build.js
const path = require('path');
const pptxgen = require('pptxgenjs');
const { applyTheme } = require(process.env.PPTX_SKILL + '/scripts/apply_theme.js');

const THEME = {
  name: 'KOACHER',
  headFontFace: 'Calibri',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '141214', lt1: 'FFFFFF', dk2: '71001D', lt2: 'F4F2F3',
    accent1: '71001D', accent2: 'D62D5A', accent3: 'EC6A90', accent4: '141214', accent5: '625B5F', accent6: '1F9D55',
    hlink: 'D62D5A', folHlink: '71001D',
  },
};

const SECTIONS = {
  open: 'Ouverture',
  ent: '01 · L’entreprise',
  cib: '02 · Ciblage & prospection',
  p3: 'Phase 3 · Information commerciale',
  end: 'Clôture',
};

// one entry per motion scene, in order
const SLIDES = [
  { img: '01_titre', sec: 'open', alt: 'Titre : BTS NDRC, épreuve E4 phase 1, Ciblage et prospection. KOACHER Club, networking auprès des dirigeants. Kylian Leroy.',
    notes: '(≈ 10 s) Bonjour, je m’appelle Kylian Leroy, alternant commercial B2B chez KOACHER. Je vais vous présenter la phase 1 de mon épreuve E4 : le ciblage et la prospection de l’opération KOACHER Club, un afterwork de networking auprès des dirigeants pour promouvoir et vendre notre offre B2B.' },
  { img: '02_sommaire', sec: 'open', alt: 'Sommaire : 01 L’entreprise, 02 Ciblage et prospection.',
    notes: '(≈ 5 s) Je présente d’abord rapidement l’entreprise, puis ma démarche de ciblage et de prospection, jusqu’aux résultats et au bilan.' },
  { img: '03_entreprise', sec: 'ent', alt: 'KOACHER, start-up lyonnaise : plus de 200 000 sportifs, 2 000 coachs et structures, 50 disciplines, note de 4,9 sur 5.',
    notes: '(≈ 15 s) KOACHER est une start-up lyonnaise, SAS et TPE, basée dans le 9e. C’est une plateforme digitale qui met en relation sportifs, coachs et structures, et entreprises. Plus de 200 000 sportifs, plus de 2 000 pros, plus de 50 disciplines, et une note de 4,9/5 sur plus de 1 200 avis.' },
  { img: '04_offre', sec: 'ent', alt: 'Trois clientèles : sportifs (B2C), coachs et structures (B2B2C), entreprises et CSE (B2B, KOACHER Entreprise).',
    notes: '(≈ 10 s) Trois clientèles : les sportifs avec l’appli gratuite, les coachs et structures avec KOACHER Pro (20 % de commission ou un abonnement), et désormais les entreprises avec KOACHER Entreprise, « le ticket resto du sport » : c’est l’offre que j’ai prospectée.' },
  { img: '05_organisation_role', sec: 'ent', alt: 'Organisation : Hugo, fondateur et dirigeant ; Kylian Leroy, alternant commercial B2B. Missions et outils.',
    notes: '(≈ 10 s) Hugo, le fondateur, valide le budget et présente l’offre. Je suis alternant commercial B2B depuis août 2026 : je prospecte, je prends les RDV et je fais les démos, j’organise des événements comme le KOACHER Club, je tiens Pipedrive à jour et je fais la veille.' },
  { img: '06_mix_marketing', sec: 'ent', alt: 'Mix marketing de KOACHER Entreprise : produit, prix, distribution, communication, positionnement face à la concurrence.',
    notes: '(≈ 5 s) Produit : un budget sport et bien-être pour les salariés. Prix : libre, à l’usage, sans engagement, exonéré jusqu’à 200,25 € par salarié et par an. Distribution : vente directe, en ligne et via les plateformes CSE. Communication : LinkedIn, événements et presse. Face à Wellpass ou Urban Sports Club, on mise sur le paiement à l’usage et la proximité.' },
  { img: '07_clientele_ca', sec: 'ent', alt: 'Clientèle et chiffre d’affaires : historique du CA et répartition à compléter ; trois segments de clientèle et clients de référence.',
    notes: '(≈ 10 s) [À compléter : historique du CA et répartition.] La clientèle se répartit en trois segments, B2C, B2B2C et B2B, avec déjà des clients comme Groupama, EM Lyon, Alliade Habitat et Action Logement.' },
  { img: '08_intercalaire', sec: 'cib', alt: 'Partie 2 : Ciblage et prospection.',
    notes: '(≈ 5 s) J’en viens au cœur de l’épreuve : le ciblage et la prospection.' },
  { img: '09_demarche_cahier_des_charges', sec: 'cib', alt: 'Cahier des charges : contexte, besoin, intitulé de l’opération KOACHER Club, durée de J-30 à J+10, budget 350 €.',
    notes: '(≈ 25 s) Contexte : KOACHER s’est développée auprès des particuliers et lance KOACHER Entreprise, encore peu connue à Lyon. Besoin : faire du réseau vite, alors que les dirigeants sont durs à joindre et que l’offre se comprend mieux quand on la fait vivre. D’où le KOACHER Club : un afterwork sport et networking, en semaine à 18h30, pendant la préparation des budgets N+1. Préparation de J-30 à J-1, suivi jusqu’à J+10, budget de 350 €.' },
  { img: '10_choix_cible', sec: 'cib', alt: 'Arbre de segmentation : décideurs (dirigeant, DRH, élu CSE) de PME tertiaires de 10 à 200 salariés, à moins de 40 minutes, sans solution sport.',
    notes: '(≈ 20 s) J’ai ciblé les décideurs : dirigeants, DRH et élus CSE, de PME tertiaires de 10 à 200 salariés, à moins de 40 minutes du lieu, sans solution sport. Pourquoi eux : ils décident du budget avantages salariés, et en PME le dirigeant tranche vite, souvent sans RH dédiée.' },
  { img: '11_analyse_portefeuille', sec: 'cib', alt: 'Analyse du portefeuille : de 7 000 contacts à 30 décideurs ciblés, en quatre étapes (extraction, nettoyage, filtres, qualification dans Pipedrive).',
    notes: '(≈ 25 s) Je suis parti d’un fichier de plus de 7 000 contacts : la base Pipedrive et une extraction LinkedIn Sales Navigator. J’ai supprimé les doublons et les contacts hors cible, filtré par fonction, taille et proximité, puis qualifié chaque contact dans Pipedrive : étape, prochaine action, date de relance. Résultat : 30 décideurs ciblés. → Montrer l’annexe : base Pipedrive et filtres Sales Navigator.' },
  { img: '12_objectifs', sec: 'cib', alt: 'Objectifs : principal 8 RDV démo sous 7 jours ; quantitatifs 25 présents, 25 contacts CRM, +50 abonnés ; qualitatifs ; objectif de repli.',
    notes: '(≈ 20 s) Objectif principal : 8 RDV démo dans les 7 jours. Objectifs secondaires : 25 présents, 25 contacts qualifiés dans le CRM, +50 abonnés LinkedIn. Qualitatifs : au moins 70 % de décideurs, une image d’experte QVCT locale, des relations avec des prescripteurs et une satisfaction d’au moins 4/5. Objectif de repli : 15 contacts, 3 RDV, 2 prescripteurs.' },
  { img: '13_retroplanning', sec: 'cib', alt: 'Rétroplanning de J-30 à J+10 sous forme de diagramme de Gantt.',
    notes: '(≈ 20 s) À J-30, cadrage avec mon tuteur et rétroplanning, puis négociation de la salle. À J-25, constitution du fichier. À J-21, création des supports : invitation, visuel LinkedIn, formulaire, flyer, fiche découverte, QR code. Ensuite la prospection, avec des relances à J-7 et J-1 et le brief équipe à J-2. Après l’événement : les RDV démo et la réunion bilan à J+10. → Annexe : diagramme de Gantt.' },
  { img: '14_prospection_canaux', sec: 'cib', alt: 'Prospection multicanale : invitation LinkedIn ou SMS puis appel, e-mailing, post LinkedIn et prescripteurs, relances, 21 inscrits.',
    notes: '(≈ 20 s) Les contacts prioritaires ont reçu une invitation personnalisée par LinkedIn ou SMS, puis un appel. Les autres ont reçu un e-mailing avec le lien d’inscription. J’ai publié l’événement sur la page LinkedIn de KOACHER et mobilisé la CCI et nos partenaires. Après les relances, 21 inscrits. → Annexes : invitation, e-mailing, formulaire.' },
  { img: '15_jour_j', sec: 'cib', alt: 'Déroulé du jour J de 18h00 à 20h45 : installation, accueil, padel, pitch, networking, clôture.',
    notes: '(≈ 20 s) Installation à 18h, accueil à 18h30 avec des badges de couleur selon le profil, 30 minutes de padel à 18h45, un pitch de 10 minutes à 19h20 avec démo de l’appli et simulation fiscale, puis le networking : découverte des besoins, traitement des objections et prise de RDV par QR code. Clôture à 20h45 avec un tirage au sort parmi ceux qui ont pris RDV. → Annexes : fiche découverte, fiche argumentaire.' },
  { img: '16_reseaux_professionnels', sec: 'cib', alt: 'Réseaux sociaux (post LinkedIn, +60 abonnés, 127 impressions) et réseaux professionnels (tuteur, structure hôte, CCI, partenaires).',
    notes: '(≈ 20 s) Côté réseaux sociaux, j’ai publié l’événement sur la page LinkedIn de KOACHER : +60 abonnés et 127 impressions. Côté réseaux professionnels, j’ai travaillé avec mon tuteur et la structure hôte, et mobilisé la CCI et les partenaires KOACHER, par LinkedIn, mail, téléphone et WhatsApp. → Annexe : post LinkedIn.' },
  { img: '17_resultats_quantitatifs', sec: 'cib', alt: 'Résultats : 30 ciblés, 21 inscrits, 14 présents, 9 RDV démo, 4 devis, 1 signature. Coût 350 €, 14,60 € par contact, 38,90 € par RDV.',
    notes: '(≈ 20 s) 30 contacts ciblés, 21 inscrits soit 70 %, 14 présents soit 67 % des inscrits, 9 RDV démo, 4 devis et 1 signature dans le mois. L’opération a coûté 350 €, soit 14,60 € par contact et 38,90 € par RDV. → Annexe : pipeline Pipedrive.' },
  { img: '18_objectifs_vs_resultats', sec: 'cib', alt: 'Tableau objectifs contre résultats : RDV, abonnés, décideurs et satisfaction atteints ; contacts CRM presque ; présents non atteint.',
    notes: '(≈ 20 s) Avec les mêmes indicateurs : l’objectif principal est dépassé, 9 RDV pour 8. Les abonnés, la part de décideurs (80 %) et la satisfaction (4,5/5) sont atteints. Les contacts CRM sont presque atteints, 24 sur 25. En revanche, 14 présents pour 25 visés : c’est mon principal axe d’amélioration.' },
  { img: '19_bilan_reflexif', sec: 'cib', alt: 'Bilan réflexif : atouts, difficultés et solutions, axes d’amélioration.',
    notes: '(≈ 25 s) Mes atouts : un fichier large, des filtres efficaces et un contact personnalisé qui a bien fonctionné. Face au faible taux de réponse des mails à froid, je suis passé à LinkedIn, au SMS et au téléphone, et j’ai relancé à J-7 et la veille. Pour la prochaine fois : un scoring pour prioriser, plus d’invitations pour atteindre 25 présents, des invitations envoyées plus tôt et un champ « source » dans Pipedrive.' },
  { img: '21_p3_ouverture', sec: 'p3', alt: 'Phase 3 : exploiter et mutualiser l’information commerciale. DAS analysé : KOACHER Entreprise. Programme en neuf points.',
    notes: '(≈ 20 s) Pour la phase 3, je vous présente comment j’ai exploité et mutualisé l’information commerciale. J’ai analysé le DAS KOACHER Entreprise : le sport et le bien-être offerts aux salariés. Je suis neuf points : marché, PESTEL, offre, demande, sources de veille, e-réputation, SIC, plateformes collaboratives et réunions d’équipe.' },
  { img: '22_p3_marche', sec: 'p3', alt: 'Analyse du marché : quatre familles d’acteurs, chiffres clés à compléter, 89 % des salariés favorables au sport en entreprise.',
    notes: '(≈ 60 s) Le marché du sport en entreprise est porteur : 89 % des salariés y sont favorables. Il se structure en quatre familles : les plateformes par abonnement par salarié, avec EGYM Wellpass en leader, puis Urban Sports Club et Wellhub ; les plateformes d’avantages salariés et de CSE comme Edenred ou Swile, où KOACHER est déjà présente ; l’offre locale, avec les coachs indépendants, les salles et les mutuelles ; et le paiement à l’usage, qui est le positionnement de KOACHER. [À compléter : CA du marché, évolution et part de marché de KOACHER.]' },
  { img: '23_p3_pestel', sec: 'p3', alt: 'Analyse PESTEL du DAS KOACHER Entreprise : cinq opportunités et un point de vigilance légal.',
    notes: '(≈ 60 s) Politique : l’État encourage le sport-santé, avec la loi du 2 mars 2022. Économique : le budget sport est exonéré de cotisations jusqu’à 200,25 € par salarié et par an, et déductible de l’IS. Socioculturel : 89 % des salariés sont favorables et les attentes en QVCT sont fortes. Technologique : tout passe par l’appli, les plateformes CSE et le tableau de bord. Environnemental : des activités de proximité, en salle, dehors ou en visio. Légal : l’exonération est encadrée par l’URSSAF ; c’est un point de vigilance à maîtriser pour répondre aux objections. → Annexes : urssaf.fr, Légifrance.' },
  { img: '24_p3_porter', sec: 'p3', alt: 'Cinq forces de Porter : rivalité forte, pouvoir des clients fort, nouveaux entrants et substituts moyens, pouvoir des fournisseurs faible.',
    notes: '(≈ 50 s) La rivalité est forte : EGYM Wellpass, Urban Sports Club et Wellhub vendent tous un abonnement par salarié. Le pouvoir des clients est fort : l’offre est sans engagement et les PME comparent. Les nouveaux entrants et les produits de substitution (mutuelles, abonnement individuel en salle, coachs indépendants) sont une menace moyenne. Le pouvoir des fournisseurs est faible grâce à nos 2 000 partenaires.' },
  { img: '25_p3_positionnement', sec: 'p3', alt: 'Carte de positionnement : KOACHER sur le paiement à l’usage et l’ancrage local ; comparatif et arguments face aux objections.',
    notes: '(≈ 45 s) Sur la carte, les grands acteurs vendent un abonnement par salarié. KOACHER se place sur le paiement à l’usage et la proximité : budget libre et start-up lyonnaise. Ce sont mes arguments face aux objections : un avantage salarié concret, on ne paie que l’usage réel, un coût allégé grâce à l’exonération et à l’IS, une solution clé en main, plus de 50 disciplines et un financement CSE cumulable.' },
  { img: '26_p3_demande', sec: 'p3', alt: 'Analyse de la demande : trois profils d’acheteurs, parcours d’achat en cinq étapes, clients potentiels de 7 000 contacts à 4 devis.',
    notes: '(≈ 50 s) Trois profils achètent : le dirigeant de TPE ou PME, qui tranche vite et apprécie le sans engagement ; le DRH ou responsable QVT, motivé par la QVCT, la fidélisation et la marque employeur ; et l’élu CSE, dont le financement se cumule avec celui de l’employeur. Le parcours d’achat : découverte par le réseau, test, évaluation avec la simulation fiscale, décision souvent longue au moment des budgets N+1, puis usage. Clients potentiels : 7 000 contacts en base, 30 décideurs ciblés, 24 qualifiés dans Pipedrive et 4 devis, dont 1 signé.' },
  { img: '27_p3_veille_sources', sec: 'p3', alt: 'Démarche de veille : trois objectifs, sources internes et externes, Google Alertes sur trois mots-clés.',
    notes: '(≈ 45 s) Ma veille a trois objectifs : maîtriser l’avantage fiscal, connaître la concurrence pour répondre aux objections et comprendre les attentes des dirigeants. Sources externes : URSSAF, sports.gouv.fr, Légifrance, le baromètre Harmonie Mutuelle 2024, les sites des concurrents, Le Progrès et LinkedIn. Sources internes : b2b.koacher.app, Pipedrive, le tableau de bord KOACHER et les réunions d’équipe. J’ai paramétré trois Google Alertes : « sport en entreprise », « QVCT » et « Wellpass ». → Annexes : alertes, articles de presse.' },
  { img: '28_p3_e_reputation', sec: 'p3', alt: 'E-réputation : note de 4,9 sur 5 sur plus de 1 200 avis, citations presse, satisfaction KOACHER Club 4,5 sur 5, opinion : 89 % des salariés favorables.',
    notes: '(≈ 45 s) KOACHER a une note de 4,9/5 sur plus de 1 200 avis et a été citée par Le Progrès, Lyon Mag, Bpifrance, la French Tech et le MEDEF. Pour le KOACHER Club, la satisfaction est de 4,5/5 et la page LinkedIn a gagné 60 abonnés. Côté opinion, 89 % des salariés sont favorables au sport en entreprise, et mon alerte « Wellpass » me permet de suivre l’image du leader.' },
  { img: '29_p3_sic', sec: 'p3', alt: 'Cycle du SIC : collecte, traitement, stockage, diffusion, et outils NTIC utilisés.',
    notes: '(≈ 50 s) Mon SIC suit quatre étapes. Je collecte l’information avec les fiches découverte, le formulaire d’inscription et LinkedIn. Je la traite en qualifiant chaque contact dans Pipedrive. Je la stocke dans Pipedrive et dans un dossier Google Drive partagé. Je la diffuse lors de la réunion bilan, avec le tableau de bord Pipedrive. Mes outils : Pipedrive, Google Drive, LinkedIn, Canva, les QR codes et WhatsApp.' },
  { img: '30_p3_ameliorations', sec: 'p3', alt: 'Deux préconisations pour le SIC et l’outil créé : fiche argumentaire avec simulation fiscale.',
    notes: '(≈ 50 s) Deux préconisations : l’origine des contacts n’était pas connue, je propose donc un champ « source » dans Pipedrive ; les infos sur la concurrence étaient dispersées, je propose une fiche concurrente partagée. J’ai aussi créé un outil : une fiche argumentaire d’une page avec une simulation fiscale. Par exemple, pour une PME de 50 salariés, jusqu’à 10 012,50 € de budget sport par an exonérés de cotisations. Elle m’a fait gagner du temps pendant le networking et m’a donné une preuve chiffrée. → Annexe : fiche argumentaire.' },
  { img: '31_p3_collaboratif', sec: 'p3', alt: 'Plateformes collaboratives : dossier Google Drive partagé, groupe WhatsApp d’équipe, tableau de bord Pipedrive.',
    notes: '(≈ 40 s) Pour partager l’information, nous utilisons Google Drive comme intranet, avec un dossier partagé KOACHER Club ; un groupe WhatsApp pour les échanges quotidiens ; et le tableau de bord Pipedrive, partagé lors de la réunion bilan : 24 contacts qualifiés, 9 RDV, 4 devis et 1 signature.' },
  { img: '32_p3_reunions', sec: 'p3', alt: 'Réunions d’équipe et entretiens : moment, fréquence, personnes présentes et points abordés.',
    notes: '(≈ 45 s) Le projet a été rythmé par un cadrage avec mon tuteur à J-30, des échanges quotidiens sur WhatsApp, un brief équipe à J-2 et une réunion bilan à J+10 avec le tableau de bord Pipedrive. [À compléter : la fréquence de mes entretiens avec mon manager et les points abordés.]' },
  { img: '33_merci', sec: 'end', alt: 'Merci de votre attention. Place à vos questions.',
    notes: '(≈ 5 s) Merci de votre attention, je suis prêt pour vos questions.' },
];

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.title = 'KOACHER – Épreuve E4, phases 1 et 3';
  pres.author = 'Kylian Leroy';
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  pres.defineSlideMaster({ title: 'PLEIN_ECRAN', background: { color: C.background2 }, objects: [] });

  let current = null;
  for (const s of SLIDES) {
    const sectionTitle = SECTIONS[s.sec];
    if (sectionTitle !== current) { pres.addSection({ title: sectionTitle }); current = sectionTitle; }
    const slide = pres.addSlide({ masterName: 'PLEIN_ECRAN', sectionTitle });
    slide.addImage({ path: path.join(__dirname, 'images', s.img + '.jpg'), x: 0, y: 0, w: 10, h: 5.625, altText: s.alt, objectName: s.img });
    slide.addNotes(s.notes);
  }

  const file = path.join(__dirname, 'KOACHER_E4_ciblage_prospection.pptx');
  await pres.writeFile({ fileName: file });
  await applyTheme(file, THEME);
  console.log(file);
})().catch(e => { console.error(e); process.exit(1); });
