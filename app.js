/* Finanzas · app web instalable (PWA). Sin dependencias: HTML + JS puro. */
'use strict';

// ------------------------------------------------------------------ utilidades
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => (n < 0 ? '−' : '') + '$' + Math.abs(Math.round(n || 0)).toLocaleString('es-CO');
const short = n => {
  const a = Math.abs(n || 0), s = n < 0 ? '−' : '';
  if (a >= 1e6) return s + '$' + (a / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace('.', ',') + ' M';
  if (a >= 1e3) return s + '$' + Math.round(a / 1e3) + ' mil';
  return s + '$' + Math.round(a);
};
const pct = (n, d = 0) => ((n || 0) * 100).toFixed(d).replace('.', ',') + '%';
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const uid = () => 'mv-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
const pad2 = n => String(n).padStart(2, '0');
const isoOf = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const todayIso = () => isoOf(new Date());
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const PALETA = ['#f46524', '#f7cb4d', '#26a69a', '#8bc34a', '#7fa6c9', '#b388d9', '#ec7fa9', '#a1887f', '#4dd0e1', '#7986cb', '#d4b483', '#9aa0a6'];

const ICONS = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  pie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20zM12 10v4M12 17h.01"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-15.5 6.2M3 12A9 9 0 0 1 18.5 5.8M18.5 2v4h-4M5.5 22v-4h4"/></svg>',
};

// ------------------------------------------------------------------ estado y almacenamiento
const store = {
  get(k, d) { try { const v = localStorage.getItem('fin.' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('fin.' + k, JSON.stringify(v)); } catch { /* almacenamiento lleno o bloqueado */ } },
  del(k) { try { localStorage.removeItem('fin.' + k); } catch { /* nada */ } },
};

const S = {
  cfg: store.get('cfg', null),            // {url, key, demo}
  config: null,                           // listas y año
  months: {},                             // cache por mes
  year: null,
  view: 'registrar',
  mes: null,                              // mes que se está viendo
  queue: store.get('queue', []),
  loading: false, offline: false, stamp: null, flushing: false,
  entry: { digits: '', cat: null, tipo: 'Gasto', cuenta: store.get('cuenta', ''), fecha: todayIso(), concepto: '' },
};
const cache = store.get('cache', null);
if (cache) { S.config = cache.config; S.months = cache.months || {}; S.year = cache.year; S.stamp = cache.stamp; }

function persist() {
  store.set('cache', { config: S.config, months: S.months, year: S.year, stamp: S.stamp });
  store.set('queue', S.queue);
}

// ------------------------------------------------------------------ API (Apps Script o modo demo)
class ApiError extends Error { constructor(m, network) { super(m); this.network = !!network; } }

async function api(action, data = {}) {
  if (S.cfg?.demo) return demoApi(action, data);
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 30000);
  let r;
  try {
    r = await fetch(S.cfg.url, {
      method: 'POST', redirect: 'follow', signal: ctl.signal,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },        // evita la petición previa (CORS) de Google
      body: JSON.stringify({ token: S.cfg.key, action, ...data }),
    });
  } catch (e) {
    if (e.name === 'AbortError') throw new ApiError('La hoja tardó demasiado en responder. Inténtalo de nuevo.', true);
    if (navigator.onLine === false) throw new ApiError('Sin internet', true);
    throw new ApiError('No se pudo hablar con el script. Revisa que la implementación tenga acceso «Cualquier persona», que la URL termine en /exec y que sea la implementación más reciente.', true);
  } finally { clearTimeout(t); }
  let j;
  try { j = await r.json(); } catch { throw new ApiError('La URL no responde como se esperaba. Revisa la URL de la implementación.', false); }
  if (!j.ok) throw new ApiError(j.error === 'unauthorized' ? 'La clave no coincide con la del script' : (j.error || 'Error desconocido'), false);
  return j;
}

// ------------------------------------------------------------------ carga de datos
const nowMes = () => S.config?.mesActual || MESES[new Date().getMonth()];

async function loadAll(force = false) {
  if (!S.cfg) return;
  S.loading = true; render();
  try {
    const mes = S.mes || nowMes();
    const r = await api('bootstrap', { mes });
    S.config = r.config; S.months[r.month.mes] = r.month; S.mes = S.mes || r.month.mes;
    S.stamp = Date.now(); S.offline = false;
    if (!S.entry.cuenta && S.config.cuentas.length) S.entry.cuenta = '';
    persist();
  } catch (e) {
    S.offline = !!e.network;
    toast(e.message, true);
  }
  S.loading = false; render();
  flushQueue();
}

async function loadMonth(mes) {
  S.mes = mes; render();
  try { const r = await api('month', { mes }); S.months[mes] = r.month; S.offline = false; persist(); }
  catch (e) { S.offline = !!e.network; if (!S.months[mes]) toast(e.message, true); }
  render();
}

async function loadYear() {
  try { const r = await api('year'); S.year = r.year; S.offline = false; persist(); }
  catch (e) { S.offline = !!e.network; if (!S.year) toast(e.message, true); }
  if (S.view === 'anio') render();
}

async function refresh() {
  if (S.cfg?.demo) return render();
  await Promise.all([loadMonth(S.mes || nowMes()), S.view === 'anio' ? loadYear() : Promise.resolve()]);
}

// ------------------------------------------------------------------ cola sin conexión
async function flushQueue() {
  if (S.flushing || !S.cfg) return;
  S.flushing = true;
  let enviados = 0;
  try {
    for (const op of S.queue.filter(o => !o.error)) {
      try {
        await api('add', op.data);
        S.queue = S.queue.filter(o => o !== op); enviados++; persist();
      } catch (e) {
        if (e.network) { S.offline = true; break; }
        op.error = e.message; persist();
      }
    }
  } finally { S.flushing = false; }
  if (enviados) { toast(`✓ ${enviados} ${enviados === 1 ? 'movimiento sincronizado' : 'movimientos sincronizados'}`); await refresh(); }
  else render();
}
window.addEventListener('online', () => flushQueue());
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.cfg) { flushQueue(); if (Date.now() - (S.stamp || 0) > 60000) refresh(); } });

