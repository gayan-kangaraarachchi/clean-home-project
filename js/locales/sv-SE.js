// Svenska (Sverige)

export default {
  app: { language: 'Språk' },
  tabs: { today: 'I dag', week: 'Vecka', habits: 'Rutiner' },
  slots: { morning: 'Morgon', afternoon: 'Eftermiddag', evening: 'Kväll', any: 'När som helst' },
  areas: { bathroom: 'Badrum', laundry: 'Tvätt', floors: 'Golv', waste: 'Sopor', kitchen: 'Kök', other: 'Övrigt' },

  header: {
    loading: 'Laddar dina sysslor…',
    nothingDue: 'Inget att göra i dag',
    allDone: 'Allt klart för i dag',
    left: { one: '{n} syssla kvar', other: '{n} sysslor kvar' },
    subNothing: 'Njut av pausen. Kolla veckan som kommer.',
    subAllDone: 'Bra jobbat. Hemmet tackar dig.',
    subLate: { one: '{n} kvar från en tidigare dag.', other: '{n} kvar från tidigare dagar.' },
    subDefault: 'Bocka av allt eftersom.',
  },

  today: {
    noHabits: 'Inga rutiner än.',
    addFirst: 'Lägg till din första syssla',
    nothingDue: 'Inget att göra i dag.',
    comingUp: 'På gång',
    doNow: 'Gör nu',
    markDone: 'Markera som klar: {name}',
    markNotDone: 'Markera som ej klar: {name}',
  },

  pill: {
    done: 'Klar',
    fromYesterday: 'Från i går',
    late: { one: '{n} dag sen', other: '{n} dagar sen' },
  },

  week: {
    next7: 'Kommande 7 dagar',
    prev: '← Föreg.',
    next: 'Nästa →',
    prevLabel: 'Föregående 7 dagar',
    nextLabel: 'Nästa 7 dagar',
    freeDay: 'Ledig dag',
    upcoming: 'Kommande',
    doneSuffix: '(klar)',
    last45: 'Senaste 45 dagarna',
    cellTitle: '{date}: {n} klara',
    choresDone: 'sysslor klara',
    activeDays: 'aktiva dagar',
    streak: 'dagar i rad',
  },

  habits: {
    count: { one: '{n} rutin', other: '{n} rutiner' },
    add: '+ Lägg till rutin',
    empty: 'Lägg till sysslor som att städa badrummet eller kolla soporna, och välj hur ofta de upprepas.',
    last: 'Senast: {when}',
    never: 'aldrig',
    next: 'Nästa: {when}',
    edit: 'Redigera',
  },

  sched: {
    daily: 'Varje dag',
    interval: { one: 'Varje dag', other: 'Var {n}:e dag' },
    weekly: 'Varje vecka · {days}',
    monthly: 'Varje månad · dag {n}',
  },

  form: {
    titleNew: 'Ny rutin',
    titleEdit: 'Redigera rutin',
    name: 'Namn',
    namePlaceholder: 't.ex. Rengör kylskåpet',
    area: 'Område',
    slot: 'Tid på dagen',
    repeats: 'Upprepas',
    optDaily: 'Varje dag',
    optInterval: 'Med några dagars mellanrum',
    optWeekly: 'Veckodagar jag väljer',
    optMonthly: 'En gång i månaden',
    every: 'Upprepa efter',
    everyHint: 'dagar sedan senast',
    days: 'Dessa dagar',
    monthDay: 'Dag i månaden',
    monthDayHint: 'flyttas till sista dagen i kortare månader',
    notes: 'Anteckningar',
    notesPlaceholder: 'Valfri checklista eller tips',
    delete: 'Ta bort',
    deleteConfirm: 'Tryck igen för att ta bort',
    cancel: 'Avbryt',
    save: 'Spara',
    errName: 'Ge rutinen ett namn.',
    errEvery: 'Välj mellan 1 och 90 dagar.',
    errDays: 'Välj minst en dag.',
    errMonthDay: 'Välj en dag mellan 1 och 31.',
  },

  storage: {
    saved: 'Sparat på den här enheten.',
    blocked: 'Webbläsaren blockerar lagring, så ändringar försvinner när du stänger sidan.',
  },

  starter: {
    garbage: { name: 'Kolla soporna', note: 'Töm kärlen om de är fulla, sortera återvinningen.' },
    'vac-room': { name: 'Dammsug rummet', note: '' },
    'vac-house': { name: 'Dammsug hela huset', note: 'Alla rum, hallen och trappan.' },
    bath: { name: 'Städa badrummet', note: 'Toalett, handfat, dusch, spegel, golv.' },
    dryer: { name: 'Rengör torktumlaren', note: 'Luddfilter och kondensbehållare.' },
    washer: { name: 'Rengör tvättmaskinen', note: 'Kör ett varmt tomt program, torka av dörrlisten och tvättmedelsfacket.' },
  },
};
