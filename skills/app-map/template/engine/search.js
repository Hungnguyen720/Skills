// Search in the top bar. It finds screens, buttons and their actions, domains, tables, domain events,
// system actions and words, and opens what you pick. Press / to jump to the box.

const plain = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const ownerOfTable = Object.fromEntries(ACTIONS.domains.flatMap((d) => (d.tables || []).map((t) => [t, d.id])))
const openScreen = (id) => { showTab('map'); document.getElementById(id).scrollIntoView({ block: 'start' }) }
const openAction = (id) => {
  showTab('map')
  const n = usedOn[id]?.[0] || null
  trace([id], n)
  if (n) find(id, 0)
}
const openDomain = (id) => { showTab('map'); showDomain(id) }
const openWord = (i) => {
  showTab('words')
  const row = document.getElementById('word-' + (i + 1))
  row.scrollIntoView({ block: 'center' })
  row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash')
}

// Each entry: what kind it is, its name, a line under it, the text search matches, and what picking it does
const index = [
  ...S.map((s) => ({ kind: 'Screen', name: s.title, sub: plain(s.purpose), text: `${s.id} ${plain(s.purpose)}`, go: () => openScreen(s.id) })),
  ...allActions.map((a) => {
    const buttons = [...new Set((usedOn[a.id] || []).map(ctlText))]
    return { kind: 'Action', name: a.label, sub: `${a.id} · ${dname(a.domain)} · ${stateWord[a.status]}${buttons.length ? ` · button: ${buttons.join(', ')}` : ' · no button'}`, text: `${a.id} ${buttons.join(' ')}`, go: () => openAction(a.id) }
  }),
  ...domains.map((d) => ({ kind: 'Domain', name: d.name, sub: d.sub, text: `${d.id} ${(d.owns || []).join(' ')}`, go: () => openDomain(d.id) })),
  ...Object.entries(ownerOfTable).map(([t, d]) => ({ kind: 'Table', name: t, sub: `owned by ${dname(d)}`, text: t.replace(/_/g, ' '), go: () => openDomain(d) })),
  ...Object.entries(EVENTS).map(([e, ev]) => ({ kind: 'Event', name: e, sub: `published by ${dname(ev.from)}, handled by ${[...new Set(ev.handlers.map((h) => dname(h.domain)))].join(', ')}`, text: e.replace(/([a-z])([A-Z])/g, '$1 $2'), go: () => openDomain(ev.from) })),
  ...ACTIONS.system.map((x) => ({ kind: 'System', name: x.id, sub: plain(x.what), text: '', go: () => openDomain(x.domain) })),
  ...words.map((w, i) => ({ kind: 'Word', name: w.use, sub: `${w.thing}${w.not ? `. Not ${w.not}` : ''}`, text: w.docs, go: () => openWord(i) })),
]
index.forEach((e) => { e.nameL = e.name.toLowerCase(); e.all = `${e.name} ${e.sub} ${e.text}`.toLowerCase() })

// Every word of the query must match. Names that start with the query come first, then names that contain it.
function search(q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  const score = (e) => {
    if (!terms.every((t) => e.all.includes(t))) return -1
    const joined = terms.join(' ')
    return e.nameL.startsWith(joined) ? 3 : e.nameL.includes(joined) ? 2 : terms.every((t) => e.nameL.includes(t)) ? 1 : 0
  }
  return index.map((e) => [e, score(e)]).filter(([, s]) => s >= 0).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([e]) => e)
}

const box = document.getElementById('search'), out = document.getElementById('searchOut'), combo = box.closest('.search')
let results = [], at = 0
const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
function render() {
  const open = !!box.value.trim()
  out.hidden = !open
  combo.setAttribute('aria-expanded', open)
  if (!open) return
  out.innerHTML = results.length
    ? results.map((e, i) => `<div role="option" class="hit${i === at ? ' at' : ''}" data-i="${i}" aria-selected="${i === at}"><span class="hk k-${e.kind.toLowerCase()}">${e.kind}</span><b>${esc(e.name)}</b><small>${esc(e.sub)}</small></div>`).join('')
    : '<div class="nohit">Nothing matches.</div>'
  out.querySelector('.at')?.scrollIntoView({ block: 'nearest' })
}
function pick(i) {
  const e = results[i]
  if (!e) return
  out.hidden = true
  combo.setAttribute('aria-expanded', false)
  box.blur()
  e.go()
}
box.addEventListener('input', () => { results = search(box.value); at = 0; render() })
box.addEventListener('focus', () => { if (box.value.trim()) render() })
box.addEventListener('keydown', (ev) => {
  if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
    ev.preventDefault()
    if (results.length) at = (at + (ev.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length
    render()
  } else if (ev.key === 'Enter') { ev.preventDefault(); pick(at) }
  else if (ev.key === 'Escape') { box.value = ''; results = []; render(); box.blur() }
})
out.addEventListener('mousedown', (ev) => { const h = ev.target.closest('.hit'); if (h) { ev.preventDefault(); pick(+h.dataset.i) } })
box.addEventListener('blur', () => setTimeout(() => { out.hidden = true; combo.setAttribute('aria-expanded', false) }, 100))
document.addEventListener('keydown', (ev) => {
  if (ev.key === '/' && !ev.target.closest('input, textarea, [contenteditable]')) { ev.preventDefault(); box.focus(); box.select() }
})