// ------------------------------------------------------------------ interfaz base
let toastT;
function toast(msg, bad) {
  const t = $('#toast'); t.textContent = msg; t.className = 'show' + (bad ? ' bad' : '');
  clearTimeout(toastT); toastT = setTimeout(() => t.className = '', 2600);
}
const buzz = () => { try { navigator.vibrate?.(12); } catch { /* sin vibración */ } };

const TABS = [['registrar', 'Registrar', ICONS.plus], ['resumen', 'Resumen', ICONS.pie], ['fijos', 'Fijos', ICONS.check],
  ['anio', 'Año', ICONS.chart], ['historial', 'Historial', ICONS.list]];

function renderTop() {
  const m = S.mes || nowMes(), yr = S.config?.year || new Date().getFullYear();
  const i = MESES.indexOf(m);
  const pend = S.queue.length;
  $('#top').innerHTML = `
    <button class="ibtn" data-a="prev" aria-label="Mes anterior" ${i <= 0 ? 'disabled style="opacity:.3"' : ''}>${ICONS.left}</button>
    <div class="month"><b>${m}</b><small>${yr}</small></div>
    <button class="ibtn" data-a="next" aria-label="Mes siguiente" ${i >= 11 ? 'disabled style="opacity:.3"' : ''}>${ICONS.right}</button>
    ${pend ? `<button class="pill warn" data-a="goQueue">${ICONS.refresh.replace('<svg', '<svg width="13" height="13"')}${pend}</button>` : S.offline ? '<span class="pill bad">Sin conexión</span>' : S.cfg?.demo ? '<span class="pill">Demo</span>' : ''}
    <button class="ibtn" data-a="settings" aria-label="Ajustes">${ICONS.gear}</button>`;
}

function renderNav() {
  $('#nav').innerHTML = TABS.map(([k, l, ic]) => `<button data-a="tab" data-k="${k}" class="${S.view === k ? 'on' : ''}" aria-label="${l}">${ic}${l}</button>`).join('');
}

function render() {
  if (!S.cfg) { $('#top').innerHTML = ''; $('#nav').innerHTML = ''; return renderSetup(); }
  renderTop(); renderNav();
  const v = $('#view');
  const m = S.months[S.mes || nowMes()];
  const scroll = v.scrollTop;
  if (!m || !S.config) { v.innerHTML = '<div class="sk"></div><div class="sk"></div><div class="sk"></div>'; return; }
  const fn = { registrar: vRegistrar, resumen: vResumen, fijos: vFijos, anio: vAnio, historial: vHistorial }[S.view];
  v.innerHTML = fn(m);
  if (S.view !== 'registrar') v.scrollTop = scroll;
}

// ------------------------------------------------------------------ gráficos SVG
function donut(items, total, centerLabel) {
  const R = 62, C = 2 * Math.PI * R; let off = 0;
  const arcs = items.map((it, i) => {
    const len = total > 0 ? it.v / total * C : 0;
    const a = `<circle r="${R}" cx="80" cy="80" fill="none" stroke="${it.c}" stroke-width="20" stroke-dasharray="${Math.max(len - 2, 0)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 80 80)"/>`;
    off += len; return a;
  }).join('');
  return `<svg viewBox="0 0 160 160" width="168" height="168" style="display:block;margin:0 auto">
    <circle r="${R}" cx="80" cy="80" fill="none" stroke="#1a1e26" stroke-width="20"/>${arcs}
    <text x="80" y="76" text-anchor="middle" fill="#8d96a6" font-size="10.5" font-weight="600">${esc(centerLabel)}</text>
    <text x="80" y="96" text-anchor="middle" fill="#e9ecf1" font-size="17" font-weight="700">${esc(short(total))}</text></svg>`;
}

