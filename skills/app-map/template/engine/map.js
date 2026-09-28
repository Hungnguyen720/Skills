// Renders the screens, the domain map, the side panel and traces. Everything app-specific comes from data/.

document.title = `${APP.name} map`
document.getElementById('appName').textContent = `${APP.name} map`
document.getElementById('mapIntro').innerHTML = APP.intro || ''
document.getElementById('legendSame').textContent = `Reacts ${APP.same || 'right away'}`
document.getElementById('legendLater').textContent = `Reacts ${APP.later || 'later'}`
const LATER = APP.later || 'later', SAME = APP.same || 'right away'

/* ---------- Render screens ---------- */
// Each screen card layers plain words on top (purpose, frames, notes, words) and the build detail
// underneath (actions, tables, domain events), closed until opened.
const domainName = Object.fromEntries(ACTIONS.domains.map((d) => [d.id, d.name]))
const actionIdsOn = (s) => [...new Set([s.desk, s.desk2, s.phone, ...(s.phones || [])].join('').match(/data-action="[^"]+"/g)?.flatMap((m) => m.slice(13, -1).split(' ')) || [])].filter((id) => ACT[id])
const stateWord = { exists: 'Built', review: 'In review', planned: 'Planned' }
// A screen is built when every action behind it exists, in review when any is in review, and planned otherwise
function screenState(s) {
  const acts = actionIdsOn(s).map((id) => ACT[id])
  const pool = acts.length ? acts : ACTIONS.domains.find((d) => d.id === s.domain)?.actions || []
  const st = pool.every((a) => a.status === 'exists') ? 'exists' : pool.some((a) => a.status === 'review') ? 'review' : 'planned'
  const n = (k) => pool.filter((a) => a.status === k).length
  const why = acts.length ? [['exists', 'built'], ['review', 'in review'], ['planned', 'planned']].filter(([k]) => n(k)).map(([k, w]) => `${n(k)} ${w}`).join(', ') + ` of ${acts.length} action${acts.length > 1 ? 's' : ''}`
    : `No buttons. ${domainName[s.domain]} has ${n('exists')} of ${pool.length} actions built.`
  return { st, why }
}
// The domains a screen changes: each action's owner, or for an app command the domains it changes
const screenDomains = (s) => {
  const ids = actionIdsOn(s).flatMap((id) => ACT[id].domain === 'app' ? ACT[id].changes || [] : [ACT[id].domain])
  return [...new Set(ids.length ? ids : [s.domain].filter(Boolean))]
}
const decidedTag = (html) => html.replace(/\s*\((decided \d{4}-\d{2}-\d{2})([,;][^)]*)?\)/gi, (_, d, rest) => ` <span class="dtag"${rest ? ` title="${rest.slice(1).trim()}"` : ''}>${d}</span>`)
const wordsOn = (id) => words.filter((w) => w.screens.includes(id))
const stateOf = {}
const buildRows = (s) => {
  const acts = actionIdsOn(s).map((id) => ACT[id])
  if (!acts.length) return `<p class="hint">No buttons on this screen. It reads from ${domainName[s.domain] || 'no domain'}.</p>`
  const writes = [...new Set(acts.flatMap((a) => a.writes || []))]
  const pubs = [...new Set(acts.flatMap((a) => a.publishes || []))]
  return `<table class="build"><thead><tr><th>Action</th><th>Name in code</th><th>Domain</th><th>Status</th><th>Operation</th></tr></thead><tbody>
    ${acts.map((a) => `<tr><td><a data-map-find="${a.id}" href="#find=${a.id}">${a.label}</a></td><td><code>${a.id}</code></td><td>${domainName[a.domain]}</td><td><span class="sbadge st-${a.status}">${stateWord[a.status]}</span>${a.pr ? ` <span class="hint">${a.pr}</span>` : ''}</td><td>${a.http ? `<code>${a.http}</code>` : a.code ? `<code>${a.code}</code>` : a.before ? `<span class="hint">was <code>${a.before}</code></span>` : ''}</td></tr>`).join('')}</tbody></table>
    ${writes.length ? `<div class="bline"><b>Writes</b>${writes.map((t) => `<span class="tchip">${t}</span>`).join('')}</div>` : ''}
    ${pubs.length ? `<div class="bline"><b>Publishes</b>${pubs.map((e) => `<span class="tchip">${e}</span>`).join('')}</div>` : ''}`
}
document.getElementById('screensOut').innerHTML = S.map((s) => {
  const { st, why } = stateOf[s.id] = screenState(s)
  const ws = wordsOn(s.id)
  return `
  <section class="screen" id="${s.id}">
    <div class="shead"><h3>${s.title}</h3><span class="sbadge st-${st}" title="${why}">${stateWord[st]}</span><span class="swhy">${why}</span>
      <span class="sdoms">${screenDomains(s).map((d) => `<a class="dchip" data-domain="${d}" href="#domain=${d}">${domainName[d]}</a>`).join('')}</span></div>
    <p class="purpose">${decidedTag(s.purpose)}</p>
    ${s.placeholder ? '<div class="phbanner">Placeholder, added so every action has a button. Not reviewed.</div>' : ''}
    <div class="framewrap"><div class="frames">${s.desk || ''}${s.desk2 || ''}${s.phone || ''}${(s.phones || []).join('')}</div><button class="more-frames" hidden></button></div>
    <details open><summary>Notes${ws.length ? ' and words' : ''}${s.questions.length ? ' and open questions' : ''}</summary><div class="notes${ws.length || s.questions.length ? '' : ' one'}">
      <div><ol>${s.notes.map((n, i) => `<li><b class="pin">${i + 1}</b><span>${decidedTag(n)}</span></li>`).join('')}</ol></div>
      ${ws.length || s.questions.length ? `<div>${ws.length ? `<h4>Words</h4><ul class="words">${ws.map((w) => `<li><b>${w.use}</b>${w.not ? `, not ${w.not}` : ''}. <span class="hint">${decidedTag(w.why)}</span></li>`).join('')}</ul>` : ''}
      ${s.questions.length ? `<h4>Open questions</h4><ol class="qs">${s.questions.map((q) => `<li>${q}</li>`).join('')}</ol>` : ''}</div>` : ''}</div></details>
    <details class="forbuild"><summary>For building: ${why.replace(/^No buttons\. /, '')}</summary>${buildRows(s)}</details>
  </section>`
}).join('')

// The screen list on the left, grouped by place, with each screen's build status
const shortTitle = (t, group) => t.startsWith(group + ': ') ? t.slice(group.length + 2).replace(/^./, (c) => c.toUpperCase()) : t
document.getElementById('screenNav').innerHTML = screenGroups.map(([g, ids]) => `<div class="navgrp"><h4>${g}</h4>${ids.map((id) => {
  const s = S.find((x) => x.id === id)
  return `<a href="#${id}" data-screen="${id}" class="${s.placeholder ? 'tocph' : ''}" title="${stateWord[stateOf[id].st]}: ${stateOf[id].why}"><i class="sdot st-${stateOf[id].st}"></i><span>${shortTitle(s.title, g)}</span></a>`
}).join('')}</div>`).join('')
// Light the screen in view
const navLinks = Object.fromEntries([...document.querySelectorAll('#screenNav a')].map((a) => [a.dataset.screen, a]))
const inView = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return
  Object.values(navLinks).forEach((a) => a.classList.toggle('cur', a.dataset.screen === e.target.id))
  navLinks[e.target.id].scrollIntoView({ block: 'nearest' })
}), { root: document.getElementById('screensPane'), rootMargin: '0px 0px -75% 0px' })
document.querySelectorAll('section.screen').forEach((n) => inView.observe(n))

