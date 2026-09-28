// The app's domains, the actions a person can take in each, and the domain events between them.
// Example data for a made-up dog walking app. Replace all of it.
// See references/data-model.md in the app-map skill for every field.
//
// areas: the columns the domain map draws, left to right. The area with id "app" is optional and
//   holds application commands that call several domains in one go.
// domains: id, name, area, sub (a few words), kind (one sentence), owns, tables, reads, inputs, routes,
//   and slice (the build step that makes it) or built (where it stands).
// actions, per domain: id "<domain>.<verb><Thing>", label, actor, status, and what it touches.
//   status "exists": in today's code. Name the proof: http (an operationId in APP.contract) or code (a path).
//   status "review": an open pull request (pr) adds it.
//   status "planned": nothing yet.
// events: each domain event, the domain that publishes it, and its handlers (mode "same" or "deferred").
// system: webhooks, scheduled jobs and handlers, which have no button by design.
// gaps: actions a user may expect that nobody plans yet, and why.
window.ACTIONS = {
  areas: [
    { id: 'access', name: 'Access' },
    { id: 'work', name: 'Work' },
    { id: 'money', name: 'Money' },
  ],
  domains: [
    {
      id: 'identity', name: 'Identity', area: 'access', sub: 'Walkers, sign-in', slice: 1,
      kind: 'Who is signed in.', owns: ['Walker accounts', 'Sessions'], tables: ['users', 'sessions'],
      actions: [
        { id: 'identity.signIn', label: 'Sign in', actor: 'Walker', status: 'planned', ticket: '#1', changes: ['identity'], writes: ['sessions'] },
        { id: 'identity.signOut', label: 'Sign out', actor: 'Walker', status: 'planned', ticket: '#1', changes: ['identity'], writes: ['sessions'] },
      ],
    },
    {
      id: 'clients', name: 'Clients', area: 'work', sub: 'Owners and dogs', slice: 1,
      kind: 'The people the walker works for, and their dogs.', owns: ['Clients', 'Dogs'], tables: ['clients', 'dogs'],
      actions: [
        { id: 'clients.addClient', label: 'Add a client', actor: 'Walker', status: 'review', pr: '#4', ticket: '#2', changes: ['clients'], writes: ['clients'] },
        { id: 'clients.addDog', label: 'Add a dog', actor: 'Walker', status: 'planned', ticket: '#2', changes: ['clients'], writes: ['dogs'] },
      ],
    },
    {
      id: 'walks', name: 'Walks', area: 'work', sub: 'Booked and done', slice: 1,
      kind: 'Each walk, from booked to done.', owns: ['Walks'], tables: ['walks'],
      reads: [{ domain: 'clients', what: 'the dog and its owner' }],
      actions: [
        { id: 'walks.bookWalk', label: 'Book a walk', actor: 'Walker', status: 'planned', ticket: '#3', changes: ['walks'], writes: ['walks'] },
        { id: 'walks.completeWalk', label: 'Mark a walk done', actor: 'Walker', status: 'planned', ticket: '#3', changes: ['walks'], writes: ['walks'], publishes: ['walkCompleted'] },
        { id: 'walks.cancelWalk', label: 'Cancel a walk', actor: 'Walker', status: 'planned', ticket: '#3', changes: ['walks'], writes: ['walks'] },
      ],
    },
    {
      id: 'invoices', name: 'Invoices', area: 'money', sub: 'Charges, invoices', slice: 2,
      kind: 'What each client owes, and the monthly invoice.', owns: ['Charges', 'Invoices'], tables: ['charges', 'invoices'],
      inputs: ['Stripe webhooks for paid invoices'],
      actions: [
        { id: 'invoices.sendInvoice', label: 'Send an invoice now', actor: 'Walker', status: 'planned', ticket: '#5', changes: ['invoices'], writes: ['invoices'],
          outside: [{ service: 'Stripe', when: 'after', what: 'Creates and sends the invoice' }] },
      ],
    },
  ],
  events: {
    walkCompleted: {
      from: 'walks',
      handlers: [
        { id: 'invoices.chargeForWalk', domain: 'invoices', mode: 'same', what: 'Adds a charge for the walk to the client\'s month.', writes: ['charges'] },
        { id: 'clients.sendWalkReport', domain: 'clients', mode: 'deferred', what: 'Emails the owner that the walk is done.' },
      ],
    },
  },
  system: [
    { id: 'invoices.monthlyInvoices', domain: 'invoices', what: 'On the 1st, sends each client an invoice for last month\'s charges.' },
    { id: 'invoices.stripeWebhook', domain: 'invoices', what: 'Marks an invoice paid when Stripe says so.' },
  ],
  gaps: [
    { domain: 'walks', what: 'Repeat a walk every week', reason: 'Nobody has asked for it yet. Walkers book each walk.' },
  ],
}
