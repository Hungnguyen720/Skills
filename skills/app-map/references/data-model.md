# Data model

The page loads these files in order. They are classic scripts, so each top-level `const` is visible to the files after it.

| File | Defines |
|---|---|
| `data/app.js` | `APP`: the name, menus, jobs, architecture and rules |
| `data/actions.js` | `window.ACTIONS`: areas, domains, actions, events, system actions and gaps |
| `engine/wireframe.js` | The action index (`ACT`, `SYS`, `EVENTS`), the wireframe helpers, and `S`, the screen list |
| `data/screens/*.js` | One file per menu area. Each calls `S.push({...})` once per screen |
| `data/journeys.js` | `screenGroups`, `mapGroups`, `links` and `flows` |
| `data/words.js` | `words` and `conflicts` |
| `engine/map.js`, `engine/tabs.js`, `engine/search.js` | Drawing and behavior. Don't edit these for one app |

Text fields accept HTML. Use `<code>` for ids and `<b>` sparingly.

## APP (`data/app.js`)

| Field | What it is |
|---|---|
| `name` | The app's name. The page title becomes "<name> map" |
| `user` | The main user, such as "The florist". Heads the jobs table as "<user> wants to" |
| `intro` | One or two sentences above the screens. Say where the screens came from and what wins when sources disagree |
| `nav` | The desktop sidebar items, in order. `shell('Walks', ...)` lights the item with that name |
| `phoneNav` | The phone bar. Four items at most. Make the last one "More" when there are more places |
| `phoneMore` | Items that live under More. `phone(..., { tab: 'Settings' })` then lights More |
| `same`, `later` | The words for an event handler's mode, such as "in the same transaction" and "later, as a background job". Match how the app runs handlers |
| `contract` | OpenAPI files or folders, relative to the repo root. The check collects their `operationId`s. Leave it empty when there is no contract |
| `sharedTables` | Tables any domain may write, such as an outbox or an audit log |
| `rules` | Short rules that every domain follows. Shown on the overview |
| `outside` | HTML. Which outside services exist and which domain talks to each one |
| `jobs` | `[want, where, how often]` rows. The owner's jobs to be done, most frequent first |
| `arch.layers` | `{ name, where, items, note, domains, via }`. One box per layer, top to bottom. `domains: true` lists the domains inside that layer. `via` names what connects it to the next layer |
| `arch.outside` | `{ name, what }` for each outside service |
| `arch.strips` | `{ title, html }` panels under the layers, for build order, deployment or anything else that doesn't fit a layer |

With `arch.layers` empty, the Architecture page shows the domains only. That's the right state while the stack is undecided.

## ACTIONS (`data/actions.js`)

### areas

`{ id, name }`. Each area is one column of the domain map, left to right. The areas take colors in order. The id `app` is reserved for commands that call several domains in one go. It is purple and sits under the shortest column.

### domains

| Field | What it is |
|---|---|
| `id` | Lowercase, one word. Every action id starts with it |
| `name`, `sub` | The box's title, and two to four words under it |
| `area` | An area id |
| `kind` | One sentence about what the domain is responsible for |
| `owns` | The things it owns, in the owner's words |
| `tables` | The tables it owns. Each table has exactly one owner |
| `reads` | `{ domain, what }`: data it reads from another domain, without writing it |
| `inputs` | Anything that reaches it from outside, such as webhooks or imports |
| `routes` | The screen or API routes it serves, in extraction |
| `slice` or `built` | Build step number, or a short phrase for where it stands, such as "in today's code" |
| `note` | Extra text for the domain panel |
| `combines` | `true` for a box that groups other domains for reading. It is drawn dashed and has no tables |
| `actions` | See below |

### actions

| Field | What it is |
|---|---|
| `id` | `<domain>.<verb><Thing>`, such as `walks.completeWalk` |
| `label` | What a person would call it, such as "Mark a walk done" |
| `actor` | Who presses it |
| `status` | `exists`, `review` or `planned` |
| `http` | The OpenAPI `operationId`. When `APP.contract` is set, an exists action with `http` must appear in the contract |
| `code` | A path, relative to the repo root, that proves the action exists. `#L10` or `#handler` fragments are allowed |
| `pr` | The pull request that adds it, for `review` |
| `ticket` | The issue that plans it |
| `changes` | The domains whose state it changes. Usually just its own |
| `touches` | Domains it changes only in passing. Prefer `changes` |
| `writes` | Tables it writes. Each must belong to a domain in `changes` or `touches`, or to `APP.sharedTables` |
| `calls` | Actions or system actions it calls directly, in the same request |
| `publishes` | Event names from `events` |
| `outside` | `{ service, when, what }`, where `when` is `before`, `after`, `unstated` or free text |
| `note` | Shown on the action's line in the Status gaps and the panel |
| `chainNote` | A line at the end of the trace |
| `before` | For a planned action split out of an older one, the older operation's name |