// A screen's frames can run past the right edge. Say how many are hidden, and scroll to them on click.
function markHiddenFrames(wrap) {
  const f = wrap.querySelector('.frames'), right = f.getBoundingClientRect().right
  const hidden = [...f.children].filter((c) => c.getBoundingClientRect().left > right - 40).length
  const more = f.scrollLeft + f.clientWidth < f.scrollWidth - 2
  wrap.classList.toggle('more', more)
  const b = wrap.querySelector('.more-frames')
  b.hidden = !more
  b.textContent = hidden ? `${hidden} more frame${hidden > 1 ? 's' : ''} →` : 'More →'
}
const frameWraps = [...document.querySelectorAll('.framewrap')]
frameWraps.forEach((w) => {
  w.querySelector('.frames').addEventListener('scroll', () => markHiddenFrames(w), { passive: true })
  w.querySelector('.more-frames').addEventListener('click', () => { const f = w.querySelector('.frames'); f.scrollBy({ left: f.clientWidth * 0.8, behavior: 'smooth' }) })
})
const markAllFrames = () => frameWraps.forEach(markHiddenFrames)
new ResizeObserver(markAllFrames).observe(document.getElementById('screensOut'))

const titles = Object.fromEntries(S.map((s) => [s.id, s.title]))
// usedOn[action id] = the controls that call it, in page order
const usedOn = {}
document.querySelectorAll('#screensOut [data-action]').forEach((n) => {
  n.tabIndex = 0
  n.setAttribute('role', 'button')
  const ids = n.dataset.action.split(' ')
  if (ids.some((id) => !ACT[id])) n.classList.add('unknown-ctl')
  ids.forEach((id) => (usedOn[id] ||= []).push(n))
})
const screenOf = (n) => n.closest('section.screen').id
const ctlText = (n) => n.textContent.trim().replace(/\s+/g, ' ') || 'field'
const allActions = Object.values(ACT)
const noButton = allActions.filter((a) => !usedOn[a.id])
const unknownIds = Object.keys(usedOn).filter((id) => !ACT[id])

