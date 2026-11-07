/*
 * Alle inhoud van de app: rangen, eigenschappen, activiteiten en statussymbolen.
 * Alleen gegevens, geen code. Een id mag je nooit veranderen: het logboek verwijst ernaar.
 */

// Een rang vraagt PR (min), tijd in het spel (dagen) en een ritueel: een overgangsmoment, zoals in het echt.
// De hoogste rangen vragen ook een goede stand in meerdere kringen (kring: aantal kringen, vanaf welke stand).
// En erkenning: zo veel punten aan signalen dat anderen naar jou toe kwamen, over al je tijd in het spel.
// Het ritueel is een voorwaarde zoals bij de prestaties (zie boven PRESTATIES).
export const RANGEN = [
  { min: 0, dagen: 0, naam: 'Voorbijganger', uitleg: 'Een simpele passant in de groene lanen van Wassenaar.', icoon: 'person-walking' },
  { min: 500, dagen: 0, naam: 'Nieuwkomer', uitleg: 'Recent geland. Je observeert de ongeschreven regels.', icoon: 'box-open' },
  {
    min: 1500, dagen: 14, erkenning: 50, naam: 'Geïntroduceerde', uitleg: 'Er wordt voor je ingestaan. Je bezoekt besloten bijeenkomsten.', icoon: 'handshake',
    ritueel: { tekst: 'Iemand nam je mee of nodigde je thuis uit', voorwaarde: { soort: 'een', lijst: [{ soort: 'activiteit', id: 'i07' }, { soort: 'activiteit', id: 'i03' }, { soort: 'activiteit', id: 'i04' }] } },
  },
  {
    min: 3500, dagen: 90, erkenning: 150, naam: 'Lid', uitleg: 'Een actief en gerespecteerd lid van de lokale gemeenschap.', icoon: 'id-card',
    ritueel: { tekst: 'Je werd lid van een vereniging of club', voorwaarde: { soort: 'een', lijst: [{ soort: 'symbool', id: 'm_vereniging' }, { soort: 'symbool', id: 'm_lid_oostdorp' }, { soort: 'symbool', id: 'm_rotary' }, { soort: 'symbool', id: 'm_bestuur' }, { soort: 'symbool', id: 'm_hgc' }, { soort: 'symbool', id: 'm_rozenstein' }] } },
  },
  {
    min: 7500, dagen: 180, erkenning: 400, naam: 'Patroon', uitleg: 'Een sponsor van het dorp. Je dwingt respect af.', icoon: 'building-columns',
    ritueel: { tekst: 'Je gaf iets terug: een diner, een donatie of een sponsoring', voorwaarde: { soort: 'een', lijst: [{ soort: 'activiteit', id: 'i08' }, { soort: 'activiteit', id: 'f06' }, { soort: 'activiteit', id: 'g11' }] } },
  },
  {
    min: 15000, dagen: 365, erkenning: 800, naam: 'Wassenaarder', uitleg: 'Niet te onderscheiden van oud geld. Het dorp is van jou.', icoon: 'chess-knight',
    ritueel: { tekst: 'Je bent gezien in zeven terreinen', voorwaarde: { soort: 'terreinen', aantal: 7 } },
    kring: { aantal: 3, vanaf: 200 },
  },
  {
    min: 30000, dagen: 730, erkenning: 1500, naam: 'Ereburger', uitleg: 'Het absolute toppunt van de lokale samenleving.', icoon: 'crown',
    kring: { aantal: 4, vanaf: 500 },
    ritueel: { tekst: 'Erkenning van hogerhand: lintje, raadszetel of de burgemeester', voorwaarde: { soort: 'een', lijst: [{ soort: 'symbool', id: 'm_knight' }, { soort: 'symbool', id: 'm_council' }, { soort: 'symbool', id: 'm_mayor' }] } },
  },
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
    // Wat anderen naar jou toe doen: de echte maat voor bekend zijn. Kost geen energie, krijgt geen bonus.
    id: 'erkenning',
    kringen: { dorp: 1 },
    inkomend: true,
    naam: 'Erkenning: wat naar jou toe kwam',
    icoon: 'inbox',
    kleur: 'goud',
    activiteiten: [
      ['s01', 'Iemand groette je bij naam', 15, 'stealth'],
      ['s02', 'Iemand die je nauwelijks kent, maakte een praatje met je', 20, 'civic'],
      ['s03', 'Je werd uitgenodigd zonder dat je erom vroeg', 60, 'stealth', { uitnodiging: true }],
      ['s04', 'Iemand vroeg je om advies', 50, 'civic'],
      ['s05', 'Een raadslid of wethouder zocht contact met je', 80, 'civic', { kringen: { bestuur: 1 } }],
      ['s06', 'Een journalist vroeg om je mening of je data', 80, 'civic', { kringen: { dorp: 0.5, bestuur: 0.5 } }],
      ['s07', 'Je werd genoemd of geciteerd in de lokale media', 100, 'civic', { kringen: { dorp: 1, bestuur: 0.5 } }],
      ['s08', 'Iemand stelde jou voor aan een ander', 50, 'stealth'],
      ['s09', 'Iemand stuurde een ander naar jou door: "vraag het hem maar"', 70, 'civic'],
      ['s10', 'Je werd gevraagd voor een bestuur, commissie of klus', 120, 'civic', { kringen: { dorp: 0.5, bestuur: 1 } }],
      ['s11', 'Iemand bedankte je voor iets wat je deed', 30, 'civic'],
      ['s12', 'Een diplomaat of expat nodigde je uit', 80, 'stealth', { uitnodiging: true, kringen: { diplomaten: 1 } }],
      ['s13', 'Iemand van oud geld nodigde je thuis uit', 100, 'stealth', { uitnodiging: true, kringen: { oudgeld: 1 } }],
      ['s14', 'Iemand kende je al van naam voordat jullie elkaar ontmoetten', 120, 'stealth', { kringen: { dorp: 0.5, oudgeld: 0.5, bestuur: 0.5 } }],
      ['s15', 'Je werd gevraagd om te spreken of een toast uit te brengen', 100, 'civic'],
      ['s16', 'Je werd om een gunst gevraagd', 40, 'civic'],
      ['s17', 'Iemand belde of appte je om je mening over een lokaal onderwerp', 50, 'civic'],
      ['s18', 'Je kreeg een kerst- of nieuwjaarskaart van iemand uit het dorp', 30, 'stealth'],
      ['s19', 'Iemand liep in een volle ruimte naar je toe om je gedag te zeggen', 40, 'stealth'],
      ['s20', 'In een winkel of café wisten ze wat je wilde zonder dat je het zei', 30, 'stealth'],
      ['s21', 'Je werd gevraagd als vrijwilliger, omdat iemand aan jou dacht', 70, 'civic'],
      ['s22', 'Je werd positief genoemd in een buurtapp of lokale online groep', 40, 'civic'],
      ['s23', 'Iemand vroeg je om mee te denken over een plan van de gemeente', 90, 'civic', { kringen: { bestuur: 1 } }],
      ['s24', 'Je werd uitgenodigd voor een besloten bijeenkomst of voorpremière', 90, 'stealth', { uitnodiging: true, kringen: { dorp: 0.5, oudgeld: 0.5 } }],
      ['s25', 'Iemand vroeg of jij een kennismaking kon regelen', 80, 'stealth'],
    ],
  },
  {
    id: 'dorp',
    kringen: { dorp: 1 },
    naam: 'Sociaal en Oostdorp',
    icoon: 'house-chimney',
    kleur: 'teal',
    activiteiten: [
      ['a01', 'Buren gegroet en bij hun naam genoemd', 10, 'civic'],
      ['a02', 'Praatje gemaakt in de supermarkt', 20, 'civic'],
      ['a03', 'Wandeling door het dorp met een praatje onderweg', 15, 'physical'],
      ['a04', 'Koffie of borrel bij Pops in het centrum', 30, 'stealth', { plek: 'pops' }],
      ['a05', 'Nieuwe buren welkom geheten', 40, 'stealth'],
      ['a06', 'Koningsdag in het dorp gevierd', 40, 'civic'],
      ['a07', 'Voorstelling in De Warenar bezocht', 50, 'cultural', { plek: 'warenar' }],
      ['a08', 'Vergadering van Buurtvereniging Oostdorp bijgewoond', 60, 'civic'],
      ['a09', 'Meegedaan aan Burendag of een opschoondag in de wijk', 70, 'civic', { gunst: 1 }],
      ['a10', 'Vrijwilliger bij de Oranjevereniging', 100, 'civic', { gunst: 1 }],
      ['a11', 'Buurtfeest of straatborrel georganiseerd', 150, 'civic', { tegen: true }],
      ['a12', 'Condoleancekaart gestuurd of naar een uitvaart geweest', 60, 'civic', { gunst: 1 }],
      ['a13', 'Buren gefeliciteerd of op kraamvisite geweest', 40, 'civic', { gunst: 1 }],
      ['a14', 'Een verjaardag onthouden, met een kaart', 20, 'stealth'],
      ['a15', 'Een oudere buur geholpen', 50, 'civic', { gunst: 1 }],
      ['a16', 'Iemands naam onthouden en de volgende keer gebruikt', 15, 'stealth'],
      ['a17', 'De buurtapp behulpzaam beantwoord', 15, 'civic', { gunst: 1 }],
      ['a18', 'Nieuwjaarsreceptie van de gemeente bezocht', 80, 'civic', { plek: 'paauw', kringen: { bestuur: 1, dorp: 0.5 } }],
      ['a19', 'Dodenherdenking op 4 mei bijgewoond', 40, 'civic', { stil: true, gunst: 1 }],
      ['a20', 'Koffietafel op Koningsdag in het centrum', 40, 'civic', { plek: 'langstraat' }],
      ['a21', 'Spullen verkocht op de vrijmarkt van Koningsdag', 30, 'financial'],
      ['a22', 'Jazzavond van de Jazz Sociëteit in het Deylerhuis', 50, 'cultural', { plek: 'deylerhuis' }],
      ['a23', 'Kerstmarkt in het centrum bezocht', 30, 'financial', { plek: 'langstraat' }],
      ['a24', 'Een nieuwe buur rondgeleid door het dorp', 50, 'civic', { gunst: 1 }],
      ['a25', 'Bij de bakker of slager een praatje gemaakt en een naam onthouden', 15, 'stealth'],
      ['a26', 'Een buur een klusje gedaan of gereedschap uitgeleend', 30, 'civic', { gunst: 1 }],
      ['a27', 'Sneeuw of bladeren geruimd bij een oudere buur', 40, 'physical', { gunst: 1 }],
      ['a28', 'Een concert, dienst of open dag in de Dorpskerk bezocht', 40, 'cultural'],
      ['a29', 'Een lezing of activiteit in de bibliotheek bezocht', 30, 'cultural'],
      ['a30', 'Op uitnodiging bij een buur op de koffie geweest', 40, 'stealth', { uitnodiging: true }],
      ['a31', 'Een buur uitgenodigd voor koffie bij jou thuis', 50, 'stealth', { tegen: true }],
      ['a32', 'Een buurtapp of buurtpreventiegroep opgezet of bijgehouden', 60, 'civic'],
      ['a33', 'Een zieke of rouwende buur een maaltijd of bloemen gebracht', 50, 'civic', { gunst: 1 }],
    ],
  },
  {
    id: 'civic',
    kringen: { bestuur: 0.5, dorp: 0.5 },
    naam: 'Je kennis inzetten',
    icoon: 'lightbulb',
    kleur: 'blauw',
    activiteiten: [
      ['b01', 'Raadsvergadering gevolgd om te weten wat er speelt, live of teruggekeken', 30, 'civic'],
      ['b02', 'Openbare informatie van de gemeente opgezocht en gebruikt', 40, 'civic'],
      ['b03', 'Gewerkt aan een eigen project voor het dorp', 50, 'civic'],
      ['b04', 'Raadsvergadering bijgewoond op de publieke tribune', 60, 'stealth', { plek: 'paauw', gunst: -1 }],
      ['b05', 'Iets over Wassenaar geschreven en gepubliceerd', 80, 'civic'],
      ['b06', 'Wat je weet over een lokaal onderwerp op een rij gezet voor de lokale pers', 120, 'civic', { kringen: { dorp: 1, bestuur: -0.5 } }],
      ['b07', 'Vraag van een raadslid beantwoord vanuit je vak', 120, 'civic'],
      ['b08', 'Een journalist van De Wassenaarse Krant of Sleutelstad op weg geholpen met je kennis', 150, 'civic', { kringen: { dorp: 1, bestuur: -0.5 } }],
      ['b09', 'Ingesproken bij een commissievergadering', 150, 'civic', { plek: 'paauw' }],
      ['b10', 'Lokale media gebruikten jouw kennis in een artikel', 200, 'civic', { kringen: { dorp: 1, bestuur: -0.5 } }],
      ['b11', 'Brief of reactie geplaatst in De Wassenaarse Krant, Sleutelstad of wassenaarders.nl', 70, 'civic'],
      ['b12', 'Een vereniging of stichting gratis geholpen vanuit je vak', 100, 'civic', { gunst: 1 }],
      ['b13', 'Een buur geholpen met een vraag waar jij verstand van hebt', 40, 'civic', { gunst: 1 }],
      ['b14', 'Een workshop of uitleg gegeven aan dorpsgenoten', 120, 'civic'],
      ['b15', 'Een vraag in een lokale online groep deskundig beantwoord', 20, 'civic', { gunst: 1 }],
      ['b16', 'Een raadsstuk gelezen en de kern samengevat voor anderen', 70, 'civic'],
      ['b17', 'Een fractie of raadslid een tip gegeven vanuit je vakgebied', 80, 'stealth', { kringen: { bestuur: 1 } }],
      ['b18', 'Een inloopmoment gehouden waar dorpsgenoten hun vragen konden stellen', 120, 'civic', { gunst: 1 }],
      ['b19', 'Ouderen geholpen met de computer, telefoon of formulieren', 60, 'civic', { gunst: 1 }],
      ['b20', 'Een lokale ondernemer kosteloos advies gegeven', 80, 'financial', { kringen: { dorp: 1 } }],
      ['b21', 'Je kennis gebundeld in een gids of handleiding voor het dorp', 150, 'civic'],
    ],
  },
  {
    id: 'erfgoed',
    kringen: { oudgeld: 0.5, bestuur: 0.5 },
    naam: 'Erfgoed en lokale belangen',
    icoon: 'landmark-dome',
    kleur: 'rood',
    activiteiten: [
      ['c01', 'Dorpsmuseum Wassenaar bezocht', 30, 'cultural', { plek: 'dorpsmuseum' }],
      ['c02', 'Kasteel Duivenvoorde bezocht', 40, 'cultural', { plek: 'duivenvoorde' }],
      ['c03', 'Erfgoedwandeling of Open Monumentendag', 50, 'cultural'],
      ['c04', 'Lezing van de historische vereniging bijgewoond', 50, 'cultural'],
      ['c05', 'Zienswijze ingediend over Landgoed De Paauw', 60, 'civic'],
      ['c06', 'Dorpsmuseum geadviseerd over digitalisering', 75, 'cultural', { plek: 'dorpsmuseum' }],
      ['c07', 'Blog geschreven over Princess Garden of de Tuin van Ruys', 80, 'cultural'],
      ['c08', 'Meegeholpen met het digitaliseren van de museumcollectie', 120, 'cultural', { plek: 'dorpsmuseum' }],
      ['c09', 'Als vrijwilliger een rondleiding gegeven in het Dorpsmuseum', 90, 'cultural', { plek: 'dorpsmuseum', gunst: 1 }],
      ['c10', 'Een monument in de buurt opgezocht en de geschiedenis gelezen', 20, 'cultural'],
      ['c11', 'Lid geworden van de historische vereniging', 60, 'cultural'],
      ['c12', 'Een oude foto of een verhaal gedeeld met de historische vereniging', 50, 'cultural', { gunst: 1 }],
      ['c13', 'Een oudere Wassenaarder gevraagd naar vroeger, en goed geluisterd', 40, 'stealth', { gunst: 1 }],
      ['c14', 'Als vrijwilliger meegeholpen op Open Monumentendag', 100, 'cultural', { gunst: 1 }],
      ['c15', 'Een oude kerk of kapel in het dorp van binnen bekeken', 30, 'cultural'],
      ['c16', 'Een inspraakavond over een monument of landgoed bijgewoond', 50, 'civic'],
      ['c17', 'Een gastles over de geschiedenis van Wassenaar gegeven op een school', 120, 'cultural'],
      ['c18', 'Een tentoonstelling in het Dorpsmuseum mee opgebouwd', 100, 'cultural', { plek: 'dorpsmuseum', gunst: 1 }],
      ['c19', 'Vriend of donateur geworden van een erfgoedstichting', 80, 'financial', { kringen: { oudgeld: 1 } }],
    ],
  },
  {
    id: 'rijk',
    kringen: { bestuur: 1 },
    naam: 'Ministerie en Rijksoverheid-aura',
    icoon: 'shield-halved',
    kleur: 'navy',
    activiteiten: [
      ['d01', 'In een lokaal café gewerkt, pasje van het ministerie zichtbaar', 30, 'stealth', { kringen: { bestuur: 0.5, dorp: -0.5 }, gunst: -1 }],
      ['d02', 'Over Den Haag verteld zonder namen te noemen', 40, 'stealth', { gunst: -1 }],
      ['d03', 'Lokale ondernemer gewezen op een landelijke regeling', 60, 'financial'],
      ['d04', 'Lokale stichting geholpen met landelijke digitale regels', 100, 'stealth'],
      ['d05', 'Raadslid of wethouder uitgelegd hoe landelijk digitaal beleid werkt', 150, 'stealth'],
      ['d06', 'Gemeente en ministerie-contacten informeel met elkaar verbonden', 250, 'stealth', { gunst: -1 }],
      ['d07', 'Een lokale vereniging gewezen op een subsidie van het Rijk', 60, 'financial', { gunst: 1 }],
      ['d08', 'Uitgelegd wat een nieuwe landelijke wet betekent voor het dorp', 80, 'civic'],
      ['d09', 'Een dorpsgenoot de weg gewezen bij een overheidsloket', 50, 'civic', { gunst: 1 }],
      ['d10', 'Een lezing of debat in Den Haag bezocht en erover verteld in het dorp', 50, 'cultural'],
      ['d11', 'Een raadslid gewezen op een landelijke ontwikkeling die eraan komt', 100, 'stealth', { kringen: { bestuur: 1 } }],
      ['d12', 'Een ambtenaar van de gemeente gesproken over je vakgebied', 80, 'stealth'],
      ['d13', 'Iemand uit het dorp geholpen met een sollicitatie bij de overheid', 80, 'civic', { gunst: 1 }],
      ['d14', 'Een spreker uit Den Haag naar een lokale bijeenkomst gehaald', 150, 'stealth'],
      ['d15', 'Discreet gebleven over iets wat je weet uit je werk', 40, 'stealth', { gunst: 1 }],
      ['d16', 'Een netwerkborrel voor ambtenaren in de regio bezocht', 70, 'stealth', { gunst: -1 }],
    ],
  },
  {
    id: 'diplomatiek',
    kringen: { diplomaten: 1 },
    naam: 'Diplomatieke en expat-kringen',
    icoon: 'globe',
    kleur: 'paars',
    activiteiten: [
      ['e01', 'Internationale buren geholpen met taal of regels', 40, 'civic', { gunst: 1 }],
      ['e02', 'WhatsApp-buurtpreventie voor expats beheerd', 50, 'stealth'],
      ['e03', 'Expat-buren uitgenodigd voor koffie', 60, 'stealth'],
      ['e04', 'Borrel van de internationale gemeenschap bezocht', 80, 'stealth', { gunst: -1 }],
      ['e05', 'International Festival van de American School bezocht', 100, 'cultural', { plek: 'ash' }],
      ['e06', 'Lezing van de Diplomat Club Wassenaar bijgewoond', 250, 'stealth', { gunst: -1 }],
      ['e07', 'Uitgenodigd voor een handelsdiner, bijvoorbeeld op De Wittenburg', 400, 'stealth', { uitnodiging: true, bedank: true, plek: 'wittenburg', gunst: -1 }],
      ['e08', 'Twee mensen uit verschillende kringen aan elkaar voorgesteld', 80, 'stealth', { kringen: { diplomaten: 0.5, bestuur: 0.5, oudgeld: 0.5 } }],
      ['e09', 'Nationale-dagreceptie van een ambassade bijgewoond', 200, 'stealth', { nationaal: true }],
      ['e10', 'Gastles gegeven op de American School', 120, 'cultural', { plek: 'ash' }],
      ['e11', 'Een expatgezin geholpen met een huisarts, school of sportclub', 60, 'civic', { gunst: 1 }],
      ['e12', 'Een paar woorden geleerd in de taal van een buur', 20, 'cultural'],
      ['e13', 'Een expat meegenomen naar Koningsdag of de intocht van Sinterklaas', 70, 'civic', { gunst: 1, kringen: { diplomaten: 1, dorp: 0.5 } }],
      ['e14', 'Een internationaal gezin uitgenodigd voor een Nederlandse maaltijd', 100, 'stealth', { tegen: true }],
      ['e15', 'Bij een internationaal gezin te gast op een feestdag uit hun land', 90, 'cultural', { uitnodiging: true, bedank: true }],
      ['e16', 'Taalmaatje geweest voor een nieuwkomer', 100, 'civic', { gunst: 1 }],
      ['e17', 'Een internationale markt of liefdadigheidsbazaar bezocht', 50, 'financial'],
      ['e18', 'Een expat-buur geholpen met een brief van de gemeente', 40, 'civic', { gunst: 1 }],
      ['e19', 'Een diplomaat gefeliciteerd met de nationale dag van zijn of haar land', 40, 'stealth', { nationaal: true }],
      ['e20', 'Met een diplomaat over diens land gesproken, en vooral geluisterd', 50, 'stealth'],
    ],
  },
  {
    id: 'buiten',
    kringen: { dorp: 0.5, oudgeld: 0.5 },
    naam: 'Natuur en buitenleven',
    icoon: 'tree',
    kleur: 'groen',
    activiteiten: [
      ['f01', 'Strandwandeling bij de Wassenaarse Slag', 20, 'physical', { plek: 'slag' }],
      ['f02', 'Gewandeld of gefietst in Meijendel of Berkheide', 25, 'physical', { plek: 'meijendel' }],
      ['f03', 'Vogels gespot en gefotografeerd in Meijendel', 30, 'physical', { plek: 'meijendel' }],
      ['f04', 'Getennist bij Kielten', 40, 'physical', { plek: 'kielten' }],
      ['f05', 'Meegetraind met het WZK Tri-Team', 60, 'physical'],
      ['f06', 'Gedoneerd aan Stichting Duivenvoorde', 80, 'cultural'],
      ['f07', 'Meegedaan aan een natuurwerkdag of strandopruimactie', 80, 'physical', { gunst: 1 }],
      ['f08', 'Vrijwilliger bij Kasteel Duivenvoorde', 100, 'cultural', { plek: 'duivenvoorde' }],
      ['f09', 'Vrijwilliger bij de Wassenaarse Reddingsbrigade', 150, 'physical', { plek: 'slag', gunst: 1 }],
      ['f10', 'Meegedaan aan de Zwemloop Wassenaar', 200, 'physical', { plek: 'slag' }],
      ['f11', 'Wedstrijd van HGC Heren 1 bezocht op De Roggewoning', 40, 'physical', { plek: 'roggewoning' }],
      ['f12', 'Op de 9-holesbaan van Groen-Geel gespeeld', 50, 'physical', { plek: 'roggewoning' }],
      ['f13', 'Geholpen bij het jeugdvoetbal van Graaf Willem II VAC', 80, 'civic', { plek: 'roggewoning' }],
      ['f14', 'Als introducé gegolfd op Rozenstein', 100, 'physical', { plek: 'rozenstein', uitnodiging: true, bedank: true }],
      ['f15', 'De Avondvierdaagse Wassenaar gelopen', 60, 'physical'],
      ['f16', 'Een duinwandeling met een boswachter of gids gelopen', 40, 'physical', { plek: 'meijendel' }],
      ['f17', 'Hardgelopen of gefietst met een groep uit het dorp', 50, 'physical'],
      ['f18', 'In zee gezwommen bij de Wassenaarse Slag', 40, 'physical', { plek: 'slag' }],
      ['f19', 'Een nieuwjaarsduik gedaan', 80, 'physical', { plek: 'slag' }],
      ['f20', 'Vogels of insecten geteld voor een natuurorganisatie', 50, 'physical', { gunst: 1 }],
      ['f21', 'Groente uit je moestuin of volkstuin gedeeld met buren', 40, 'physical', { gunst: 1 }],
      ['f22', 'Lid geworden van een sportclub in het dorp', 80, 'physical', { kringen: { dorp: 1 } }],
      ['f23', 'Meegedaan aan een sponsorloop of sponsorfietstocht', 90, 'physical', { gunst: 1 }],
      ['f24', 'Een toernooi of clubavond meegespeeld op Kielten', 50, 'physical', { plek: 'kielten' }],
      ['f25', 'Zwerfafval geraapt tijdens een wandeling', 20, 'physical', { gunst: 1 }],
    ],
  },
  {
    id: 'handel',
    kringen: { dorp: 1 },
    naam: 'Lokale handel en filantropie',
    icoon: 'store',
    kleur: 'oranje',
    activiteiten: [
      ['g01', 'Bloemen gekocht bij een lokale bloemist', 15, 'financial'],
      ['g02', 'Kwaliteitsvlees gehaald bij Slagerij Groeneveld', 20, 'financial', { plek: 'langstraat' }],
      ['g03', 'Boodschappen gedaan bij een speciaalzaak in de Langstraat', 20, 'financial', { plek: 'langstraat' }],
      ['g04', 'Gegeten bij een lokaal restaurant', 40, 'financial'],
      ['g05', 'Spullen gebracht naar de Kinderkringloop', 40, 'civic', { gunst: 1 }],
      ['g06', 'Gecollecteerd voor een goed doel in de wijk', 60, 'civic', { gunst: 1 }],
      ['g07', 'Kinderkringloop digitaal geholpen', 100, 'civic'],
      ['g08', 'Centrummanagement geadviseerd over leegstand in de Langstraat', 100, 'financial'],
      ['g09', 'Lokale ondernemer geholpen met de website', 120, 'financial'],
      ['g10', 'Meegeholpen bij een jeugdteam, als trainer of scheidsrechter', 120, 'physical'],
      ['g11', 'Jeugdteam van SV Wassenaar, Blauw-Zwart of Kielten gesponsord', 300, 'financial', { kringen: { dorp: 1.5 } }],
      ['g12', 'Een cadeau gekocht in de Langstraat in plaats van online', 30, 'financial', { plek: 'langstraat' }],
      ['g13', 'Een lokale ondernemer een goede online review gegeven', 15, 'financial', { gunst: 1 }],
      ['g14', 'Een lokale zaak aangeraden bij iemand anders', 20, 'financial', { gunst: 1 }],
      ['g15', 'Naar de opening of het jubileum van een lokale zaak geweest', 50, 'financial'],
      ['g16', 'Een prijs gegeven voor de loterij of veiling van een club', 80, 'financial', { kringen: { dorp: 1 } }],
      ['g17', 'Een benefietavond of veiling voor een goed doel bijgewoond', 120, 'financial', { kringen: { oudgeld: 1, dorp: 0.5 } }],
      ['g18', 'Een lokaal goed doel vast gesteund', 150, 'financial', { gunst: 1 }],
      ['g19', 'Eten of drinken voor een feest besteld bij lokale zaken', 60, 'financial'],
      ['g20', 'Een ondernemersborrel of ondernemersontbijt in het dorp bezocht', 80, 'financial', { gunst: -1 }],
      ['g21', 'Meegeholpen bij een inzamelactie voor mensen die het moeilijk hebben', 80, 'civic', { gunst: 1 }],
    ],
  },
  {
    id: 'overlast',
    kringen: { bestuur: 0.5, dorp: 0.5 },
    naam: 'Lokale noodzaken en dossiers',
    icoon: 'bicycle',
    kleur: 'amber',
    activiteiten: [
      ['h01', 'Melding gedaan over de openbare ruimte', 15, 'civic'],
      ['h02', 'Bewonersavond over verkeer bijgewoond', 40, 'civic'],
      ['h03', 'Informatieavond over de Noordrand bijgewoond', 50, 'civic'],
      ['h04', 'Data verzameld over overlast door fatbikes', 60, 'civic'],
      ['h05', 'Meegepraat in het debat over 30 km per uur', 60, 'civic'],
      ['h06', 'Opiniestuk over fatbikes gepubliceerd', 90, 'civic', { kringen: { oudgeld: 1, dorp: -0.5 } }],
      ['h07', 'Campagne gevoerd voor 30 km per uur', 120, 'civic', { kringen: { oudgeld: 1, bestuur: -0.5 } }],
      ['h08', 'Inzichten met data over de Noordrand gepubliceerd', 120, 'civic'],
      ['h09', 'Dossier, stap 1: informatieavond bijgewoond', 50, 'civic', { dossierstap: 1 }],
      ['h10', 'Dossier, stap 2: zienswijze ingediend', 80, 'civic', { dossierstap: 2 }],
      ['h11', 'Dossier, stap 3: ingesproken in de commissie', 150, 'civic', { dossierstap: 3 }],
      ['h12', 'Dossier, stap 4: uitkomst gevolgd en erover geblogd', 100, 'civic', { dossierstap: 4 }],
      ['h13', 'Een gevaarlijke verkeerssituatie gemeld en het antwoord gevolgd', 20, 'civic'],
      ['h14', 'Met de gemeente of de wijkagent door de buurt gelopen', 60, 'civic'],
      ['h15', 'De wijkagent of de handhaver leren kennen', 40, 'stealth'],
      ['h16', 'Buren gevraagd wat zij van een probleem in de straat vinden', 40, 'civic'],
      ['h17', 'Een petitie over een lokaal probleem gestart of getekend', 30, 'civic'],
      ['h18', 'Een bewonersbrief geschreven en rondgebracht in de straat', 80, 'civic'],
      ['h19', 'Met een wethouder gesproken over een probleem in je buurt', 120, 'civic', { kringen: { bestuur: 1 } }],
      ['h20', 'Een oplossing voorgesteld in plaats van alleen geklaagd', 60, 'civic', { gunst: 1 }],
      ['h21', 'Een bewonersgroep opgericht of mee opgezet', 150, 'civic'],
      ['h22', 'Een fractie geholpen met een goede vraag aan het college', 100, 'stealth', { kringen: { bestuur: 1 } }],
    ],
  },
  {
    id: 'oudgeld',
    kringen: { oudgeld: 1 },
    naam: 'Oud-geldgewoonten',
    icoon: 'champagne-glasses',
    kleur: 'goud',
    activiteiten: [
      ['i01', 'Zondagse wandeling door De Kieviet', 20, 'stealth'],
      ['i02', 'Bedankkaart met de hand geschreven', 30, 'stealth'],
      ['i03', 'Borrel bij iemand thuis bijgewoond', 80, 'stealth', { uitnodiging: true, bedank: true }],
      ['i04', 'Uitgenodigd voor een verjaardag in De Kieviet of Rijksdorp', 120, 'stealth', { uitnodiging: true, bedank: true, gunst: -1 }],
      ['i05', 'Zelf een tuinborrel gegeven voor buren en contacten', 150, 'stealth', { tegen: true, kringen: { oudgeld: 1, dorp: 0.5 } }],
      ['i06', 'Eetclub of boekenclub bijgewoond', 60, 'cultural'],
      ['i07', 'Als introducé meegenomen naar de golfclub of de Rotary', 120, 'stealth', { uitnodiging: true, bedank: true, gunst: -1 }],
      ['i08', 'Een diner thuis gegeven', 150, 'stealth', { tegen: true }],
      ['i09', 'Een tegenbezoek gebracht', 60, 'stealth', { tegen: true }],
      ['i10', 'Een handgeschreven felicitatie gestuurd bij een jubileum of verloving', 30, 'stealth'],
      ['i11', 'Kerstkaarten met de hand geschreven aan je contacten', 40, 'stealth'],
      ['i12', 'Gecondoleerd met een handgeschreven brief', 50, 'stealth', { gunst: 1 }],
      ['i13', 'Een abonnement genomen op een concertserie of het theater', 60, 'cultural'],
      ['i14', 'Een veiling van kunst of antiek bezocht', 60, 'cultural'],
      ['i15', 'Iemand een boek aangeraden of uitgeleend, en het er later over gehad', 40, 'cultural'],
      ['i16', 'Een buur gevraagd naar de geschiedenis van hun huis', 30, 'stealth'],
      ['i17', 'Op uitnodiging mee gaan zeilen of roeien', 100, 'physical', { uitnodiging: true, bedank: true }],
      ['i18', 'Een jaarlijkse traditie bij jou thuis begonnen, zoals een kerstborrel', 200, 'stealth', { tegen: true, kringen: { oudgeld: 1, dorp: 0.5 } }],
      ['i19', 'Een bestuursfunctie bij een culturele stichting aangenomen', 250, 'cultural', { kringen: { oudgeld: 1, bestuur: 0.5 } }],
    ],
  },
  {
    id: 'gezin',
    kringen: { dorp: 1 },
    naam: 'Gezin: met je vrouw en zoon',
    icoon: 'people-roof',
    kleur: 'rood',
    activiteiten: [
      ['z01', 'Praatje met andere ouders op het schoolplein', 20, 'civic', { plek: 'school', energie: 3 }],
      ['z02', 'Ouderavond of activiteit op de school van je zoon bezocht', 40, 'civic', { plek: 'school' }],
      ['z03', 'Met je zoon naar een wedstrijd of training', 40, 'physical'],
      ['z04', 'Je zoon naar een kinderfeestje gebracht, met een praatje', 30, 'stealth', { energie: 5 }],
      ['z05', 'Zelf een kinderfeestje of speelafspraak georganiseerd', 80, 'civic', { tegen: true }],
      ['z06', 'Je zoon nam een vriendje mee naar huis', 30, 'civic', { energie: 3 }],
      ['z07', 'Samen met je vrouw mensen thuis ontvangen', 120, 'stealth', { tegen: true, kringen: { oudgeld: 1, dorp: 0.5 } }],
      ['z08', 'Met je vrouw naar een diner of borrel', 80, 'stealth', { kringen: { oudgeld: 1 } }],
      ['z09', 'Je vrouw stelde je voor aan haar netwerk', 80, 'stealth', { kringen: { oudgeld: 0.5, diplomaten: 0.5 } }],
      ['z10', 'Met z\'n drieën naar Meijendel, het strand of Duinrell', 30, 'physical', { energie: -20 }],
      ['z11', 'Gezinsdag: geen afspraken, alleen samen', 10, 'physical', { energie: -30, gunst: 1 }],
      ['z12', 'Samen met je zoon een buur geholpen', 40, 'civic', { gunst: 1 }],
      ['z13', 'Met je zoon naar de intocht van Sinterklaas in het dorp', 40, 'civic'],
      ['z14', 'Hulpouder geweest bij een uitje of activiteit van school', 60, 'civic', { gunst: 1 }],
      ['z15', 'Met je vrouw een avond uit in het dorp', 50, 'cultural'],
      ['z16', 'Samen met je vrouw meegeholpen bij een dorpsactiviteit', 80, 'civic', { gunst: 1 }],
      ['z17', 'Andere ouders uitgenodigd na een wedstrijd of training', 60, 'stealth', { tegen: true }],
      ['z18', 'Je zoon ging mee op bezoek bij een oudere buur', 30, 'civic', { gunst: 1 }],
      ['z19', 'Familie of vrienden van buiten rondgeleid door Wassenaar', 40, 'physical'],
      ['z20', 'Met je zoon meegedaan aan een opruimactie of natuurwerkdag', 50, 'physical', { gunst: 1 }],
      ['z21', 'Lid geworden van de ouderraad of de medezeggenschapsraad', 120, 'civic', { plek: 'school', kringen: { dorp: 1 } }],
      // De tennisclub van je zoon
      ['z22', 'Je zoon aangemoedigd bij een tenniswedstrijd of toernooi', 30, 'physical', { plek: 'tennis' }],
      ['z23', 'Langs de tennisbaan een praatje gemaakt met andere ouders', 20, 'stealth', { plek: 'tennis', energie: 3 }],
      ['z24', 'Bardienst gedraaid in het clubhuis van de tennisclub', 60, 'civic', { plek: 'tennis', gunst: 1 }],
      ['z25', 'Gereden naar een uitwedstrijd, met andere kinderen van het team mee', 40, 'civic', { gunst: 1 }],
      ['z26', 'Meegeholpen bij een jeugdtoernooi of de clubkampioenschappen van de tennisclub', 80, 'civic', { plek: 'tennis', gunst: 1 }],
      ['z27', 'Met je zoon een ouder-kindtoernooi gespeeld, of zelf lid geworden van de tennisclub', 60, 'physical', { plek: 'tennis' }],
      ['z28', 'Naar de nieuwjaars- of seizoensborrel van de tennisclub geweest', 50, 'stealth', { plek: 'tennis' }],
      ['z29', 'In een commissie of het bestuur van de tennisclub gestapt', 150, 'civic', { plek: 'tennis', kringen: { dorp: 1 } }],
      // De school van je zoon
      ['z30', 'Klassenouder geweest in de klas van je zoon', 80, 'civic', { plek: 'school', gunst: 1 }],
      ['z31', 'Meegeholpen bij een schoolfeest, markt of sponsorloop van school', 70, 'civic', { plek: 'school', gunst: 1 }],
      ['z32', 'Een thema-avond op school bijgewoond', 40, 'cultural', { plek: 'school' }],
      ['z33', 'Een gastles over je vak gegeven op de school van je zoon', 100, 'civic', { plek: 'school' }],
      ['z34', 'Ouders uit de klas van je zoon uitgenodigd voor koffie of een borrel', 80, 'stealth', { tegen: true }],
    ],
  },
  {
    id: 'kaart',
    kringen: { dorp: 0.5 },
    naam: 'Dorpskaart: plekken',
    icoon: 'map',
    kleur: 'teal',
    activiteiten: [
      ['k01', 'Molen De Windlust bezocht op een open dag', 40, 'cultural', { plek: 'windlust' }],
      ['k02', 'Gewandeld op Landgoed De Horsten, thee bij het paviljoen', 40, 'physical', { plek: 'horsten' }],
      ['k03', 'Tentoonstelling in Museum Voorlinden bezocht', 80, 'cultural', { plek: 'voorlinden' }],
      ['k04', 'Excursie vanuit bezoekerscentrum De Tapuit in Meijendel', 50, 'physical', { plek: 'tapuit' }],
      ['k05', 'Met kinderen of logés naar Duinrell', 50, 'physical', { plek: 'duinrell' }],
      ['k06', 'Het Louwman Museum bezocht', 50, 'cultural', { plek: 'louwman' }],
      ['k07', 'Zonsondergang aan de Wassenaarse Slag', 25, 'physical', { plek: 'slag' }],
      ['k08', 'Een route door Nationaal Park Hollandse Duinen gelopen', 40, 'physical', { plek: 'hollandseduinen' }],
      ['k09', 'Een concert, lezing of bijeenkomst op Kasteel De Wittenburg bijgewoond', 70, 'stealth', { plek: 'wittenburg' }],
      ['k10', 'De tuinen en het park van Kasteel Duivenvoorde bezocht', 30, 'physical', { plek: 'duivenvoorde' }],
      ['k11', 'Raadhuis De Paauw van binnen bekeken, bijvoorbeeld op Open Monumentendag', 40, 'cultural', { plek: 'paauw' }],
      ['k12', 'Een rondleiding of lezing in Museum Voorlinden gevolgd', 70, 'cultural', { plek: 'voorlinden' }],
      ['k13', 'Iemand meegenomen naar het Louwman Museum en zelf rondgeleid', 60, 'stealth', { plek: 'louwman' }],
      ['k14', 'De molenaar laten uitleggen hoe Molen De Windlust werkt', 40, 'cultural', { plek: 'windlust' }],
      ['k15', 'Een avondwandeling door Meijendel gelopen', 30, 'physical', { plek: 'meijendel' }],
      ['k16', 'Bij De Tapuit een cursus of lezing over de duinen gevolgd', 60, 'cultural', { plek: 'tapuit' }],
      ['k17', 'Een open dag of evenement van de American School bezocht', 50, 'cultural', { plek: 'ash' }],
      ['k18', 'Met dorpsgenoten naar een voorstelling of film in De Warenar', 50, 'cultural', { plek: 'warenar' }],
    ],
  },
  {
    id: 'protocol',
    kringen: { diplomaten: 0.5, oudgeld: 0.5 },
    naam: 'Protocol en etiquette',
    icoon: 'scroll',
    kleur: 'zilver',
    activiteiten: [
      ['p01', 'Binnen twee dagen geantwoord op een uitnodiging (RSVP)', 20, 'stealth'],
      ['p02', 'De juiste dresscode gedragen', 20, 'cultural'],
      ['p03', 'Een bedankje gestuurd: kaart of bloemen', 30, 'stealth', { gunst: 1 }],
      ['p04', 'Visitekaartjes uitgewisseld', 20, 'stealth', { gunst: -1 }],
      ['p05', 'Een ambassadeur correct aangesproken', 40, 'cultural'],
      ['p06', 'Een korte toast uitgebracht', 80, 'civic'],
      ['p07', 'Small talk gevoerd in een derde taal', 40, 'cultural'],
      ['p08', 'Discreet gebleven over een besloten bijeenkomst', 50, 'stealth', { gunst: 1 }],
      ['p09', 'Als gastheer de tafelschikking goed gedaan', 60, 'cultural'],
      ['p10', 'Op tijd gekomen, en ook op tijd weggegaan', 20, 'stealth'],
      ['p11', 'Een gastgeschenk meegenomen dat past bij de gastheer of gastvrouw', 30, 'stealth'],
      ['p12', 'Iemand voorgesteld met naam en iets om over te praten', 30, 'stealth'],
      ['p13', 'De namen en titels op een gastenlijst vooraf geleerd', 40, 'cultural'],
      ['p14', 'Een uitnodiging netjes afgeslagen, met een voorstel voor een andere keer', 30, 'stealth'],
      ['p15', 'Een gesprek op een feest niet over werk of geld laten gaan', 20, 'stealth'],
      ['p16', 'De eregast of de oudste aanwezige eerst begroet', 30, 'stealth'],
      ['p17', 'Een formele brief of mail met de juiste aanhef geschreven', 20, 'cultural'],
      ['p18', 'Je groet aangepast aan iemands cultuur: hand, kus of buiging', 40, 'cultural', { kringen: { diplomaten: 1 } }],
      ['p19', 'Een gesprek afgesloten met een concrete afspraak, en die nagekomen', 50, 'stealth'],
    ],
  },
