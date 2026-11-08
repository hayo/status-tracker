/*
 * Alle inhoud van Veldrang: airsoft als game. Rangen, skills, terreinen, patches en het speelgebied.
 * Alleen gegevens, geen code. Een id mag je nooit veranderen: het logboek verwijst ernaar.
 * De motor (../motor.js) leest dit via ../wereld.js. Wat hier ontbreekt (energie, quiz, nationale
 * dagen, kapitaal), slaat de motor over. De vorm van alles staat in het README.
 */

// De teksten en namen die per wereld verschillen.
export const WERELD = {
  naam: 'Veldrang',
  sleutel: 'veldrang', // in localStorage; de synccode staat onder deze sleutel plus _sync
  sync: { id: 'veldrang-id', zout: 'veldrang' }, // nooit veranderen: anders vindt de server niets meer
  bestand: 'veldrang', // het begin van de naam van een savegame
  welkom: 'Welkom op het veld',
  jaar: 'Jouw {jaar} op het veld',
  eisDagen: 'dagen actief als airsofter',
  bezig: 'Actief als airsofter',
  symbool: 'Patch',
  symbolen: 'Patches',
  symboolGeclaimd: 'Patch verdiend',
  geenSymbolen: 'Nog geen patches verdiend.',
  bekendheid: 'Reputatie',
  bekendTop: 'Hoger kan niet: je bent een legende in de scene',
  bekendLeeg: 'Noteer wat er naar jou toe komt: iemand kent je callsign, vraagt je in een squad of om advies. Dat is de echte maat voor reputatie.',
  teLaat: 'te laat, je team praat erover',
  bedankje: 'v12', // de activiteit voor een bedankje
  discretie: 'tactiek', // de skill die bepaalt of je opzichtige gear kunt dragen
  dossier: 'Operatie',
  dossierSkill: 'tactiek',
  quiz: 'Quiz',
  quizSkill: 'tactiek',
};

// Rangen zoals bij de landmacht, met hun NAVO-code (OR voor manschappen en onderofficieren, OF voor
// officieren). Het embleem tekent de motor zelf (embleem.js): strepen, een boog, sterren, een balk of
// een krans. Een rang vraagt PR (min), dagen actief, erkenning en een ritueel.
// De hoogste rangen vragen ook een goede stand in meerdere kringen (kring: aantal, vanaf welke stand).
export const RANGEN = [
  { min: 0, dagen: 0, naam: 'Rekruut', code: 'OR-1', embleem: { strepen: 0 }, uitleg: 'Net begonnen. Je leert de regels, het veld en je gear.', icoon: 'user' },
  {
    min: 400, dagen: 0, naam: 'Soldaat', code: 'OR-2', embleem: { strepen: 1 }, uitleg: 'Je hebt je eerste games achter de rug en weet waar de safezone is.', icoon: 'person-rifle',
    ritueel: { tekst: 'Je speelde je eerste game', voorwaarde: { soort: 'terrein', id: 'spelen', aantal: 1 } },
  },
  {
    min: 1200, dagen: 14, erkenning: 40, naam: 'Korporaal', code: 'OR-4', embleem: { strepen: 2 }, uitleg: 'Een vaste speler. Men herkent je op het veld.', icoon: 'chevron-up',
    ritueel: { tekst: 'Je werd lid van de NABV of van een team', voorwaarde: { soort: 'een', lijst: [{ soort: 'symbool', id: 'm_nabv' }, { soort: 'symbool', id: 'm_team' }] } },
  },
  {
    min: 3000, dagen: 60, erkenning: 120, naam: 'Sergeant', code: 'OR-5', embleem: { strepen: 3 }, uitleg: 'Je neemt verantwoordelijkheid: anderen volgen je in een squad.', icoon: 'angles-up',
    ritueel: { tekst: 'Je leidde een squad, gaf een briefing of bent militair', voorwaarde: { soort: 'een', lijst: [{ soort: 'activiteit', id: 'e05' }, { soort: 'activiteit', id: 'o02' }, { soort: 'symbool', id: 'm_mil' }] } },
  },
  {
    min: 6000, dagen: 120, erkenning: 300, naam: 'Sergeant-majoor', code: 'OR-7', embleem: { strepen: 3, boog: 1 }, uitleg: 'Een rots in elk team. Organisatoren kennen je naam.', icoon: 'shield-halved',
    ritueel: { tekst: 'Je marshalde een game', voorwaarde: { soort: 'activiteit', id: 'o01' } },
  },
  {
    min: 10000, dagen: 180, erkenning: 500, naam: 'Luitenant', code: 'OF-1', embleem: { sterren: 1 }, uitleg: 'Je geeft leiding aan meer dan je eigen team.', icoon: 'star',
    ritueel: { tekst: 'Je organiseerde een game of oefendag', voorwaarde: { soort: 'een', lijst: [{ soort: 'activiteit', id: 'o04' }, { soort: 'dossiers', aantal: 1 }] } },
  },
  {
    min: 16000, dagen: 270, erkenning: 800, naam: 'Kapitein', code: 'OF-2', embleem: { sterren: 3 }, uitleg: 'Een gezicht van de scene. Je naam staat op de briefing.', icoon: 'medal',
    ritueel: { tekst: 'Je speelde een milsim van een heel weekend', voorwaarde: { soort: 'activiteit', id: 's04' } },
    kring: { aantal: 3, vanaf: 200 },
  },
  {
    min: 24000, dagen: 365, erkenning: 1200, naam: 'Majoor', code: 'OF-3', embleem: { sterren: 1, balk: 1 }, uitleg: 'Je kent elk soort veld en elk soort speler.', icoon: 'award',
    ritueel: { tekst: 'Je bent actief in acht terreinen', voorwaarde: { soort: 'terreinen', aantal: 8 } },
    kring: { aantal: 4, vanaf: 300 },
  },
  {
    min: 35000, dagen: 540, erkenning: 1800, naam: 'Kolonel', code: 'OF-5', embleem: { sterren: 3, balk: 1 }, uitleg: 'Je bouwt mee aan de sport zelf: events, regels en mensen.', icoon: 'chess-king',
    ritueel: { tekst: 'Je organiseerde een milsim mee of nam een kaderfunctie aan', voorwaarde: { soort: 'een', lijst: [{ soort: 'activiteit', id: 'o05' }, { soort: 'symbool', id: 'm_kader' }] } },
    kring: { aantal: 5, vanaf: 500 },
  },
  {
    min: 50000, dagen: 730, erkenning: 2500, naam: 'Generaal', code: 'OF-9', embleem: { sterren: 4, krans: true }, uitleg: 'Een legende. Iedereen in de scene kent je callsign.', icoon: 'crown',
    ritueel: { tekst: 'Je bent een legende in de scene', voorwaarde: { soort: 'symbool', id: 'm_legende' } },
    kring: { aantal: 5, vanaf: 800 },
  },
];

// De skills: hoe goed je bent in de spelelementen. Kleur is een klasse in thema.css (skill-…).
export const EIGENSCHAPPEN = {
  precisie: { naam: 'Precisie en sniping', kort: 'Sniping', icoon: 'crosshairs' },
  cqb: { naam: 'CQB en knife kills', kort: 'CQB', icoon: 'door-open' },
  stealth: { naam: 'Stealth en verkenning', kort: 'Stealth', icoon: 'user-secret' },
  tactiek: { naam: 'Tactiek en teamwork', kort: 'Tactiek', icoon: 'people-group' },
  conditie: { naam: 'Conditie', kort: 'Conditie', icoon: 'person-running' },
  techniek: { naam: 'Techniek en gear', kort: 'Techniek', icoon: 'screwdriver-wrench' },
};

// Punten per skill waarbij de balk vol is (100 / 100).
export const EIGENSCHAP_MAX = 4000;

