/*
 * Alle inhoud van de app: rangen, eigenschappen, activiteiten en statussymbolen.
 * Alleen gegevens, geen code. Een id mag je nooit veranderen: het logboek verwijst ernaar.
 */

export const RANGEN = [
  { min: 0, naam: 'Voorbijganger', uitleg: 'Een simpele passant in de groene lanen van Wassenaar.', icoon: 'person-walking' },
  { min: 500, naam: 'Nieuwkomer', uitleg: 'Recent geland. Je observeert de ongeschreven regels.', icoon: 'box-open' },
  { min: 1500, naam: 'Geïntroduceerde', uitleg: 'Er wordt voor je ingestaan. Je bezoekt besloten bijeenkomsten.', icoon: 'handshake' },
  { min: 3500, naam: 'Lid', uitleg: 'Een actief en gerespecteerd lid van de lokale gemeenschap.', icoon: 'id-card' },
  { min: 7500, naam: 'Patroon', uitleg: 'Een sponsor van het dorp. Je dwingt respect af.', icoon: 'building-columns' },
  { min: 15000, naam: 'Wassenaarder', uitleg: 'Niet te onderscheiden van oud geld. Het dorp is van jou.', icoon: 'chess-knight' },
  { min: 30000, naam: 'Ereburger', uitleg: 'Het absolute toppunt van de lokale samenleving.', icoon: 'crown' },
];

// De vaardigheden van je karakter. Kleur is een klasse in app.css.
export const EIGENSCHAPPEN = {
  civic: { naam: 'Maatschappelijke invloed', icoon: 'bullhorn' },
  cultural: { naam: 'Cultureel besef', icoon: 'palette' },
  stealth: { naam: 'Sociale discretie', icoon: 'user-secret' },
  physical: { naam: 'Fysiek en natuur', icoon: 'person-swimming' },
  financial: { naam: 'Financiële slagkracht', icoon: 'coins' },
};

// Punten per eigenschap waarbij de balk vol is (100 / 100).
export const EIGENSCHAP_MAX = 4000;

