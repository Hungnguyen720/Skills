---
name: app-map
description: Build or update an app map. The map is one local HTML page that shows an app's screens as wireframes and links each button to the backend action it calls, the domain that owns it, the tables it writes and the domain events it publishes. It also has Tour, Status, Architecture and Words pages. Use it to extract a map from an existing codebase, to plan a new app or a change through a walkthrough, or to keep a map up to date. Triggers include "map the app", "app map", "map this codebase", "extract the map", "plan a new app", "plan this feature on the map", "screens, actions and domains", "what does this button do", and "update the map".
---

# App map

An app map is a static HTML page with no build step. Its data lives in a few plain script files. The reader clicks a button on a wireframe and sees its trace: which domain owns the action, what it writes, which events it publishes, and which domains react, in the same transaction or later.

The map has three kinds of readers, and they count equally:

- The owner learns the app and decides what it should be.
- Agents read it before they build.
- New developers read it to find their way around.

The page is read-only. The owner asks Claude for edits, and Claude makes them and shows the result. Nobody edits the page in a browser.

## Pick the mode

Ask which mode applies only when the request and the repo leave it unclear.

- **Extract.** The app exists. Read the code and draw what is there. Follow [references/extract.md](references/extract.md).
- **Plan.** The app is new, or the owner wants a change. Walk the owner through it one screen group at a time. Follow [references/ideate.md](references/ideate.md).
- **Both.** An existing app is getting a change. Extract first, so the map shows today's code, then plan the change with planned actions and screens on top.

Every field in the data files is described in [references/data-model.md](references/data-model.md). Read it before you write data.

## Set up the map

1. Look for an existing map first. Search the repo for `data/actions.js` next to an `index.html`, or for a folder called `map`.
   - If one exists and came from this template, it has `engine/` and `check.mjs`. Update its data and leave the engine alone, unless the owner asks for the newer engine. To upgrade, copy `engine/`, `map.css` and `check.mjs` from the template and leave `data/` and `index.html` as they are.
   - If a map exists but uses different code, don't replace it. Ask the owner first.
2. Otherwise, copy the `template/` folder that sits next to this SKILL.md into the project. Use `prototype/map/` unless the repo already keeps prototypes or design files somewhere else.
3. Replace all of the example data about a dog walking app. Every data file is example data. Remove anything about dogs, walks, walkers or Stripe that doesn't belong to the real app.
4. Each file in `data/screens/` needs a `<script>` tag in `index.html`. Put the tags after `engine/wireframe.js` and before `data/journeys.js`, in menu order.
5. Run the check after every edit: `node <map>/check.mjs`. Fix every error. Warnings mean an action has no button yet. Fix those too, or say why it has no button.
6. Serve the folder that contains the map, and give the owner a localhost link:
   `python3 -m http.server <port> --bind 127.0.0.1 --directory <parent of map>`, then `http://127.0.0.1:<port>/map/`.
   Pick a free port. Reuse a server that is already running. file:// links don't work, because the page loads its scripts.
7. Look at the page in a browser before you report. Use chrome-devtools-axi when it is installed. Open a URL with a hash to test a view, for example `#trace=<action id>` or `#mode=status`. Setting `location.hash` from a script doesn't reload the view.

Never publish the map as a Claude artifact or upload it anywhere. It stays a local file.

## Rules for the content

- **Every action gets a button.** A person-facing action needs a control on some screen, marked with `btn(text, primary, 'domain.verb')` or `on(html, 'domain.verb')`. Webhooks, scheduled jobs and event handlers have no button. They go in `system` or in an event's handlers.
- **One owner per table.** A domain writes only its own tables. An effect in another domain goes through a domain event, or through a `calls` to that domain's action. The check enforces this.
- **Status comes from proof.** `exists` needs an OpenAPI `operationId` (http) or a real path (code). `review` needs a pull request. Everything else is `planned`. Never mark something exists because a ticket says it's done.
- **Wireframes are low-fidelity sketches.** Use bars and placeholder rows. Write real text only where the words matter, such as button labels, headings and column names. The owner reviews the wireframes as proposals. Don't turn UI rules from the project's docs into fixed constraints on them.
- **Notes explain, pins point.** `pin(n)` on a wireframe points at `notes[n - 1]`. A note says what happens and why, in one or two plain sentences.
- **Record decisions where they apply.** Put a decision on the note, word or gap it affects, ending in "(decided YYYY-MM-DD)" with today's date. Don't keep a separate decision log.
- **Open questions stay visible.** Anything uncertain goes in the screen's `questions`, or in `conflicts` on the Words page when two sources disagree. Don't guess and present the guess as fact.
- **Happy path first.** Draw the main flow. List error cases, edit flows and edge cases as questions until the owner asks for them.

## Talking to the owner

- Ask only the questions that need an answer. Apply sensible defaults, and don't ask about anything the owner has already implied.
- Give each question two to four options, with the recommended one first and marked "(Recommended)". Recommend the simplest option: the fewest screens, fields and rows. A term the owner finds confusing is a sign the design is too complicated.
- When a trade step or an industry term is involved, explain it with a concrete made-up example with names and numbers, such as "Ana books Biscuit for 9:00; after the walk you press Done and $20 goes on her March bill."
- After each round, give the localhost link and say which screens changed.

## When the map is agreed

The agreed map is the source of truth for screens and flows. If tickets or docs disagree with it, the map wins. Update the tickets and docs from the map, and add a conflict row while the two still disagree.

Ask before you create or edit tickets, issues or pull requests. Offer to turn planned actions into tickets, one per action or one per screen group, and write the ticket numbers back into `ticket` on each action.

Keep the map current. When a pull request adds an action, mark it `review` with `pr`. When it merges, mark it `exists` with its `http` or `code`, and run the check.
