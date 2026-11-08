// Suomi (Suomi / Finland)

export default {
  app: { language: 'Kieli' },
  tabs: { today: 'Tänään', week: 'Viikko', habits: 'Rutiinit' },
  slots: { morning: 'Aamu', afternoon: 'Iltapäivä', evening: 'Ilta', any: 'Milloin vain' },
  areas: { bathroom: 'Kylpyhuone', laundry: 'Pyykit', floors: 'Lattiat', waste: 'Roskat', kitchen: 'Keittiö', other: 'Muu' },

  header: {
    loading: 'Ladataan askareita…',
    nothingDue: 'Ei askareita tänään',
    allDone: 'Kaikki tehty tältä päivältä',
    left: { one: '{n} askare jäljellä', other: '{n} askaretta jäljellä' },
    subNothing: 'Nauti tauosta. Katso tuleva viikko.',
    subAllDone: 'Hyvää työtä. Koti kiittää.',
    subLate: { one: '{n} siirtynyt aiemmalta päivältä.', other: '{n} siirtynyt aiemmilta päiviltä.' },
    subDefault: 'Merkitse tehdyksi sitä mukaa.',
  },

  today: {
    noHabits: 'Ei vielä rutiineja.',
    addFirst: 'Lisää ensimmäinen askare',
    nothingDue: 'Ei askareita tänään.',
    comingUp: 'Tulossa',
    doNow: 'Tee nyt',
    markDone: 'Merkitse tehdyksi: {name}',
    markNotDone: 'Merkitse tekemättömäksi: {name}',
  },

  pill: {
    done: 'Tehty',
    fromYesterday: 'Eiliseltä',
    late: { one: '{n} päivä myöhässä', other: '{n} päivää myöhässä' },
  },

  week: {
    next7: 'Seuraavat 7 päivää',
    prev: '← Edell.',
    next: 'Seur. →',
    prevLabel: 'Edelliset 7 päivää',
    nextLabel: 'Seuraavat 7 päivää',
    freeDay: 'Vapaapäivä',
    upcoming: 'Tulossa',
    doneSuffix: '(tehty)',
    last45: 'Viimeiset 45 päivää',
    cellTitle: '{date}: {n} tehty',
    choresDone: 'askaretta tehty',
    activeDays: 'aktiivista päivää',
    streak: 'päivän putki',
  },

  habits: {
    count: { one: '{n} rutiini', other: '{n} rutiinia' },
    add: '+ Lisää rutiini',
    empty: 'Lisää askareita, kuten kylpyhuoneen siivous tai roskien tarkistus, ja valitse kuinka usein ne toistuvat.',
    last: 'Viimeksi: {when}',
    never: 'ei koskaan',
    next: 'Seuraava: {when}',
    edit: 'Muokkaa',
  },

  sched: {
    daily: 'Joka päivä',
    interval: { one: 'Joka päivä', other: '{n} päivän välein' },
    weekly: 'Viikoittain · {days}',
    monthly: 'Kuukausittain · {n}. päivä',
  },

  form: {
    titleNew: 'Uusi rutiini',
    titleEdit: 'Muokkaa rutiinia',
    name: 'Nimi',
    namePlaceholder: 'esim. Siivoa jääkaappi',
    area: 'Alue',
    slot: 'Ajankohta',
    repeats: 'Toistuu',
    optDaily: 'Joka päivä',
    optInterval: 'Muutaman päivän välein',
    optWeekly: 'Valitseminani viikonpäivinä',
    optMonthly: 'Kerran kuukaudessa',
    every: 'Toistoväli',
    everyHint: 'päivää edellisestä kerrasta',
    days: 'Näinä päivinä',
    monthDay: 'Kuukauden päivä',
    monthDayHint: 'lyhyemmissä kuukausissa siirtyy viimeiseen päivään',
    notes: 'Muistiinpanot',
    notesPlaceholder: 'Valinnainen muistilista tai vinkki',
    delete: 'Poista',
    deleteConfirm: 'Napauta uudelleen poistaaksesi',
    cancel: 'Peruuta',
    save: 'Tallenna',
    errName: 'Anna rutiinille nimi.',
    errEvery: 'Valitse 1–90 päivää.',
    errDays: 'Valitse vähintään yksi päivä.',
    errMonthDay: 'Valitse päivä väliltä 1–31.',
  },

  storage: {
    saved: 'Tallennettu tälle laitteelle.',
    blocked: 'Selain estää tallennuksen, joten muutokset katoavat, kun suljet sivun.',
  },

  starter: {
    garbage: { name: 'Tarkista roskat', note: 'Tyhjennä astiat, jos ne ovat täynnä, ja lajittele kierrätys.' },
    'vac-room': { name: 'Imuroi huone', note: '' },
    'vac-house': { name: 'Imuroi koko talo', note: 'Kaikki huoneet, eteinen ja portaat.' },
    bath: { name: 'Siivoa kylpyhuone', note: 'WC-istuin, lavuaari, suihku, peili, lattia.' },
    dryer: { name: 'Puhdista kuivausrumpu', note: 'Nukkasihti ja lauhdevesisäiliö.' },
    washer: { name: 'Puhdista pesukone', note: 'Kuuma tyhjä pesuohjelma, pyyhi luukun tiiviste ja pesuainelokero.' },
  },
};
