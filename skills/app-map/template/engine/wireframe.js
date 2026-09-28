// The action index and the wireframe helpers every screen file uses.

/* ---------- Action index ---------- */
const ACT = {}
ACTIONS.domains.forEach((d) => d.actions.forEach((a) => (ACT[a.id] = { ...a, domain: d.id })))
const SYS = Object.fromEntries(ACTIONS.system.map((s) => [s.id, s]))
const EVENTS = ACTIONS.events || {}

/* ---------- Wireframe helpers ---------- */
// A(id): the label that names the backend action a control calls
const A = (id) => `<code class="act${ACT[id] ? '' : ' unknown'}" data-action-label="${id}" title="${id}">${id}</code>`
const widths = ['62%', '48%', '71%', '55%', '40%', '66%', '52%', '58%', '45%']
const bar = (w, cls = '') => `<i class="bar ${cls}" style="width:${w}"></i>`
// btn(text, primary, actions): a button, and the space-separated backend actions it calls
// A control and its action labels sit in one .ctl so the labels wrap with the control, never apart from it
const ctl = (control, ids) => `<span class="ctl">${control}${ids.map(A).join('')}</span>`
const btn = (t, primary, action) => action ? ctl(`<span class="btn${primary ? ' primary' : ''}" data-action="${action}">${t}</span>`, action.split(' ')) : `<span class="btn${primary ? ' primary' : ''}">${t}</span>`
// on(html, ...ids): mark any other control, such as a row link, checkbox, or field, as calling one or more actions
const on = (html, ...ids) => ctl(`<span data-action="${ids.join(' ')}">${html}</span>`, ids)
const pin = (n) => `<b class="pin">${n}</b>`
const chip = (t, on) => `<span class="chip${on ? ' on' : ''}">${t}</span>`
const field = (t = '', w) => `<i class="field"${w ? ` style="width:${w}"` : ''}>${t}</i>`
const lab = (t) => `<span class="lab">${t}</span>`
const menu = (style, items) => `<div class="menu" style="${style}">${items.map((i) => `<div>${i}</div>`).join('')}</div>`

function cell(k, i) {
  if (k.startsWith('=')) return `<span class="t">${k.slice(1)}</span>`
  if (k.startsWith('#')) return `<span class="t r">${k.slice(1)}</span>`
  switch (k) {
    case 't': return `<span>${bar(widths[i % 9])}</span>`
    case 'n': return `<span class="r">${bar(['42%', '30%', '50%'][i % 3])}</span>`
    case 's': return `<span><i class="dot${i % 2 ? ' f' : ''}"></i>${bar('46%')}</span>`
    case 'c': return `<span class="r"><i class="chk${i % 3 ? ' on' : ''}"></i></span>`
    case 'x': return `<span><i class="chk${i % 2 ? '' : ' on'}"></i></span>`
    case 'a': return `<span class="r">···</span>`
    case 'in': return `<span class="r"><i class="field" style="min-width:44px">&nbsp;</i></span>`
    case 'p': return `<span class="row" style="flex-wrap:nowrap"><i class="av"></i>${bar('55%')}</span>`
    default: return `<span>${k}</span>`
  }
}
// cols: [{h, k, w}], rows: number or array of per-row overrides; opts: head, sel, foot, seed, voided
function table(cols, rows, opts = {}) {
  const tpl = cols.map((c) => c.w || '1fr').join(' ')
  const head = opts.head === false ? '' :
    `<div class="tr th" style="grid-template-columns:${tpl}">${cols.map((c) => `<span class="${c.k === 'n' || c.k === 'in' || c.k === 'c' || (c.k || '').startsWith('#') ? 'r' : ''}">${c.h}</span>`).join('')}</div>`
  const list = typeof rows === 'number' ? Array.from({ length: rows }, () => null) : rows
  const body = list.map((ov, i) =>
    `<div class="tr${opts.sel === i ? ' sel' : ''}${opts.voided === i ? ' void' : ''}" style="grid-template-columns:${tpl}">${cols.map((c, j) => cell(ov && ov[j] !== undefined ? ov[j] : c.k, i + j + (opts.seed || 0))).join('')}</div>`).join('')
  const foot = opts.foot ? `<div class="tr tf" style="grid-template-columns:${tpl}">${opts.foot}</div>` : ''
  return `<div class="tbl">${head}${body}${foot}</div>`
}

// shell(active, main): a desktop page with the APP.nav sidebar. solo(main): a page with no menu.
const shell = (active, main) => `<div class="wf desk"><aside><i class="logo"></i><div class="nav">${APP.nav.map((n) => `<span class="${n === active ? 'on' : ''}">${n}</span>`).join('')}</div><div class="acct"><i class="av"></i>${bar('50%')}</div></aside><main>${main}</main></div>`
const solo = (main) => `<div class="wf solo">${main}</div>`
// head({ crumb, title, meta, tabs, on, p }): the top of a detail page, with a back link, a title, a meta line and tabs
const head = (o) => `${o.crumb ? `<div class="crumb">&larr; ${o.crumb}</div>` : ''}<div class="etitle">${o.title}${o.p ? ' ' + pin(o.p) : ''}</div>${o.meta ? `<div class="meta">${o.meta}</div>` : ''}${o.tabs ? `<div class="tabs">${o.tabs.map((t) => `<span class="${t === o.on ? 'on' : ''}">${t}</span>`).join('')}</div>` : ''}`

// phone(title, body, { back, act, tab, noTabs }): a phone frame with the APP.phoneNav bar. tab names the lit item.
const phone = (title, body, o = {}) => `<div class="wf ph"><div class="ptop"><span>${o.back ? '&larr;' : ''}</span><b>${title}</b><span>${o.act || ''}</span></div><div class="pbody">${body}</div>${o.noTabs ? '' : `<div class="ptabs">${APP.phoneNav.map((t) => `<span class="${t === ((APP.phoneMore || []).includes(o.tab) ? 'More' : o.tab || APP.phoneNav[0]) ? 'on' : ''}">${t}</span>`).join('')}</div>`}</div>`
const prows = (n, o = 0, trail = '<i class="dot"></i>') => Array.from({ length: n }, (_, i) => `<div class="prow"><i class="dsq"></i><span>${bar(widths[(i + o) % 9])}<br>${bar('36%', 'lt')}</span>${trail}</div>`).join('')
const pchips = (tabs, on) => `<div class="pchips">${tabs.map((t) => chip(t, t === on)).join('')}</div>`

/* ---------- Screens ---------- */
// Each file in data/screens pushes screens here: { id, title, purpose, desk, desk2, phone, phones, notes, questions }.
// A pin(n) in a frame points at notes[n - 1].
// placeholder: 1 marks a screen added so every action has a button. Nobody has reviewed those.
// domain names the domain behind a screen that has no buttons, so the screen still gets a build status.
const S = []