// Kenmerken (vijfde veld): uitnodiging (je werd uitgenodigd), tegen (je nodigde zelf uit),
// bedank (vraagt om een bedankje), nationaal (extra XP rond een nationale dag), plek (id in PLEKKEN),
// dossierstap (1 tot 4, je kiest een dossier uit DOSSIERS), stil (nooit een bonus, zoals bij een herdenking),
// kringen (in plaats van die van het terrein), gunst (1 belangeloos, -1 strategisch),
// energie (wat het kost; negatief is opladen; anders volgt het uit de punten).
].map((c) => ({ ...c, activiteiten: c.activiteiten.map(([id, naam, punten, eigenschap, kenmerken = {}]) => ({ id, naam, punten, eigenschap, ...kenmerken })) }));

export const SYMBOLEN = [
  { id: 'm_vereniging', punten: 250, naam: 'Lid van een lokale vereniging of club', icoon: 'people-group', eigenschap: 'civic' },
  { id: 'm_hgc', punten: 400, naam: 'Lid van HGC', icoon: 'hockey-puck', stijl: 'ingetogen', eigenschap: 'physical' },
  { id: 'm_rozenstein', punten: 900, naam: 'Lid van Golfclub Rozenstein', icoon: 'golf-ball-tee', eigenschap: 'physical' },
  { id: 'm_barbour', punten: 200, naam: 'Een Barbour-jas die ouder is dan je kinderen', icoon: 'shirt', stijl: 'ingetogen', eigenschap: 'stealth' },
  { id: 'm_hond', punten: 200, naam: 'Je kent de paden van Meijendel blind', icoon: 'person-hiking', stijl: 'ingetogen', eigenschap: 'physical' },
  { id: 'm_boswachter', punten: 250, naam: 'De boswachter groet je bij naam', icoon: 'tree', stijl: 'ingetogen', eigenschap: 'physical' },
  { id: 'm_fiets', punten: 150, naam: 'Je fiets heeft een mand en is minstens twintig jaar oud', icoon: 'bicycle', stijl: 'ingetogen', eigenschap: 'stealth' },
  { id: 'm_familieborrel', punten: 600, naam: 'Uitgenodigd op de nieuwjaarsborrel van een oude familie', icoon: 'champagne-glasses', stijl: 'ingetogen', eigenschap: 'stealth' },
  { id: 'm_tennis', punten: 300, naam: 'Langs de tennisbaan kennen ze jou en je zoon bij naam', icoon: 'table-tennis-paddle-ball', stijl: 'ingetogen', kringen: { dorp: 1 }, eigenschap: 'physical' },
  { id: 'm_school', punten: 400, naam: 'Vaste hulpouder of klassenouder op school', icoon: 'school', stijl: 'ingetogen', kringen: { dorp: 1 }, eigenschap: 'civic' },
  { id: 'm_lid_oostdorp', punten: 300, naam: 'Lid van Buurtvereniging Oostdorp', icoon: 'house-chimney', stijl: 'ingetogen', kringen: { dorp: 1.5 }, eigenschap: 'civic' },
  { id: 'm_slager', punten: 300, naam: 'Bij naam begroet bij Slagerij Groeneveld', icoon: 'drumstick-bite', stijl: 'ingetogen', eigenschap: 'financial' },
  { id: 'm_pops', punten: 300, naam: 'Bij Pops weten ze wat je drinkt', icoon: 'mug-hot', stijl: 'ingetogen', kringen: { dorp: 1 }, eigenschap: 'stealth' },
  { id: 'm_news', punten: 400, naam: 'Genoemd in De Wassenaarse Krant', icoon: 'newspaper', eigenschap: 'civic' },
  { id: 'm_heritage_map', punten: 600, naam: 'Beschermer van Wassenaars erfgoed', icoon: 'landmark-dome', eigenschap: 'cultural' },
  { id: 'm_art', punten: 600, naam: 'Schilderij van de Haagse School gekocht', icoon: 'image', stijl: 'ingetogen', eigenschap: 'cultural' },
  { id: 'm_car', punten: 700, naam: 'Klassieke Porsche of Land Rover gekocht', icoon: 'car', stijl: 'opzichtig', kringen: { oudgeld: -1, dorp: -0.5 }, eigenschap: 'financial' },
  { id: 'm_rotary', punten: 700, naam: 'Bestuurslid van de Rotary of Lions Club', icoon: 'handshake-angle', eigenschap: 'civic' },
  { id: 'm_bestuur', punten: 700, naam: 'Bestuurslid van een lokale stichting of vereniging', icoon: 'users', eigenschap: 'civic' },
  { id: 'm_paauw', punten: 800, naam: 'Je zienswijze over De Paauw werd genoemd in de raad', icoon: 'tree', eigenschap: 'cultural' },
  { id: 'm_brigade', punten: 800, naam: 'Vaste vrijwilliger bij de Reddingsbrigade', icoon: 'life-ring', eigenschap: 'physical' },
  { id: 'm_museum', punten: 900, naam: 'Nieuwe website van het Dorpsmuseum live, met jouw hulp', icoon: 'landmark', eigenschap: 'cultural' },
  { id: 'm_civic_tool', punten: 1000, naam: 'De gemeente gebruikt iets wat jij hebt gemaakt of uitgezocht', icoon: 'lightbulb', eigenschap: 'civic' },
  { id: 'm_haring', punten: 1200, naam: 'Jaarlijkse haringparty georganiseerd', icoon: 'fish-fins', stijl: 'ingetogen', eigenschap: 'stealth' },
  { id: 'm_mayor_consult', punten: 1200, naam: 'De burgemeester vroeg je om advies vanuit je vak', icoon: 'lightbulb', eigenschap: 'civic' },
  { id: 'm_council', punten: 1500, naam: 'Gekozen in de gemeenteraad van Wassenaar', icoon: 'landmark', kringen: { bestuur: 1.5, dorp: 0.5 }, eigenschap: 'civic' },
  { id: 'm_spreker', punten: 1500, naam: 'Spreker bij de Diplomat Club Wassenaar', icoon: 'microphone', kringen: { diplomaten: 1.5 }, eigenschap: 'stealth' },
  { id: 'm_strand', punten: 1800, naam: 'Strandhuisje bij de Wassenaarse Slag', icoon: 'umbrella-beach', stijl: 'opzichtig', kringen: { oudgeld: 1 }, eigenschap: 'cultural' },
  { id: 'm_haagsche', punten: 2000, naam: 'Ballotage gehaald bij de Koninklijke Haagsche Golf', icoon: 'golf-ball-tee', stijl: 'opzichtig', kringen: { oudgeld: 1.5 }, eigenschap: 'physical' },
  { id: 'm_house', punten: 2500, naam: 'Rijksmonument gekocht', icoon: 'house-flag', stijl: 'opzichtig', kringen: { oudgeld: 1 }, eigenschap: 'financial' },
  { id: 'm_mayor', punten: 3000, naam: 'Je tutoyeert de burgemeester', icoon: 'handshake-simple', stijl: 'ingetogen', kringen: { bestuur: 1.5 }, eigenschap: 'stealth' },
  { id: 'm_knight', punten: 5000, naam: 'Ridder in de Orde van Oranje-Nassau', icoon: 'medal', kringen: { bestuur: 1, oudgeld: 1 }, eigenschap: 'civic' },
  { id: 'm_royal', punten: 8000, naam: 'In de inner circle van het Koninklijk Huis', icoon: 'chess-king', stijl: 'ingetogen', kringen: { oudgeld: 2 }, eigenschap: 'stealth' },
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
      ['Je deelt je kennis met anderen: online, in een vakgroep of in een vereniging', 200],
      ['Bestuurslid van een lokale stichting of vereniging', 500],
    ],
  },
];

