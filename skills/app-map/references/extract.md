# Extract a map from a codebase

The goal is a map of the code as it runs today. Draw what the code does, even where it differs from the tickets or docs. Where the sources disagree, add a row to `conflicts`.

Read `AGENTS.md`, `CLAUDE.md` and the docs index first, if the repo has them. They name the domains, the commands and the words the team uses.

## Where each part comes from

| Map part | Where to look |
|---|---|
| `APP.name`, `APP.user` | The README, the package name, the login page |
| `APP.nav`, `phoneNav` | The layout or shell component that renders the sidebar and the mobile bar |
| Screens | The router: `routes/`, `pages/`, `app/` folders, `resources/js/Pages`, Rails `config/routes.rb`, Django `urls.py`. One screen per page a person can reach. A dialog or drawer can be a `desk2` frame on its parent screen |
| Buttons | Forms, submit handlers, and `onClick` handlers that call the API or a server action. Each one that changes state becomes a `btn` or `on` with its action id |
| Actions | Controllers, route handlers, server actions, GraphQL mutations, command handlers. Read-only endpoints are not actions |
| `http` | The `operationId` in the OpenAPI spec. Set `APP.contract` to the spec's files or folders |
| `code` | The file that handles the action, when there is no contract. Add `#functionName` for a big file |
| Domains | Top-level modules, bounded contexts, packages or service folders. When the code has no modules, group the tables by what they describe and name one domain per group |
| `tables` | Migrations or the schema file. Give each table to the domain whose code writes it most. Tables every domain writes go in `APP.sharedTables` |
| `writes` | The models or queries the handler writes |
| Events | Domain events, listeners, observers, subscribers, outbox rows, queue jobs dispatched by an action |
| Handler `mode` | `same` when the listener runs inside the request's transaction, `deferred` when it is queued |
| `system` | Webhook controllers, cron and scheduled tasks, queue workers that no button starts |
| `outside` | SDK clients and HTTP calls to other services. Note whether each call happens before or after the transaction commits |
| `arch` | The deploy config, Dockerfiles, framework, database and hosting |
| `words` | UI copy, where the same thing has two names in code, tickets or screens |
| `status` | `exists` for everything on the main branch. `review` for an open pull request that adds an action. Use `planned` only for tickets nobody has built yet, and only when the owner wants planned work on the map too |

## Order of work

1. List the routes and the handlers that change state. Write the domains, tables and actions in `data/actions.js` first. Run the check until it passes, with warnings about missing buttons.
2. Write one screen file per nav area. Sketch each page. Put a button on it for every action the page calls. Stop when the check has no warnings.
3. Add events, handlers and system actions. Trace a few actions in the browser and compare the trace with the code.
4. Fill in `APP.jobs`, `arch`, the screen groups and one or two flows for the main journeys.
5. Add words and conflicts last.

For a large app, split the work by domain. Give subagents one domain each, and have each return its actions, tables and screens as data. Then merge the results into the files yourself and run the check once.

## What to leave out

- Admin-only tools and debug pages, unless the owner asks for them.
- Endpoints that only read. They show on the screen as tables and lists, not as actions.
- Error screens and empty states. Add them as questions if they look wrong.

## When the code is unclear

Don't guess. Put the question on the screen, such as "Does cancelling a walk refund the charge? `WalkController@cancel` doesn't touch charges." Then ask the owner in the next round, with a recommendation.

## Report

Tell the owner:

- The localhost link.
- The count from the check: screens, actions, events and contract operations.
- Actions in the contract or the code that no button calls. Either they are system actions or a screen is missing.
- Tables written by a domain that doesn't own them. These are the design problems the map found.
- Open questions, grouped by screen.
