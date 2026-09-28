// Places and journeys. Example data for a made-up dog walking app. Replace all of it.
// screenGroups: the screen list on the left. Each screen sits in exactly one group.
// mapGroups: the places in the app, for the Tour page. links: how one place feeds another.
// flows: step-by-step journeys. A step is [title, text, screen id, action id]; the screen and action
//   are optional. Clicking a step opens that screen and traces the action's button there.

const screenGroups = [
  ['Start', ['signin']],
  ['Walks', ['walks', 'walk']],
  ['Clients', ['clients']],
  ['Invoices', ['invoices']],
]

const mapGroups = [
  { t: 'Public', p: 'Anyone', n: [['Sign in']] },
  { t: 'Menu', p: 'Sidebar on desktop, bottom bar on phone', n: [['Walks', 'home'], ['Clients'], ['Invoices'], ['Settings']] },
]

const links = [
  ['Walk', 'Invoices', 'Done adds a charge to the owner\'s month'],
]

const flows = [
  { t: 'A. A day of walks', w: 'Walker, on a phone', s: [
    ['Walks', 'Open the app and see today\'s walks.', 'walks'],
    ['Walk', 'After the walk, press Done.', 'walk', 'walks.completeWalk'],
    ['Invoices', 'The walk shows in the owner\'s month.', 'invoices'] ] },
]