// Kenmerken (vijfde veld): uitnodiging (je werd uitgenodigd), tegen (je nodigde zelf uit),
// bedank (vraagt om een bedankje), plek (id in PLEKKEN), dossierstap (1 tot 4: een operatie),
// kringen (in plaats van die van het terrein), gunst (1 sportief, -1 strategisch).
export const CATEGORIEEN = [
  {
    // Wat anderen naar jou toe doen: de echte maat voor reputatie. Krijgt geen bonus.
    id: 'reputatie',
    kringen: { scene: 1 },
    inkomend: true,
    naam: 'Reputatie: wat naar jou toe kwam',
    icoon: 'inbox',
    kleur: 'goud',
    activiteiten: [
      ['r01', 'Iemand kende je callsign al voordat jullie elkaar spraken', 80, 'stealth'],
      ['r02', 'Je werd gevraagd om bij een squad aan te sluiten', 60, 'tactiek', { uitnodiging: true }],
      ['r03', 'Een teamleider vroeg jou om point te lopen of een flank te nemen', 50, 'tactiek'],
      ['r04', 'Iemand vroeg je om advies over gear of een replica', 40, 'techniek', { kringen: { scene: 0.5, online: 0.5 } }],
      ['r05', 'Een organisator vroeg je om te marshallen of te helpen', 100, 'tactiek', { kringen: { veld: 1 } }],
      ['r06', 'Je werd genoemd in een verslag, video of post over een game', 80, 'tactiek', { kringen: { online: 1, scene: 0.5 } }],
      ['r07', 'Een tegenstander complimenteerde je met een goede actie', 40, 'cqb'],
      ['r08', 'Je kreeg een patch of coin van een ander team', 70, 'tactiek'],
      ['r09', 'Je werd uitgenodigd voor een besloten game of milsim', 120, 'tactiek', { uitnodiging: true, kringen: { veld: 0.5, scene: 0.5 } }],
      ['r10', 'Iemand bedankte je voor je sportiviteit', 40, 'tactiek'],
      ['r11', 'Een nieuwe speler werd naar jou doorverwezen', 60, 'tactiek'],
      ['r12', 'Je werd gevraagd als commandant van een kant', 150, 'tactiek', { kringen: { veld: 0.5, scene: 1 } }],
      ['r13', 'Een veld, team of winkel deelde iets van jou', 80, 'techniek', { kringen: { online: 1 } }],
      ['r14', 'Je werd gevraagd om een briefing of tactiekles te geven', 120, 'tactiek', { kringen: { veld: 0.5, team: 0.5 } }],
      ['r15', 'Je werd gevraagd om lid te worden van een team', 100, 'tactiek', { uitnodiging: true, kringen: { team: 1 } }],
    ],
  },
  {
    id: 'spelen',
    kringen: { scene: 0.5, veld: 0.5 },
    naam: 'Spelen: woodland, CQB en milsim',
    icoon: 'person-rifle',
    kleur: 'groen',
    activiteiten: [
      ['s01', 'Een skirmish in het bos gespeeld', 40, 'conditie', { plek: 'bos' }],
      ['s02', 'Een CQB-game gespeeld', 40, 'cqb', { plek: 'cqbhal' }],
      ['s03', 'Een milsim van een dag gespeeld', 100, 'tactiek'],
      ['s04', 'Een milsim van een heel weekend gespeeld, met overnachting', 250, 'conditie', { plek: 'kamp' }],
      ['s05', 'Een nachtgame gespeeld', 80, 'stealth'],
      ['s06', 'Een objective gehaald voor je kant', 50, 'tactiek'],
      ['s07', 'Een punt verdedigd tot het einde van de ronde', 40, 'tactiek'],
      ['s08', 'Gespeeld op een veld waar je nog nooit was', 60, 'tactiek', { kringen: { scene: 1 } }],
      ['s09', 'Als laatste van je squad overeind gebleven en het punt gehouden', 60, 'cqb'],
      ['s10', 'Een scenario met rollenspel gespeeld', 70, 'tactiek'],
      ['s11', 'Een game in regen of kou volgehouden tot het einde', 40, 'conditie'],
      ['s12', 'Gespeeld in een gemengd squad met mensen die je niet kende', 40, 'tactiek', { kringen: { scene: 1 }, gunst: 1 }],
      ['s13', 'Een speedsoft-game gespeeld', -30, 'conditie'],
      ['s14', 'In speedsoft-kit naar een woodland- of milsimgame gekomen', -60, 'conditie', { gunst: -1 }],
      ['s15', 'Een speedsoft-toernooi gespeeld', -50, 'cqb'],
    ],
  },
  {
    id: 'acties',
    kringen: { scene: 0.5, team: 0.5 },
    naam: 'Spelelementen: kills en moves',
    icoon: 'crosshairs',
    kleur: 'rood',
    activiteiten: [
      ['k01', 'Een knife kill gemaakt', 60, 'cqb'],
      ['k02', 'Een tegenstander uitgeschakeld van grote afstand', 50, 'precisie'],
      ['k03', 'Een sniper van de tegenpartij uitgeschakeld', 70, 'precisie'],
      ['k04', 'Ongezien achter de linies gekomen', 70, 'stealth'],
      ['k05', 'Een flank genomen die het spel deed kantelen', 80, 'tactiek'],
      ['k06', 'Met je team een kamer gecleard', 50, 'cqb'],
      ['k07', 'Als medic een teamgenoot weer in het spel geholpen', 40, 'tactiek'],
      ['k08', 'Twee of meer tegenstanders na elkaar uitgeschakeld', 60, 'cqb'],
      ['k09', 'Een ronde overleefd met alleen je pistool', 50, 'cqb'],
      ['k10', 'De positie van de tegenstander verkend en doorgegeven', 60, 'stealth'],
      ['k11', 'Een hele game gespeeld zonder geraakt te worden', 120, 'stealth'],
      ['k12', 'Een sniperpositie een uur vastgehouden', 60, 'precisie'],
      ['k13', 'Een kill gemaakt met een granaat of mijn', 50, 'tactiek'],
      ['k14', 'Een tegenstander met een surrender uitgeschakeld in plaats van te schieten', 60, 'cqb', { gunst: 1 }],
    ],
  },
  {
    id: 'veld',
    kringen: { scene: 0.5 },
    naam: 'Het speelgebied: plekken',
    icoon: 'map',
    kleur: 'teal',
    activiteiten: [
      ['p01', 'De bunker ingenomen', 60, 'cqb', { plek: 'bunker' }],
      ['p02', 'Het spookdorp gecleard', 70, 'cqb', { plek: 'dorp' }],
      ['p03', 'De uitkijktoren bezet en de omgeving verkend', 50, 'precisie', { plek: 'uitkijk' }],
      ['p04', 'De sniperheuvel vastgehouden', 60, 'precisie', { plek: 'heuvel' }],
      ['p05', 'Door het dichte bos geslopen', 50, 'stealth', { plek: 'bos' }],
      ['p06', 'Het voertuigwrak als dekking verdedigd', 40, 'tactiek', { plek: 'wrak' }],
      ['p07', 'Het vlagpunt veroverd', 60, 'tactiek', { plek: 'vlag' }],
      ['p08', 'Het depot bevoorraad of gesaboteerd', 50, 'stealth', { plek: 'depot' }],
      ['p09', 'De kapel verdedigd', 50, 'tactiek', { plek: 'kapel' }],
      ['p10', 'Een nacht in het kampement geslapen', 60, 'conditie', { plek: 'kamp' }],
      ['p11', 'In de CQB-hal gespeeld', 40, 'cqb', { plek: 'cqbhal' }],
      ['p12', 'In de safezone een praatje gemaakt met een ander team', 20, 'tactiek', { plek: 'safezone', kringen: { scene: 1 } }],
      ['p13', 'Je replica laten chronen bij het chronostation', 10, 'techniek', { plek: 'chrono' }],
    ],
  },
  {
    id: 'training',
    kringen: { team: 1 },
    naam: 'Training en conditie',
    icoon: 'person-running',
    kleur: 'oranje',
    activiteiten: [
      ['t01', 'Hardgelopen of gesport voor je conditie', 20, 'conditie'],
      ['t02', 'Met je team geoefend: communicatie, bewegen en CQB-drills', 60, 'tactiek'],
      ['t03', 'Je hop-up en richtmiddel afgesteld op een baan of veld', 30, 'precisie'],
      ['t04', 'Doelschieten geoefend op een baan of veld', 20, 'precisie'],
      ['t05', 'Een cursus EHBO of eerste hulp in het veld gevolgd', 100, 'tactiek'],
      ['t06', 'Kaartlezen en navigeren geoefend', 40, 'tactiek'],
      ['t07', 'De video van een eigen game teruggekeken en ervan geleerd', 30, 'tactiek'],
      ['t08', 'Een workshop of training van een veld gevolgd', 60, 'tactiek', { kringen: { veld: 1 } }],
      ['t09', 'Met volle uitrusting gewandeld of gerend', 40, 'conditie'],
      ['t10', 'Handsignalen en radioprocedures geoefend', 30, 'tactiek'],
      ['t11', 'Als (oud-)militair een training gegeven aan airsofters', 120, 'tactiek', { gunst: 1, kringen: { team: 0.5, scene: 1 } }],
    ],
  },
  {
    id: 'sport',
    kringen: { scene: 1 },
    naam: 'Sportiviteit en veiligheid',
    icoon: 'handshake',
    kleur: 'zeegroen',
    activiteiten: [
      ['v01', 'Elke hit eerlijk gemeld, ook de twijfelgevallen', 20, 'tactiek', { gunst: 1 }],
      ['v02', 'Een speler aangesproken die zijn bril afzette in het speelveld', 30, 'tactiek', { gunst: 1 }],
      ['v04', 'Een discussie op het veld rustig opgelost', 50, 'tactiek', { gunst: 1 }],
      ['v05', 'Een tegenstander na de game bedankt of de hand geschud', 20, 'tactiek', { gunst: 1 }],
      ['v06', 'Een speler die geen hits meldt, netjes gemeld bij een marshal', 30, 'tactiek'],
      ['v07', 'Een gewonde speler geholpen of eerste hulp gegeven', 80, 'tactiek', { gunst: 1 }],
      ['v08', 'Je loop afgedekt in de safezone en anderen eraan herinnerd', 15, 'techniek', { gunst: 1 }],
      ['v09', 'Na een game geholpen met het opruimen van het veld', 40, 'conditie', { gunst: 1, kringen: { veld: 1 } }],
      ['v10', 'Een minimale afstand aangehouden en anderen niet van dichtbij geraakt', 20, 'cqb', { gunst: 1 }],
      ['v11', 'Uit jezelf je fps of joule laten nameten toen je twijfelde', 20, 'techniek', { gunst: 1 }],
      ['v12', 'De organisatie of een marshal bedankt na een game', 20, 'tactiek', { gunst: 1, kringen: { veld: 1 } }],
    ],
  },
  {
    id: 'gear',
    kringen: { scene: 0.5, online: 0.5 },
    naam: 'Gear en techniek',
    icoon: 'screwdriver-wrench',
    kleur: 'zilver',
    activiteiten: [
      ['g01', 'Je replica schoongemaakt en onderhouden', 15, 'techniek'],
      ['g02', 'Zelf een upgrade of reparatie gedaan', 60, 'techniek'],
      ['g03', 'Iemand anders geholpen met een reparatie', 60, 'techniek', { gunst: 1, kringen: { scene: 1 } }],
      ['g04', 'Je loadout getest en verbeterd', 30, 'techniek'],
      ['g05', 'Een airsoftwinkel bezocht en advies gevraagd', 30, 'techniek', { kringen: { scene: 0.5, veld: 0.5 } }],
      ['g06', 'Een review van gear geschreven of gefilmd', 80, 'techniek', { kringen: { online: 1 } }],
      ['g07', 'Batterijen, gas en magazines op orde voor een game', 10, 'techniek'],
      ['g08', 'Een nieuwe speler geholpen met een eerste setup', 70, 'techniek', { gunst: 1 }],
      ['g09', 'Je replica laten nakijken door een tech', 30, 'techniek'],
      ['g10', 'Een HPA-systeem of tracer afgesteld', 50, 'techniek'],
      ['g11', 'Je kit aangepast voor een thema of impressie', 60, 'techniek'],
      ['g12', 'Een speedsoft-build gekocht of gebouwd', -50, 'techniek'],
    ],
  },
  {
    id: 'team',
    kringen: { team: 1 },
    naam: 'Je team',
    icoon: 'people-group',
    kleur: 'blauw',
    activiteiten: [
      ['e01', 'Een teamtraining of teamavond bijgewoond', 40, 'tactiek'],
      ['e02', 'Samen met je team een game gepland', 40, 'tactiek'],
      ['e03', 'Een nieuw teamlid wegwijs gemaakt', 60, 'tactiek', { gunst: 1 }],
      ['e04', 'Mee ontworpen aan de teampatch of het tenue', 80, 'techniek'],
      ['e05', 'Als squadleider een squad door een game geleid', 120, 'tactiek'],
      ['e06', 'Na een game iets gezelligs met het team georganiseerd', 80, 'tactiek', { tegen: true }],
      ['e07', 'Een debrief na een game gehouden', 50, 'tactiek'],
      ['e08', 'De teamchat bijgehouden en iedereen op de hoogte gehouden', 20, 'tactiek'],
      ['e09', 'Je team vertegenwoordigd bij een overleg met organisatoren', 80, 'tactiek', { kringen: { team: 0.5, veld: 1 } }],
      ['e10', 'Met je team een eigen scenario bedacht', 100, 'tactiek'],
    ],
  },
  {
    id: 'organiseren',
    kringen: { veld: 1 },
    naam: 'Organiseren en marshallen',
    icoon: 'clipboard-list',
    kleur: 'navy',
    activiteiten: [
      ['o01', 'Gemarshald tijdens een game', 80, 'tactiek', { gunst: 1 }],
      ['o02', 'Een briefing voor spelers gegeven', 60, 'tactiek'],
      ['o03', 'Een veld helpen opbouwen: barricades, props en routes', 60, 'conditie', { gunst: 1 }],
      ['o04', 'Een kleine game of oefendag georganiseerd', 150, 'tactiek', { tegen: true }],
      ['o05', 'Een milsim mee georganiseerd', 300, 'tactiek', { kringen: { veld: 1, scene: 1 } }],
      ['o06', 'Een scenario of verhaallijn voor een event geschreven', 120, 'tactiek'],
      ['o07', 'De chrono gedaan bij de ingang', 40, 'techniek', { gunst: 1, plek: 'chrono' }],
      ['o08', 'De inschrijvingen en betalingen voor een game geregeld', 60, 'tactiek'],
      ['o09', 'Een EHBO-post of veiligheidsplan voor een event geregeld', 80, 'tactiek', { gunst: 1 }],
      ['o10', 'Een game afgesloten met prijzen of een eervolle vermelding', 50, 'tactiek'],
      ['o11', 'Operatie, stap 1: plan en datum gemaakt', 50, 'tactiek', { dossierstap: 1 }],
      ['o12', 'Operatie, stap 2: locatie en toestemming geregeld', 80, 'tactiek', { dossierstap: 2 }],
      ['o13', 'Operatie, stap 3: scenario en briefing klaar', 100, 'tactiek', { dossierstap: 3 }],
      ['o14', 'Operatie, stap 4: uitgevoerd en een debrief gehouden', 150, 'tactiek', { dossierstap: 4 }],
    ],
  },
  {
    id: 'community',
    kringen: { scene: 1 },
    naam: 'Community en nieuwe spelers',
    icoon: 'hand-holding-heart',
    kleur: 'paars',
    activiteiten: [
      ['c01', 'Een nieuwe speler uitgelegd hoe het spel werkt', 40, 'tactiek', { gunst: 1 }],
      ['c02', 'Een vriend of collega meegenomen naar een eerste game', 80, 'tactiek', { tegen: true, gunst: 1 }],
      ['c03', 'Een replica of gear uitgeleend aan een nieuwe speler', 60, 'techniek', { gunst: 1 }],
      ['c04', 'Een vraag van een beginner online goed beantwoord', 20, 'techniek', { gunst: 1, kringen: { online: 1 } }],
      ['c05', 'Een airsoftbeurs of meetup bezocht', 50, 'tactiek'],
      ['c06', 'Na een game nagepraat met spelers van een ander team', 40, 'tactiek'],
      ['c07', 'Gespeeld bij een andere club of op een ander veld', 60, 'tactiek', { kringen: { scene: 1, veld: 0.5 } }],
      ['c08', 'Een buddy gevonden en samen gespeeld', 30, 'tactiek'],
      ['c09', 'Iemand geholpen met de regels en het lidmaatschap', 50, 'tactiek', { gunst: 1, kringen: { bond: 0.5, scene: 0.5 } }],
    ],
  },
  {
    id: 'media',
    kringen: { online: 1 },
    naam: 'Media en online',
    icoon: 'camera',
    kleur: 'amber',
    activiteiten: [
      ['m01', 'Een game gefilmd met een helmcamera', 30, 'techniek'],
      ['m02', 'Een video van een game gepubliceerd', 80, 'techniek'],
      ['m03', 'Foto\'s van een event gedeeld, met toestemming van de spelers', 40, 'techniek', { gunst: 1 }],
      ['m04', 'Een verslag van een game geschreven', 60, 'tactiek'],
      ['m05', 'Een tutorial of uitleg gemaakt', 100, 'techniek'],
      ['m06', 'Een game live gestreamd', 80, 'techniek'],
      ['m07', 'Een post van een veld of team gedeeld om ze te steunen', 10, 'tactiek', { gunst: 1 }],
      ['m08', 'Te gast geweest in een podcast of video van een ander', 120, 'tactiek', { kringen: { online: 1, scene: 0.5 } }],
      ['m09', 'Een speedsoft-video gepubliceerd', -40, 'techniek'],
    ],
  },
  {
    id: 'nabv',
    kringen: { bond: 1 },
    naam: 'NABV en verenigingsleven',
    icoon: 'shield-halved',
    kleur: 'bruin',
    activiteiten: [
      ['n01', 'Je lidmaatschap van de NABV verlengd', 20, 'tactiek'],
      ['n02', 'Een ledenvergadering van de NABV bijgewoond of gevolgd', 60, 'tactiek'],
      ['n03', 'Meegepraat of gestemd over een voorstel van de NABV', 40, 'tactiek'],
      ['n04', 'Vrijwilliger geweest voor de NABV', 120, 'tactiek', { gunst: 1 }],
      ['n05', 'Een nieuwe speler geholpen met lid worden', 50, 'tactiek', { gunst: 1, kringen: { bond: 0.5, scene: 0.5 } }],
      ['n06', 'Meegeholpen aan een evenement of open dag van de NABV', 100, 'conditie', { gunst: 1 }],
      ['n07', 'Een stuk geschreven voor de nieuwsbrief of site van de NABV', 80, 'techniek', { kringen: { bond: 1, online: 0.5 } }],
      ['n08', 'Een functie in een commissie of het kader van de NABV aangenomen', 250, 'tactiek'],
    ],
  },
].map((c) => ({ ...c, activiteiten: c.activiteiten.map(([id, naam, punten, eigenschap, kenmerken = {}]) => ({ id, naam, punten, eigenschap, ...kenmerken })) }));

