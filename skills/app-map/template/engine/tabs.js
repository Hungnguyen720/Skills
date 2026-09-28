// The other tabs: architecture, jobs and flows, words and gaps. Then deep links.

/* ---------- Architecture ---------- */
// From APP.arch. A layer with domains: true lists the domains from actions.js, so a new domain shows up on its own.
const areaOf = (id) => ACTIONS.areas.findIndex((a) => a.id === id)
const domainPills = () => ACTIONS.domains.filter((d) => d.area !== 'app' && !d.combines)
  .map((d) => `<span class="pill" style="background:${areaColor(d.area)[1]};border-color:${areaColor(d.area)[0]}40" title="${d.sub}">${d.id}${d.built ? `<small>${d.built}</small>` : ''}</span>`).join('\n')
const appPills = () => (byId.app?.actions || []).map((a) => `<span class="pill">${a.label}${a.status === 'exists' ? '' : `<small>${stateWord[a.status]}</small>`}</span>`).join('\n')
const pills = (xs) => (xs || []).map((t) => `<span class="pill">${t}</span>`).join('')
const arch = APP.arch || {}
const layers = arch.layers?.length ? arch.layers : [{ name: 'Domains', where: 'The stack is not decided yet.', domains: true }]
document.getElementById('archOut').innerHTML = `<div class="arch"><div>${layers.map((l, i) => `
  ${i ? `<div class="down">${l.via || ''}</div>` : ''}
  <div class="layer"><h2>${l.name}</h2>${l.where ? `<div class="where">${l.where}</div>` : ''}
    ${l.items?.length ? `<div class="row" style="margin-top:8px">${pills(l.items)}</div>` : ''}
    ${l.domains ? `<div class="sub"><h3>Domains</h3><div class="row">${domainPills()}</div>${byId.app ? `<h3 style="margin-top:10px">Commands across domains</h3><div class="row">${appPills()}</div>` : ''}</div>` : ''}
    ${l.note ? `<p class="note">${l.note}</p>` : ''}</div>`).join('')}</div>
  ${arch.outside?.length ? `<aside class="ext"><h2>Outside services</h2>${arch.outside.map((o) => `<div class="card"><b>${o.name}</b><span>${o.what}</span></div>`).join('')}</aside>` : ''}</div>
  ${arch.strips?.length ? `<div class="strips">${arch.strips.map((x) => `<div class="strip"><h2>${x.title}</h2>${x.html}</div>`).join('')}</div>` : ''}`

