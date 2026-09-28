#!/usr/bin/env node

// Checks the app map against itself, and against the code and the OpenAPI contract when the app has them.
// It loads the same scripts as the page, in the page's order, so it sees the same screens and actions.
// Run it from anywhere: node <map folder>/check.mjs

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const mapRoot = dirname(fileURLToPath(import.meta.url))
// The repository root is the nearest folder above the map with a .git; without one, the map's parent
let repositoryRoot = mapRoot
while (!existsSync(join(repositoryRoot, '.git')) && dirname(repositoryRoot) !== repositoryRoot) repositoryRoot = dirname(repositoryRoot)
if (!existsSync(join(repositoryRoot, '.git'))) repositoryRoot = dirname(mapRoot)
const errors = []
const relative = (path) => path.slice(repositoryRoot.length + 1)
const warnings = []
const info = []

// Load the page's data scripts. Engine code that touches the page (map.js, tabs.js, search.js) is skipped.
const page = readFileSync(join(mapRoot, 'index.html'), 'utf8')
const dataScripts = [...page.matchAll(/<script src="([^"]+)"><\/script>/g)]
  .map((match) => match[1])
  .filter((src) => !['engine/map.js', 'engine/tabs.js', 'engine/search.js'].includes(src))
// Every screen file needs a script tag, or the page never shows it
for (const file of readdirSync(join(mapRoot, 'data', 'screens'))) {
  if (file.endsWith('.js') && !page.includes(`src="data/screens/${file}"`)) errors.push(`data/screens/${file} has no script tag in index.html`)
}
const context = {}
context.window = context
vm.createContext(context)
const source = dataScripts.map((src) => readFileSync(join(mapRoot, src), 'utf8')).join('\n;\n')
vm.runInContext(`${source}\n;globalThis.__map = { APP, S, flows, screenGroups, words }`, context, { filename: 'map' })
const { ACTIONS } = context
const { APP } = context.__map
const { S: screens, flows, screenGroups, words } = context.__map

const areaIds = new Set(ACTIONS.areas.map((area) => area.id))
const domainIds = new Set(ACTIONS.domains.map((domain) => domain.id))
const actions = ACTIONS.domains.flatMap((domain) => domain.actions.map((action) => ({ ...action, domain: domain.id })))
const actionById = new Map(actions.map((action) => [action.id, action]))
const systemById = new Map(ACTIONS.system.map((entry) => [entry.id, entry]))
const events = ACTIONS.events

// Ids
const seen = new Set()
for (const { id, domain } of [...actions, ...ACTIONS.system]) {
  if (seen.has(id)) errors.push(`${id} is defined more than once`)
  seen.add(id)
  if (id.split('.')[0] !== domain) errors.push(`${id} sits in the ${domain} domain, but its prefix names another`)
}

// Domains
for (const domain of ACTIONS.domains) {
  if (!areaIds.has(domain.area)) errors.push(`${domain.id} names an unknown area ${domain.area}`)
  for (const read of domain.reads || []) {
    if (!domainIds.has(read.domain)) errors.push(`${domain.id} reads an unknown domain ${read.domain}`)
  }
}
for (const entry of ACTIONS.system) {
  if (!domainIds.has(entry.domain)) errors.push(`System action ${entry.id} names an unknown domain ${entry.domain}`)
}

// Tables: one owner each, and nobody writes another domain's tables, except the shared ones in APP.sharedTables
const platformTables = new Set(APP.sharedTables || [])
const ownerOf = new Map()
for (const domain of ACTIONS.domains) {
  for (const table of domain.tables || []) {
    if (ownerOf.has(table)) errors.push(`${table} is owned by both ${ownerOf.get(table)} and ${domain.id}`)
    ownerOf.set(table, domain.id)
  }
}
function checkWrites(who, writes, allowed) {
  for (const table of writes || []) {
    if (platformTables.has(table)) continue
    const owner = ownerOf.get(table)
    if (!owner) errors.push(`${who} writes ${table}, which no domain owns`)
    else if (!allowed.includes(owner)) errors.push(`${who} writes ${table}, owned by ${owner}, which it neither changes nor touches`)
  }
}
for (const action of actions) {
  checkWrites(action.id, action.writes, [...(action.changes || []), ...(action.touches || [])])
  for (const domain of [...(action.changes || []), ...(action.touches || [])]) {
    if (!domainIds.has(domain)) errors.push(`${action.id} changes an unknown domain ${domain}`)
  }
  for (const name of action.publishes || []) {
    if (!events[name]) errors.push(`${action.id} publishes ${name}, which is not in the events list`)
  }
  for (const id of action.calls || []) {
    if (!actionById.has(id) && !systemById.has(id)) errors.push(`${action.id} calls ${id}, which is neither an action nor a system action`)
  }
}

// Events
for (const [name, event] of Object.entries(events)) {
  if (!domainIds.has(event.from)) errors.push(`Event ${name} comes from an unknown domain ${event.from}`)
  if (!event.handlers?.length) errors.push(`Event ${name} has no handlers`)
  for (const handler of event.handlers || []) {
    if (!domainIds.has(handler.domain)) errors.push(`Event ${name} has a handler in an unknown domain ${handler.domain}`)
    if (handler.id.split('.')[0] !== handler.domain) errors.push(`Handler ${handler.id} sits in ${handler.domain}, but its prefix names another`)
    if (!['same', 'deferred'].includes(handler.mode)) errors.push(`Handler ${handler.id} has mode ${handler.mode}; use same or deferred`)
    checkWrites(`Handler ${handler.id}`, handler.writes, [handler.domain])
  }
}