// Patches: grote, eenmalige stappen. Ingetogen patches tellen extra als je tactiek hoog is;
// opzichtige leveren minder op zolang je tactiek laag is (all gear, no idea).
export const SYMBOLEN = [
  { id: 'm_eigen', punten: 200, naam: 'Je eerste eigen replica', icoon: 'person-rifle', eigenschap: 'techniek' },
  { id: 'm_nabv', punten: 300, naam: 'Lid van de NABV', icoon: 'shield-halved', stijl: 'ingetogen', kringen: { bond: 1.5 }, eigenschap: 'tactiek' },
  { id: 'm_team', punten: 300, naam: 'Lid van een vast team', icoon: 'people-group', kringen: { team: 1.5 }, eigenschap: 'tactiek' },
  { id: 'm_callsign', punten: 250, naam: 'Een callsign dat anderen ook gebruiken', icoon: 'tag', stijl: 'ingetogen', kringen: { scene: 1 }, eigenschap: 'stealth' },
  { id: 'm_patch', punten: 300, naam: 'Een eigen teampatch', icoon: 'certificate', kringen: { team: 1 }, eigenschap: 'techniek' },
  { id: 'm_radio', punten: 300, naam: 'Een team met radio\'s en vaste procedures', icoon: 'tower-broadcast', kringen: { team: 1 }, eigenschap: 'tactiek' },
  { id: 'm_ghillie', punten: 400, naam: 'Een zelfgemaakte ghillie suit', icoon: 'leaf', stijl: 'ingetogen', eigenschap: 'stealth' },
  { id: 'm_ehbo', punten: 400, naam: 'Een geldig EHBO-diploma', icoon: 'kit-medical', stijl: 'ingetogen', eigenschap: 'tactiek' },
  { id: 'm_dmr', punten: 500, naam: 'Een goed afgestelde DMR of sniper', icoon: 'crosshairs', eigenschap: 'precisie' },
  { id: 'm_hpa', punten: 500, naam: 'Een HPA-setup', icoon: 'gauge-high', stijl: 'opzichtig', eigenschap: 'techniek' },
  { id: 'm_milsim', punten: 600, naam: 'Een coin of medaille van een milsim', icoon: 'medal', kringen: { veld: 0.5, scene: 1 }, eigenschap: 'conditie' },
  { id: 'm_kanaal', punten: 600, naam: 'Een video met meer dan 1.000 weergaven', icoon: 'video', stijl: 'opzichtig', kringen: { online: 1.5 }, eigenschap: 'techniek' },
  { id: 'm_impressie', punten: 700, naam: 'Een complete impressie voor milsim', icoon: 'vest', stijl: 'opzichtig', eigenschap: 'techniek' },
  { id: 'm_marshal', punten: 700, naam: 'Vaste marshal bij een veld', icoon: 'clipboard-list', kringen: { veld: 1.5 }, eigenschap: 'tactiek' },
  { id: 'm_tech', punten: 800, naam: 'Bekend als tech in je regio', icoon: 'screwdriver-wrench', stijl: 'ingetogen', kringen: { scene: 1.5 }, eigenschap: 'techniek' },
  { id: 'm_nacht', punten: 900, naam: 'Nachtzicht of warmtezicht', icoon: 'eye', stijl: 'opzichtig', kringen: { scene: 0.5 }, eigenschap: 'stealth' },
  { id: 'm_toernooi', punten: 1000, naam: 'Een toernooi of competitie gewonnen', icoon: 'trophy', kringen: { scene: 1.5 }, eigenschap: 'cqb' },
  { id: 'm_honderd', punten: 1000, naam: 'Honderd games gespeeld', icoon: 'flag', stijl: 'ingetogen', eigenschap: 'conditie' },
  // Militaire status: wie militair is of was, heeft op het veld extra aanzien, naar rang en functie.
  { id: 'm_mil', punten: 600, naam: 'Je dient of diende in de krijgsmacht', icoon: 'person-military-rifle', stijl: 'ingetogen', kringen: { scene: 1, team: 0.5 }, eigenschap: 'tactiek' },
  { id: 'm_mil_onder', punten: 900, naam: 'Onderofficier in de krijgsmacht', icoon: 'angles-up', stijl: 'ingetogen', kringen: { scene: 1, team: 0.5 }, eigenschap: 'tactiek' },
  { id: 'm_mil_officier', punten: 1200, naam: 'Officier in de krijgsmacht', icoon: 'star', stijl: 'ingetogen', kringen: { scene: 1, veld: 0.5 }, eigenschap: 'tactiek' },
  { id: 'm_mil_instructeur', punten: 1000, naam: 'Militair instructeur', icoon: 'person-chalkboard', stijl: 'ingetogen', kringen: { scene: 1, team: 1 }, eigenschap: 'tactiek' },
  { id: 'm_mil_scherpschutter', punten: 1000, naam: 'Militair scherpschutter', icoon: 'crosshairs', stijl: 'ingetogen', kringen: { scene: 1 }, eigenschap: 'precisie' },
  { id: 'm_mil_special', punten: 1500, naam: 'Gediend bij een specialistische eenheid', icoon: 'user-secret', stijl: 'ingetogen', kringen: { scene: 1.5 }, eigenschap: 'stealth' },
  { id: 'm_organisator', punten: 1500, naam: 'Organisator van een terugkerend event', icoon: 'calendar-days', kringen: { veld: 1.5, scene: 1 }, eigenschap: 'tactiek' },
  { id: 'm_kader', punten: 1500, naam: 'Een kaderfunctie bij de NABV of een veld', icoon: 'building-columns', kringen: { bond: 1.5, veld: 0.5 }, eigenschap: 'tactiek' },
  { id: 'm_legende', punten: 3000, naam: 'Een legende: iedereen kent je callsign', icoon: 'crown', stijl: 'ingetogen', kringen: { scene: 2, online: 1 }, eigenschap: 'stealth' },
];