/*
 * Voorwaarden, voor prestaties en titels. Elke voorwaarde heeft een soort en meestal een aantal:
 * acties (aantal gelogd), activiteit (id, zo vaak), terrein (id, zo vaak), terreinen (zo veel verkend),
 * verschillend (zo veel verschillende activiteiten), reeks (langste reeks in weken), week (PR in één week),
 * dag (terreinen op één dag), symbool (id), symbolen (aantal), skill (id, punten), missies (voltooid),
 * prestige (keer New Game+), event (gelogd tijdens een event), comeback (na 4 weken stilte weer actief),
 * contacten (aantal mensen in je netwerk), rollen (verschillende rollen), hecht (hechte banden),
 * wederkerig (uitnodigingen op tijd beantwoord), tegen (zelf uitgenodigd), bedankt (op tijd bedankt),
 * lof (keer lovend besproken), blaam (keer kritisch besproken), quiz (vragen goed beantwoord),
 * plekken (ontdekt op de dorpskaart), buurten (actief in zo veel buurten), buurt (id, zo vaak), dossiers (afgerond),
 * kringen (zo veel kringen op stand vanaf), gunfactor (minstens), rol (id, zo veel mensen in die rol),
 * erkenning (punten aan erkenning, altijd), bekendheid (erkenning in de laatste 90 dagen),
 * verhouding (procent: hoeveel er naar jou toe kwam tegenover wat jij deed, de laatste 90 dagen),
 * alle (een lijst die allemaal moet), een (een lijst waarvan er één moet).
 */