function groupedBars(meses, keys, colors, w = 340, h = 150) {
  const max = Math.max(1, ...meses.flatMap(m => keys.map(k => m[k] || 0)));
  const gw = w / meses.length, bw = Math.min(7, (gw - 6) / keys.length);
  const cut = S.year?.corteN || 12;
  let out = '';
  for (let g = 0; g < 4; g++) { const y = 8 + (h - 30) * g / 3; out += `<line x1="0" x2="${w}" y1="${y}" y2="${y}" stroke="#1d222c"/>`; }
  meses.forEach((m, i) => {
    const x0 = i * gw + (gw - bw * keys.length - (keys.length - 1) * 1.5) / 2;
    keys.forEach((k, j) => {
      const v = Math.max(0, m[k] || 0), bh = v / max * (h - 38);
      out += `<rect x="${x0 + j * (bw + 1.5)}" y="${h - 22 - bh}" width="${bw}" height="${Math.max(bh, v > 0 ? 1.5 : 0)}" rx="2" fill="${colors[j]}" opacity="${i + 1 > cut ? .35 : 1}"/>`;
    });
    out += `<text x="${i * gw + gw / 2}" y="${h - 6}" text-anchor="middle" fill="${i + 1 === cut ? '#e9ecf1' : '#5d6575'}" font-size="9.5" font-weight="${i + 1 === cut ? 700 : 500}">${m.mes.slice(0, 3)}</text>`;
  });
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="display:block">${out}</svg>`;
}

function sparkline(vals, w = 340, h = 70, color = '#8fb0c9') {
  const max = Math.max(0.01, ...vals), n = vals.length;
  const pts = vals.map((v, i) => [10 + i * (w - 20) / (n - 1), h - 10 - (v / max) * (h - 22)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="display:block"><path d="${d}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${vals[i] > 0 ? 3 : 2}" fill="${vals[i] > 0 ? color : '#2a303c'}"/>`).join('')}</svg>`;
}

const catColor = n => { const i = (S.config?.categorias || []).findIndex(c => c.n === n); return PALETA[(i < 0 ? 9 : i) % PALETA.length]; };
const barClass = r => r > 1 ? 'bad' : r > .8 ? 'warn' : '';

// ------------------------------------------------------------------ vista: registrar
function fechaLabel(iso) {
  const hoy = todayIso(); const ay = new Date(); ay.setDate(ay.getDate() - 1);
  if (iso === hoy) return 'Hoy'; if (iso === isoOf(ay)) return 'Ayer';
  const [y, m, d] = iso.split('-').map(Number); return `${d} ${MESES[m - 1].slice(0, 3).toLowerCase()}`;
}
function vRegistrar() {
  const e = S.entry, cats = S.config.categorias, v = Number(e.digits || 0);
  const transf = e.tipo === 'Transferencia';
  return `
  <div class="amount"><div class="cur num ${v ? '' : 'empty'}"><small>$</small>${v ? v.toLocaleString('es-CO') : '0'}</div></div>
  <div class="seg"><button data-a="tipo" data-k="Gasto" class="${!transf ? 'on' : ''}">Gasto</button>
    <button data-a="tipo" data-k="Transferencia" class="${transf ? 'on' : ''}">Transferencia</button></div>
  ${transf ? `<div class="card small muted" style="padding:12px 14px">Mover dinero entre tus cuentas <b style="color:var(--tx)">no cuenta como gasto</b>. Queda registrado, pero no afecta tus indicadores.</div>` :
    `<div class="chips">${cats.map(c => `<button class="chip ${e.cat === c.n ? 'on' : ''}" style="--c:${catColor(c.n)}" data-a="cat" data-k="${esc(c.n)}"><i class="dot" style="background:${catColor(c.n)}"></i><span>${esc(c.n)}</span></button>`).join('')}</div>`}
  <div class="opts">
    <label class="sel"><small>Fecha</small><b>${fechaLabel(e.fecha)}</b><input type="date" data-a="fecha" value="${e.fecha}" max="${S.config.year}-12-31" min="${S.config.year}-01-01"></label>
    <label class="sel"><small>Cuenta</small><b>${esc(e.cuenta || 'Sin cuenta')}</b><select data-a="cuenta"><option value="">Sin cuenta</option>${S.config.cuentas.map(c => `<option ${c === e.cuenta ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
    <label class="sel"><small>Mes en hoja</small><b>${MESES[Number(e.fecha.slice(5, 7)) - 1]}</b></label>
  </div>
  <input class="field" data-a="concepto" placeholder="${transf ? 'Concepto (ej. a Nu)' : 'Concepto (opcional)'}" maxlength="80" value="${esc(e.concepto)}" autocomplete="off">
  <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-a="key" data-k="${n}">${n}</button>`).join('')}
    <button data-a="key" data-k="000" class="fn">000</button><button data-a="key" data-k="0">0</button><button data-a="key" data-k="del" class="fn" aria-label="Borrar">⌫</button></div>
  <button class="btn" data-a="guardar" ${v > 0 && (transf || e.cat) ? '' : 'disabled'}>${transf ? 'Registrar transferencia' : 'Guardar gasto'}</button>`;
}

function guardarMovimiento() {
  const e = S.entry, v = Number(e.digits || 0), transf = e.tipo === 'Transferencia';
  if (!(v > 0)) return;
  let cat = e.cat;
  if (transf) cat = (S.config.categorias.find(c => c.n === 'Otros') || S.config.categorias[S.config.categorias.length - 1]).n;
  if (!cat) return;
  const op = { id: uid(), t: Date.now(), data: { id: null, concepto: (e.concepto || '').trim() || (transf ? 'Transferencia' : cat), valor: v, categoria: cat, fecha: e.fecha, cuenta: e.cuenta || '', tipo: e.tipo } };
  op.data.id = op.id;
  S.queue.push(op); persist(); buzz();
  const mesIdx = Number(e.fecha.slice(5, 7)) - 1;
  S.entry = { ...S.entry, digits: '', cat: null, concepto: '', tipo: 'Gasto' };
  store.set('cuenta', S.entry.cuenta);
  toast(`Guardado · ${money(v)} · ${MESES[mesIdx]}`);
  render(); flushQueue();
}

// ------------------------------------------------------------------ vista: resumen
function vResumen(m) {
  const k = m.kpi, rows = m.cats.filter(c => c.real > 0);
  const tot = m.totalReal;
  const top = [...rows].sort((a, b) => b.real - a.real);
  const items = top.slice(0, 7).map(c => ({ n: c.n, v: c.real, c: catColor(c.n) }));
  const resto = tot - items.reduce((a, b) => a + b.v, 0);
  if (resto > 1) items.push({ n: 'Otras', v: resto, c: '#5d6575' });
  const alertas = [];
  m.cats.filter(c => c.pres > 0 && c.real > c.pres).forEach(c => alertas.push(['bad', `${c.n} excedida ${short(c.real - c.pres)}`]));
  if (m.ocio.pres > 0 && m.ocio.real > m.ocio.pres) alertas.push(['bad', 'Ocio sobre el presupuesto']);
  else if (m.ocio.pres > 0 && m.ocio.pConsumo > .8) alertas.push(['warn', `Ocio al ${pct(m.ocio.pConsumo)}`]);
  if (k.pendientes > 0) alertas.push(['warn', `${short(k.pendientes)} en fijos por pagar`]);
  if (k.ingReal === 0) alertas.push(['warn', 'Aún no registras ingresos reales']);
  const cats = m.cats.filter(c => c.real > 0 || c.pres > 0).sort((a, b) => (b.pres ? b.real / b.pres : 0) - (a.pres ? a.real / a.pres : 0) || b.real - a.real);
  return `
  <div class="card hero"><div class="lbl">Disponible libre</div>
    <div class="big num ${k.libre < 0 ? 'neg' : ''}">${money(k.libre)}</div>
    <div class="sub"><span>Por asignar <b class="num">${money(k.disponible)}</b></span><span>Fijos pendientes <b class="num">${money(k.pendientes)}</b></span></div></div>
  ${alertas.length ? `<div class="row" style="flex-wrap:wrap;margin:-2px 0 12px;gap:6px">${alertas.map(a => `<span class="pill ${a[0]}">${esc(a[1])}</span>`).join('')}</div>` : ''}
  <div class="grid3" style="margin-bottom:12px">
    <div class="stat"><div class="k">Ingresos</div><div class="v num">${short(k.ingReal)}</div><div class="s">de ${short(k.ingPres)}</div></div>
    <div class="stat"><div class="k">Gastado</div><div class="v num">${short(k.gastado)}</div><div class="s">${pct(k.pGastado)} del ingreso</div></div>
    <div class="stat"><div class="k">Ahorro</div><div class="v num">${short(k.ahorro)}</div><div class="s">${pct(k.pAhorro)} del ingreso</div></div>
  </div>
  <div class="card"><h3>Gasto por categoría <span>${money(tot)}</span></h3>
    ${tot > 0 ? donut(items, tot, 'Gastado') + `<div class="legend">${items.map(i => `<div><i class="dot" style="background:${i.c}"></i><div class="ell">${esc(i.n)}</div><span class="num">${pct(i.v / tot)}</span></div>`).join('')}</div>` : '<div class="empty">Sin gastos este mes</div>'}
  </div>
  <div class="card"><h3>Presupuesto vs real</h3>
    ${cats.length ? cats.map(c => {
      const r = c.pres > 0 ? c.real / c.pres : 0;
      return `<div class="item"><div class="row between"><div class="row" style="gap:8px"><i class="dot" style="background:${catColor(c.n)}"></i><b style="font-weight:600">${esc(c.n)}</b></div>
      <div class="num small"><b class="${c.pres > 0 && c.real > c.pres ? 'neg' : ''}">${money(c.real)}</b> <span class="muted">${c.pres > 0 ? '/ ' + short(c.pres) : '· sin presupuesto'}</span></div></div>
      ${c.pres > 0 ? `<div class="bar ${barClass(r)}" style="margin-top:8px"><i style="width:${clamp(r, 0, 1) * 100}%"></i></div>` : ''}</div>`;
    }).join('') : '<div class="empty">Nada que mostrar todavía</div>'}
  </div>
  <div class="card"><h3>Ocio <span>${m.ocio.pres ? pct(m.ocio.pConsumo) + ' consumido' : ''}</span></h3>
    <div class="row between"><div><div class="num" style="font-size:22px;font-weight:700">${money(m.ocio.rest)}</div><div class="small muted">restante de ${money(m.ocio.pres)}</div></div>
      <div class="small muted" style="text-align:right">gastado<br><b class="num" style="color:var(--tx)">${money(m.ocio.real)}</b></div></div>
    <div class="bar ocio ${barClass(m.ocio.pres ? m.ocio.real / m.ocio.pres : 0)}" style="margin-top:12px"><i style="width:${clamp(m.ocio.pres ? m.ocio.real / m.ocio.pres : 0, 0, 1) * 100}%"></i></div></div>
  <div class="card"><h3>Ahorro e inversión <span>${money(m.ahorroTot.r)} / ${money(m.ahorroTot.p)}</span></h3>
    ${m.ahorro.map(a => `<div class="item"><div class="row between"><b style="font-weight:600">${esc(a.n)}</b><span class="num small muted">${money(a.r)} / ${short(a.p)}</span></div>
      <div class="bar aho" style="margin:8px 0 6px"><i style="width:${clamp(a.pc, 0, 1) * 100}%"></i></div>
      <div class="row between"><span class="small muted">${pct(a.pc)} de la meta</span><button class="pill" data-a="aporte" data-row="${a.row}">+ Aporte</button></div></div>`).join('') || '<div class="empty">Sin metas</div>'}
  </div>
  <div class="card"><h3>Ingresos <span>${money(k.ingReal)} / ${money(k.ingPres)}</span></h3>
    ${m.ingresos.map(i => `<div class="item row between"><div class="grow"><div class="ell" style="font-weight:600">${esc(i.c)}</div><div class="small muted num">Esperado ${money(i.p)}</div></div>
      ${i.r ? `<button class="pill ok" data-a="ingreso" data-row="${i.row}">${tickSm()} ${short(i.r)}</button>` : `<button class="pill warn" data-a="ingreso" data-row="${i.row}">Registrar recibido</button>`}</div>`).join('')}
    <button class="btn sec" style="height:42px;margin-top:12px;font-size:14px" data-a="nuevoIngreso">+ Agregar ingreso</button></div>`;
}
const tickSm = () => ICONS.tick.replace('<svg', '<svg width="12" height="12"');

// ------------------------------------------------------------------ vista: fijos
function vFijos(m) {
  const t = m.fijosTot;
  const hoy = new Date(); const esMesActual = MESES.indexOf(m.mes) === hoy.getMonth() && S.config.year === hoy.getFullYear();
  const fijos = [...m.fijos].sort((a, b) => (a.estado === 'Pagado') - (b.estado === 'Pagado') || a.dia - b.dia);
  const pagados = m.fijos.filter(f => f.estado === 'Pagado').length;
  const badge = f => {
    if (f.estado === 'Pagado' || !esMesActual || !f.dia) return f.dia ? `Día ${f.dia}` : '';
    const d = f.dia - hoy.getDate();
    return d < 0 ? `<span class="neg">Vencido hace ${-d} d</span>` : d === 0 ? '<span style="color:var(--warn)">Vence hoy</span>' : d <= 3 ? `<span style="color:var(--warn)">Vence en ${d} d</span>` : `Día ${f.dia}`;
  };
  return `
  <div class="card hero"><div class="lbl">Por pagar este mes</div><div class="big num">${money(t.pendiente)}</div>
    <div class="bar ok" style="margin:6px 0 10px"><i style="width:${t.total ? t.pagado / t.total * 100 : 0}%"></i></div>
    <div class="sub"><span>Pagado <b class="num">${money(t.pagado)}</b></span><span><b>${pagados}</b> de ${m.fijos.length} obligaciones</span><span>${pct(m.kpi.pFijos)} del ingreso</span></div></div>
  <div class="card" style="padding:6px 16px">${fijos.length ? fijos.map(f => `
    <button class="mv" data-a="fijo" data-row="${f.row}"><span class="check ${f.estado === 'Pagado' ? 'on' : ''}">${ICONS.tick}</span>
      <div class="grow"><div class="t ell ${f.estado === 'Pagado' ? 'muted' : ''}" style="${f.estado === 'Pagado' ? 'text-decoration:line-through;text-decoration-color:var(--dim)' : ''}">${esc(f.c)}</div>
      <div class="small muted ell"><i class="dot" style="background:${catColor(f.cat)};margin-right:5px"></i>${esc(f.cat)} · ${badge(f)}</div></div>
      <div class="a num">${money(f.estado === 'Pagado' && f.real != null ? f.real : f.p)}</div></button>`).join('') : '<div class="empty">No hay gastos fijos en este mes</div>'}</div>`;
}

// ------------------------------------------------------------------ vista: año
function vAnio() {
  const y = S.year;
  if (!y) { loadYear(); return '<div class="sk"></div><div class="sk"></div><div class="sk"></div>'; }
  const k = y.kpi;
  const top = [...y.cats].filter(c => c.real > 0 || c.pres > 0).sort((a, b) => b.real - a.real);
  const estCol = { Excedido: 'bad', 'En riesgo': 'warn', Dentro: 'ok' };
  return `
  <div class="card hero"><div class="lbl">Disponible acumulado a ${esc(y.corte)}</div><div class="big num ${k.disponible < 0 ? 'neg' : ''}">${money(k.disponible)}</div>
    <div class="sub"><span>Tasa de ahorro <b>${pct(k.tasaAhorro, 1)}</b></span><span>Ejecución <b>${pct(k.ejec)}</b></span></div></div>
  <div class="grid2" style="margin-bottom:12px">
    <div class="stat"><div class="k">Ingresos reales</div><div class="v num">${short(k.ingReal)}</div><div class="s">de ${short(k.ingPres)} presup.</div></div>
    <div class="stat"><div class="k">Gastos reales</div><div class="v num">${short(k.gastReal)}</div><div class="s">de ${short(k.gastPres)} presup.</div></div>
    <div class="stat"><div class="k">Ahorro real</div><div class="v num">${short(k.ahReal)}</div><div class="s">de ${short(k.ahPres)} presup.</div></div>
    <div class="stat"><div class="k">Fijos pendientes</div><div class="v num">${short(k.pendientes)}</div><div class="s">libre ${short(k.libre)}</div></div></div>
  <div class="card"><h3>Mes a mes <span class="row" style="gap:10px"><span><i class="dot" style="background:var(--ing)"></i> Ingresos</span><span><i class="dot" style="background:var(--acc)"></i> Gastos</span><span><i class="dot" style="background:var(--aho)"></i> Ahorro</span></span></h3>
    ${groupedBars(y.meses, ['ingReal', 'gastReal', 'ahReal'], ['#8bc34a', '#f46524', '#8fb0c9'])}</div>
  <div class="card"><h3>Tasa de ahorro mensual</h3>${sparkline(y.meses.map(m => Math.max(0, m.pAhorro)))}</div>
  <div class="card"><h3>Gasto por categoría <span>acumulado</span></h3>
    ${top.map(c => { const r = c.pres > 0 ? c.real / c.pres : 0; return `<div class="item"><div class="row between"><div class="row" style="gap:8px"><i class="dot" style="background:${catColor(c.n)}"></i><b style="font-weight:600">${esc(c.n)}</b></div>
      <span class="num small"><b>${money(c.real)}</b> <span class="muted">${pct(c.pct)}</span></span></div>
      ${c.pres > 0 ? `<div class="bar ${barClass(r)}" style="margin-top:8px"><i style="width:${clamp(r, 0, 1) * 100}%"></i></div><div class="small muted" style="margin-top:4px">${pct(r)} del presupuesto de ${short(c.pres)}</div>` : '<div class="small dim" style="margin-top:2px">Sin presupuesto</div>'}</div>`; }).join('') || '<div class="empty">Sin datos</div>'}</div>
  <div class="card"><h3>Metas del año <span>${pct(k.cumplimiento)}</span></h3>
    ${y.metas.map(g => `<div class="item"><div class="row between"><b style="font-weight:600">${esc(g.n)}</b><span class="num small muted">${short(g.acum)} / ${short(g.obj)}</span></div>
      <div class="bar aho" style="margin:8px 0 6px"><i style="width:${clamp(g.pct, 0, 1) * 100}%"></i></div>
      <div class="small muted">Faltan <b class="num" style="color:var(--tx)">${short(g.saldo)}</b>${g.req ? ` · ${short(g.req)} por mes` : ''}</div></div>`).join('') || '<div class="empty">Sin metas</div>'}</div>`;
}

// ------------------------------------------------------------------ vista: historial
function vHistorial(m) {
  const pend = S.queue;
  const porDia = {};
  m.movs.forEach(x => (porDia[x.f] = porDia[x.f] || []).push(x));
  const dias = Object.keys(porDia).sort().reverse();
  const fmtDia = iso => { const [y, mo, d] = iso.split('-').map(Number); const dt = new Date(y, mo - 1, d); return `${DIAS[dt.getDay()]} ${d} ${MESES[mo - 1].slice(0, 3).toLowerCase()}`; };
  const fila = x => {
    const tr = x.tipo === 'Transferencia';
    return `<button class="mv" data-a="editar" data-row="${x.row}"><span class="ic" style="${tr ? 'color:var(--aho)' : ''}">${tr ? ICONS.swap.replace('<svg', '<svg width="18" height="18"') : `<i class="dot" style="background:${catColor(x.cat)};width:11px;height:11px"></i>`}</span>
      <div class="grow"><div class="t ell">${esc(x.c)}</div><div class="small muted ell">${esc(x.cat)}${x.cuenta ? ' · ' + esc(x.cuenta) : ''}${x.control && x.control !== 'OK' ? ` · <span class="neg">${esc(x.control)}</span>` : ''}</div></div>
      <div class="a num" style="${tr ? 'color:var(--aho)' : ''}">${money(x.v)}</div></button>`;
  };
  return `
  ${pend.length ? `<div class="day" id="cola">Pendientes de enviar</div><div class="card" style="padding:6px 16px">${pend.map(o => `
    <div class="mv"><span class="ic" style="color:${o.error ? 'var(--bad)' : 'var(--warn)'}">${o.error ? ICONS.warn : ICONS.refresh}</span>
    <div class="grow"><div class="t ell">${esc(o.data.concepto)}</div><div class="small ${o.error ? 'neg' : 'muted'} ell">${esc(o.error || (S.offline ? 'Esperando conexión' : 'Enviando…'))}</div></div>
    <div class="a num">${money(o.data.valor)}</div>
    ${o.error ? `<button class="pill bad" data-a="descartar" data-id="${o.id}">Quitar</button><button class="pill" data-a="reintentar" data-id="${o.id}">Reintentar</button>` : ''}</div>`).join('')}</div>` : ''}
  <div class="row between" style="padding:2px 4px"><span class="small muted">${m.movs.length} movimientos · gastos ${money(m.kpi.gastado - m.fijosTot.pagado)}</span>
    <button class="pill" data-a="sync">${ICONS.refresh.replace('<svg', '<svg width="13" height="13"')} Actualizar</button></div>
  ${dias.length ? dias.map(d => `<div class="day">${fmtDia(d)}</div><div class="card" style="padding:2px 16px">${porDia[d].map(fila).join('')}</div>`).join('') : '<div class="empty">Sin movimientos en este mes.<br>Registra el primero desde la pestaña «Registrar».</div>'}`;
}

// ------------------------------------------------------------------ hojas modales
function openSheet(html, onMount) {
  const root = $('#sheet-root');
  root.innerHTML = `<div class="scrim" data-a="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  onMount && onMount(root);
}
const closeSheet = () => { $('#sheet-root').innerHTML = ''; };