// De eerste inschatting. Elk antwoord geeft punten, die voor een deel naar een skill gaan.
export const STARTVRAGEN = [
  {
    id: 'ervaring',
    vraag: 'Hoe lang speel je al airsoft?',
    eigenschap: 'tactiek',
    deel: 0.5,
    antwoorden: [['Nog nooit', 0], ['Korter dan een jaar', 100], ['Een tot drie jaar', 400], ['Drie tot tien jaar', 1000], ['Langer dan tien jaar', 2000]],
  },
  {
    id: 'vaak',
    vraag: 'Hoe vaak speel je?',
    eigenschap: 'conditie',
    deel: 0.5,
    antwoorden: [['Nog niet', 0], ['Een paar keer per jaar', 100], ['Ongeveer eens per maand', 300], ['Elke week of vaker', 700]],
  },
  {
    id: 'team',
    vraag: 'Speel je in een team?',
    eigenschap: 'tactiek',
    deel: 0.5,
    antwoorden: [['Nee, ik speel alleen', 0], ['Soms met vrienden', 100], ['In een vast team', 300], ['Ik leid een team', 700]],
  },
  {
    id: 'bond',
    vraag: 'Ben je lid van de NABV?',
    eigenschap: 'tactiek',
    deel: 0.3,
    antwoorden: [['Nee', 0], ['Ja', 200], ['Ja, en ik doe vrijwilligerswerk', 500]],
  },
  {
    id: 'helpen',
    vraag: 'Wat doe je voor anderen op het veld?',
    eigenschap: 'tactiek',
    deel: 0.5,
    antwoorden: [['Niets bijzonders', 0], ['Ik help nieuwe spelers', 150], ['Ik marshal of help bij de chrono', 400], ['Ik organiseer games', 1000]],
  },
  {
    id: 'militair',
    vraag: 'Ben je militair?',
    eigenschap: 'tactiek',
    deel: 0.5,
    antwoorden: [
      ['Nee', 0], ['Oud-militair of reservist', 300], ['Militair: soldaat of korporaal', 500], ['Militair: onderofficier', 800],
      ['Militair: officier', 1100], ['Militair met een specialistische functie, zoals instructeur, scherpschutter of special forces', 1400],
    ],
  },
  {
    id: 'gear',
    vraag: 'Hoe staat het met je gear?',
    eigenschap: 'techniek',
    deel: 0.5,
    antwoorden: [['Ik huur', 0], ['Eén eigen replica', 100], ['Meer replica\'s en eigen loadouts', 300], ['Ik bouw en repareer zelf', 600]],
  },
];

/*
 * Voorwaarden voor prestaties en titels: zie gegevens.js van Wassenaar voor alle soorten.
 */