export const PRESTATIES = [
  { id: 'p_eerste', naam: 'Eerste stap', uitleg: 'Log je eerste activiteit.', icoon: 'person-walking', voorwaarde: { soort: 'acties', aantal: 1 } },
  { id: 'p_pops', naam: 'Vaste klant', uitleg: 'Tien keer koffie of borrel bij Pops.', icoon: 'mug-hot', voorwaarde: { soort: 'activiteit', id: 'a04', aantal: 10 } },
  { id: 'p_tribune', naam: 'Tribunebeest', uitleg: 'Tien raadsvergaderingen op de publieke tribune.', icoon: 'landmark', voorwaarde: { soort: 'activiteit', id: 'b04', aantal: 10 } },
  { id: 'p_ontdekker', naam: 'Ontdekker', uitleg: 'Verken vijf terreinen.', icoon: 'globe', voorwaarde: { soort: 'terreinen', aantal: 5 } },
  { id: 'p_alleskunner', naam: 'Alleskunner', uitleg: 'Verken alle negen terreinen.', icoon: 'star', voorwaarde: { soort: 'terreinen', aantal: 9 } },
  { id: 'p_verzamelaar', naam: 'Verzamelaar', uitleg: 'Doe 25 verschillende activiteiten.', icoon: 'list-check', voorwaarde: { soort: 'verschillend', aantal: 25 } },
  { id: 'p_volhouder', naam: 'Volhouder', uitleg: 'Vier weken op rij actief.', icoon: 'fire', voorwaarde: { soort: 'reeks', aantal: 4 } },
  { id: 'p_ijzer', naam: 'IJzeren discipline', uitleg: 'Twaalf weken op rij actief.', icoon: 'fire', voorwaarde: { soort: 'reeks', aantal: 12 } },
  { id: 'p_honderd', naam: 'Honderd keer', uitleg: 'Log honderd activiteiten.', icoon: 'trophy', voorwaarde: { soort: 'acties', aantal: 100 } },
  { id: 'p_topweek', naam: 'Topweek', uitleg: 'Verdien 1.000 PR in één week.', icoon: 'bolt', voorwaarde: { soort: 'week', aantal: 1000 } },
  { id: 'p_diplomaat', naam: 'Salonfähig', uitleg: 'Vijf keer actief in diplomatieke en expat-kringen.', icoon: 'globe', voorwaarde: { soort: 'terrein', id: 'diplomatiek', aantal: 5 } },
  { id: 'p_data', naam: 'Vakmens van het dorp', uitleg: 'Tien keer je kennis ingezet voor het dorp.', icoon: 'lightbulb', voorwaarde: { soort: 'terrein', id: 'civic', aantal: 10 } },
  { id: 'p_symbolen', naam: 'Pronkkast', uitleg: 'Claim vijf statussymbolen.', icoon: 'medal', voorwaarde: { soort: 'symbolen', aantal: 5 } },
  { id: 'p_missies', naam: 'Missie volbracht', uitleg: 'Voltooi tien weekmissies.', icoon: 'circle-check', voorwaarde: { soort: 'missies', aantal: 10 } },
  { id: 'p_prestige', naam: 'Opnieuw geboren', uitleg: 'Begin een New Game+.', icoon: 'rotate-right', voorwaarde: { soort: 'prestige', aantal: 1 } },
  { id: 'p_duizendpoot', naam: 'Duizendpoot', uitleg: 'Drie terreinen op één dag.', icoon: 'bolt', geheim: true, voorwaarde: { soort: 'dag', aantal: 3 } },
  { id: 'p_feest', naam: 'Feestneus', uitleg: 'Log iets tijdens een event.', icoon: 'champagne-glasses', geheim: true, voorwaarde: { soort: 'event', aantal: 1 } },
  { id: 'p_comeback', naam: 'De terugkeer', uitleg: 'Weer actief na vier weken stilte.', icoon: 'arrow-trend-up', geheim: true, voorwaarde: { soort: 'comeback', aantal: 1 } },
  { id: 'p_brug', naam: 'Bruggenbouwer', uitleg: 'Mensen uit acht verschillende rollen in je netwerk.', icoon: 'people-group', voorwaarde: { soort: 'rollen', aantal: 8 } },
  { id: 'p_dunbar', naam: 'Kring van Dunbar', uitleg: 'Vijftig mensen in je netwerk.', icoon: 'users', voorwaarde: { soort: 'contacten', aantal: 50 } },
  { id: 'p_hecht', naam: 'Hechte kring', uitleg: 'Vijf hechte banden: mensen die je zes keer of vaker zag.', icoon: 'hand-holding-heart', voorwaarde: { soort: 'hecht', aantal: 5 } },
  { id: 'p_gastvrij', naam: 'Wie wat brengt', uitleg: 'Vijf uitnodigingen op tijd beantwoord met een tegenuitnodiging.', icoon: 'gift', voorwaarde: { soort: 'wederkerig', aantal: 5 } },
  { id: 'p_bedankt', naam: 'Altijd een kaartje', uitleg: 'Tien keer binnen twee dagen bedankt.', icoon: 'envelope', voorwaarde: { soort: 'bedankt', aantal: 10 } },
  { id: 'p_chatham', naam: 'Chatham House', uitleg: 'Tien keer discreet gebleven over een besloten bijeenkomst.', icoon: 'user-secret', voorwaarde: { soort: 'activiteit', id: 'p08', aantal: 10 } },
  { id: 'p_lof', naam: 'Gesprek van de dag', uitleg: 'Vijf keer lovend besproken in het dorp.', icoon: 'comments', voorwaarde: { soort: 'lof', aantal: 5 } },
  { id: 'p_quiz', naam: 'Etiquette-expert', uitleg: 'Alle vragen van de etiquettequiz goed.', icoon: 'scroll', voorwaarde: { soort: 'quiz', aantal: 12 } },
  { id: 'p_verkenner', naam: 'Dorpsverkenner', uitleg: 'Tien plekken op de dorpskaart ontdekt.', icoon: 'map', voorwaarde: { soort: 'plekken', aantal: 10 } },
  { id: 'p_kenner', naam: 'Kenner van het dorp', uitleg: 'Alle plekken op de dorpskaart ontdekt.', icoon: 'location-dot', voorwaarde: { soort: 'plekken', aantal: 21 } },
  { id: 'p_schutting', naam: 'Over de schutting', uitleg: 'Actief in alle buurten van Wassenaar.', icoon: 'house', voorwaarde: { soort: 'buurten', aantal: 7 } },
  { id: 'p_kieviet', naam: 'Kievietse kringen', uitleg: 'Tien keer actief in De Kieviet.', icoon: 'chess-rook', voorwaarde: { soort: 'buurt', id: 'De Kieviet', aantal: 10 } },
  { id: 'p_dossier', naam: 'Dossierkenner', uitleg: 'Eén lokaal dossier van begin tot eind gevolgd.', icoon: 'folder-open', voorwaarde: { soort: 'dossiers', aantal: 1 } },
  { id: 'p_waakhond', naam: 'Waakhond van het dorp', uitleg: 'Drie lokale dossiers afgerond.', icoon: 'folder-open', voorwaarde: { soort: 'dossiers', aantal: 3 } },
  { id: 'p_welkom', naam: 'Overal welkom', uitleg: 'Gewaardeerd in alle vier de kringen.', icoon: 'scale-balanced', voorwaarde: { soort: 'kringen', aantal: 4, vanaf: 200 } },
  { id: 'p_gegund', naam: 'Iedereen gunt het je', uitleg: 'Een gunfactor van 80 of meer.', icoon: 'heart', voorwaarde: { soort: 'gunfactor', aantal: 80 } },
  { id: 'p_schoolplein', naam: 'Schoolpleinnetwerk', uitleg: 'Vijf ouders van klasgenoten in je netwerk.', icoon: 'children', voorwaarde: { soort: 'rol', id: 'Ouder van een klasgenoot', aantal: 5 } },
  { id: 'p_gastgezin', naam: 'Huis van gastvrijheid', uitleg: 'Vijf keer samen met je vrouw mensen thuis ontvangen.', icoon: 'house-user', voorwaarde: { soort: 'activiteit', id: 'z07', aantal: 5 } },
  { id: 'p_gezinsdag', naam: 'Eerst het thuisfront', uitleg: 'Tien gezinsdagen zonder afspraken.', icoon: 'people-roof', voorwaarde: { soort: 'activiteit', id: 'z11', aantal: 10 } },
  { id: 'p_gegroet', naam: 'Bij naam gegroet', uitleg: 'Tien keer gegroet bij naam.', icoon: 'user-check', voorwaarde: { soort: 'activiteit', id: 's01', aantal: 10 } },
  { id: 'p_raadgever', naam: 'Raadgever', uitleg: 'Tien keer om advies gevraagd.', icoon: 'comment-dots', voorwaarde: { soort: 'activiteit', id: 's04', aantal: 10 } },
  { id: 'p_vraagbaak', naam: '"Vraag het hem maar"', uitleg: 'Vijf keer doorverwezen naar jou.', icoon: 'signs-post', voorwaarde: { soort: 'activiteit', id: 's09', aantal: 5 } },
  { id: 'p_naam', naam: 'Je naam gaat rond', uitleg: 'Iemand kende je al van naam voordat jullie elkaar ontmoetten.', icoon: 'ear-listen', voorwaarde: { soort: 'activiteit', id: 's14', aantal: 1 } },
  { id: 'p_bekend', naam: 'Bekend gezicht', uitleg: 'Een bekendheid van 300 in 90 dagen.', icoon: 'star-half-stroke', voorwaarde: { soort: 'bekendheid', aantal: 300 } },
  { id: 'p_omslag', naam: 'Het omslagpunt', uitleg: 'In 90 dagen kwam er meer naar jou toe dan jij naar anderen ging, met minstens tien signalen.', icoon: 'arrow-right-to-bracket', voorwaarde: { soort: 'verhouding', aantal: 100 } },
  { id: 'p_tong', naam: 'Over de tong', uitleg: 'Het dorp sprak er schande van.', icoon: 'comments', geheim: true, voorwaarde: { soort: 'blaam', aantal: 1 } },
  { id: 'p_schaduw', naam: 'Eminence grise', uitleg: 'Sociale discretie op 75 / 100.', icoon: 'user-secret', geheim: true, voorwaarde: { soort: 'skill', id: 'stealth', aantal: 3000 } },
];