export const CATEGORIEEN = [
  {
    id: 'dorp',
    naam: 'Sociaal en Oostdorp',
    icoon: 'house-chimney',
    kleur: 'teal',
    activiteiten: [
      ['a01', 'Buren gegroet en bij hun naam genoemd', 10, 'civic'],
      ['a02', 'Praatje gemaakt in de supermarkt', 20, 'civic'],
      ['a03', 'Wandeling door het dorp met een praatje onderweg', 15, 'physical'],
      ['a04', 'Koffie of borrel bij Pops in het centrum', 30, 'stealth'],
      ['a05', 'Nieuwe buren welkom geheten', 40, 'stealth'],
      ['a06', 'Koningsdag in het dorp gevierd', 40, 'civic'],
      ['a07', 'Voorstelling in De Warenar bezocht', 50, 'cultural'],
      ['a08', 'Vergadering van Buurtvereniging Oostdorp bijgewoond', 60, 'civic'],
      ['a09', 'Meegedaan aan Burendag of een opschoondag in de wijk', 70, 'civic'],
      ['a10', 'Vrijwilliger bij de Oranjevereniging', 100, 'civic'],
      ['a11', 'Buurtfeest of straatborrel georganiseerd', 150, 'civic'],
    ],
  },
  {
    id: 'civic',
    naam: 'Civic tech en data',
    icoon: 'code',
    kleur: 'blauw',
    activiteiten: [
      ['b01', 'Raadsvergadering gevolgd, live of teruggekeken', 30, 'civic'],
      ['b02', 'Open data van de gemeente opgevraagd of gebruikt', 40, 'civic'],
      ['b03', 'Gemeenteraad Tracker bijgewerkt', 50, 'civic'],
      ['b04', 'Raadsvergadering bijgewoond op de publieke tribune', 60, 'stealth'],
      ['b05', 'Blog over Wassenaar gepubliceerd op hayobethlehem.nl', 80, 'civic'],
      ['b06', 'Maandelijks overzicht van stemgedrag naar journalisten gestuurd', 120, 'civic'],
      ['b07', 'Vraag van een raadslid beantwoord met data', 120, 'civic'],
      ['b08', 'Data gedeeld met een journalist van De Wassenaarse Krant of Sleutelstad', 150, 'civic'],
      ['b09', 'Ingesproken bij een commissievergadering', 150, 'civic'],
      ['b10', 'Lokale media gebruikten jouw data in een artikel', 200, 'civic'],
    ],
  },
  {
    id: 'erfgoed',
    naam: 'Erfgoed en lokale belangen',
    icoon: 'landmark-dome',
    kleur: 'rood',
    activiteiten: [
      ['c01', 'Dorpsmuseum Wassenaar bezocht', 30, 'cultural'],
      ['c02', 'Kasteel Duivenvoorde bezocht', 40, 'cultural'],
      ['c03', 'Erfgoedwandeling of Open Monumentendag', 50, 'cultural'],
      ['c04', 'Lezing van de historische vereniging bijgewoond', 50, 'cultural'],
      ['c05', 'Zienswijze ingediend over Landgoed De Paauw', 60, 'civic'],
      ['c06', 'Dorpsmuseum geadviseerd over digitalisering', 75, 'cultural'],
      ['c07', 'Blog geschreven over Princess Garden of de Tuin van Ruys', 80, 'cultural'],
      ['c08', 'Meegeholpen met het digitaliseren van de museumcollectie', 120, 'cultural'],
    ],
  },
  {
    id: 'rijk',
    naam: 'Ministerie en Rijksoverheid-aura',
    icoon: 'shield-halved',
    kleur: 'navy',
    activiteiten: [
      ['d01', 'In een lokaal café gewerkt, pasje van het ministerie zichtbaar', 30, 'stealth'],
      ['d02', 'Over Den Haag verteld zonder namen te noemen', 40, 'stealth'],
      ['d03', 'Lokale ondernemer gewezen op een landelijke regeling', 60, 'financial'],
      ['d04', 'Lokale stichting geholpen met landelijke digitale regels', 100, 'stealth'],
      ['d05', 'Raadslid of wethouder uitgelegd hoe landelijk digitaal beleid werkt', 150, 'stealth'],
      ['d06', 'Gemeente en ministerie-contacten informeel met elkaar verbonden', 250, 'stealth'],
    ],
  },
  {
    id: 'diplomatiek',
    naam: 'Diplomatieke en expat-kringen',
    icoon: 'globe',
    kleur: 'paars',
    activiteiten: [
      ['e01', 'Internationale buren geholpen met taal of regels', 40, 'civic'],
      ['e02', 'WhatsApp-buurtpreventie voor expats beheerd', 50, 'stealth'],
      ['e03', 'Expat-buren uitgenodigd voor koffie', 60, 'stealth'],
      ['e04', 'Borrel van de internationale gemeenschap bezocht', 80, 'stealth'],
      ['e05', 'International Festival van de American School bezocht', 100, 'cultural'],
      ['e06', 'Lezing van de Diplomat Club Wassenaar bijgewoond', 250, 'stealth'],
      ['e07', 'Uitgenodigd voor een handelsdiner, bijvoorbeeld op De Wittenburg', 400, 'stealth'],
    ],
  },
  {
    id: 'buiten',
    naam: 'Natuur en buitenleven',
    icoon: 'tree',
    kleur: 'groen',
    activiteiten: [
      ['f01', 'Strandwandeling bij de Wassenaarse Slag', 20, 'physical'],
      ['f02', 'Gewandeld of gefietst in Meijendel of Berkheide', 25, 'physical'],
      ['f03', 'Vogels gespot en gefotografeerd in Meijendel', 30, 'physical'],
      ['f04', 'Getennist bij Kielten', 40, 'physical'],
      ['f05', 'Meegetraind met het WZK Tri-Team', 60, 'physical'],
      ['f06', 'Gedoneerd aan Stichting Duivenvoorde', 80, 'cultural'],
      ['f07', 'Meegedaan aan een natuurwerkdag of strandopruimactie', 80, 'physical'],
      ['f08', 'Vrijwilliger bij Kasteel Duivenvoorde', 100, 'cultural'],
      ['f09', 'Vrijwilliger bij de Wassenaarse Reddingsbrigade', 150, 'physical'],
      ['f10', 'Meegedaan aan de Zwemloop Wassenaar', 200, 'physical'],
    ],
  },
  {
    id: 'handel',
    naam: 'Lokale handel en filantropie',
    icoon: 'store',
    kleur: 'oranje',
    activiteiten: [
      ['g01', 'Bloemen gekocht bij een lokale bloemist', 15, 'financial'],
      ['g02', 'Kwaliteitsvlees gehaald bij Slagerij Groeneveld', 20, 'financial'],
      ['g03', 'Boodschappen gedaan bij een speciaalzaak in de Langstraat', 20, 'financial'],
      ['g04', 'Gegeten bij een lokaal restaurant', 40, 'financial'],
      ['g05', 'Spullen gebracht naar de Kinderkringloop', 40, 'civic'],
      ['g06', 'Gecollecteerd voor een goed doel in de wijk', 60, 'civic'],
      ['g07', 'Kinderkringloop digitaal geholpen', 100, 'civic'],
      ['g08', 'Centrummanagement geadviseerd over leegstand in de Langstraat', 100, 'financial'],
      ['g09', 'Lokale ondernemer geholpen met de website', 120, 'financial'],
      ['g10', 'Meegeholpen bij een jeugdteam, als trainer of scheidsrechter', 120, 'physical'],
      ['g11', 'Jeugdteam van SV Wassenaar, Blauw-Zwart of Kielten gesponsord', 300, 'financial'],
    ],
  },
  {
    id: 'overlast',
    naam: 'Lokale noodzaken',
    icoon: 'bicycle',
    kleur: 'amber',
    activiteiten: [
      ['h01', 'Melding gedaan over de openbare ruimte', 15, 'civic'],
      ['h02', 'Bewonersavond over verkeer bijgewoond', 40, 'civic'],
      ['h03', 'Informatieavond over de Noordrand bijgewoond', 50, 'civic'],
      ['h04', 'Data verzameld over overlast door fatbikes', 60, 'civic'],
      ['h05', 'Meegepraat in het debat over 30 km per uur', 60, 'civic'],
      ['h06', 'Opiniestuk over fatbikes gepubliceerd', 90, 'civic'],
      ['h07', 'Campagne gevoerd voor 30 km per uur', 120, 'civic'],
      ['h08', 'Inzichten met data over de Noordrand gepubliceerd', 120, 'civic'],
    ],
  },
  {
    id: 'oudgeld',
    naam: 'Oud-geldgewoonten',
    icoon: 'champagne-glasses',
    kleur: 'goud',
    activiteiten: [
      ['i01', 'Zondagse wandeling door De Kieviet', 20, 'stealth'],
      ['i02', 'Bedankkaart met de hand geschreven', 30, 'stealth'],
      ['i03', 'Borrel bij iemand thuis bijgewoond', 80, 'stealth'],
      ['i04', 'Uitgenodigd voor een verjaardag in De Kieviet of Rijksdorp', 120, 'stealth'],
      ['i05', 'Zelf een tuinborrel gegeven voor buren en contacten', 150, 'stealth'],
    ],
  },
].map((c) => ({ ...c, activiteiten: c.activiteiten.map(([id, naam, punten, eigenschap]) => ({ id, naam, punten, eigenschap })) }));