/* ---------- Domain map ---------- */
// Everything here comes from actions.js. Only the colors and the grid are drawn by hand.
// Areas take colors in order. The "app" area, for commands across domains, is always purple.
const palette = [['#3f64a8', '#edf2fb'], ['#1f7a8c', '#e6f3f5'], ['#2f8a5b', '#eaf6ef'], ['#9b4a86', '#f8edf5'], ['#b7791f', '#fbf3e4'], ['#b0413e', '#fbeceb'], ['#5b6b2f', '#f1f4e6'], ['#44607a', '#ebf0f5']]
const areaColor = (id) => id === 'app' ? ['#6d4fc2', '#f3effc'] : palette[Math.max(0, ACTIONS.areas.filter((a) => a.id !== 'app').findIndex((a) => a.id === id)) % palette.length]
// Each area is a column, left to right. App commands take the first free cell in the shortest column.
const columns = ACTIONS.areas.map((a) => a.id).filter((id) => id !== 'app')
const colSize = (id) => ACTIONS.domains.filter((d) => d.area === id).length
const shortest = columns.reduce((m, id) => (colSize(id) < colSize(m) ? id : m), columns[0])
const APP_CELL = [columns.indexOf(shortest), colSize(shortest)]
const BW = 124, BH = 64, GAP = 22, ROWGAP = 32, TOP = 30, SIDE = 8
const domains = ACTIONS.domains.map((d) => ({ ...d }))
for (const d of domains) {
  const peers = domains.filter((x) => x.area === d.area)
  ;[d.c, d.r] = d.area === 'app' ? [APP_CELL[0], APP_CELL[1] + peers.indexOf(d)] : [columns.indexOf(d.area), peers.indexOf(d)]
  d.x = SIDE + d.c * (BW + GAP)
  d.y = TOP + d.r * (BH + ROWGAP)
}
const W = SIDE * 2 + columns.length * BW + (columns.length - 1) * GAP
const ROWS = Math.max(...domains.map((d) => d.r)) + 1
const H = TOP + ROWS * (BH + ROWGAP) - 4
const byId = Object.fromEntries(domains.map((d) => [d.id, d]))
const dname = (id) => byId[id]?.name || id

// Edges drawn in the overview, derived from events, reads and calls. Trace edges are drawn per trace.
const staticEdges = []
function addEdge(from, to, k, label) {
  if (from === to || !byId[from] || !byId[to]) return
  const e = staticEdges.find((x) => x.from === from && x.to === to && x.k === k)
  if (e) { if (!e.labels.includes(label)) e.labels.push(label) } else staticEdges.push({ from, to, k, labels: [label] })
}
for (const [name, ev] of Object.entries(EVENTS)) {
  const to = [...new Set(ev.handlers.map((h) => h.domain))]
  // A handler in the same transaction wins over a later job it queues in the same domain
  for (const d of to) addEdge(ev.from, d, ev.handlers.some((h) => h.domain === d && h.mode === 'same') ? 'same' : 'def', name)
}
for (const d of domains) for (const r of d.reads || []) addEdge(d.id, r.domain, 'read', r.what)
// App commands call almost every domain, so their calls show only when one is traced
for (const a of Object.values(ACT)) if (a.domain !== 'app') for (const c of a.calls || []) addEdge(a.domain, c.split('.')[0], 'command', ACT[c]?.label || c)
const colors = { same: '#1d2330', def: '#d9622b', command: '#6d4fc2', read: '#8a93a3' }