export const PRESTATIES = [
  { id: 'p_eerste', naam: 'Eerste inzet', uitleg: 'Log je eerste activiteit.', icoon: 'person-rifle', voorwaarde: { soort: 'acties', aantal: 1 } },
  { id: 'p_tien', naam: 'Tien keer het veld op', uitleg: 'Speel tien keer.', icoon: 'flag', voorwaarde: { soort: 'terrein', id: 'spelen', aantal: 10 } },
  { id: 'p_mes', naam: 'Stil en dichtbij', uitleg: 'Vijf knife kills.', icoon: 'skull', voorwaarde: { soort: 'activiteit', id: 'k01', aantal: 5 } },
  { id: 'p_havik', naam: 'Oog van de havik', uitleg: 'Tien keer iemand uitgeschakeld van grote afstand.', icoon: 'crosshairs', voorwaarde: { soort: 'activiteit', id: 'k02', aantal: 10 } },
  { id: 'p_counter', naam: 'Countersniper', uitleg: 'Drie snipers van de tegenpartij uitgeschakeld.', icoon: 'bullseye', voorwaarde: { soort: 'activiteit', id: 'k03', aantal: 3 } },
  { id: 'p_geest', naam: 'Geest', uitleg: 'Drie games zonder geraakt te worden.', icoon: 'user-secret', voorwaarde: { soort: 'activiteit', id: 'k11', aantal: 3 } },
  { id: 'p_flank', naam: 'Flankmeester', uitleg: 'Vijf keer een flank die het spel deed kantelen.', icoon: 'route', voorwaarde: { soort: 'activiteit', id: 'k05', aantal: 5 } },
  { id: 'p_medic', naam: 'Engel van het veld', uitleg: 'Tien keer als medic een teamgenoot geholpen.', icoon: 'kit-medical', voorwaarde: { soort: 'activiteit', id: 'k07', aantal: 10 } },
  { id: 'p_kamer', naam: 'Kamerveger', uitleg: 'Tien kamers gecleard.', icoon: 'door-open', voorwaarde: { soort: 'activiteit', id: 'k06', aantal: 10 } },
  { id: 'p_eerlijk', naam: 'Eerlijk duurt het langst', uitleg: 'Twintig keer elke hit eerlijk gemeld.', icoon: 'handshake', voorwaarde: { soort: 'activiteit', id: 'v01', aantal: 20 } },
  { id: 'p_marshal', naam: 'Scheidsrechter', uitleg: 'Vijf keer gemarshald.', icoon: 'clipboard-list', voorwaarde: { soort: 'activiteit', id: 'o01', aantal: 5 } },
  { id: 'p_operatie', naam: 'Gastheer van het veld', uitleg: 'Een operatie in vier stappen afgerond.', icoon: 'folder-open', voorwaarde: { soort: 'dossiers', aantal: 1 } },
  { id: 'p_milsim', naam: 'Weekendkrijger', uitleg: 'Drie milsims van een weekend.', icoon: 'campground', voorwaarde: { soort: 'activiteit', id: 's04', aantal: 3 } },
  { id: 'p_nacht', naam: 'Nachtuil', uitleg: 'Vijf nachtgames.', icoon: 'moon', voorwaarde: { soort: 'activiteit', id: 's05', aantal: 5 } },
  { id: 'p_mentor', naam: 'Mentor', uitleg: 'Tien keer een nieuwe speler het spel uitgelegd.', icoon: 'person-chalkboard', voorwaarde: { soort: 'activiteit', id: 'c01', aantal: 10 } },
  { id: 'p_tech', naam: 'Sleutelaar', uitleg: 'Tien keer iemand geholpen met een reparatie.', icoon: 'screwdriver-wrench', voorwaarde: { soort: 'activiteit', id: 'g03', aantal: 10 } },
  { id: 'p_media', naam: 'Oorlogsverslaggever', uitleg: 'Tien keer actief in media en online.', icoon: 'camera', voorwaarde: { soort: 'terrein', id: 'media', aantal: 10 } },
  { id: 'p_terrein', naam: 'Kenner van het terrein', uitleg: 'Ontdek alle plekken van het speelgebied.', icoon: 'map', voorwaarde: { soort: 'plekken', aantal: 13 } },
  { id: 'p_sectoren', naam: 'Overal geweest', uitleg: 'Actief in alle zes de sectoren.', icoon: 'location-dot', voorwaarde: { soort: 'buurten', aantal: 6 } },
  { id: 'p_ontdekker', naam: 'Verkenner', uitleg: 'Verken vijf terreinen.', icoon: 'binoculars', voorwaarde: { soort: 'terreinen', aantal: 5 } },
  { id: 'p_alleskunner', naam: 'Allround operator', uitleg: 'Verken alle twaalf terreinen.', icoon: 'star', voorwaarde: { soort: 'terreinen', aantal: 12 } },
  { id: 'p_verzamelaar', naam: 'Veelzijdig', uitleg: 'Doe 25 verschillende activiteiten.', icoon: 'list-check', voorwaarde: { soort: 'verschillend', aantal: 25 } },
  { id: 'p_volhouder', naam: 'Volhouder', uitleg: 'Vier weken op rij actief.', icoon: 'fire', voorwaarde: { soort: 'reeks', aantal: 4 } },
  { id: 'p_ijzer', naam: 'IJzeren discipline', uitleg: 'Twaalf weken op rij actief.', icoon: 'fire', voorwaarde: { soort: 'reeks', aantal: 12 } },
  { id: 'p_honderd', naam: 'Honderd keer', uitleg: 'Log honderd activiteiten.', icoon: 'trophy', voorwaarde: { soort: 'acties', aantal: 100 } },
  { id: 'p_topweek', naam: 'Topweek', uitleg: 'Verdien 1.000 PR in één week.', icoon: 'bolt', voorwaarde: { soort: 'week', aantal: 1000 } },
  { id: 'p_patches', naam: 'Volle klittenband', uitleg: 'Verdien vijf patches.', icoon: 'certificate', voorwaarde: { soort: 'symbolen', aantal: 5 } },
  { id: 'p_missies', naam: 'Missie volbracht', uitleg: 'Voltooi tien weekmissies.', icoon: 'circle-check', voorwaarde: { soort: 'missies', aantal: 10 } },
  { id: 'p_netwerk', naam: 'Bekend in de safezone', uitleg: 'Vijfentwintig mensen in je netwerk.', icoon: 'users', voorwaarde: { soort: 'contacten', aantal: 25 } },
  { id: 'p_reputatie', naam: 'Bekend callsign', uitleg: 'Een reputatie van 300 in 90 dagen.', icoon: 'inbox', voorwaarde: { soort: 'bekendheid', aantal: 300 } },
  { id: 'p_omslag', naam: 'Het omslagpunt', uitleg: 'Er komt meer naar je toe dan je zelf zoekt.', icoon: 'arrow-trend-up', voorwaarde: { soort: 'verhouding', aantal: 100 } },
  { id: 'p_sportief', naam: 'Sportief tot op het bot', uitleg: 'Een sportiviteit van 80 of meer.', icoon: 'scale-balanced', voorwaarde: { soort: 'gunfactor', aantal: 80 } },
  { id: 'p_bedankt', naam: 'Goede manieren', uitleg: 'Tien keer de organisatie op tijd bedankt.', icoon: 'envelope', voorwaarde: { soort: 'bedankt', aantal: 10 } },
  { id: 'p_kringen', naam: 'Overal gewaardeerd', uitleg: 'Gewaardeerd in drie kringen.', icoon: 'scale-balanced', voorwaarde: { soort: 'kringen', aantal: 3, vanaf: 200 } },
  { id: 'p_prestige', naam: 'Opnieuw ingelijfd', uitleg: 'Begin een New Game+.', icoon: 'rotate-right', voorwaarde: { soort: 'prestige', aantal: 1 } },
  { id: 'p_duizendpoot', naam: 'Duizendpoot', uitleg: 'Drie terreinen op één dag.', icoon: 'bolt', geheim: true, voorwaarde: { soort: 'dag', aantal: 3 } },
  { id: 'p_comeback', naam: 'Terug van weggeweest', uitleg: 'Weer actief na vier weken stilte.', icoon: 'rotate-right', geheim: true, voorwaarde: { soort: 'comeback', aantal: 1 } },
];

export const TITELS = [
  { id: 't_havik', naam: 'De Havik', uitleg: 'Precisie en sniping op 50 / 100.', voorwaarde: { soort: 'skill', id: 'precisie', aantal: 2000 } },
  { id: 't_cqb', naam: 'De Kamerveger', uitleg: 'CQB en knife kills op 50 / 100.', voorwaarde: { soort: 'skill', id: 'cqb', aantal: 2000 } },
  { id: 't_schim', naam: 'De Schim', uitleg: 'Stealth en verkenning op 50 / 100.', voorwaarde: { soort: 'skill', id: 'stealth', aantal: 2000 } },
  { id: 't_strateeg', naam: 'De Strateeg', uitleg: 'Tactiek en teamwork op 50 / 100.', voorwaarde: { soort: 'skill', id: 'tactiek', aantal: 2000 } },
  { id: 't_onvermoeibaar', naam: 'Onvermoeibaar', uitleg: 'Conditie op 50 / 100.', voorwaarde: { soort: 'skill', id: 'conditie', aantal: 2000 } },
  { id: 't_tech', naam: 'De Tech', uitleg: 'Techniek en gear op 50 / 100.', voorwaarde: { soort: 'skill', id: 'techniek', aantal: 2000 } },
  { id: 't_marshal', naam: 'Oog van het veld', uitleg: 'Twintig keer gemarshald.', voorwaarde: { soort: 'activiteit', id: 'o01', aantal: 20 } },
  { id: 't_mentor', naam: 'De Mentor', uitleg: 'Tien keer het spel uitgelegd en vijf keer een setup geholpen.', voorwaarde: { soort: 'alle', lijst: [{ soort: 'activiteit', id: 'c01', aantal: 10 }, { soort: 'activiteit', id: 'g08', aantal: 5 }] } },
  { id: 't_bekend', naam: 'Naam in de scene', uitleg: 'Een reputatie van 700 in 90 dagen.', voorwaarde: { soort: 'bekendheid', aantal: 700 } },
  { id: 't_ridder', naam: 'Ridder van het veld', uitleg: 'Een sportiviteit van 90 of meer.', voorwaarde: { soort: 'gunfactor', aantal: 90 } },
  { id: 't_operatieleider', naam: 'Operatieleider', uitleg: 'Alle zes de operaties afgerond.', voorwaarde: { soort: 'dossiers', aantal: 6 } },
  { id: 't_veteraan', naam: 'Veteraan van de scene', uitleg: 'Vertrouwd in alle vijf de kringen.', voorwaarde: { soort: 'kringen', aantal: 5, vanaf: 500 } },
];

// Paden: vanaf rang PAD_VANAF (Sergeant) kies je een rol. Die geeft extra XP op drie terreinen.
export const PAD_VANAF = 3;
export const PAD_BONUS = 0.25;
export const PADEN = [
  { id: 'schutter', naam: 'Schutter en sniper', uitleg: 'Precisie, geduld en verkenning.', icoon: 'crosshairs', terreinen: ['acties', 'training', 'gear'] },
  { id: 'assault', naam: 'Assault en CQB', uitleg: 'Snel naar binnen, voorop en dichtbij.', icoon: 'door-open', terreinen: ['acties', 'spelen', 'veld'] },
  { id: 'medic', naam: 'Medic en support', uitleg: 'Het team overeind houden en anderen helpen.', icoon: 'kit-medical', terreinen: ['sport', 'team', 'community'] },
  { id: 'leider', naam: 'Leider en organisator', uitleg: 'Squads leiden, games organiseren en marshallen.', icoon: 'clipboard-list', terreinen: ['organiseren', 'team', 'nabv'] },
];