export const SYMBOLEN = [
  { id: 'm_lid_oostdorp', punten: 300, naam: 'Lid van Buurtvereniging Oostdorp', icoon: 'house-chimney', eigenschap: 'civic' },
  { id: 'm_slager', punten: 300, naam: 'Bij naam begroet bij Slagerij Groeneveld', icoon: 'drumstick-bite', eigenschap: 'financial' },
  { id: 'm_pops', punten: 300, naam: 'Bij Pops weten ze wat je drinkt', icoon: 'mug-hot', eigenschap: 'stealth' },
  { id: 'm_news', punten: 400, naam: 'Genoemd in De Wassenaarse Krant', icoon: 'newspaper', eigenschap: 'civic' },
  { id: 'm_heritage_map', punten: 600, naam: 'Beschermer van Wassenaars erfgoed', icoon: 'landmark-dome', eigenschap: 'cultural' },
  { id: 'm_art', punten: 600, naam: 'Schilderij van de Haagse School gekocht', icoon: 'image', eigenschap: 'cultural' },
  { id: 'm_car', punten: 700, naam: 'Klassieke Porsche of Land Rover gekocht', icoon: 'car', eigenschap: 'financial' },
  { id: 'm_rotary', punten: 700, naam: 'Bestuurslid van de Rotary of Lions Club', icoon: 'handshake-angle', eigenschap: 'civic' },
  { id: 'm_bestuur', punten: 700, naam: 'Bestuurslid van een lokale stichting of vereniging', icoon: 'users', eigenschap: 'civic' },
  { id: 'm_paauw', punten: 800, naam: 'Je zienswijze over De Paauw werd genoemd in de raad', icoon: 'tree', eigenschap: 'cultural' },
  { id: 'm_brigade', punten: 800, naam: 'Vaste vrijwilliger bij de Reddingsbrigade', icoon: 'life-ring', eigenschap: 'physical' },
  { id: 'm_museum', punten: 900, naam: 'Nieuwe website van het Dorpsmuseum live, met jouw hulp', icoon: 'landmark', eigenschap: 'cultural' },
  { id: 'm_civic_tool', punten: 1000, naam: 'Je civic tool wordt gebruikt door de gemeente', icoon: 'code-branch', eigenschap: 'civic' },
  { id: 'm_haring', punten: 1200, naam: 'Jaarlijkse haringparty georganiseerd', icoon: 'fish-fins', eigenschap: 'stealth' },
  { id: 'm_mayor_consult', punten: 1200, naam: 'De burgemeester vroeg je om advies over tech', icoon: 'lightbulb', eigenschap: 'civic' },
  { id: 'm_council', punten: 1500, naam: 'Gekozen in de gemeenteraad van Wassenaar', icoon: 'landmark', eigenschap: 'civic' },
  { id: 'm_spreker', punten: 1500, naam: 'Spreker bij de Diplomat Club Wassenaar', icoon: 'microphone', eigenschap: 'stealth' },
  { id: 'm_strand', punten: 1800, naam: 'Strandhuisje bij de Wassenaarse Slag', icoon: 'umbrella-beach', eigenschap: 'cultural' },
  { id: 'm_haagsche', punten: 2000, naam: 'Ballotage gehaald bij de Koninklijke Haagsche Golf', icoon: 'golf-ball-tee', eigenschap: 'physical' },
  { id: 'm_house', punten: 2500, naam: 'Rijksmonument gekocht', icoon: 'house-flag', eigenschap: 'financial' },
  { id: 'm_mayor', punten: 3000, naam: 'Je tutoyeert de burgemeester', icoon: 'handshake-simple', eigenschap: 'stealth' },
  { id: 'm_knight', punten: 5000, naam: 'Ridder in de Orde van Oranje-Nassau', icoon: 'medal', eigenschap: 'civic' },
  { id: 'm_royal', punten: 8000, naam: 'In de inner circle van het Koninklijk Huis', icoon: 'chess-king', eigenschap: 'stealth' },
];