/* ---------- Tour: jobs, places and journeys ---------- */
document.getElementById('jobWho').textContent = `${APP.user || 'The user'} wants to`
document.querySelector('#jobTable tbody').innerHTML = (APP.jobs || []).map((j) => `<tr>${j.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('') || '<tr><td colspan="3">No jobs yet.</td></tr>'
document.getElementById('mapGroups').innerHTML = mapGroups.map((g) => `<div class="group"><b>${g.t}</b><p>${g.p}</p>${g.n.map(([a, b]) => `<div class="node">${a}${b ? `<small>${b}</small>` : ''}</div>`).join('')}</div>`).join('')
document.getElementById('mapLinks').innerHTML = links.map(([a, b, c]) => `<div><b>${a}</b> &rarr; <b>${b}</b><br><span style="color:var(--muted)">${c}</span></div>`).join('')
const stepAttrs = (at, act) => at ? ` data-map-screen="${at}"${act ? ` data-map-act="${act}"` : ''} tabindex="0" title="${act ? `Trace ${ACT[act]?.label || act} on ${titles[at]}` : `Open ${titles[at]}`}"` : ''
document.getElementById('flows').innerHTML = flows.map((f) => `<div class="flowblock"><h4>${f.t} <small>· ${f.w}</small></h4><div class="flow">${f.s.map(([a, b, at, act], i) => `${i ? '<span class="arrow">&rarr;</span>' : ''}<div class="step${at ? ' go' : ''}"${stepAttrs(at, act)}><b>${i + 1}. ${a}</b>${b}${act ? `<span class="step-act">${ACT[act]?.label || act}</span>` : ''}</div>`).join('')}</div></div>`).join('')

/* ---------- Words ---------- */
// The data is in words.js. Each word also shows on the screens it names.
document.querySelector('#wordTable tbody').innerHTML = words.map((w, i) => `<tr id="word-${i + 1}"><td><b>W${i + 1}</b></td><td>${w.thing}</td><td>${w.docs}</td><td><b>${w.use}</b></td><td>${w.why}</td><td>${w.status}</td><td>${w.screens.map((id) => `<a href="#${id}" data-map-screen="${id}">${titles[id]}</a>`).join(', ')}</td></tr>`).join('')
document.querySelector('#conflictTable tbody').innerHTML = (conflicts.map(([a, b, c]) => `<tr><td>${a}</td><td>${b}</td><td>${c}</td></tr>`).join('') || '<tr><td colspan="3">None.</td></tr>')

/* ---------- Gaps ---------- */
const placeholders = S.filter((s) => s.placeholder)
const nState = (k) => S.filter((s) => stateOf[s.id].st === k).length, nAct = (k) => allActions.filter((a) => a.status === k).length
document.getElementById('buildStats').innerHTML = `
  <div><b>${nState('exists')} of ${S.length}</b>screens built</div>
  <div><b>${nState('review')}</b>screens in review</div>
  <div><b>${nAct('exists')} of ${allActions.length}</b>actions built</div>
  <div><b>${nAct('review')}</b>actions in review</div>`
const gapTotal = noButton.length + unknownIds.length + ACTIONS.gaps.length
document.getElementById('gapCount').textContent = gapTotal
document.getElementById('gapStats').innerHTML = `
  <div><b class="red">${unknownIds.length}</b>buttons name a missing action</div>
  <div><b class="red">${noButton.length}</b>actions have no button</div>
  <div><b class="red">${ACTIONS.gaps.length}</b>actions nobody plans</div>
  <div><b>${placeholders.length}</b>placeholder screens</div>
  <div><b>${ACTIONS.system.length}</b>system actions</div>`
document.querySelector('#gapUnknown tbody').innerHTML = unknownIds.map((id) => `<tr class="none"><td><a href="#" data-map-find="${id}"><code>${id}</code></a></td><td>${[...new Set(usedOn[id].map((n) => titles[screenOf(n)]))].join(', ')}</td></tr>`).join('') || '<tr><td colspan="2">None</td></tr>'
document.querySelector('#gapNoBtn tbody').innerHTML = noButton.map((a) => `<tr class="none"><td>${a.label}</td><td><a href="#" data-map-trace="${a.id}"><code>${a.id}</code></a></td><td>${a.note || ''}</td></tr>`).join('') || '<tr><td colspan="3">None. Every action has a button.</td></tr>'
document.querySelector('#gapUnplanned tbody').innerHTML = ACTIONS.gaps.map((g) => `<tr><td>${dname(g.domain)}</td><td>${g.what}</td><td>${g.reason}</td></tr>`).join('')
document.querySelector('#gapPlaceholders tbody').innerHTML = placeholders.map((s) => {
  const ids = [...new Set([...document.getElementById(s.id).querySelectorAll('[data-action]')].flatMap((n) => n.dataset.action.split(' ')))]
  return `<tr><td><a href="#" data-map-screen="${s.id}">${s.title}</a></td><td>${ids.map((id) => `<code>${id}</code>`).join(' ')}</td></tr>`
}).join('')
document.querySelector('#gapSystem tbody').innerHTML = ACTIONS.system.map((x) => `<tr><td>${dname(x.domain)}</td><td><code>${x.id}</code></td><td>${x.what}</td></tr>`).join('')

/* ---------- Start ---------- */
// Deep links: #mode=status, #tab=words, #trace=app.buyForEvents, #find=team.invite, #domain=design, or a screen id.
// Old tab links keep working: #tab=jobs opens Tour, #tab=gaps opens Status, and a removed tab opens Browse.
const modeTabs = { browse: 'map', tour: 'jobs', status: 'gaps' }
function openHash() {
  const h = decodeURIComponent(location.hash.slice(1))
  const [k, v] = h.split('=')
  if (k === 'mode') return showTab(modeTabs[v] || 'map')
  if (k === 'tab') return showTab(document.getElementById('tab-' + v) ? v : 'map')
  if (['trace', 'find', 'domain'].includes(k)) showTab('map')
  if (k === 'trace') { trace(v.split(','), usedOn[v]?.[0] || null); usedOn[v]?.[0]?.scrollIntoView({ block: 'center', inline: 'nearest' }) }
  else if (k === 'find') { trace([v], usedOn[v]?.[0] || null); find(v) }
  else if (k === 'domain') showDomain(v)
}
overview()
openHash()
window.addEventListener('hashchange', openHash)