// De loadout: wat je draagt en waarmee je speelt. Hoe exotischer, hoe meer aanzien op het veld.
// Een zwart pak met een M4 en een Glock is het saaist, huurkit nog saaier. Per optie: [id, naam, trede].
// De factor geldt voor spelen, spelelementen en plekken: het gemiddelde van de delen die je koos.
export const LOADOUT = {
  treden: [
    { naam: 'Speedsoft', factor: 0.7 },
    { naam: 'Huurkit', factor: 0.8 },
    { naam: 'Saai', factor: 0.9 },
    { naam: 'Gangbaar', factor: 1 },
    { naam: 'Degelijk', factor: 1.05 },
    { naam: 'Bijzonder', factor: 1.1 },
    { naam: 'Exotisch', factor: 1.2 },
  ],
  terreinen: ['spelen', 'acties', 'veld'],
  delen: [
    {
      id: 'camo',
      naam: 'Camouflage',
      opties: [
        ['speedsoft', 'Speedsoft-jersey en -broek', 0, { soort: 'speedsoft', kleuren: ['#d63a2f', '#1c1c1c', '#f2f2f2', '#2a6ad6'] }],
        ['huur', 'Huurkit van het veld', 1, { soort: 'effen', kleuren: ['#4a4c3a', '#3d3f30'] }],
        ['zwart', 'Zwart', 2, { soort: 'effen', kleuren: ['#1e1e1e', '#2a2a2a'] }],
        ['effen', 'Effen groen, tan of coyote', 2, { soort: 'effen', kleuren: ['#6b6a45', '#8a7a55'] }],
        ['ucp', 'UCP (Amerikaans digitaal grijs)', 2, { soort: 'digitaal', kleuren: ['#a7a596', '#7d7f73', '#c9c7b6', '#8f9184'] }],
        ['multicam', 'Multicam', 3, { soort: 'multicam', kleuren: ['#b39d74', '#7e6d4f', '#5e6b3c', '#d3c4a1', '#4b3d2a'] }],
        ['woodland', 'Woodland (M81)', 3, { soort: 'vlekken', kleuren: ['#6b7148', '#6a4f35', '#3b4a2b', '#1b1b17'] }],
        ['flecktarn', 'Flecktarn', 3, { soort: 'stippen', kleuren: ['#7c7b55', '#4b5a33', '#2f3a24', '#6b513a', '#1e1e18'] }],
        ['aor', 'AOR1 of AOR2', 3, { soort: 'digitaal', kleuren: ['#c2ae86', '#9a8463', '#7a6a4d', '#d9c9a6'] }],
        ['marpat', 'Marpat', 4, { soort: 'digitaal', kleuren: ['#4d5a3a', '#2c3524', '#6b5d42', '#8a8a62'] }],
        ['nfp', 'NFP (Nederlands)', 4, { soort: 'multicam', kleuren: ['#6a7046', '#3d4a2c', '#8a7a55', '#2a2a20', '#9a9a72'] }],
        ['dpm', 'DPM (Brits)', 4, { soort: 'vlekken', kleuren: ['#7b7b4f', '#4b5a2f', '#6b4a2e', '#1e1e1a'] }],
        ['mtp', 'MTP (Brits)', 4, { soort: 'multicam', kleuren: ['#a8946b', '#6e6544', '#4f5a35', '#c9b892', '#3a3424'] }],
        ['mcvariant', 'Multicam Tropic, Arid of Black', 4, { soort: 'multicam', kleuren: ['#56603b', '#2e3a26', '#7f8a5a', '#1e2a1c', '#9aa070'] }],
        ['atacs', 'A-TACS', 4, { soort: 'multicam', kleuren: ['#8a8070', '#6d6a5a', '#a59c86', '#4c4a3f', '#b8ae96'] }],
        ['pencott', 'PenCott', 4, { soort: 'digitaal', kleuren: ['#6b6a4a', '#4a4a33', '#8b7b56', '#2e2e22'] }],
        ['kryptek', 'Kryptek', 5, { soort: 'schubben', kleuren: ['#6b6450', '#4a4436', '#8d8670', '#2b2820'] }],
        ['vz95', 'Tsjechisch woodland (vz. 95)', 5, { soort: 'blad', kleuren: ['#6e7446', '#3a4428', '#6e5434', '#1f2219', '#9a9a6a'] }],
        ['m90', 'Zweeds splinter (M90)', 5, { soort: 'splinter', kleuren: ['#7b8250', '#4f5a36', '#2c3322', '#1c1f17'] }],
        ['splinter', 'Duits Splittertarn', 5, { soort: 'splinter', kleuren: ['#8a8463', '#5a6b3e', '#6e5a3e', '#a59c78'] }],
        ['flora', 'Russisch Flora of EMR', 5, { soort: 'strepen', kleuren: ['#9a9a6a', '#6c7a4a', '#3f5534', '#c3c09a'] }],
        ['partizan', 'Russisch Partizan of SS-Leto', 5, { soort: 'blad', kleuren: ['#a39a73', '#7a6e4a', '#4c5a33', '#2f2d22'] }],
        ['m84', 'Deens M/84', 5, { soort: 'stippen', kleuren: ['#7c7f5d', '#566043', '#2f3a2a', '#1e2219'] }],
        ['m05', 'Fins M05', 5, { soort: 'digitaal', kleuren: ['#5c6646', '#3b4430', '#7a7a5a', '#232720', '#8f8a6a'] }],
        ['wz93', 'Pools wz. 93', 5, { soort: 'vlekken', kleuren: ['#7a7a52', '#3d4a2c', '#6f553a', '#1c1c18'] }],
        ['vegetato', 'Italiaans Vegetato', 5, { soort: 'blad', kleuren: ['#8d8c66', '#5f6a40', '#3b4a2c', '#7a6141', '#1d1d18'] }],
        ['auscam', 'Australisch AUSCAM', 5, { soort: 'stippen', kleuren: ['#a39e7a', '#7d7a55', '#4c5a35', '#6a4d34', '#2a2a22'] }],
        ['tropentarn', 'Duits Tropentarn', 5, { soort: 'stippen', kleuren: ['#d1c39c', '#a3966f', '#7d6f4c', '#5a6b3e'] }],
        ['dcu', 'Chocolate chip', 5, { soort: 'chips', kleuren: ['#d2c3a4', '#8a6e4c', '#b49a72', '#2a241c', '#f4efe4'] }],
        ['tiger', 'Tigerstripe', 6, { soort: 'tijger', kleuren: ['#7a7a4a', '#3a4a2a', '#1c1c16', '#5a5a38'] }],
        ['rhodesian', 'Rhodesian brushstroke', 6, { soort: 'penseel', kleuren: ['#a8936b', '#4e5a32', '#6b4a2e'] }],
        ['erbsen', 'Erbsentarn', 6, { soort: 'erwten', kleuren: ['#8a7a52', '#5a6a3a', '#2f3a24', '#6b4a2e', '#b0a37a'] }],
        ['berezka', 'Berezka', 6, { soort: 'blad', kleuren: ['#b9bf93', '#8a9a6a', '#5a6a3e', '#d5d8b8'] }],
        ['erdl', 'ERDL (Vietnam)', 6, { soort: 'vlekken', kleuren: ['#6f7b48', '#3e4d2b', '#6e5434', '#1d1d18'] }],
        ['frog', 'Frogskin (WO2)', 6, { soort: 'stippen', kleuren: ['#7a7a4f', '#4f5a33', '#8a7a52', '#2c2c22'] }],
        ['lizard', 'Frans Lizard', 6, { soort: 'lizard', kleuren: ['#8a8458', '#4d5a33', '#6a4e33'] }],
        ['platanen', 'Platanenmuster (WO2)', 6, { soort: 'vlekken', kleuren: ['#a38a52', '#7a6a3e', '#4b5a2a', '#2e2a1c'] }],
        ['eigen', 'Eigen ghillie of eigen ontwerp', 6, { soort: 'ghillie', kleuren: ['#4a5230', '#5a6238', '#7a7048', '#2c2a1e', '#8a8458'] }],
      ],
    },
    {
      id: 'wapen',
      naam: 'Hoofdwapen',
      opties: [
        ['speed', 'Speedsoft-build: lichte M4 of SMG met hoge vuursnelheid', 0],
        ['huur', 'Huurreplica van het veld', 1],
        ['m4zwart', 'M4, kaal en zwart', 2], ['arp9', 'ARP9', 2], ['instap', 'Instap-M4 van een budgetmerk', 2],
        ['m4', 'M4 met eigen aankleding', 3], ['m16', 'M16A4', 3], ['hk416', 'HK416', 3], ['mk18', 'Mk18', 3], ['amoeba', 'Ares Amoeba', 3],
        ['ak', 'AK-74', 3], ['akm', 'AKM', 3], ['mp5', 'MP5', 3], ['g36', 'G36', 3], ['ump', 'UMP', 3], ['mp7', 'MP7', 3], ['vsr', 'VSR-10', 3],
        ['c7', 'Diemaco C7', 4], ['c8', 'Diemaco C8', 4], ['scar', 'SCAR-L', 4], ['scarh', 'SCAR-H', 4],
        ['bullpup', 'Steyr AUG', 4], ['tavor', 'Tavor', 4], ['l85', 'L85 (SA80)', 4], ['g3', 'G3', 4], ['fal', 'FAL', 4],
        ['pdw', 'Kriss Vector', 4], ['p90', 'P90', 4], ['mcx', 'SIG MCX', 4], ['acr', 'ACR', 4], ['hk417', 'HK417', 4],
        ['ak12', 'AK-12', 4], ['sg550', 'SIG 550', 4], ['aks74u', 'AKS-74U', 4], ['l96', 'L96 (AWP)', 4], ['ssg24', 'Novritsch SSG24', 4],
        ['svd', 'SVD Dragunov', 5], ['lmg', 'M249', 5], ['mg4', 'MG4', 5], ['famas', 'FAMAS', 5], ['vz58', 'VZ58', 5], ['galil', 'Galil', 5],
        ['as', 'AS Val', 5], ['vss', 'VSS Vintorez', 5], ['m14', 'M14', 5], ['bizon', 'PP-19 Bizon', 5], ['srs', 'Silverback SRS', 5],
        ['uzi', 'Uzi', 5], ['sniper', 'Novritsch SSG10 of een andere zware bolt-action', 5],
        ['historisch', 'Thompson', 6], ['mp40', 'MP40', 6], ['sten', 'Sten', 6], ['garand', 'M1 Garand', 6], ['m1carbine', 'M1 Carbine', 6],
        ['ppsh', 'PPSh-41', 6], ['m3', 'M3 Grease Gun', 6], ['stg44', 'StG 44', 6], ['mg42', 'MG42', 6], ['zwaar', 'PKM', 6], ['m60', 'M60', 6],
        ['grendel', 'Mosin-Nagant', 6], ['leeenfield', 'Lee-Enfield', 6], ['type56', 'Type 56 met bajonet', 6],
        ['shotgun', 'Pompgun als hoofdwapen', 6], ['m79', 'Granaatwerper als hoofdwapen (M79)', 6],
      ],
    },
    {
      id: 'pistool',
      naam: 'Secundair wapen',
      opties: [
        ['speed', 'Speedsoft-pistool: Hi-Capa met hoge vuursnelheid', 0],
        ['huur', 'Huurpistool van het veld', 1],
        ['glock', 'Glock 17', 2], ['glock19', 'Glock 19', 2], ['hicapa', 'Hi-Capa', 2], ['aap01', 'AAP-01', 2],
        ['p226', 'SIG P226', 3], ['m9', 'Beretta M9', 3], ['usp', 'HK USP', 3], ['m1911', '1911', 3], ['glockplus', 'Glock met eigen aanpassingen', 3], ['hicapaplus', 'Hi-Capa met eigen aanpassingen', 3],
        ['m18', 'SIG M18', 4], ['m17', 'SIG M17', 4], ['g18', 'Glock 18C', 4], ['fiveseven', 'FN Five-seveN', 4], ['cz', 'CZ P-09', 4],
        ['shadow', 'CZ Shadow 2', 4], ['vp9', 'HK VP9', 4], ['mk23', 'HK Mk23', 4], ['p320', 'SIG P320', 4],
        ['deagle', 'Desert Eagle', 5], ['makarov', 'Makarov PM', 5], ['tokarev', 'Tokarev TT-33', 5], ['revolver', 'Revolver: Colt Python of S&W', 5],
        ['mp9', 'B&T MP9', 5], ['skorpion', 'Skorpion vz. 61', 5], ['grach', 'MP-443 Grach', 5],
        ['mauser', 'Mauser C96', 6], ['luger', 'Luger P08', 6], ['stechkin', 'Stechkin APS', 6], ['webley', 'Webley-revolver', 6], ['nambu', 'Nambu', 6],
      ],
    },
    {
      id: 'hoofd',
      naam: 'Hoofddeksel',
      opties: [
        ['speed', 'Speedsoft-masker en pet', 0],
        ['huur', 'Huurmasker of huurhelm van het veld', 1],
        ['pet', 'Pet', 2], ['bril', 'Alleen een bril', 2],
        ['boonie', 'Boonie hat', 3], ['fast', 'Fast-helm', 3], ['beanie', 'Muts met een shemagh', 3],
        ['nvgmount', 'Helm met NVG-mount, cover en counterweight', 4], ['mich', 'MICH of ACH met een cover in je camo', 4], ['headset', 'Helm met een echte headset', 4],
        ['ratnik', 'Russische 6B47 of Ratnik', 5], ['pasgt', 'PASGT-helm', 5], ['bivak', 'Bivakmuts met een gezichtsmasker van gaas', 5],
        ['stahlhelm', 'Historische helm: M1, Stahlhelm of SSh-68', 6], ['ghillie', 'Ghillie hood', 6], ['baret', 'Baret van een echte eenheid', 6],
      ],
    },
    {
      id: 'draag',
      naam: 'Draagsysteem',
      opties: [
        ['speed', 'Speedsoft-rig of alleen een magazijntas', 0],
        ['huur', 'Huurvest van het veld', 1],
        ['zwartpc', 'Goedkope plate carrier in het zwart', 2], ['tasjes', 'Alleen een paar tasjes aan je riem', 2],
        ['pc', 'Plate carrier', 3], ['chestrig', 'Chest rig', 3],
        ['belt', 'Battle belt met een chest rig', 4], ['modulair', 'Modulair systeem in je eigen camo', 4], ['jpc', 'Lichte plate carrier met een placard', 4],
        ['smersh', 'Russisch Smersh-systeem', 5], ['plce', 'Brits PLCE-webbing', 5], ['lbv', 'Load bearing vest uit de jaren 90', 5],
        ['historisch', 'Historisch webbing: M1956, Pattern 37 of Y-straps', 6], ['zelf', 'Zelf genaaid of omgebouwd', 6],
      ],
    },
    {
      id: 'optiek',
      naam: 'Richtmiddel',
      opties: [
        ['speed', 'Mini red dot op een speedsoft-build', 0],
        ['huur', 'Het vizier van de huurreplica', 1],
        ['reddot', 'Goedkope red dot', 2],
        ['holo', 'Holosight of red dot met een vergroter', 3], ['scope', 'Richtkijker met vaste vergroting', 3],
        ['bekend', 'Replica van een bekende optiek: ACOG, Aimpoint of EOTech', 4], ['lpvo', 'LPVO met variabele vergroting', 4],
        ['pso', 'Russische PSO of Kobra', 5], ['nachtzicht', 'Nachtzicht of warmtezicht op je wapen', 5],
        ['ijzer', 'Bewust alleen het ijzeren vizier', 6], ['historisch', 'Historische richtkijker', 6],
      ],
    },
  ],
};