function sheetSettings() {
  const c = S.cfg || {};
  openSheet(`<h2>Conexión con tu hoja</h2>
    <label>URL de la implementación (termina en /exec)</label><input class="field" id="s-url" inputmode="url" autocapitalize="off" autocorrect="off" value="${esc(c.demo ? '' : c.url || '')}" placeholder="https://script.google.com/macros/s/…/exec">
    <label>Clave</label><input class="field" id="s-key" type="password" autocapitalize="off" autocomplete="off" value="${esc(c.demo ? '' : c.key || '')}" placeholder="La clave que pusiste en el script">
    <div style="height:16px"></div><button class="btn" data-a="saveCfg">Probar y guardar</button>
    <div style="height:10px"></div><button class="btn sec" data-a="demo">Ver con datos de ejemplo</button>
    ${S.cfg ? `<div style="height:10px"></div><button class="btn danger" data-a="logout">Desconectar este dispositivo</button>` : ''}
    <p class="small dim" style="margin:14px 0 0">Los datos viven solo en tu Google Sheets. En este dispositivo se guarda la URL, la clave y una copia para ver sin conexión.</p>`);
}

function sheetFijo(row) {
  const f = S.months[S.mes].fijos.find(x => x.row === Number(row)); if (!f) return;
  const pagado = f.estado === 'Pagado';
  openSheet(`<h2>${esc(f.c)}</h2><div class="muted small" style="margin-top:-8px">${esc(f.cat)} · presupuesto ${money(f.p)}${f.dia ? ' · día ' + f.dia : ''}</div>
    ${pagado ? `<div style="height:18px"></div><button class="btn sec" data-a="fijoSet" data-row="${f.row}" data-e="Pendiente">Marcar como pendiente</button>` :
      `<label>Valor pagado</label><input class="field num" id="f-real" type="number" inputmode="numeric" value="${f.p}">
      <div class="small dim" style="margin-top:6px">Si pagaste otro valor, cámbialo. Se cuenta como gasto del mes.</div>
      <div style="height:16px"></div><button class="btn" data-a="fijoSet" data-row="${f.row}" data-e="Pagado">Marcar como pagado</button>`}`);
}