// Titels voer je naast je rang. Je kiest er één op de Erelijst.
export const TITELS = [
  { id: 't_brug', naam: 'De Bruggenbouwer', uitleg: 'Sociale discretie op 50 / 100.', voorwaarde: { soort: 'skill', id: 'stealth', aantal: 2000 } },
  { id: 't_erfgoed', naam: 'Erfgoedridder', uitleg: 'Cultureel besef op 50 / 100.', voorwaarde: { soort: 'skill', id: 'cultural', aantal: 2000 } },
  { id: 't_tribuun', naam: 'Volkstribuun', uitleg: 'Maatschappelijke invloed op 50 / 100.', voorwaarde: { soort: 'skill', id: 'civic', aantal: 2000 } },
  { id: 't_duin', naam: 'Duinloper', uitleg: 'Fysiek en natuur op 50 / 100.', voorwaarde: { soort: 'skill', id: 'physical', aantal: 2000 } },
  { id: 't_mecenas', naam: 'Mecenas', uitleg: 'Financiële slagkracht op 50 / 100.', voorwaarde: { soort: 'skill', id: 'financial', aantal: 2000 } },
  { id: 't_haring', naam: 'Haringbaron', uitleg: 'Een haringparty en vijf tuinborrels.', voorwaarde: { soort: 'alle', lijst: [{ soort: 'symbool', id: 'm_haring' }, { soort: 'activiteit', id: 'i05', aantal: 5 }] } },
  { id: 't_data', naam: 'Projectmaker', uitleg: 'Twintig keer gewerkt aan een eigen project voor het dorp.', voorwaarde: { soort: 'activiteit', id: 'b03', aantal: 20 } },
  { id: 't_oostdorp', naam: 'Oostdorper in hart en nieren', uitleg: 'Twintig keer actief in Oostdorp en het dorp.', voorwaarde: { soort: 'terrein', id: 'dorp', aantal: 20 } },
  { id: 't_protocol', naam: 'Protocollair', uitleg: 'Alle vragen van de etiquettequiz goed.', voorwaarde: { soort: 'quiz', aantal: 12 } },
  { id: 't_gastheer', naam: 'Gastheer van de lanen', uitleg: 'Tien keer zelf mensen uitgenodigd.', voorwaarde: { soort: 'tegen', aantal: 10 } },
  { id: 't_spin', naam: 'De spin in het web', uitleg: 'Vijfentwintig mensen in tien verschillende rollen.', voorwaarde: { soort: 'alle', lijst: [{ soort: 'contacten', aantal: 25 }, { soort: 'rollen', aantal: 10 }] } },
  { id: 't_inspreker', naam: 'Inspreker van dienst', uitleg: 'Alle zes de lokale dossiers afgerond.', voorwaarde: { soort: 'dossiers', aantal: 6 } },
  { id: 't_bekend', naam: 'Bekende Wassenaarder', uitleg: 'Een bekendheid van 700 in 90 dagen.', voorwaarde: { soort: 'bekendheid', aantal: 700 } },
  { id: 't_vraagbaak', naam: 'De vraagbaak', uitleg: 'Vijftien keer om advies gevraagd of naar je doorverwezen.', voorwaarde: { soort: 'alle', lijst: [{ soort: 'activiteit', id: 's04', aantal: 10 }, { soort: 'activiteit', id: 's09', aantal: 5 }] } },
  { id: 't_ingewijde', naam: 'Ingewijde', uitleg: 'Vertrouwd in alle vier de kringen.', voorwaarde: { soort: 'kringen', aantal: 4, vanaf: 500 } },
  { id: 't_wereld', naam: 'Wereldburger', uitleg: 'Tien keer actief in diplomatieke en expat-kringen.', voorwaarde: { soort: 'terrein', id: 'diplomatiek', aantal: 10 } },
];