const svg = document.getElementById('dmap')
svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
const NS = 'http://www.w3.org/2000/svg'
const el = (tag, attrs = {}, parent = svg) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); parent.appendChild(n); return n }
const defs = el('defs')
for (const [k, c] of Object.entries(colors)) {
  const m = el('marker', { id: 'a-' + k, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, defs)
  el('path', { d: 'M0 0 L10 5 L0 10 Z', fill: c }, m)
}
// A light band behind each area, with its name on top
const bandG = el('g', { class: 'bands' })
columns.forEach((id, c) => {
  const [col] = areaColor(id)
  const rows = domains.filter((d) => d.area === id).length
  const x = SIDE + c * (BW + GAP) - 5
  el('rect', { x, y: TOP - 22, width: BW + 10, height: 22 + rows * (BH + ROWGAP) - ROWGAP + 5, rx: 12, fill: col, 'fill-opacity': 0.07 }, bandG)
  el('text', { x: x + 9, y: TOP - 8, 'font-size': 10.5, 'font-weight': 650, fill: col, 'letter-spacing': '.04em' }, bandG).textContent = ACTIONS.areas.find((a) => a.id === id).name.toUpperCase()
})
const staticG = el('g')
const traceG = el('g')

// A path from one box to another: a straight line or a curve if nothing is in the way, otherwise
// a line with two bends that runs down a gap between the columns or the rows
const center = (d) => [d.x + BW / 2, d.y + BH / 2]
const clip = (d, dx, dy, pad = 3) => { const [cx, cy] = center(d); const t = Math.min((BW / 2 + pad) / Math.abs(dx || 1e-9), (BH / 2 + pad) / Math.abs(dy || 1e-9)); return [cx + dx * t, cy + dy * t] }
const inside = (x, y, d) => x > d.x - 2 && x < d.x + BW + 2 && y > d.y - 2 && y < d.y + BH + 2
const hitsOn = (pointAt, a, b) => { let n = 0; for (let i = 1; i < 40; i++) { const [x, y] = pointAt(i / 40); for (const d of domains) if (d !== a && d !== b && inside(x, y, d)) n++ } return n }
const gapXs = [SIDE / 2, ...columns.slice(1).map((_, c) => SIDE + (c + 1) * (BW + GAP) - GAP / 2), W - SIDE / 2]
const gapYs = Array.from({ length: ROWS }, (_, r) => TOP + (r + 1) * (BH + ROWGAP) - ROWGAP / 2)
// Lines that share a gap sit a few pixels apart, and a pair keeps the route it got first
const laneUse = {}, routeCache = {}
function route(fromId, toId) {
  const key = fromId + '>' + toId
  if (!routeCache[key]) routeCache[key] = findRoute(fromId, toId)
  return routeCache[key]
}
function findRoute(fromId, toId) {
  const a = byId[fromId], b = byId[toId]
  const [ax, ay] = center(a), [bx, by] = center(b)
  const len = Math.hypot(bx - ax, by - ay), px = -(by - ay) / len, py = (bx - ax) / len
  const cands = []
  for (const bow of [0, 0.3, -0.3, 0.55, -0.55]) {
    const cx = (ax + bx) / 2 + px * bow * len, cy = (ay + by) / 2 + py * bow * len
    const p0 = clip(a, cx - ax, cy - ay), p1 = clip(b, cx - bx, cy - by)
    const at = (t) => [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * cx + t * t * p1[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * cy + t * t * p1[1]]
    cands.push({ d: bow ? `M${p0[0]} ${p0[1]} Q${cx} ${cy} ${p1[0]} ${p1[1]}` : `M${p0[0]} ${p0[1]} L${p1[0]} ${p1[1]}`, mid: at(0.5), hits: hitsOn(at, a, b), len: len * (1 + Math.abs(bow)) })
  }
  const bent = (lane, make) => {
    const pts = make(0)
    const segs = pts.slice(1).map((p, i) => [pts[i], p, Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])])
    const total = segs.reduce((s, x) => s + x[2], 0)
    const at = (t) => { let d = t * total; for (const [p, q, l] of segs) { if (d <= l) return [p[0] + (q[0] - p[0]) * d / l, p[1] + (q[1] - p[1]) * d / l]; d -= l } return pts[pts.length - 1] }
    const [m0, m1] = [pts[1], pts[2]]
    cands.push({ d: 'M' + pts.map((p) => p.join(' ')).join(' L'), mid: [(m0[0] + m1[0]) / 2, (m0[1] + m1[1]) / 2], hits: hitsOn(at, a, b), len: total, lane, make })
  }
  for (const gx of gapXs) {
    const sx = gx > ax ? a.x + BW + 3 : a.x - 3, ex = gx > bx ? b.x + BW + 3 : b.x - 3
    bent('x' + gx, (o) => [[sx, ay + o], [gx + o, ay + o], [gx + o, by + o], [ex, by + o]])
  }
  for (const gy of gapYs) {
    const sy = gy > ay ? a.y + BH + 3 : a.y - 3, ey = gy > by ? b.y + BH + 3 : b.y - 3
    bent('y' + gy, (o) => [[ax + o, sy], [ax + o, gy + o], [bx + o, gy + o], [bx + o, ey]])
  }
  const best = cands.reduce((x, c) => (c.hits * 1000 + c.len < x.hits * 1000 + x.len ? c : x))
  if (!best.lane) return best
  const n = laneUse[best.lane] = (laneUse[best.lane] || 0) + 1
  if (n === 1) return best
  const o = (n % 2 ? -1 : 1) * 5 * Math.floor(n / 2), pts = best.make(o)
  return { d: 'M' + pts.map((p) => p.join(' ')).join(' L'), mid: [(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2] }
}
// Trace labels already drawn per pair of domains, so a second event on the same edge stacks under the first.
// An event that reaches several domains is named once, on its first edge, so the names don't pile up near the source.
const labelsOn = {}
const named = new Set()
function drawEdge(parent, from, to, k, label, cls) {
  const r = route(from, to)
  const g = el('g', { class: `${cls} k-${k}`, 'data-from': from, 'data-to': to }, parent)
  const attrs = { d: r.d, fill: 'none', stroke: colors[k], 'stroke-width': k === 'read' ? 1.4 : 1.8, 'marker-end': `url(#a-${k})` }
  if (k === 'def') attrs['stroke-dasharray'] = '6 4'
  if (k === 'read') attrs['stroke-dasharray'] = '2 3'
  el('path', attrs, g)
  if (label) {
    el('title', {}, g).textContent = `${dname(from)} to ${dname(to)}: ${label}`
    const once = from + '|' + label
    if (cls === 'tedge' && k !== 'command' && !named.has(once)) {
      named.add(once)
      // Side-by-side boxes leave no room between them, so the name goes above the pair, joined with any other name there
      const a = byId[from], b = byId[to], pair = [from, to].sort().join('|')
      const beside = a && b && a.r === b.r && Math.abs(a.c - b.c) === 1
      const prev = labelsOn[pair]
      if (beside && prev) prev.textContent += ', ' + label
      else {
        const [x, y] = beside ? [(center(a)[0] + center(b)[0]) / 2, Math.min(a.y, b.y) - 5] : [r.mid[0], r.mid[1] + 3 + (prev ? 13 * prev.stack : 0)]
        const t = el('text', { x, y, 'text-anchor': 'middle', class: 'elabel', fill: colors[k] }, g)
        t.textContent = label
        if (prev) prev.stack++
        else { labelsOn[pair] = t; t.stack = 1 }
      }
    }
  }
  return g
}
staticEdges.forEach((e) => drawEdge(staticG, e.from, e.to, e.k, e.labels.join(', '), 'sedge'))

// Gap count per domain: actions with no button, actions nobody plans, and buttons naming a missing action
const gapsFor = (id) => ({
  noBtn: noButton.filter((a) => a.domain === id),
  unplanned: ACTIONS.gaps.filter((g) => g.domain === id),
  unknown: unknownIds.filter((u) => u.split('.')[0] === id),
})
const boxEls = {}
for (const d of domains) {
  const [c, bg] = areaColor(d.area)
  const g = el('g', { class: 'box', 'data-id': d.id, tabindex: 0, role: 'button', 'aria-label': d.name })
  const body = { class: 'body', x: d.x, y: d.y, width: BW, height: BH, rx: 10, fill: bg, stroke: c, 'stroke-width': 1.4 }
  if (d.combines) Object.assign(body, { fill: '#fffdf8', 'stroke-dasharray': '6 4' })
  el('rect', body, g)
  if (!d.combines) el('rect', { x: d.x, y: d.y, width: BW, height: 5, rx: 2.5, fill: c }, g)
  el('text', { x: d.x + 10, y: d.y + 25, 'font-size': 14, 'font-weight': 650, fill: '#1d2330' }, g).textContent = d.name
  el('text', { x: d.x + 10, y: d.y + 42, 'font-size': 11, fill: '#4a5262' }, g).textContent = d.sub
  el('text', { x: d.x + 10, y: d.y + 57, 'font-size': 10, fill: c }, g).textContent = d.slice ? 'slice ' + d.slice : d.built || ''
  const gp = gapsFor(d.id), n = gp.noBtn.length + gp.unplanned.length + gp.unknown.length
  if (n) {
    const b = el('g', { class: 'gapb' }, g)
    el('circle', { cx: d.x + BW - 2, cy: d.y + 2, r: 9, fill: '#b3261e', stroke: '#fff', 'stroke-width': 2 }, b)
    el('text', { x: d.x + BW - 2, y: d.y + 5.5, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: '#fff' }, b).textContent = n
    el('title', {}, b).textContent = `${n} gaps: ${gp.noBtn.length} actions with no button, ${gp.unplanned.length} nobody plans yet, ${gp.unknown.length} buttons naming a missing action`
  }
  const sb = el('g', { class: 'stepb' }, g)
  el('circle', { cx: d.x + 2, cy: d.y + 2, r: 10, fill: '#1d2330', stroke: '#fff', 'stroke-width': 2 }, sb)
  el('text', { x: d.x + 2, y: d.y + 6, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#fff' }, sb)
  boxEls[d.id] = g
}
svg.appendChild(traceG)

/* ---------- Side panel ---------- */
const panel = document.getElementById('trace')
const tchips = (xs) => xs && xs.length ? `<div class="tchips">${xs.map((t) => `<span class="tchip">${t}</span>`).join('')}</div>` : ''
const list = (xs) => xs && xs.length ? `<ul>${xs.map((t) => `<li>${t}</li>`).join('')}</ul>` : '<p class="hint">None</p>'
const built = (a) => a.status === 'exists' ? 'in today\'s code' : a.status === 'review' ? `in review, ${a.pr}` : 'planned'
const operation = (a) => a.http ? ` · ${a.status === 'review' ? 'its' : 'today\'s'} operation <code>${a.http}</code>` : a.code ? ` · in <code>${a.code}</code>` : a.before ? ` · was part of <code>${a.before}</code>` : ''
const mode = (h) => h.mode === 'deferred' ? LATER : SAME

function clearMap() {
  traceSeq++
  svg.classList.remove('dimmed', 'tracing')
  traceG.innerHTML = ''
  for (const key in labelsOn) delete labelsOn[key]
  named.clear()
  for (const g of Object.values(boxEls)) g.classList.remove('lit', 'sel', 'r-owner', 'r-call', 'r-same', 'r-def')
  staticG.querySelectorAll('.lit').forEach((g) => g.classList.remove('lit'))
  document.querySelectorAll('.picked, .found').forEach((n) => n.classList.remove('picked', 'found'))
}

function overview() {
  clearMap()
  panel.innerHTML = `
    <h2>${domains.filter((d) => d.area !== 'app' && !d.combines).length} domains, one app</h2>
    <div class="kind">Click a button on the left to trace it, or a domain above to list its actions.</div>
    <div class="stat"><div><b>${allActions.length}</b>actions</div><div><b>${allActions.length - noButton.length}</b>have a button</div><div><b class="red">${noButton.length}</b>have none</div><div><b class="red">${unknownIds.length}</b>buttons name a missing action</div></div>
    ${APP.rules?.length ? `<h3>Rules every domain follows</h3><ul class="rules">${APP.rules.map((r) => `<li>${r}</li>`).join('')}</ul>` : ''}
    ${APP.outside ? `<h3>Outside services</h3><p>${APP.outside}</p>` : ''}`
}

// The buttons that call an action, as links that scroll to each one
const whereLinks = (id) => (usedOn[id] || []).map((n, i) => `<a data-goto="${id}" data-i="${i}">${titles[screenOf(n)]}: ${ctlText(n)}</a>`).join(', ')
const actionItem = (a) => `<li class="${usedOn[a.id] ? '' : 'nobtn'}"><span class="find" data-find="${a.id}">${a.label}</span> <code>${a.id}</code><span class="tr-link" data-trace="${a.id}">trace</span>
  <span class="where">${usedOn[a.id] ? `${usedOn[a.id].length} button${usedOn[a.id].length > 1 ? 's' : ''}: ${whereLinks(a.id)}` : '<span class="red">No button on any screen</span>'} · ${[a.actor, a.ticket, built(a)].filter(Boolean).join(' · ')}</span></li>`

function showDomain(id) {
  clearMap()
  const d = byId[id]
  if (!d) return overview()
  svg.classList.add('dimmed')
  boxEls[id].classList.add('sel')
  const own = allActions.filter((a) => a.domain === id)
  const shared = allActions.filter((a) => a.domain !== id && ((a.changes || a.touches || []).includes(id)))
  const gp = gapsFor(id)
  const sys = ACTIONS.system.filter((s) => s.domain === id)
  staticG.querySelectorAll(`[data-from="${id}"], [data-to="${id}"]`).forEach((g) => g.classList.add('lit'))
  // Publishes, reacts to, reads and calls, all derived from the actions and events
  const publishes = Object.entries(EVENTS).filter(([, ev]) => ev.from === id).map(([e, ev]) => {
    const to = [...new Map(ev.handlers.map((h) => [h.domain + h.mode, h])).values()]
    return `<b>${e}</b>. ${to.length ? to.map((h) => `${dname(h.domain)} reacts ${mode(h)}`).join('; ') : 'Nothing reacts yet'}.`
  })
  const reacts = [
    ...Object.entries(EVENTS).flatMap(([e, ev]) => ev.handlers.filter((h) => h.domain === id).map((h) => `<b>${e}</b> from ${dname(ev.from)}, ${mode(h)}. ${h.what}`)),
    ...(d.inputs || []),
  ]
  const reads = (d.reads || []).map((r) => `${dname(r.domain)}: ${r.what}`)
  const readBy = domains.filter((x) => (x.reads || []).some((r) => r.domain === id)).map((x) => `${x.name}: ${x.reads.find((r) => r.domain === id).what}`)
  const calledBy = allActions.flatMap((a) => (a.calls || []).filter((c) => c.split('.')[0] === id && a.domain !== id).map((c) => `${a.label} calls <code>${c}</code>`))
  panel.innerHTML = `
    <span class="back" data-back>&larr; Overview</span>
    <h2>${d.name}</h2><div class="kind">${d.kind || ''} ${d.slice ? `Built in slice ${d.slice}.` : d.built ? `Built in ${d.built}.` : ''}${d.note ? ` ${d.note}` : ''}</div>
    ${own.length ? `<h3>Actions</h3><ul class="acts">${own.map(actionItem).join('')}</ul>` : ''}
    ${shared.length ? `<h3>Other actions that change ${d.name}</h3><ul class="acts">${shared.map(actionItem).join('')}</ul>` : ''}
    ${gp.unknown.length ? `<h3 class="red">Buttons naming an action the backend lacks</h3><ul class="acts">${gp.unknown.map((u) => `<li><span class="find red" data-find="${u}">${u}</span><span class="tr-link" data-trace="${u}">trace</span><span class="where">${whereLinks(u)}</span></li>`).join('')}</ul>` : ''}
    ${gp.unplanned.length ? `<h3 class="red">Nobody plans this yet</h3><ul>${gp.unplanned.map((g) => `<li class="red">${g.what}<br><span class="hint">${g.reason}</span></li>`).join('')}</ul>` : ''}
    ${sys.length ? `<h3>Runs without a button</h3><ul>${sys.map((s) => `<li><code>${s.id}</code> <span class="hint">${s.what}</span></li>`).join('')}</ul>` : ''}
    <details class="more"><summary>Owns, domain events, tables and routes</summary>
      <h3>Owns</h3>${list(d.owns)}
      ${calledBy.length ? `<h3>Called by</h3>${list(calledBy)}` : ''}
      ${reads.length ? `<h3>Reads</h3>${list(reads)}` : ''}
      ${readBy.length ? `<h3>Read by</h3>${list(readBy)}` : ''}
      <h3>Publishes</h3>${list(publishes)}
      <h3>Reacts to</h3>${list(reacts)}
      <h3>Tables</h3>${tchips(d.tables) || '<p class="hint">None</p>'}
      <h3>Routes</h3>${tchips(d.routes) || '<p class="hint">None</p>'}
    </details>`
}

// Handlers that publish another domain event, found by name in what they do
const cascade = (h) => Object.keys(EVENTS).filter((e) => (h.what || '').includes(e))

function chainSteps(a) {
  const steps = []
  steps.push({ d: a.domain, role: 'owner', html: `<b>${a.label}</b> <code>${a.id}</code><div class="kind">${[a.actor, a.ticket, built(a)].filter(Boolean).join(' · ')}${operation(a)}</div>${a.note ? `<div class="kind">${a.note}</div>` : ''}` })
  for (const c of a.calls || []) {
    const d = c.split('.')[0]
    const what = ACT[c]?.label || SYS[c]?.what || ''
    steps.push({ d, owner: a.domain, role: 'call', html: `Calls ${dname(d)}: <code>${c}</code>${what ? `<div class="kind">${what}</div>` : ''}` })
  }
  // Domains a handler reaches get their own step below, so only list the rest here
  const reached = new Set()
  const walk = (e, depth) => (EVENTS[e]?.handlers || []).forEach((h) => { reached.add(h.domain); if (depth < 2) cascade(h).forEach((x) => walk(x, depth + 1)) })
  ;(a.publishes || []).forEach((e) => walk(e, 0))
  const seen = new Set(steps.map((s) => s.d))
  for (const d of a.changes || a.touches || []) if (!seen.has(d) && !reached.has(d)) { seen.add(d); steps.push({ d, role: 'call', html: `Changes ${dname(d)}` }) }
  if (a.writes && a.writes.length) steps.push({ role: 'info', html: `Writes ${a.writes.length} table${a.writes.length > 1 ? 's' : ''}${tchips(a.writes)}` })
  const addEvent = (e, depth) => {
    const ev = EVENTS[e]
    if (!ev) return steps.push({ role: 'info', html: `Publishes <b>${e}</b>` })
    if (!ev.handlers.length) return steps.push({ d: ev.from, role: 'info', html: `${dname(ev.from)} publishes <b>${e}</b>. Nothing reacts yet.` })
    for (const h of ev.handlers) {
      const def = h.mode === 'deferred'
      steps.push({ d: h.domain, from: ev.from, event: e, role: def ? 'def' : 'same', html: `${dname(ev.from)} publishes <b>${e}</b>, and ${dname(h.domain)} reacts <span class="mode${def ? ' def' : ''}">${def ? LATER : SAME}</span><div><code>${h.id}</code></div><div class="kind">${h.what}</div>${tchips(h.writes)}` })
      if (depth < 2) cascade(h).filter((x) => x !== e).forEach((x) => addEvent(x, depth + 1))
    }
  }
  for (const e of a.publishes || []) addEvent(e, 0)
  for (const o of a.outside || []) steps.push({ role: 'info', html: `Calls <b>${o.service}</b>, ${o.when === 'unstated' ? 'at a time nobody has decided' : o.when === 'after' ? 'after the transaction commits' : o.when === 'before' ? 'before the transaction' : o.when}<div class="kind">${o.what}</div>` })
  if (a.chainNote) steps.push({ role: 'info', html: `<span class="kind">${a.chainNote}</span>` })
  return steps
}

let traceSeq = 0
function trace(ids, source) {
  clearMap()
  if (source) source.classList.add('picked')
  const seq = traceSeq
  svg.classList.add('dimmed', 'tracing')
  const nums = new Map()
  const all = []
  let html = source ? `<span class="back" data-back>&larr; Overview</span><div class="src-btn">Button on ${titles[screenOf(source)]}</div><h2>${ctlText(source)}</h2>` : `<span class="back" data-back>&larr; Overview</span><h2>${ids.map((id) => ACT[id]?.label || id).join(', ')}</h2>`
  for (const id of ids) {
    const a = ACT[id]
    if (!a) {
      html += `<ol class="chain"><li class="gap on"><span class="sn">!</span><div><code>${id}</code><div class="red">No action has this name yet.</div></div></li></ol>`
      continue
    }
    if (ids.length > 1) html += `<h3>Action ${ids.indexOf(id) + 1} of ${ids.length}</h3>`
    const steps = chainSteps(a)
    steps.forEach((s) => { if (s.d && !nums.has(s.d)) nums.set(s.d, nums.size + 1) })
    html += `<ol class="chain">${steps.map((s) => `<li class="${s.role}" data-k="${all.length + steps.indexOf(s)}"><span class="sn">${s.d ? nums.get(s.d) : '·'}</span><div>${s.html}</div></li>`).join('')}</ol>`
    const others = (usedOn[id] || []).filter((n) => n !== source)
    if (others.length) html += `<p class="hint">Other buttons that call it: ${others.map((n) => `<a data-goto="${id}" data-i="${usedOn[id].indexOf(n)}">${titles[screenOf(n)]}: ${ctlText(n)}</a>`).join(', ')}</p>`
    all.push(...steps)
  }
  panel.innerHTML = html
  panel.scrollTop = 0
  // Light the chain one step after another
  const roleOf = {}
  all.forEach((s, i) => setTimeout(() => {
    if (seq !== traceSeq) return
    panel.querySelector(`li[data-k="${i}"]`)?.classList.add('on')
    if (s.d && boxEls[s.d]) {
      const g = boxEls[s.d]
      if (!roleOf[s.d]) {
        roleOf[s.d] = s.role
        g.classList.add('lit', 'r-' + (s.role === 'info' ? 'call' : s.role))
        g.querySelector('.stepb circle').setAttribute('fill', s.role === 'owner' ? '#1d2330' : s.role === 'def' ? '#d9622b' : s.role === 'same' ? '#1d2330' : '#6d4fc2')
        g.querySelector('.stepb text').textContent = nums.get(s.d)
      }
    }
    if (s.from && s.from !== s.d && boxEls[s.from] && boxEls[s.d]) {
      const k = s.role === 'def' ? 'def' : 'same'
      const g = drawEdge(traceG, s.from, s.d, k, s.event, 'tedge')
      requestAnimationFrame(() => g.classList.add('on'))
    }
    if (s.role === 'call' && s.owner && s.owner !== s.d && boxEls[s.owner] && boxEls[s.d]) {
      const g = drawEdge(traceG, s.owner, s.d, 'command', 'calls', 'tedge')
      requestAnimationFrame(() => g.classList.add('on'))
    }
  }, 140 * i))
}

function find(id, index) {
  const ns = usedOn[id] || []
  document.querySelectorAll('.found').forEach((n) => n.classList.remove('found'))
  if (!ns.length) return
  const targets = index === undefined ? ns : [ns[index]]
  targets.forEach((n) => { n.classList.remove('found'); void n.offsetWidth; n.classList.add('found') })
  targets[0].scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
}

/* ---------- Events ---------- */
document.getElementById('screensPane').addEventListener('click', (ev) => {
  const label = ev.target.closest('.act')
  if (label) {
    // Labels follow the control they describe, so walk back past any other labels to find it
    let n = label.previousElementSibling
    while (n && n.classList.contains('act')) n = n.previousElementSibling
    return trace([label.dataset.actionLabel], n && n.dataset.action ? n : null)
  }
  const c = ev.target.closest('[data-action]')
  if (c) trace(c.dataset.action.split(' '), c)
})
document.getElementById('screensPane').addEventListener('keydown', (ev) => {
  if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.dataset?.action) { ev.preventDefault(); trace(ev.target.dataset.action.split(' '), ev.target) }
})
panel.addEventListener('click', (ev) => {
  const t = ev.target
  if (t.closest('[data-back]')) return overview()
  if (t.dataset.find) return find(t.dataset.find)
  if (t.dataset.trace) return trace([t.dataset.trace], null)
  if (t.dataset.goto) return find(t.dataset.goto, +t.dataset.i)
  if (t.dataset.tabLink) { ev.preventDefault(); return showTab(t.dataset.tabLink) }
})
svg.addEventListener('click', (ev) => {
  const g = ev.target.closest('.box')
  g ? showDomain(g.dataset.id) : overview()
})
svg.addEventListener('keydown', (ev) => {
  if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.dataset?.id) { ev.preventDefault(); showDomain(ev.target.dataset.id) }
})
document.getElementById('showLabels').addEventListener('change', (ev) => { document.body.classList.toggle('hide-actions', !ev.target.checked); markAllFrames() })

function showTab(name) {
  document.querySelectorAll('.apptabs button').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === name))
  document.querySelectorAll('.tab').forEach((s) => (s.hidden = s.id !== 'tab-' + name))
}
document.querySelectorAll('.apptabs button').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)))
// Links from other tabs into the map
document.body.addEventListener('click', (ev) => {
  const t = ev.target.closest('[data-map-trace], [data-map-find], [data-map-screen], [data-domain]')
  if (!t) return
  ev.preventDefault()
  showTab('map')
  if (t.dataset.domain) return showDomain(t.dataset.domain)
  if (t.dataset.mapTrace) trace([t.dataset.mapTrace], null)
  if (t.dataset.mapFind) { trace([t.dataset.mapFind], usedOn[t.dataset.mapFind]?.[0]); find(t.dataset.mapFind, 0) }
  if (t.dataset.mapAct) {
    // The button for this action on this screen, so a flow step traces the button it names
    const ns = usedOn[t.dataset.mapAct] || []
    const i = Math.max(0, ns.findIndex((n) => screenOf(n) === t.dataset.mapScreen))
    trace([t.dataset.mapAct], ns[i] || null)
    find(t.dataset.mapAct, i)
  } else if (t.dataset.mapScreen) document.getElementById(t.dataset.mapScreen).scrollIntoView({ block: 'start' })
})
document.body.addEventListener('keydown', (ev) => {
  if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches?.('.step[data-map-screen]')) { ev.preventDefault(); ev.target.click() }
})
