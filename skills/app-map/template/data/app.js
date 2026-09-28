// The app itself: its name, menus, jobs, architecture and the rules every domain follows.
// Everything here is example data for a made-up dog walking app. Replace all of it.
// See references/data-model.md in the app-map skill for every field.

const APP = {
  name: 'Dog walks',
  // Heads the jobs table: "<user> wants to"
  user: 'The walker',
  // Shown above the screens. Say where the screens came from and what wins when sources disagree.
  intro: 'The target design, from the planning walkthrough (2026-09-27). Click a control with a blue dashed outline to see what it does on the right.',

  // The desktop sidebar, and the phone bar. The phone bar fits four; items in phoneMore sit under More.
  nav: ['Walks', 'Clients', 'Invoices', 'Settings'],
  phoneNav: ['Walks', 'Clients', 'Invoices', 'More'],
  phoneMore: ['Settings'],

  // How the app runs a domain event's handlers. Used in traces and the legend.
  same: 'in the same transaction',
  later: 'later, as a background job',

  // Folders or files, relative to the repository root, whose OpenAPI operationIds prove an action exists.
  // Leave empty when the app has no contract; then an action marked exists needs a code path instead.
  contract: [],
  // Tables any domain may write, such as a command log or an outbox
  sharedTables: [],

  // Shown on the overview in the right pane
  rules: [
    'Each table has one owning domain, and no domain writes another\'s tables.',
    'Effects across domains go through a domain event.',
  ],
  outside: 'Stripe talks only to Invoices. Email goes out after the transaction commits.',

  // [what the user wants to do, where it happens, how often]
  jobs: [
    ['See today\'s walks and who they are for', 'Walks', 'Every day'],
    ['Record a walk as done', 'Walk, on a phone', 'After every walk'],
    ['Get paid for the month', 'Invoices', 'Monthly'],
  ],

  // The Architecture page. Leave layers empty while the stack is undecided; the page then lists the domains.
  arch: {
    layers: [
      { name: 'People', items: ['Walker, signed in with email'] },
      { name: 'Frontend', where: 'Undecided', items: [], note: 'A phone-first web app.' },
      { name: 'Backend', where: 'Undecided', domains: true, note: 'One service. Each domain owns its tables.' },
      { name: 'Database', where: 'PostgreSQL', items: [] },
    ],
    outside: [
      { name: 'Stripe', what: 'Invoices and card payments.' },
      { name: 'Email', what: 'Walk reports to clients.' },
    ],
    strips: [
      { title: 'Build order', html: '<p class="hint">1. Walks and clients. 2. Invoices.</p>' },
    ],
  },
}