function sheetEditar(row) {
  const m = S.months[S.mes]; const x = m.movs.find(z => z.row === Number(row)); if (!x) return;
  const cfg = S.config;
  openSheet(`<h2>Editar movimiento</h2>
    <label>Concepto</label><input class="field" id="e-c" value="${esc(x.c)}" maxlength="80">
    <label>Valor</label><input class="field num" id="e-v" type="number" inputmode="numeric" value="${x.v}">
    <div class="grid2"><div><label>Categoría</label><select class="field" id="e-cat">${cfg.categorias.map(c => `<option ${c.n === x.cat ? 'selected' : ''}>${esc(c.n)}</option>`).join('')}</select></div>
    <div><label>Fecha</label><input class="field" id="e-f" type="date" value="${x.f}"></div>
    <div><label>Cuenta</label><select class="field" id="e-cu"><option value="">Sin cuenta</option>${cfg.cuentas.map(c => `<option ${c === x.cuenta ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
    <div><label>Tipo</label><select class="field" id="e-t">${cfg.tipos.map(c => `<option ${c === x.tipo ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div></div>
    <div style="height:18px"></div><button class="btn" data-a="editSave" data-row="${x.row}">Guardar cambios</button>
    <div style="height:10px"></div><button class="btn danger" data-a="editDel" data-row="${x.row}">Eliminar movimiento</button>`);
}

function sheetMonto(title, label, def, action, extra = '') {
  openSheet(`<h2>${esc(title)}</h2><label>${esc(label)}</label><input class="field num" id="m-v" type="number" inputmode="numeric" value="${def ?? ''}" placeholder="0">${extra}
    <div style="height:16px"></div><button class="btn" data-a="${action}">Guardar</button>`, r => setTimeout(() => $('#m-v', r)?.focus(), 250));
}

// ------------------------------------------------------------------ configuración inicial
function renderSetup() {
  $('#view').innerHTML = `<div class="setup"><img class="logo" src="icons/icon-192.png" alt="">
    <h1>Finanzas</h1><p class="muted" style="margin:0 0 22px">Registra tus gastos y consulta tu resumen. Todo se guarda en tu propia hoja de Google Sheets.</p>
    <label class="small muted" style="display:block;margin-bottom:6px">URL de la implementación (termina en /exec)</label>
    <input class="field" id="s-url" inputmode="url" autocapitalize="off" autocorrect="off" placeholder="https://script.google.com/macros/s/…/exec">
    <label class="small muted" style="display:block;margin:14px 0 6px">Clave</label>
    <input class="field" id="s-key" type="password" autocapitalize="off" autocomplete="off" placeholder="La clave que pusiste en el script">
    <div style="height:18px"></div><button class="btn" data-a="saveCfg">Conectar</button>
    <div style="height:10px"></div><button class="btn sec" data-a="demo">Probar con datos de ejemplo</button></div>`;
}

async function saveCfg() {
  const url = ($('#s-url').value || '').trim(), key = ($('#s-key').value || '').trim();
  if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(url) && !/^https:\/\/script\.googleusercontent\.com\//.test(url)) return toast('La URL debe empezar con https://script.google.com/macros/s/… y terminar en /exec', true);
  if (!key) return toast('Escribe la clave', true);
  const prev = S.cfg; S.cfg = { url, key };
  const btn = document.querySelector('[data-a=saveCfg]'); if (btn) { btn.disabled = true; btn.textContent = 'Conectando…'; }
  try {
    const r = await api('bootstrap', {});
    S.config = r.config; S.mes = r.month.mes; S.months = { [r.month.mes]: r.month }; S.year = null; S.stamp = Date.now(); S.offline = false;
    store.set('cfg', S.cfg); persist(); closeSheet(); toast('Conectado ✓'); render();
  } catch (e) {
    S.cfg = prev; toast(e.message, true); if (btn) { btn.disabled = false; btn.textContent = 'Probar y guardar'; }
  }
}

// ------------------------------------------------------------------ eventos
document.addEventListener('click', async ev => {
  const el = ev.target.closest('[data-a]'); if (!el) return;
  const a = el.dataset.a, k = el.dataset.k, row = el.dataset.row;
  const m = S.months[S.mes];
  switch (a) {
    case 'tab': S.view = k; $('#view').scrollTop = 0; render(); if (k === 'anio') loadYear(); break;
    case 'prev': case 'next': { const i = MESES.indexOf(S.mes || nowMes()) + (a === 'next' ? 1 : -1); if (i >= 0 && i < 12) { S.entry.fecha = fechaParaMes(i); loadMonth(MESES[i]); } break; }
    case 'settings': sheetSettings(); break;
    case 'closeSheet': closeSheet(); break;
    case 'goQueue': S.view = 'historial'; render(); break;
    case 'tipo': S.entry.tipo = k; render(); break;
    case 'cat': S.entry.cat = k; render(); buzz(); break;
    case 'key': {
      let d = S.entry.digits;
      if (k === 'del') d = d.slice(0, -1); else if ((d + k).length <= 10) d = (d + k).replace(/^0+/, '');
      S.entry.digits = d; render(); break;
    }
    case 'guardar': guardarMovimiento(); break;
    case 'sync': await refresh(); await flushQueue(); toast('Actualizado'); break;
    case 'saveCfg': saveCfg(); break;
    case 'demo': S.entry.fecha = DEMO.config.year + '-09-28'; S.cfg = { demo: true }; store.set('cfg', S.cfg); S.config = DEMO.config; S.mes = DEMO.config.mesActual; S.months = JSON.parse(JSON.stringify(DEMO.months)); S.year = DEMO.year; S.queue = []; closeSheet(); render(); break;
    case 'logout': if (confirm('¿Desconectar este dispositivo? Los datos siguen en tu hoja.')) { ['cfg', 'cache', 'queue'].forEach(x => store.del(x)); S.cfg = null; S.queue = []; S.months = {}; S.year = null; S.config = null; closeSheet(); render(); } break;
    case 'fijo': sheetFijo(row); break;
    case 'fijoSet': {
      const real = $('#f-real') ? Number($('#f-real').value) : null; const f = m.fijos.find(x => x.row === Number(row));
      try { await api('setFixed', { mes: S.mes, row: Number(row), estado: el.dataset.e, real: real != null && real !== f.p ? real : null }); closeSheet(); toast(el.dataset.e === 'Pagado' ? 'Marcado como pagado ✓' : 'Marcado como pendiente'); buzz(); await loadMonth(S.mes); }
      catch (e) { toast(e.message, true); } break;
    }
    case 'editar': sheetEditar(row); break;
    case 'editSave': {
      const x = m.movs.find(z => z.row === Number(row));
      try { await api('update', { mes: S.mes, row: Number(row), esperado: { c: x.c, v: x.v }, concepto: $('#e-c').value, valor: Number($('#e-v').value), categoria: $('#e-cat').value, fecha: $('#e-f').value, cuenta: $('#e-cu').value, tipo: $('#e-t').value }); closeSheet(); toast('Cambios guardados ✓'); await loadMonth(S.mes); }
      catch (e) { toast(e.message, true); } break;
    }
    case 'editDel': {
      const x = m.movs.find(z => z.row === Number(row)); if (!confirm(`¿Eliminar «${x.c}» por ${money(x.v)}?`)) break;
      try { await api('delete', { mes: S.mes, row: Number(row), esperado: { c: x.c, v: x.v } }); closeSheet(); toast('Eliminado'); await loadMonth(S.mes); } catch (e) { toast(e.message, true); } break;
    }
    case 'ingreso': { const i = m.ingresos.find(z => z.row === Number(row)); S._row = Number(row); sheetMonto(i.c, 'Valor recibido', i.r ?? i.p, 'ingresoSave'); break; }
    case 'ingresoSave': try { await api('setIncome', { mes: S.mes, row: S._row, real: Number($('#m-v').value) }); closeSheet(); toast('Ingreso registrado ✓'); await loadMonth(S.mes); } catch (e) { toast(e.message, true); } break;
    case 'nuevoIngreso': sheetMonto('Nuevo ingreso', 'Valor recibido', '', 'ingresoNuevoSave', '<label>Concepto</label><input class="field" id="m-c" placeholder="Ej. Venta, bono, reembolso" maxlength="60">'); break;
    case 'ingresoNuevoSave': try { await api('addIncome', { mes: S.mes, concepto: $('#m-c').value, real: Number($('#m-v').value) }); closeSheet(); toast('Ingreso agregado ✓'); await loadMonth(S.mes); } catch (e) { toast(e.message, true); } break;
    case 'aporte': S._row = Number(row); sheetMonto('Aporte a ' + m.ahorro.find(z => z.row === Number(row)).n, 'Valor ahorrado', '', 'aporteSave'); break;
    case 'aporteSave': try { await api('addSaving', { mes: S.mes, row: S._row, monto: Number($('#m-v').value) }); closeSheet(); toast('Aporte registrado ✓'); await loadMonth(S.mes); } catch (e) { toast(e.message, true); } break;
    case 'descartar': S.queue = S.queue.filter(o => o.id !== el.dataset.id); persist(); render(); break;
    case 'reintentar': { const o = S.queue.find(z => z.id === el.dataset.id); if (o) { delete o.error; persist(); flushQueue(); } break; }
  }
});
document.addEventListener('input', ev => {
  const el = ev.target; if (el.dataset?.a === 'concepto') S.entry.concepto = el.value;
});
document.addEventListener('change', ev => {
  const el = ev.target;
  if (el.dataset?.a === 'fecha' && el.value) { S.entry.fecha = el.value; const i = Number(el.value.slice(5, 7)) - 1; if (MESES[i] !== S.mes) loadMonth(MESES[i]); else render(); }
  if (el.dataset?.a === 'cuenta') { S.entry.cuenta = el.value; store.set('cuenta', el.value); render(); }
});
function fechaParaMes(i) {
  const hoy = new Date(); const y = S.config.year;
  if (hoy.getFullYear() === y && hoy.getMonth() === i) return todayIso();
  return `${y}-${pad2(i + 1)}-01`;
}

// ------------------------------------------------------------------ modo demo (datos de ejemplo, sin conexión a nada)
function demoApi(action, d) {
  return new Promise((res, rej) => setTimeout(() => {
    const m = S.months[S.mes] || DEMO.months[DEMO.config.mesActual];
    try {
      switch (action) {
        case 'bootstrap': return res({ ok: true, config: DEMO.config, month: JSON.parse(JSON.stringify(DEMO.months[d.mes || DEMO.config.mesActual] || DEMO.months[DEMO.config.mesActual])) });
        case 'month': return res({ ok: true, month: S.months[d.mes] || emptyMonth(d.mes) });
        case 'year': return res({ ok: true, year: DEMO.year });
        case 'add': {
          const x = d, mm = S.months[MESES[Number(x.fecha.slice(5, 7)) - 1]] || emptyMonth(MESES[Number(x.fecha.slice(5, 7)) - 1]);
          S.months[mm.mes] = mm; mm.movs.unshift({ row: 100 + mm.movs.length, c: x.concepto, v: x.valor, cat: x.categoria, f: x.fecha, cuenta: x.cuenta, tipo: x.tipo, control: 'OK', id: x.id });
          if (x.tipo !== 'Transferencia') { mm.kpi.gastado += x.valor; mm.kpi.disponible -= x.valor; mm.kpi.libre -= x.valor; mm.totalReal += x.valor;
            const c = mm.cats.find(z => z.n === x.categoria); if (c) { c.real += x.valor; c.dif -= x.valor; } if (mm.kpi.ingReal) mm.kpi.pGastado = mm.kpi.gastado / mm.kpi.ingReal; }
          return res({ ok: true });
        }
        case 'setFixed': { const f = m.fijos.find(z => z.row === d.row); const antes = f.estado; f.estado = d.estado; f.real = d.real ?? null; const val = f.real ?? f.p;
          if (antes !== d.estado) { const sg = d.estado === 'Pagado' ? 1 : -1; m.fijosTot.pagado += sg * val; m.fijosTot.pendiente -= sg * f.p; m.kpi.pendientes -= sg * f.p; m.kpi.gastado += sg * val; m.kpi.disponible -= sg * val; m.kpi.libre -= sg * (val - f.p); }
          return res({ ok: true }); }
        case 'update': case 'delete': { const i = m.movs.findIndex(z => z.row === d.row); if (action === 'delete') m.movs.splice(i, 1); else Object.assign(m.movs[i], { c: d.concepto, v: d.valor, cat: d.categoria, f: d.fecha, cuenta: d.cuenta, tipo: d.tipo }); return res({ ok: true }); }
        case 'setIncome': { const i = m.ingresos.find(z => z.row === d.row); m.kpi.ingReal += d.real - (i.r || 0); i.r = d.real; return res({ ok: true }); }
        case 'addIncome': m.ingresos.push({ row: 30, c: d.concepto, p: 0, r: d.real }); m.kpi.ingReal += d.real; return res({ ok: true });
        case 'addSaving': { const a = m.ahorro.find(z => z.row === d.row); a.r += d.monto; a.pc = a.p ? a.r / a.p : 0; m.kpi.ahorro += d.monto; m.ahorroTot.r += d.monto; return res({ ok: true }); }
      }
      res({ ok: true });
    } catch (e) { rej(new ApiError(String(e.message || e))); }
  }, 120));
}
function emptyMonth(mes) {
  const b = JSON.parse(JSON.stringify(DEMO.months[DEMO.config.mesActual]));
  b.mes = mes; b.movs = []; b.fijos.forEach(f => { f.estado = 'Pendiente'; f.real = null; });
  Object.keys(b.kpi).forEach(k => b.kpi[k] = 0); b.cats.forEach(c => { c.real = 0; c.dif = c.pres; c.pGasto = 0; c.pIngreso = 0; });
  b.ingresos.forEach(i => i.r = null); b.ahorro.forEach(a => { a.r = 0; a.pc = 0; }); b.totalReal = 0; b.fijosTot = { total: b.fijosTot.total, pagado: 0, pendiente: b.fijosTot.total };
  b.kpi.pendientes = b.fijosTot.total; b.ocio = { ...b.ocio, real: 0, rest: b.ocio.pres, pConsumo: 0, pIngreso: 0 }; return b;
}

// ------------------------------------------------------------------ arranque
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
if (S.cfg?.demo && !S.config) { S.config = DEMO.config; S.mes = DEMO.config.mesActual; S.months = JSON.parse(JSON.stringify(DEMO.months)); S.year = DEMO.year; }
S.mes = S.mes || (S.config ? S.config.mesActual : null);
render();
if (S.cfg && !S.cfg.demo) loadAll();
if (new URLSearchParams(location.search).has('demo') && !S.cfg) { document.querySelector('[data-a=demo]')?.click(); }
