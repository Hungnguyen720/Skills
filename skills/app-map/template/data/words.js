// The words the app uses for things people could name several ways. Each shows on the screens it names.
// Example data for a made-up dog walking app. Replace it.
// thing: what it is. use: the word to use. not: words to avoid. docs: the words sources use today.
// conflicts: places where two sources disagree, as [topic, one says, another says].

const words = [
  { thing: 'The person whose dog gets walked', use: 'owner', not: 'customer, parent',
    docs: 'client (in the tickets), owner (on screens)',
    why: 'Walkers say owner. "Client" stays the name of the Clients page, which lists owners.',
    status: 'Decided 2026-09-27', screens: ['walks', 'walk', 'clients'] },
]

const conflicts = [
  ['Walk length', 'Ticket #3 says 30 or 60 minutes', 'The pricing note says any length'],
]