// Vanaf deze rang (index in RANGEN) kies je een pad. Het pad geeft extra XP op zijn terreinen.
export const PAD_VANAF = 3;
export const PAD_BONUS = 0.25;
export const PADEN = [
  { id: 'bestuurder', naam: 'De Bestuurder', uitleg: 'Invloed via raad, regels en ruimte.', icoon: 'landmark', terreinen: ['civic', 'overlast', 'rijk'] },
  { id: 'diplomaat', naam: 'De Diplomaat', uitleg: 'Netwerken in salons en ambassades.', icoon: 'globe', terreinen: ['diplomatiek', 'rijk', 'oudgeld'] },
  { id: 'mecenas', naam: 'De Mecenas', uitleg: 'Steun voor erfgoed, handel en goede doelen.', icoon: 'coins', terreinen: ['erfgoed', 'handel', 'oudgeld'] },
  { id: 'dorpeling', naam: 'De Dorpeling', uitleg: 'Geworteld in de buurt en de duinen.', icoon: 'house-chimney', terreinen: ['dorp', 'buiten', 'handel'] },
];

// Elke week drie missies, steeds anders. {terrein} wordt de naam van een terrein.
export const MISSIES = [
  { soort: 'terrein', aantal: 2, tekst: 'Log 2 keer in {terrein}', beloning: 100 },
  { soort: 'nieuw', aantal: 1, tekst: 'Doe een activiteit die je nog nooit deed', beloning: 120 },
  { soort: 'acties', aantal: 5, tekst: 'Log 5 activiteiten', beloning: 150 },
  { soort: 'pr', aantal: 300, tekst: 'Verdien 300 PR', beloning: 100 },
  { soort: 'dagen', aantal: 3, tekst: 'Wees actief op 3 verschillende dagen', beloning: 120 },
  { soort: 'onbekend', aantal: 1, tekst: 'Doe iets in een terrein waar je nog niets deed', beloning: 150 },
  { soort: 'erkenning', aantal: 2, tekst: 'Noteer 2 keer dat iemand naar jou toe kwam', beloning: 100 },
];