// Startvragen: per antwoord de punten. De eigenschap krijgt punten × deel.
export const STARTVRAGEN = [
  {
    id: 'wonen',
    vraag: 'Waar woon je?',
    eigenschap: 'financial',
    deel: 0.5,
    antwoorden: [
      ['Niet in Wassenaar, ik ben bezoeker', 0],
      ['Huurhuis in of bij het centrum', 100],
      ['Koophuis in Oostdorp of Kerkehout', 250],
      ['Vrijstaande villa in De Kieviet of Rijksdorp', 800],
      ['Een rijksmonument', 2000],
    ],
  },
  {
    id: 'werk',
    vraag: 'Wat voor werk doe je?',
    eigenschap: 'stealth',
    deel: 0.5,
    antwoorden: [
      ['Bedrijfsleven, buiten de regio', 0],
      ['Lokale ondernemer of zzp’er', 150],
      ['Ambtenaar, adviseur bij het Rijk of wetenschapper', 400],
      ['Diplomaat of topbestuurder', 800],
    ],
  },
  {
    id: 'zichtbaar',
    vraag: 'Hoe zichtbaar ben je in de samenleving?',
    eigenschap: 'civic',
    deel: 1,
    antwoorden: [
      ['Niet, ik blijf liever op de achtergrond', 0],
      ['Online actief: IndieWeb, open source of civic tech', 200],
      ['Bestuurslid van een lokale stichting of vereniging', 500],
    ],
  },
];