// Weekmissies: elke week drie. {terrein} wordt de naam van een terrein.
export const MISSIES = [
  { soort: 'terrein', aantal: 2, tekst: 'Log 2 keer in {terrein}', beloning: 100 },
  { soort: 'nieuw', aantal: 1, tekst: 'Doe een activiteit die je nog nooit deed', beloning: 120 },
  { soort: 'acties', aantal: 5, tekst: 'Log 5 activiteiten', beloning: 150 },
  { soort: 'pr', aantal: 300, tekst: 'Verdien 300 PR', beloning: 100 },
  { soort: 'dagen', aantal: 2, tekst: 'Wees actief op 2 verschillende dagen', beloning: 100 },
  { soort: 'onbekend', aantal: 1, tekst: 'Doe iets in een terrein waar je nog niets deed', beloning: 150 },
  { soort: 'erkenning', aantal: 2, tekst: 'Noteer 2 keer dat iemand naar jou toe kwam', beloning: 100 },
];

// Reeks: per week op rij actief +10% XP, tot ×1,5.
export const REEKS_STAP = 0.1;
export const REEKS_MAX = 1.5;

// Seizoensevents in de game. Een event geeft extra XP. De datums zijn elk jaar gelijk (maand-dag).
export const EVENTS = [
  { naam: 'Nieuwjaarsoffensief', van: '01-01', tot: '01-14', factor: 1.5, icoon: 'snowflake' },
  { naam: 'Lenteoffensief', van: '04-01', tot: '04-14', factor: 2, icoon: 'seedling' },
  { naam: 'Zomer-milsim', van: '07-15', tot: '07-31', factor: 2, icoon: 'campground' },
  { naam: 'Nachtoperaties', van: '10-25', tot: '10-31', factor: 2, icoon: 'moon' },
  { naam: 'Winterkamp', van: '12-15', tot: '12-31', factor: 1.5, icoon: 'fire' },
];

// Vergeten worden: na zo veel weken stilte gaat er elke week een stukje af (als je dat aanzet).
export const VERGETEN_NA = 4;
export const VERGETEN_PER_WEEK = 0.02;
export const VERGETEN_MAX = 0.2;

// Wederkerigheid: wie jou uitnodigde, nodig je binnen zo veel weken terug uit.
export const WEDERKERIG_WEKEN = 6;
export const WEDERKERIG_BONUS = 1.5;

// Een bedankje binnen zo veel dagen telt dubbel.
export const BEDANK_DAGEN = 2;
export const BEDANK_BONUS = 2;

// Dezelfde activiteit vaak in één week levert minder op.
export const VERZADIGD_NA = 3;
export const VERZADIGD_FACTOR = 0.5;

// Netwerk: een nieuwe rol is een nieuwe brug.
export const NIEUWE_BRUG = 1.5;
export const HECHT_VANAF = 6; // zo vaak samen gespeeld is een hechte band
export const DUNBAR = 150;

// Opzichtige patches leveren minder op met weinig tactiek; ingetogen patches meer met veel tactiek.
export const OPZICHTIG = { onder: 1000, factor: 0.7 };
export const INGETOGEN = { vanaf: 2000, factor: 1.25 };