// Bij een reeks weken op rij krijg je extra XP: per week deze stap, tot dit maximum.
export const REEKS_STAP = 0.1;
export const REEKS_MAX = 1.5;

// Events met extra XP. Data als MM-DD; pas ze gerust aan.
export const EVENTS = [
  { naam: 'Koningsweek', van: '04-21', tot: '04-27', factor: 2, icoon: 'crown' },
  { naam: 'Avondvierdaagse', van: '05-25', tot: '05-29', factor: 1.5, icoon: 'person-walking' },
  { naam: 'Hollandse Nieuwe', van: '06-01', tot: '06-21', factor: 2, icoon: 'fish-fins' },
  { naam: 'Open Monumentendag', van: '09-08', tot: '09-14', factor: 2, icoon: 'landmark-dome' },
  { naam: 'Kerst in het dorp', van: '12-15', tot: '12-31', factor: 2, icoon: 'star' },
];

// Vergeten worden (staat uit, tenzij je het aanzet): na zo veel weken stilte zakt je PR per week.
export const VERGETEN_NA = 4;
export const VERGETEN_PER_WEEK = 0.02;
export const VERGETEN_MAX = 0.2;

/* ---------- Sociale regels ---------- */

// Wederkerigheid (Mauss): een uitnodiging vraagt om een tegenuitnodiging, binnen zo veel weken.
export const WEDERKERIG_WEKEN = 6;
export const WEDERKERIG_BONUS = 1.5;

// Na een activiteit met bedank: binnen zo veel dagen een bedankje sturen geeft deze factor.
export const BEDANK_DAGEN = 2;
export const BEDANK_BONUS = 2;

// Verzadiging (Dunbar: kwaliteit boven kwantiteit): vaker dan dit per week levert minder op.
export const VERZADIGD_NA = 3;
export const VERZADIGD_FACTOR = 0.5;

// Netwerk: iemand in een rol die nog niet in je netwerk zat, geeft extra XP.
export const NIEUWE_BRUG = 1.5;
export const HECHT_VANAF = 6; // zo vaak gezien is een hechte band
export const DUNBAR = 150;

// Ingetogenheid (Veblen, Bourdieu): opzichtige symbolen leveren minder op zonder sociale discretie,
// ingetogen symbolen meer met.
export const OPZICHTIG = { onder: 1000, factor: 0.7 };
export const INGETOGEN = { vanaf: 2000, factor: 1.25 };

// Roddel (Elias en Scotson): één keer per week oordeelt het dorp over je vorige week.
export const RODDEL = {
  lof: { punten: 75, tekst: 'Men spreekt met lof over je inzet in het dorp.' },
  gierig: { punten: -50, tekst: 'Men zegt dat je wel komt eten, maar nooit terug uitnodigt.' },
  opzichtig: { punten: -50, tekst: 'Men vindt je wat opzichtig. Oud geld pronkt niet.' },
  ondankbaar: { punten: -30, tekst: 'Men mist je bedankjes.' },
};

// De rollen in je netwerk. Je logt nooit een naam, alleen initialen of een bijnaam en een rol.
export const ROLLEN = [
  'Buur', 'Dorpsgenoot', 'Raadslid of wethouder', 'Ambtenaar', 'Journalist', 'Diplomaat', 'Expat',
  'Ondernemer', 'Bestuurder van een vereniging', 'Cultuur of erfgoed', 'Sport of natuur',
  'Oud-Wassenaarse familie', 'Haagse politiek of Rijk', 'Ouder van een klasgenoot',
];

// Nationale dagen (MM-DD). Ambassades houden hun receptie vaak rond deze dag, soms op een andere.
export const NATIONALE_DAGEN = [
  ['India', '01-26'], ['Japan', '02-23'], ['Ierland', '03-17'], ['Griekenland', '03-25'],
  ['Noorwegen', '05-17'], ['Italië', '06-02'], ['Zweden', '06-06'], ['Portugal', '06-10'],
  ['Canada', '07-01'], ['Verenigde Staten', '07-04'], ['Frankrijk', '07-14'], ['België', '07-21'],
  ['Zwitserland', '08-01'], ['Brazilië', '09-07'], ['Mexico', '09-16'], ['China', '10-01'],
  ['Duitsland', '10-03'], ['Spanje', '10-12'], ['Oostenrijk', '10-26'],
];
export const NATIONAAL_MARGE = 3; // dagen voor en na
export const NATIONAAL_BONUS = 2;

// De etiquettequiz. Elk goed antwoord geeft één keer punten voor Cultureel besef.
export const QUIZ_PUNTEN = 25;
export const QUIZ = [
  { id: 'q01', vraag: 'Op de uitnodiging staat "tenue de ville". Wat trek je aan?', antwoorden: ['Een donker pak met stropdas, of een nette jurk', 'Een smoking', 'Een jeans met colbert'], goed: 0, uitleg: 'Tenue de ville is net, maar niet feestelijk: pak en das, of een nette jurk of mantelpak.' },
  { id: 'q02', vraag: 'Wat betekent "black tie"?', antwoorden: ['Een zwart pak met zwarte das', 'Een smoking met strik', 'Een rokkostuum met witte strik'], goed: 1, uitleg: 'Black tie is een smoking met een zwarte strik; voor vrouwen een avondjurk.' },
  { id: 'q03', vraag: 'En "white tie"?', antwoorden: ['Een wit overhemd zonder das', 'Een smoking met witte strik', 'Een rokkostuum met witte strik: het formeelst'], goed: 2, uitleg: 'White tie is de formeelste dresscode: rokkostuum met wit vest en witte strik.' },
  { id: 'q04', vraag: 'Hoe spreek je een ambassadeur aan?', antwoorden: ['Excellentie', 'Hoogheid', 'Edelachtbare'], goed: 0, uitleg: 'Een ambassadeur is "Excellentie". Hoogheid is voor prinsen en prinsessen, edelachtbare voor een rechter of burgemeester.' },
  { id: 'q05', vraag: 'Waar zit de eregast aan tafel?', antwoorden: ['Aan het hoofd van de tafel', 'Rechts van de gastheer of gastvrouw', 'Zo dicht mogelijk bij de deur'], goed: 1, uitleg: 'De eregast zit rechts van de gastheer of gastvrouw.' },
  { id: 'q06', vraag: 'Wat betekent R.S.V.P. op een uitnodiging?', antwoorden: ['Kom op tijd', 'Neem een cadeau mee', 'Laat weten of je komt'], goed: 2, uitleg: '"Répondez s\'il vous plaît": antwoord, liefst binnen een paar dagen.' },
  { id: 'q07', vraag: 'Een gesprek valt onder de Chatham House-regel. Wat mag je?', antwoorden: ['Gebruiken wat er gezegd is, zonder te zeggen wie het zei', 'Alles citeren, met naam', 'Niets gebruiken van wat er gezegd is'], goed: 0, uitleg: 'Je mag de inhoud gebruiken, maar niet wie het zei of wie er was.' },
  { id: 'q08', vraag: 'Je was te gast bij iemand thuis. Wat doe je daarna?', antwoorden: ['Niets, dat is ouderwets', 'Binnen een paar dagen bedanken, met een kaart of bloemen', 'Dezelfde avond een berichtje met een tegenuitnodiging'], goed: 1, uitleg: 'Een kaartje of bloemen binnen een paar dagen. De tegenuitnodiging volgt later.' },
  { id: 'q09', vraag: 'Hoe begin je nu een brief aan een jonkheer?', antwoorden: ['"Geachte heer" en zijn achternaam', '"Hoogheid"', '"Excellentie"'], goed: 0, uitleg: '"Hoogwelgeboren heer" bestaat nog, maar is sterk verouderd. "Geachte heer …" is prima.' },
  { id: 'q10', vraag: 'Wat draag je meestal op een nationale-dagreceptie van een ambassade?', antwoorden: ['Zakelijke kleding', 'Avondkleding', 'Iets in de kleuren van het land'], goed: 0, uitleg: 'Meestal zakelijk, tenzij de uitnodiging iets anders zegt.' },
  { id: 'q11', vraag: 'Hoe laat kom je op een diplomatiek diner?', antwoorden: ['Een kwartier te vroeg', 'Precies op tijd', 'Een half uur later, dat is chic'], goed: 1, uitleg: 'Op tijd. Te vroeg stoort de gastheer, te laat de tafelschikking.' },
  { id: 'q12', vraag: 'Je stelt twee mensen aan elkaar voor. Wie noem je eerst?', antwoorden: ['Maakt niet uit', 'De jongste of lager in rang', 'De oudste of hoger in rang'], goed: 2, uitleg: 'Je noemt eerst wie hoger in rang of ouder is, en stelt de ander aan diegene voor.' },
];