// Status against the contract and the code
const contractOperations = new Set()
const contracts = (APP.contract || []).map((path) => join(repositoryRoot, path))
for (const path of contracts) if (!existsSync(path)) errors.push(`APP.contract names ${relative(path)}, which does not exist`)
function collectOperations(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) collectOperations(path)
    else if (/\.ya?ml$/.test(entry.name)) {
      for (const match of readFileSync(path, 'utf8').matchAll(/operationId"?\s*:\s*"?([A-Za-z0-9_]+)/g)) contractOperations.add(match[1])
    }
  }
}
for (const path of contracts.filter(existsSync)) {
  if (statSync(path).isDirectory()) collectOperations(path)
  else for (const match of readFileSync(path, 'utf8').matchAll(/operationId"?\s*:\s*"?([A-Za-z0-9_]+)/g)) contractOperations.add(match[1])
}
const codeExists = (path) => existsSync(join(repositoryRoot, path.split('#')[0]))
const mappedOperations = new Set()
for (const action of actions) {
  if (action.http) mappedOperations.add(action.http)
  if (action.code && !codeExists(action.code)) errors.push(`${action.id} names code ${action.code}, which does not exist`)
  if (action.status === 'exists') {
    if (!action.http && !action.code) errors.push(`${action.id} is marked exists but names no operation (http) or code path (code)`)
    else if (action.http && contracts.length && !contractOperations.has(action.http)) errors.push(`${action.id} is marked exists, but ${action.http} is not in the contract`)
  } else if (action.status === 'review') {
    if (!action.pr) errors.push(`${action.id} is marked review but names no pull request`)
    if (action.http && contractOperations.has(action.http)) errors.push(`${action.id} is marked review, but ${action.http} is already in the contract; mark it exists`)
  } else if (action.status === 'planned') {
    if (action.http && contractOperations.has(action.http)) errors.push(`${action.id} is marked planned, but ${action.http} is already in the contract; mark it exists`)
  } else {
    errors.push(`${action.id} has status ${action.status}; use exists, review or planned`)
  }
}
for (const operation of [...contractOperations].sort()) {
  if (!mappedOperations.has(operation)) info.push(`${operation} is in the contract but no map action names it`)
}

// Screens: buttons, pins and notes
const screenById = new Map(screens.map((screen) => [screen.id, screen]))
const buttonsOn = new Map()
for (const screen of screens) {
  const html = [screen.desk, screen.desk2, screen.phone, ...(screen.phones || [])].filter(Boolean).join('')
  const ids = new Set([...html.matchAll(/data-action="([^"]+)"/g)].flatMap((match) => match[1].split(' ')))
  buttonsOn.set(screen.id, ids)
  for (const id of ids) {
    if (!actionById.has(id)) errors.push(`A button on ${screen.id} names ${id}, which is not an action`)
  }
  const pins = new Set([...html.matchAll(/<b class="pin">(\d+)<\/b>/g)].map((match) => Number(match[1])))
  // A note may describe the whole screen and have no pin, but every pin needs its note
  const notes = screen.notes.length
  for (const n of pins) if (n < 1 || n > notes) errors.push(`${screen.id} has pin ${n}, but only ${notes} note${notes === 1 ? '' : 's'}`)
}
const withButton = new Set([...buttonsOn.values()].flatMap((ids) => [...ids]))
for (const action of actions) {
  if (!withButton.has(action.id)) warnings.push(`${action.id} has no button on any screen`)
}

// Screens: each sits in exactly one group of the screen list, and a domain hint names a real domain
const grouped = new Map()
for (const [group, ids] of screenGroups) {
  for (const id of ids) {
    if (!screenById.has(id)) errors.push(`Screen group ${group} names an unknown screen ${id}`)
    else if (grouped.has(id)) errors.push(`${id} sits in both ${grouped.get(id)} and ${group}`)
    grouped.set(id, group)
  }
}
for (const screen of screens) {
  if (!grouped.has(screen.id)) errors.push(`${screen.id} is in no screen group, so the screen list leaves it out`)
  if (screen.domain && !domainIds.has(screen.domain)) errors.push(`${screen.id} names an unknown domain ${screen.domain}`)
  if (!buttonsOn.get(screen.id).size && !screen.domain) errors.push(`${screen.id} has no buttons and no domain, so it has no build status`)
}

// Words: each names the screens it shows on
words.forEach((word, i) => {
  if (!word.screens?.length) errors.push(`Word W${i + 1} (${word.use}) names no screens`)
  for (const id of word.screens || []) if (!screenById.has(id)) errors.push(`Word W${i + 1} (${word.use}) names an unknown screen ${id}`)
})

// Flows on the Tour page
for (const flow of flows) {
  flow.s.forEach(([title, , screenId, actionId], i) => {
    const where = `Flow ${flow.t.split('.')[0]} step ${i + 1} (${title})`
    if (!screenId) return
    if (!screenById.has(screenId)) return errors.push(`${where} names an unknown screen ${screenId}`)
    if (!actionId) return
    if (!actionById.has(actionId)) return errors.push(`${where} names an unknown action ${actionId}`)
    if (!buttonsOn.get(screenId).has(actionId)) errors.push(`${where} names ${actionId}, but ${screenId} has no button for it`)
  })
}

for (const line of info) console.log(`info: ${line}`)
for (const line of warnings) console.warn(`warning: ${line}`)
for (const line of errors) console.error(`error: ${line}`)
if (errors.length) {
  console.error(`Map check failed with ${errors.length} error${errors.length === 1 ? '' : 's'}.`)
  process.exit(1)
}
console.log(`Map check passed: ${screens.length} screens, ${actions.length} actions, ${Object.keys(events).length} events${contracts.length ? `, ${contractOperations.size} contract operations` : ''}.`)
