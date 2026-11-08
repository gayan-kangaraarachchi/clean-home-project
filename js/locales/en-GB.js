// English (United Kingdom) — default and fallback language.
// Plural messages are objects keyed by Intl.PluralRules categories (one, other, …) and use {n}.

export default {
  app: { language: 'Language' },
  tabs: { today: 'Today', week: 'Week', habits: 'Habits' },
  slots: { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', any: 'Any time' },
  areas: { bathroom: 'Bathroom', laundry: 'Laundry', floors: 'Floors', waste: 'Garbage', kitchen: 'Kitchen', other: 'Other' },

  header: {
    loading: 'Loading your chores…',
    nothingDue: 'Nothing due today',
    allDone: 'All done for today',
    left: { one: '{n} chore to go', other: '{n} chores to go' },
    subNothing: 'Enjoy the break. Check the week ahead.',
    subAllDone: 'Nice work. The house thanks you.',
    subLate: { one: '{n} carried over from an earlier day.', other: '{n} carried over from earlier days.' },
    subDefault: 'Tick them off as you go.',
  },

  today: {
    noHabits: 'No habits yet.',
    addFirst: 'Add your first chore',
    nothingDue: 'Nothing due today.',
    comingUp: 'Coming up',
    doNow: 'Do now',
    markDone: 'Mark done: {name}',
    markNotDone: 'Mark not done: {name}',
  },

  pill: {
    done: 'Done',
    fromYesterday: 'From yesterday',
    late: { one: '{n} day late', other: '{n} days late' },
  },

  week: {
    next7: 'Next 7 days',
    prev: '← Prev',
    next: 'Next →',
    prevLabel: 'Previous 7 days',
    nextLabel: 'Next 7 days',
    freeDay: 'Free day',
    upcoming: 'Upcoming',
    doneSuffix: '(done)',
    last45: 'Last 45 days',
    cellTitle: '{date}: {n} done',
    choresDone: 'chores done',
    activeDays: 'active days',
    streak: 'day streak',
  },

  habits: {
    count: { one: '{n} habit', other: '{n} habits' },
    add: '+ Add habit',
    empty: 'Add chores like cleaning the bathroom or checking the garbage, and choose how often they repeat.',
    last: 'Last: {when}',
    never: 'never',
    next: 'Next: {when}',
    edit: 'Edit',
  },

  sched: {
    daily: 'Every day',
    interval: { one: 'Every day', other: 'Every {n} days' },
    weekly: 'Weekly · {days}',
    monthly: 'Monthly · day {n}',
  },

  form: {
    titleNew: 'New habit',
    titleEdit: 'Edit habit',
    name: 'Name',
    namePlaceholder: 'e.g. Clean the fridge',
    area: 'Area',
    slot: 'Time of day',
    repeats: 'Repeats',
    optDaily: 'Every day',
    optInterval: 'Every few days',
    optWeekly: 'On weekdays I pick',
    optMonthly: 'Once a month',
    every: 'Repeat every',
    everyHint: 'days after it was last done',
    days: 'On these days',
    monthDay: 'Day of month',
    monthDayHint: 'moves to the last day in shorter months',
    notes: 'Notes',
    notesPlaceholder: 'Optional checklist or tip',
    delete: 'Delete',
    deleteConfirm: 'Tap again to delete',
    cancel: 'Cancel',
    save: 'Save',
    errName: 'Give the habit a name.',
    errEvery: 'Repeat every 1 to 90 days.',
    errDays: 'Pick at least one day.',
    errMonthDay: 'Pick a day from 1 to 31.',
  },

  storage: {
    saved: 'Saved on this device.',
    blocked: 'This browser is blocking storage, so changes will be lost when you close the page.',
  },

  // Built-in starter chores. Shown in the current language until the user renames them.
  starter: {
    garbage: { name: 'Check garbage', note: 'Empty bins if full, sort recycling.' },
    'vac-room': { name: 'Vacuum the room', note: '' },
    'vac-house': { name: 'Vacuum the whole house', note: 'All rooms, hallway and stairs.' },
    bath: { name: 'Clean bathroom', note: 'Toilet, sink, shower, mirror, floor.' },
    dryer: { name: 'Clean dryer', note: 'Lint filter and condenser tray.' },
    washer: { name: 'Clean washing machine', note: 'Hot empty cycle, wipe door seal and detergent drawer.' },
  },
};