// Eén keer per week praat men over je vorige week. kring: wie erover praat bij kritiek.
export const RODDEL = {
  lof: { punten: 75, tekst: 'In de safezone zegt men dat je een goede speler bent om mee te spelen.' },
  gierig: { punten: -50, kring: 'team', tekst: 'Men zegt dat je wel meerijdt en meedoet, maar nooit iets terugdoet.' },
  opzichtig: { punten: -50, kring: 'scene', tekst: 'Men zegt: all gear, no idea.' },
  ondankbaar: { punten: -30, kring: 'veld', tekst: 'De organisatie mist je bedankjes.' },
};

// De rollen in je netwerk. Je logt nooit een naam, alleen een callsign of initialen en een rol.
export const ROLLEN = [
  'Teamgenoot', 'Teamleider', 'Speler van een ander team', 'Nieuwe speler', 'Organisator', 'Marshal',
  'Tech', 'Winkelier', 'Medic', 'Fotograaf of filmer', 'Vrijwilliger van de NABV', 'Eigenaar van een veld',
];

// Het speelgebied: verzonnen plekken die op bijna elk veld voorkomen. Een eerste bezoek geeft ×2.
export const ONTDEKKING_BONUS = 2;
export const PLEKKEN = [
  { id: 'safezone', naam: 'De safezone', icoon: 'shield' },
  { id: 'chrono', naam: 'Het chronostation', icoon: 'gauge-high' },
  { id: 'bunker', naam: 'De bunker', icoon: 'dungeon' },
  { id: 'uitkijk', naam: 'De uitkijktoren', icoon: 'binoculars' },
  { id: 'dorp', naam: 'Het spookdorp', icoon: 'house-chimney' },
  { id: 'kapel', naam: 'De kapel', icoon: 'church' },
  { id: 'heuvel', naam: 'De sniperheuvel', icoon: 'mountain' },
  { id: 'wrak', naam: 'Het voertuigwrak', icoon: 'truck' },
  { id: 'bos', naam: 'Het dichte bos', icoon: 'tree' },
  { id: 'kamp', naam: 'Het kampement', icoon: 'campground' },
  { id: 'cqbhal', naam: 'De CQB-hal', icoon: 'door-open' },
  { id: 'vlag', naam: 'Het vlagpunt', icoon: 'flag' },
  { id: 'depot', naam: 'Het depot', icoon: 'box' },
];

// De sectoren van het speelgebied. Bij het loggen kies je er een, zoals een buurt bij Wassenaar.
export const BUURTEN = ['Alfa', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'];

// Operaties: zelf een event organiseren, in vier stappen. Een afgeronde operatie geeft 250 PR.
export const DOSSIER_BELONING = 250;
export const DOSSIERS = [
  { id: 'oefendag', naam: 'Een oefendag voor nieuwe spelers', icoon: 'person-chalkboard' },
  { id: 'nachtgame', naam: 'Een nachtgame', icoon: 'moon' },
  { id: 'cqbtoernooi', naam: 'Een CQB-toernooi', icoon: 'trophy' },
  { id: 'milsim', naam: 'Een milsim van een weekend', icoon: 'campground' },
  { id: 'teamdag', naam: 'Een trainingsdag voor je team', icoon: 'people-group' },
  { id: 'opendag', naam: 'Een open dag voor wie airsoft wil proberen', icoon: 'door-open' },
];
export const DOSSIER_STAPPEN = ['Plan en datum', 'Locatie en toestemming', 'Scenario en briefing', 'Uitvoering en debrief'];

// Kringen: je zichtbaarheid in de community. Een activiteit telt mee in de kringen van haar terrein.
export const KRINGEN = [
  { id: 'team', naam: 'Je eigen team', kort: 'Team', icoon: 'people-group' },
  { id: 'veld', naam: 'Velden en organisatoren', kort: 'Organisatie', icoon: 'flag' },
  { id: 'scene', naam: 'De scene: andere teams en spelers', kort: 'Scene', icoon: 'users' },
  { id: 'online', naam: 'Online community', kort: 'Online', icoon: 'comments' },
  { id: 'bond', naam: 'NABV en verenigingsleven', kort: 'NABV', icoon: 'shield-halved' },
];
export const KRING_STANDEN = [
  [-Infinity, 'Onbetrouwbaar'], [0, 'Onbekend'], [50, 'Bekend gezicht'], [200, 'Gewaardeerd'], [500, 'Vertrouwd'], [1000, 'Legende'],
];
export const KRING_SYMBOOL = { scene: 0.5, team: 0.5 }; // voor een patch zonder eigen kringen

// Sportiviteit: over de laatste weken, vanaf 50. Sportieve dingen laten hem stijgen, strategische dalen.
export const GUNFACTOR = {
  start: 50, dagen: 84, belangeloos: 3, strategisch: -2, opzichtig: -5, blaam: -5,
  streber: 30, streberFactor: 0.8, gegund: 70, gegundFactor: 1.1,
  titel: 'Sportiviteit',
  namen: ['Twijfelachtig', 'Gewoon', 'Eerlijke speler'], // laag, midden, hoog
  uitleg: [
    'Men twijfelt aan je sportiviteit. Doe eens iets voor een ander: help, meld eerlijk, ruim op.',
    'Sportieve dingen laten hem stijgen: eerlijk melden, helpen en bedanken. Opscheppen laat hem dalen.',
    'Men speelt graag met je. Alles levert iets meer op.',
  ],
};

// Reputatie: de punten aan reputatie in de laatste dagen. De niveaus zijn [vanaf, naam].
export const ERKENNING = {
  dagen: 90,
  niveaus: [[0, 'Onbekend'], [100, 'Gezicht op het veld'], [300, 'Bekend callsign'], [700, 'Naam in de scene'], [1500, 'Legende']],
  verhoudingVanaf: 10, // pas vanaf zo veel signalen telt de verhouding
};

// Het speelgebied als stafkaart: verzonnen, met een raster. Coördinaten in een vlak van 1000 bij 700.
// zee is hier een ven, duinen een heide. Sectoren sluiten op elkaar aan: een gedeeld hoekpunt staat in
// beide lijsten.
export const KAART = {
  breedte: 1000,
  hoogte: 700,
  zee: 'M0 0H300C250 60 160 100 0 110Z',
  kust: 'M300 0C250 60 160 100 0 110',
  duinen: 'M0 430C120 410 240 520 300 700H0Z',
  titel: 'Operatiegebied',
  label: 'Kaart van een verzonnen speelgebied, met sectoren en plekken',
  zeeNaam: 'Het Ven',
  zeeLabel: [190, 62],
  zeegezicht: false,
  raster: 100, // een vak van 100 bij 100, met letters en cijfers
  schaal: '500 meter',
  tekst: {
    gebied: 'Sector',
    mist: 'onverkend',
    kies: 'Tik op een plek of sector',
    hulp: 'Een plek in kleur heb je ontdekt; een vage plek nog niet. Je eerste bezoek geeft ×2. Een sector onder de mist is nog onverkend; hoe voller de kleur, hoe vaker je er was.',
    buurt: 'Kies bij het loggen onder "Met wie en waar?" de sector.',
  },
  duinNamen: [],
  bossen: [
    { naam: 'Het Zwarte Woud', punten: [[175, 425], [370, 405], [385, 560], [205, 600]], naamOnder: true },
    { naam: 'Het Dennenbos', punten: [[730, 425], [925, 410], [935, 560], [760, 590]], naamOnder: true },
  ],
  wegen: [
    { naam: 'Het zandpad', soort: 'weg', pad: 'M0 370C300 330 600 430 1000 310', label: '8%' },
    { naam: 'De bosweg', soort: 'snelweg', pad: 'M560 700C590 500 500 300 610 0', label: '62%' },
  ],
  buurten: {
    Alfa: { titel: 'Sector', kleur: 'groen', punten: [[140, 140], [420, 120], [430, 360], [150, 380]], label: [280, 180] },
    Bravo: { titel: 'Sector', kleur: 'bruin', punten: [[420, 120], [700, 140], [690, 390], [430, 360]], label: [560, 180] },
    Charlie: { titel: 'Sector', kleur: 'goud', punten: [[700, 140], [950, 130], [960, 370], [690, 390]], label: [830, 175] },
    Delta: { titel: 'Sector', kleur: 'zeegroen', punten: [[150, 380], [430, 360], [410, 640], [140, 630]], label: [280, 415] },
    Echo: { titel: 'Sector', kleur: 'rood', punten: [[430, 360], [690, 390], [700, 620], [410, 640]], label: [560, 410] },
    Foxtrot: { titel: 'Sector', kleur: 'blauw', punten: [[690, 390], [960, 370], [960, 640], [700, 620]], label: [830, 445] },
  },
  // Per plek: waar hij staat en hoe hij getekend wordt.
  plekken: {
    safezone: [75, 470, 'tent'], chrono: [75, 585, 'kist'],
    bunker: [300, 270, 'bunker'], uitkijk: [195, 300, 'uitkijk'],
    dorp: [540, 255, 'huis'], kapel: [640, 315, 'koepel'],
    heuvel: [830, 245, 'berg'], wrak: [760, 335, 'wrak'],
    bos: [290, 520, 'boom'], kamp: [350, 600, 'tent'],
    cqbhal: [560, 490, 'hal'], vlag: [630, 575, 'vlag'],
    depot: [840, 515, 'kist'],
  },
};