### events

`{ <name>: { from, handlers: [{ id, domain, mode, what, writes }] } }`. The event name is past tense, such as `walkCompleted`. `mode` is `same` or `deferred`. A handler's id starts with its own domain, and it may write only its own domain's tables. If a handler's `what` mentions another event's name, the trace follows it.

### system

`{ id, domain, what }`. Webhooks, scheduled jobs and anything else with no button.

### gaps

`{ domain, what, reason }`. Something a user may expect that nobody plans yet. The Status page lists these.

## Screens (`data/screens/*.js`)

```js
S.push({
  id: 'walks',                 // unique, lowercase
  title: 'Walks',              // 'Area: detail' for a sub-screen, such as 'Walks: a walk'
  purpose: 'One sentence about why the screen exists.',
  desk: shell('Walks', `...`), // desktop frame; '' when the screen is phone-only
  desk2: '',                   // an optional second desktop frame, such as an open dialog
  phone: phone('Walks', `...`),// one phone frame, or use phones: [...] for several
  notes: ['What pin 1 points at.', 'What pin 2 points at.'],
  questions: ['Open questions for the owner.'],
  domain: 'walks',             // only for a screen with no buttons, so it still gets a build status
  placeholder: 1,              // only for a stub added so an action has a button; nobody has reviewed it
})
```

A screen's state comes from its buttons' actions. It is Built when all of them exist, In review when any is in review, and Planned otherwise.

### Wireframe helpers

| Helper | Draws |
|---|---|
| `shell(active, html)` | A desktop page with the `APP.nav` sidebar, with `active` lit |
| `solo(html)` | A desktop page with no menu, such as sign in |
| `phone(title, html, { back, act, tab, noTabs })` | A phone frame. `back` shows an arrow, `act` a top-right control, `tab` the lit bar item |
| `head({ crumb, title, meta, tabs, on, p })` | The top of a detail page. `p` adds a pin to the title |
| `btn(text, primary, 'a.b c.d')` | A button that calls the named actions, with their labels |
| `on(html, 'a.b', ...)` | Marks any other control, such as a row, link, checkbox or field, as calling actions |
| `table(cols, rows, opts)` | `cols` is `[{ h, k, w }]`. `k` is a cell kind: `t` text bar, `n` number, `s` status dot, `c` or `x` checkbox, `a` row menu, `in` input, `p` person. `rows` is a count, or an array of rows whose cells override the kind. `'=Ana'` is literal text and `'#12'` is a right-aligned number. `opts` takes `head: false`, `sel`, `voided`, `foot` and `seed` |
| `prows(n, offset, trail)` | Phone list rows |
| `pchips(tabs, on)` | Phone filter chips |
| `chip(text, on)`, `field(text, width)`, `lab(text)`, `bar(width)`, `menu(style, items)` | Small parts |
| `pin(n)` | A numbered dot that points at `notes[n - 1]` |

Layout classes from `map.css`: `phead` (a page title row, with `h` for the title), `grp` (a group heading), `row`, `sec` (a phone section heading), `note`, `pbar` (a phone bottom action bar), `etitle`, `meta`, `tabs`, `crumb`.

## Journeys (`data/journeys.js`)

- `screenGroups`: `[group, [screen ids]]`. The screen list on the left. Each screen sits in exactly one group.
- `mapGroups`: `{ t, p, n: [[place, tag]] }`. The places in the app on the Tour page, such as "Public" or "Menu".
- `links`: `[from, to, why]`. How one place feeds another.
- `flows`: `{ t: 'A. Title', w: 'who, on what device', s: [[step title, text, screen id, action id]] }`. The screen and action are optional. The action must have a button on that screen.

## Words (`data/words.js`)

- `words`: `{ thing, use, not, docs, why, status, screens }`. One row per thing people could name more than one way. `screens` lists where the word shows.
- `conflicts`: `[topic, one source says, another says]`. Open disagreements between tickets, docs, code and the map.

## Deep links

`#<screen id>` scrolls to a screen. `#trace=<action id>` traces an action. `#find=<action id>` lights every button for that action and traces it. `#domain=<id>` opens a domain. `#mode=browse`, `#mode=tour` or `#mode=status` picks a mode. `#tab=arch` or `#tab=words` opens a page.