/* ---------- Hyperlokaal ---------- */

// De dorpskaart: elke plek telt één keer als ontdekking, met extra XP.
export const ONTDEKKING_BONUS = 2;
export const PLEKKEN = [
  { id: 'windlust', naam: 'Molen De Windlust', icoon: 'wind' },
  { id: 'horsten', naam: 'Landgoed De Horsten', icoon: 'tree' },
  { id: 'voorlinden', naam: 'Museum Voorlinden', icoon: 'image' },
  { id: 'tapuit', naam: 'De Tapuit in Meijendel', icoon: 'binoculars' },
  { id: 'meijendel', naam: 'Meijendel', icoon: 'dove' },
  { id: 'hollandseduinen', naam: 'Nationaal Park Hollandse Duinen', icoon: 'mountain-sun' },
  { id: 'slag', naam: 'Wassenaarse Slag', icoon: 'umbrella-beach' },
  { id: 'duinrell', naam: 'Duinrell', icoon: 'ticket' },
  { id: 'louwman', naam: 'Louwman Museum', icoon: 'car' },
  { id: 'paauw', naam: 'Raadhuis De Paauw', icoon: 'landmark-dome' },
  { id: 'dorpsmuseum', naam: 'Dorpsmuseum', icoon: 'landmark' },
  { id: 'duivenvoorde', naam: 'Kasteel Duivenvoorde', icoon: 'chess-rook' },
  { id: 'wittenburg', naam: 'Kasteel De Wittenburg', icoon: 'chess-rook' },
  { id: 'warenar', naam: 'De Warenar', icoon: 'masks-theater' },
  { id: 'deylerhuis', naam: 'Deylerhuis', icoon: 'music' },
  { id: 'pops', naam: 'Pops', icoon: 'mug-hot' },
  { id: 'langstraat', naam: 'Langstraat', icoon: 'store' },
  { id: 'ash', naam: 'American School', icoon: 'school' },
  { id: 'roggewoning', naam: 'Sportpark De Roggewoning', icoon: 'hockey-puck' },
  { id: 'rozenstein', naam: 'Golfclub Rozenstein', icoon: 'golf-ball-tee' },
  { id: 'kielten', naam: 'Kielten', icoon: 'futbol' },
  { id: 'school', naam: 'De school van je zoon', icoon: 'school' },
  { id: 'tennis', naam: 'De tennisclub van je zoon', icoon: 'table-tennis-paddle-ball' },
];

// De buurten. Bij het loggen kies je er optioneel één.
export const BUURTEN = ['Oostdorp', 'Kerkehout', 'Centrum', 'De Kieviet', 'Rijksdorp', 'Zuid', 'Maaldrift'];

// Lokale dossiers. Je volgt er een in vier stappen (de activiteiten met dossierstap).
export const DOSSIER_BELONING = 250;
export const DOSSIERS = [
  { id: 'noordrand', naam: 'De Noordrand en de woningbouw', icoon: 'house' },
  { id: 'paauw', naam: 'Landgoed De Paauw: Princess Garden en de Tuin van Ruys', icoon: 'landmark-dome' },
  { id: 'leegstand', naam: 'Leegstand in de Langstraat en de Luifelbaan', icoon: 'store' },
  { id: 'verkeer', naam: 'Verkeer op de Rijksstraatweg en 30 km/u', icoon: 'road' },
  { id: 'fatbikes', naam: 'Fatbikes bij de scholen en de Slag', icoon: 'bicycle' },
  { id: 'kieviet', naam: 'Bomenkap en villabouw in De Kieviet', icoon: 'tree' },
];
export const DOSSIER_STAPPEN = ['Informatieavond', 'Zienswijze', 'Inspreken', 'Uitkomst en blog'];

/* ---------- Dimensies: kringen, gunfactor, energie ---------- */

// Je aanzien per kring. Elke activiteit telt mee voor de kringen van haar terrein (kringen), of voor
// haar eigen kringen. Per punt basis-PR telt een tiende mee, keer het gewicht. Negatief kan ook.
export const KRINGEN = [
  { id: 'dorp', naam: 'Dorpelingen', icoon: 'house-chimney' },
  { id: 'oudgeld', naam: 'Oud geld', icoon: 'chess-rook' },
  { id: 'diplomaten', naam: 'Diplomaten en expats', icoon: 'globe' },
  { id: 'bestuur', naam: 'Bestuur en politiek', icoon: 'landmark' },
];
export const KRING_STANDEN = [
  [-Infinity, 'Gewantrouwd'], [0, 'Onbekend'], [50, 'Bekend'], [200, 'Gewaardeerd'], [500, 'Vertrouwd'], [1000, 'Ingewijd'],
];
export const KRING_SYMBOOL = { dorp: 0.5, oudgeld: 0.5 }; // voor een statussymbool zonder eigen kringen

// De gunfactor (Goffman, oud geld): belangeloos doen laat hem stijgen, strategisch netwerken dalen.
// Hij kijkt naar de laatste weken.
export const GUNFACTOR = {
  start: 50, dagen: 84, belangeloos: 3, strategisch: -2, opzichtig: -5, blaam: -5,
  streber: 30, streberFactor: 0.8, gegund: 70, gegundFactor: 1.1,
};

// Tijd en energie: elke week een sociaal budget. Een activiteit kost energie (de punten gedeeld door
// ENERGIE.deler, tussen min en max), tenzij ze een eigen energie heeft. Wie over zijn budget gaat,
// heeft een sociale kater en verdient minder.
export const ENERGIE = { week: 100, deler: 6, min: 3, max: 30, kater: 0.7 };
// Je type bepaalt waar je van oplaadt: die activiteiten kosten niets en geven de helft terug.
export const TYPEN = [
  { id: 'introvert', naam: 'Introvert', uitleg: 'Je laadt op in de natuur, op de plekken van de dorpskaart en thuis.', terreinen: ['buiten', 'kaart', 'gezin'] },
  { id: 'extravert', naam: 'Extravert', uitleg: 'Je laadt op van borrels, Pops en een volle tafel.', terreinen: ['oudgeld', 'dorp'] },
];

/* ---------- Erkenning ---------- */

// Bekendheid: de punten aan erkenning in de laatste dagen. De niveaus zijn [vanaf, naam].
export const ERKENNING = {
  dagen: 90,
  niveaus: [[0, 'Onbekend'], [100, 'Gezicht in het dorp'], [300, 'Bekend gezicht'], [700, 'Bekende Wassenaarder'], [1500, 'Begrip in Wassenaar']],
  verhoudingVanaf: 10, // pas vanaf zo veel signalen telt de verhouding
};

/* ---------- De kaart ---------- */

// Wassenaar als fantasy-koninkrijk: een schematische kaart, noorden boven, niet op schaal. Coördinaten
// in een vlak van 1000 bij 700. Buurten en bossen zijn hoekpunten; de kaart rondt ze zelf af. Elke buurt
// heeft een titel als rijk. De ligging van buurten en plekken is bij benadering: pas ze gerust aan.
export const KAART = {
  breedte: 1000,
  hoogte: 700,
  zee: 'M0 0H640C520 120 300 330 0 560Z',
  kust: 'M640 0C520 120 300 330 0 560',
  duinen: 'M640 0H820C720 180 520 380 330 700H0V560C300 330 520 120 640 0Z',
  titel: 'Het Koninkrijk Wassenaar',
  zeeNaam: 'De Noordzee',
  duinNamen: [['De Heuvels van Berkheide', 610, 112], ['Het Duinland van Meijendel', 320, 512]],
  bossen: [
    { naam: 'Woud van De Horsten', punten: [[905, 152], [990, 148], [992, 238], [915, 246]] },
    { naam: 'Woud van Voorlinden', punten: [[505, 548], [602, 532], [626, 625], [522, 648]], naamOnder: true },
    { naam: 'Woud van Duivenvoorde', punten: [[905, 560], [995, 548], [995, 668], [915, 662]] },
  ],
  wegen: [
    { naam: 'De Koningsweg', soort: 'weg', pad: 'M390 700C560 520 760 330 1000 150', label: '22%' },
    { naam: 'De Grote Heirbaan', soort: 'snelweg', pad: 'M630 700C760 560 880 440 1000 330', label: '41%' },
  ],
  // Rijken sluiten op elkaar aan: een gedeeld hoekpunt staat in beide lijsten. De kaart tekent de grenzen
  // grillig, maar gedeelde grenzen blijven gelijk. kleur is de kleur van het wapen van het rijk.
  buurten: {
    Rijksdorp: { titel: 'Heerlijkheid', kleur: 'paars', punten: [[600, 165], [730, 148], [848, 172], [852, 232], [722, 236], [702, 382], [588, 345]], label: [650, 256] },
    Centrum: { titel: 'Vrijstad', kleur: 'rood', punten: [[722, 236], [852, 232], [842, 392], [702, 382]], label: [787, 266] },
    Oostdorp: { titel: 'Graafschap', kleur: 'groen', punten: [[848, 172], [975, 195], [985, 345], [842, 392], [852, 232]], label: [912, 285] },
    Kerkehout: { titel: 'Baronie', kleur: 'blauw', punten: [[702, 382], [842, 392], [862, 485], [690, 525], [698, 425]], label: [775, 428] },
    'De Kieviet': { titel: 'Hertogdom', kleur: 'goud', punten: [[588, 345], [702, 382], [698, 425], [690, 525], [522, 522]], label: [625, 398] },
    Zuid: { titel: 'Markgraafschap', kleur: 'zeegroen', punten: [[522, 522], [690, 525], [862, 485], [875, 565], [805, 655], [640, 682], [560, 610]], label: [690, 560] },
    Maaldrift: { titel: 'Vrije heerlijkheid', kleur: 'bruin', punten: [[842, 392], [985, 345], [985, 505], [875, 565], [862, 485]], label: [925, 490] },
  },
  // Per plek: waar hij staat en hoe hij getekend wordt.
  plekken: {
    slag: [402, 226, 'vuurtoren'], hollandseduinen: [565, 150, 'berg'], meijendel: [250, 560, 'boom'], tapuit: [380, 470, 'uitkijk'],
    duinrell: [650, 205, 'tent'], wittenburg: [622, 318, 'kasteel'], voorlinden: [552, 588, 'tempel'], louwman: [478, 652, 'tempel'],
    ash: [705, 605, 'huis'], roggewoning: [630, 635, 'vlag'], deylerhuis: [742, 478, 'herberg'], kielten: [815, 470, 'vlag'],
    paauw: [745, 360, 'koepel'], pops: [790, 310, 'herberg'], langstraat: [835, 310, 'markt'], dorpsmuseum: [829, 360, 'tempel'],
    school: [787, 360, 'school'], tennis: [952, 440, 'baan'],
    warenar: [745, 310, 'huis'], windlust: [872, 352, 'molen'], horsten: [950, 205, 'boom'], duivenvoorde: [955, 600, 'kasteel'],
    rozenstein: [878, 418, 'vlag'],
  },
};
