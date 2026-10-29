// Cahier des charges as a PowerPoint: one full-bleed 4K image per scene of koacher-motion/salon.html.
//   cd ../koacher-motion && node render.js --page salon.html --stills --scale 2
//   python3 ../e4-salon-fitness/to_jpg.py && node ../e4-salon-fitness/build_pptx.js
const path = require('path');
const pptxgen = require('pptxgenjs');
const { applyTheme } = require(process.env.PPTX_SKILL + '/scripts/apply_theme.js');

const IMAGES = path.join(__dirname, '..', 'koacher-motion', 'out', 'salon', 'jpg');
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
const SECTIONS = { open: 'Ouverture', A: 'Le projet', B: 'L’organisation', C: 'Budget & planning', D: 'Pilotage' };

const SLIDES = [
  { img: '01_titre', sec: 'open', alt: 'Cahier des charges : participation de KOACHER au salon du fitness et du bien-être, Eurexpo Lyon, 20 et 21 mars 2027.',
    notes: 'Bonjour Hugo. Comme vous me l’avez demandé, je vous présente le cahier des charges de notre participation au salon du fitness et du bien-être, les 20 et 21 mars à Eurexpo. L’idée : un stand « Testez KOACHER » pour recruter des professionnels du sport sur KOACHER Pro. Mon objectif aujourd’hui est d’obtenir votre validation, car le stand doit être réservé avant le 31 janvier.' },
  { img: '02_contexte_besoin', sec: 'A', alt: 'Contexte et besoin : 12 000 visiteurs dont environ 1 800 professionnels du sport ; chiffres clés KOACHER ; besoin de recruter des pros sur KOACHER Pro.',
    notes: 'Le KOACHER Club a très bien marché auprès des dirigeants : 9 RDV, 4 devis et une signature pour 350 €. Mais il ne touche pas les coachs et les salles, qui font la richesse de notre offre. Le salon annonce 12 000 visiteurs, dont environ 15 % de professionnels, soit près de 1 800 personnes en deux jours. Notre besoin : recruter des pros sur KOACHER Pro, enrichir l’offre pour nos sportifs et nos entreprises clientes, et créer du chiffre d’affaires récurrent.' },
  { img: '03_parametres_modifies', sec: 'A', alt: 'Tableau des paramètres modifiés entre le KOACHER Club et le salon fitness.',
    notes: 'Par rapport au KOACHER Club, presque tout change : on passe d’un afterwork que nous organisons à un salon où nous sommes exposants, sur deux jours. La cible devient les coachs indépendants et les structures, l’offre phare devient KOACHER Pro, et l’objectif principal devient 30 inscriptions. Le budget est plus élevé, d’où ce cahier des charges.' },
  { img: '04_objectifs', sec: 'A', alt: 'Objectifs : 30 pros inscrits sur KOACHER Pro sous 30 jours ; 150 contacts, 10 RDV, 300 téléchargements, +100 abonnés ; rentabilité ; objectif de repli.',
    notes: 'Objectif principal : 30 professionnels inscrits sur KOACHER Pro dans les 30 jours, dont 10 directement sur le stand. Objectifs secondaires : 150 contacts qualifiés dans Pipedrive, 10 RDV démo avec des entreprises ou des CSE, 300 téléchargements de l’appli et 100 abonnés de plus. Côté rentabilité : au plus 16,50 € par contact et 83 € par inscription. Si le salon est moins fréquenté que prévu, mon objectif de repli est de 15 inscriptions, 80 contacts et 5 RDV.' },
  { img: '05_cibles_offres', sec: 'A', alt: 'Cibles et offres : coachs indépendants (cœur de cible), salles et studios, entreprises et CSE, grand public.',
    notes: 'Le cœur de cible, ce sont les coachs indépendants : ils veulent de la visibilité et des réservations simples. Je leur propose KOACHER Pro, à 20 % de commission ou 39 € par mois, sans engagement. Pour les salles et studios, la formule structure à 49 € par mois. Les entreprises et les CSE restent une cible secondaire, avec KOACHER Entreprise et la prise de RDV démo. Le grand public, lui, télécharge l’appli.' },
  { img: '06_stand', sec: 'B', alt: 'Plan du stand de 9 m² en quatre espaces : zone pro, zone entreprises, zone démo, accueil et jeu concours.',
    notes: 'Le stand de 9 m² est organisé en quatre espaces. Au centre, la zone démo, avec une mini-séance toutes les heures pour attirer les visiteurs. Au fond, la zone pro, où un coach peut créer son profil en 5 minutes sur tablette, et la zone entreprises, avec la simulation fiscale. À l’avant, l’accueil et le jeu concours. Le principe est le même qu’au KOACHER Club : faire tester avant de vendre.' },
  { img: '07_journee_type', sec: 'B', alt: 'Déroulé d’une journée sur le stand, de 9 h à 19 h.',
    notes: 'Une journée type : brief à 9 h, ouverture à 10 h, une démo toutes les heures de 10 h 30 à 17 h 30, pauses déjeuner en relais, tirage du jeu concours à 18 h 30 et, à 19 h, export des contacts vers Pipedrive pour ne rien perdre.' },
  { img: '08_moyens_humains', sec: 'B', alt: 'Planning de l’équipe sur les deux jours : Kylian, Hugo le samedi après-midi, deux coachs ambassadeurs et un coach de réserve.',
    notes: 'Je suis présent les deux jours. Je vous demande d’être là le samedi de 14 h à 19 h pour rencontrer les gérants de salles et les entreprises. Deux coachs ambassadeurs, défrayés 80 € chacun, animent les démos ; leurs créneaux se chevauchent de 12 h à 15 h pour les pauses, donc il y a toujours au moins deux personnes sur le stand. Un coach de réserve est prévu en cas d’absence. Si Hugo objecte qu’il ne peut venir que le samedi : c’est prévu, le planning tient sans lui le dimanche.' },
  { img: '09_moyens_materiels', sec: 'B', alt: 'Moyens matériels : stand équipé, tablettes, kakémono, supports imprimés, fiches de vente, matériel de démo, logistique, jeu concours.',
    notes: 'Le stand est équipé par l’organisateur. J’apporte deux tablettes avec une connexion 4G de secours, le kakémono et le panneau des formules faits sur Canva, 1 000 flyers et 300 cartes QR code, mes fiches découverte et argumentaire, et le matériel de démo prêté par les coachs.' },
  { img: '10_budget', sec: 'C', alt: 'Budget prévisionnel : 2 470 € HT au lieu de 3 000 € de devis, sous l’enveloppe de 2 500 € ; remboursé par 8 abonnements annuels de coach.',
    notes: 'Le devis initial était de 3 000 € HT. Je l’ai ramené à 2 470 €, sous votre enveloppe de 2 500 € : 10 % de remise sur le stand si on réserve avant le 31 janvier, suppression de l’option d’angle, et 3 bons cadeaux au lieu de 5. Le retour sur investissement : 8 abonnements annuels de coach, à 328 €, remboursent le salon ; et si les 30 pros visés prennent l’abonnement mensuel, c’est 1 170 € de CA chaque mois. Objection « un salon, c’est cher » : le coût est couvert par 8 abonnements annuels, et ce CA est récurrent. Objection « ça dépasse mon enveloppe » : non, 2 470 €, soit 30 € de marge.' },
  { img: '11_communication', sec: 'C', alt: 'Plan de communication avant, pendant et après le salon.',
    notes: 'Avant le salon, à partir du 22 février : annonce sur LinkedIn et Instagram, e-mailing aux coachs et structures de notre base Pipedrive, messages aux gérants de salles et RDV pré-fixés sur le stand. Pendant : stories en direct, QR codes et jeu concours. Après : e-mail de remerciement avec le lien d’inscription, relances à J+3 et J+10, et publication du bilan. Objection « il y aura surtout du grand public » : je pré-fixe des RDV avec des pros avant le salon, et le grand public télécharge l’appli, ce qui sert aussi KOACHER.' },
  { img: '12_retroplanning', sec: 'C', alt: 'Rétroplanning de J-54 à J+30, du 25 janvier au 19 avril 2027.',
    notes: 'Si vous validez aujourd’hui, je réserve le stand vendredi 29 janvier. En février : recrutement des coachs et création des supports. La communication démarre le 22 février. Point d’étape avec vous le lundi 8 mars, brief d’équipe le 15, installation le 19. Après le salon : saisie des contacts le 22 mars avec la source « Salon fitness », relances jusqu’au 2 avril, et réunion bilan le 19 avril.' },
  { img: '13_suivi_evaluation', sec: 'D', alt: 'Indicateurs de suivi : inscriptions, contacts, RDV, taux de transformation, coûts, téléchargements, abonnés.',
    notes: 'Chaque objectif a son indicateur et son outil. Grâce au champ « source » dans Pipedrive, on saura exactement combien de contacts et d’inscriptions viennent du salon. Le bilan sera présenté le 19 avril avec le tableau de bord Pipedrive partagé. Objection « comment saura-t-on si ça a marché ? » : avec ces indicateurs, les mêmes que les objectifs.' },
  { img: '14_risques', sec: 'D', alt: 'Six risques et leurs solutions.',
    notes: 'J’ai anticipé les principaux risques : peu de pros sur le stand, trop de grand public, une absence dans l’équipe, un dépassement de budget, des inscriptions non finalisées, une panne technique. Pour chacun, une solution est prête. Objection « pourquoi pas un deuxième afterwork ? » : l’afterwork touche les dirigeants ; le salon touche les professionnels du sport. Les deux sont complémentaires.' },
  { img: '15_decision', sec: 'D', alt: 'Décision attendue : budget de 2 470 € HT, réservation avant le 31 janvier, présence d’Hugo le samedi, 2 coachs ambassadeurs ; prochaines étapes.',
    notes: 'Pour conclure, je vous demande de valider quatre points : le budget de 2 470 € HT, la réservation du stand avant le 31 janvier, votre présence le samedi de 14 h à 19 h, et le recrutement de deux coachs ambassadeurs. Si c’est d’accord, je réserve vendredi. Reformuler l’accord, puis récapituler les prochaines étapes. Solution de repli si Hugo refuse le budget : partager le stand avec une structure partenaire pour diviser son coût.' },
];

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.title = 'Cahier des charges – KOACHER au salon du fitness et du bien-être';
  pres.author = 'Kylian Leroy';
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  pres.defineSlideMaster({ title: 'PLEIN_ECRAN', background: { color: C.background2 }, objects: [] });

  let current = null;
  for (const s of SLIDES) {
    const sectionTitle = SECTIONS[s.sec];
    if (sectionTitle !== current) { pres.addSection({ title: sectionTitle }); current = sectionTitle; }
    const slide = pres.addSlide({ masterName: 'PLEIN_ECRAN', sectionTitle });
    slide.addImage({ path: path.join(IMAGES, s.img + '.jpg'), x: 0, y: 0, w: 10, h: 5.625, altText: s.alt, objectName: s.img });
    slide.addNotes(s.notes);
  }
  const file = path.join(__dirname, 'Cahier_des_charges_Salon_fitness.pptx');
  await pres.writeFile({ fileName: file });
  await applyTheme(file, THEME);
  console.log(file);
})().catch(e => { console.error(e); process.exit(1); });
