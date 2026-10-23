/* Finanzas · app web instalable (PWA). Sin dependencias: HTML + JS puro. */
'use strict';
const APP_VERSION = '11';

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
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z"/><circle cx="16.5" cy="14.5" r="1.2"/></svg>',
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
  cuentas: null,                          // saldos por cuenta (hoja «Cuentas»)
  view: 'registrar',
  mes: null,                              // mes que se está viendo
  queue: store.get('queue', []),
  loading: false, offline: false, stamp: null, flushing: false,
  entry: { digits: '', cat: null, tipo: 'Gasto', cuenta: store.get('cuenta', ''), destino: '', fecha: todayIso(), concepto: '' },
};
const cache = store.get('cache', null);
if (cache) { S.config = cache.config; S.months = cache.months || {}; S.year = cache.year; S.stamp = cache.stamp; }

function persist() {
  store.set('cache', { config: S.config, months: S.months, year: S.year, stamp: S.stamp });
  store.set('queue', S.queue);
}

// ------------------------------------------------------------------ API (Apps Script o modo demo)
const errorTexto = e => ({
  unauthorized: 'La clave no coincide con la del script. Usa «Diagnosticar la conexión» en Ajustes.',
  clave_no_configurada: 'En el script la CLAVE sigue siendo la de ejemplo: cámbiala, guarda y publica una Nueva versión.',
  clave_corta: 'La CLAVE del script tiene menos de 10 caracteres. Usa una más larga y publica una Nueva versión.',
}[e] || (/authori[sz]ation|autoriza/i.test(e || '') ? 'Falta autorizar permisos nuevos en el script: en Apps Script ejecuta la función autorizarPermisos y publica una Nueva versión.' : (e || 'Error desconocido')));
const limpiarClave = k => String(k || '').replace(/[\s\u200B-\u200D\uFEFF\u00A0'"\u2018\u2019\u201C\u201D]/g, '');

class ApiError extends Error { constructor(m, network) { super(m); this.network = !!network; } }

async function api(action, data = {}, ms = 30000) {
  if (S.cfg?.demo) return demoApi(action, data);
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  let r;
  try {
    r = await fetch(S.cfg.url, {
      method: 'POST', redirect: 'follow', signal: ctl.signal,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },        // evita la petición previa (CORS) de Google
      body: JSON.stringify({ token: limpiarClave(S.cfg.key), action, ...data }),
    });
  } catch (e) {
    if (e.name === 'AbortError') throw new ApiError('La hoja tardó demasiado en responder. Inténtalo de nuevo.', true);
    if (navigator.onLine === false) throw new ApiError('Sin internet', true);
    throw new ApiError('No se pudo hablar con el script. Abre Ajustes → «Diagnosticar la conexión» para ver la causa.', true);
  } finally { clearTimeout(t); }
  let j;
  try { j = await r.json(); } catch { throw new ApiError('La URL no responde como se esperaba. Revisa la URL de la implementación.', false); }
  if (!j.ok) throw new ApiError(errorTexto(j.error), false);
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
  maybeWizard();
  flushQueue();
}

async function loadMonth(mes) {
  S.mes = mes; render();
  try { const r = await api('month', { mes }); S.months[mes] = r.month; S.offline = false; persist(); S.cuentas = null; }
  catch (e) { S.offline = !!e.network; if (!S.months[mes]) toast(e.message, true); }
  render();
  if (S.view === 'cuentas') loadCuentas();
}

async function loadYear() {
  try { const r = await api('year'); S.year = r.year; S.offline = false; persist(); }
  catch (e) { S.offline = !!e.network; if (!S.year) toast(e.message, true); }
  if (S.view === 'anio') render();
}

async function loadCuentas() {
  if (!S.config?.cuentasListas) return;
  try { const r = await api('accounts'); S.cuentas = r.cuentas; S.offline = false; }
  catch (e) { S.offline = !!e.network; toast(e.message, true); S.cuentas = S.cuentas || { error: true }; }
  if (S.view === 'cuentas') render();
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
  ['cuentas', 'Cuentas', ICONS.wallet], ['anio', 'Año', ICONS.chart], ['historial', 'Historial', ICONS.list]];

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
  if (S.wz?.on) return renderWizard();
  renderTop(); renderNav();
  const v = $('#view');
  const m = S.months[S.mes || nowMes()];
  const scroll = v.scrollTop;
  if (!m || !S.config) { v.innerHTML = '<div class="sk"></div><div class="sk"></div><div class="sk"></div>'; return; }
  const fn = { registrar: vRegistrar, resumen: vResumen, fijos: vFijos, cuentas: vCuentas, anio: vAnio, historial: vHistorial }[S.view];
  v.innerHTML = fn(m);
  if (S.view === 'registrar') fitAmt($('#amt'));
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
  const transf = e.tipo === 'Transferencia', cu = hayCuentas();
  const opcionesCuenta = (sel, vacio) => `<option value="">${vacio}</option>${S.config.cuentas.map(c => `<option ${c === sel ? 'selected' : ''}>${esc(c)}</option>`).join('')}`;
  return `
  <label class="amount"><span class="cur num ${v ? '' : 'empty'}"><small>$</small><input id="amt" class="amt num" type="text" inputmode="numeric" pattern="[0-9]*" enterkeyhint="done" autocomplete="off" placeholder="0" aria-label="Monto" value="${v ? v.toLocaleString('es-CO') : ''}"></span><small class="hint">Toca el monto para escribirlo</small></label>
  <div class="seg"><button data-a="tipo" data-k="Gasto" class="${!transf ? 'on' : ''}">Gasto</button>
    <button data-a="tipo" data-k="Transferencia" class="${transf ? 'on' : ''}">Transferencia</button></div>
  ${transf ? `<div class="card small muted" style="padding:12px 14px">Mover dinero entre tus cuentas <b style="color:var(--tx)">no cuenta como gasto</b>.${cu ? ' Se resta de «De» y se suma a «A».' : ' Queda registrado, pero no afecta tus indicadores.'}</div>` :
    `<div class="chips">${cats.map(c => `<button class="chip ${e.cat === c.n ? 'on' : ''}" style="--c:${catColor(c.n)}" data-a="cat" data-k="${esc(c.n)}"><i class="dot" style="background:${catColor(c.n)}"></i><span>${esc(c.n)}</span></button>`).join('')}</div>`}
  <div class="opts">
    <label class="sel"><small>Fecha</small><b>${fechaLabel(e.fecha)}</b><input type="date" data-a="fecha" value="${e.fecha}" max="${S.config.year}-12-31" min="${S.config.year}-01-01"></label>
    ${transf && cu ? `<label class="sel"><small>De</small><b>${esc(e.cuenta || 'Elegir')}</b><select data-a="cuenta">${opcionesCuenta(e.cuenta, 'Elegir…')}</select></label>
    <label class="sel"><small>A</small><b>${esc(e.destino || 'Elegir')}</b><select data-a="destino">${opcionesCuenta(e.destino, 'Elegir…')}</select></label>` :
    `<label class="sel"><small>Cuenta</small><b>${esc(e.cuenta || 'Sin cuenta')}</b><select data-a="cuenta">${opcionesCuenta(e.cuenta, 'Sin cuenta')}</select></label>
    <label class="sel"><small>Mes en hoja</small><b>${MESES[Number(e.fecha.slice(5, 7)) - 1]}</b></label>`}
  </div>
  <input class="field" data-a="concepto" placeholder="${transf ? 'Concepto (opcional)' : 'Concepto (opcional)'}" maxlength="80" value="${esc(e.concepto)}" autocomplete="off">
  <button class="btn" style="margin-top:14px" data-a="guardar" ${puedeGuardar() ? '' : 'disabled'}>${transf ? 'Registrar transferencia' : 'Guardar gasto'}</button>`;
}

const fitAmt = el => { if (el) el.style.width = Math.max(1, el.value.length) + 'ch'; };
function puedeGuardar() {
  const e = S.entry, v = Number(e.digits || 0), transf = e.tipo === 'Transferencia';
  return v > 0 && (transf ? (!hayCuentas() || (e.cuenta && e.destino && e.cuenta !== e.destino)) : !!e.cat);
}
const hayCuentas = () => !!S.config?.cuentasListas && S.config.cuentas.length >= 2;
const cuentaField = (id, val, label) => S.config?.cuentasListas && S.config.cuentas.length
  ? `<label>${label}</label><select class="field" id="${id}"><option value="">Sin cuenta</option>${S.config.cuentas.map(c => `<option ${c === val ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>` : '';
const cuentaVal = id => (S.config?.cuentasListas && $('#' + id)) ? $('#' + id).value : undefined;

function guardarMovimiento() {
  const e = S.entry, v = Number(e.digits || 0), transf = e.tipo === 'Transferencia';
  if (!(v > 0)) return;
  let cat = e.cat;
  if (transf) cat = (S.config.categorias.find(c => c.n === 'Otros') || S.config.categorias[S.config.categorias.length - 1]).n;
  if (!cat) return;
  if (transf && hayCuentas() && (!e.cuenta || !e.destino || e.cuenta === e.destino)) return toast('Elige la cuenta de origen y la de destino (distintas)', true);
  const op = { id: uid(), t: Date.now(), data: { id: null, concepto: (e.concepto || '').trim() || (transf ? (e.cuenta && e.destino ? `${e.cuenta} → ${e.destino}` : 'Transferencia') : cat), valor: v, categoria: cat, fecha: e.fecha, cuenta: e.cuenta || '', destino: transf ? (e.destino || '') : '', tipo: e.tipo } };
  op.data.id = op.id;
  S.queue.push(op); persist(); buzz();
  const mesIdx = Number(e.fecha.slice(5, 7)) - 1;
  S.entry = { ...S.entry, digits: '', cat: null, concepto: '', tipo: 'Gasto', destino: '' };
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
  <div class="card hero"><div class="lbl">Disponible ahora</div>
    <div class="big num ${k.disponible < 0 ? 'neg' : ''}">${money(k.disponible)}</div>
    <div class="sub"><span>Libre tras fijos pendientes <b class="num ${k.libre < 0 ? 'neg' : ''}">${money(k.libre)}</b></span><span>Fijos pendientes <b class="num">${money(k.pendientes)}</b></span></div></div>
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
      <div class="row between"><span class="small muted">${pct(a.pc)} de la meta</span><span class="row" style="gap:6px"><button class="pill" data-a="metaEditar" data-row="${a.row}">Editar</button><button class="pill" data-a="aporte" data-row="${a.row}">+ Aporte</button></span></div></div>`).join('') || '<div class="empty">Sin metas</div>'}
    <button class="btn sec" style="height:42px;margin-top:12px;font-size:14px" data-a="metaNueva">+ Agregar meta de ahorro o inversión</button>
  </div>
  <div class="card"><h3>Ingresos <span>${money(k.ingReal)} / ${money(k.ingPres)}</span></h3>
    ${m.ingresos.map(i => `<div class="item row between"><div class="grow"><div class="ell" style="font-weight:600">${esc(i.c)}</div><div class="small muted num">Esperado ${money(i.p)}${i.cuenta ? ' · ' + esc(i.cuenta) : ''}</div></div>
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
      <div class="a num">${money(f.estado === 'Pagado' && f.real != null ? f.real : f.p)}</div></button>`).join('') : '<div class="empty">Este mes aún no tiene gastos fijos.<br>Agrégalos una sola vez y se copian a los demás meses.</div>'}</div>
  <button class="btn sec" style="margin-top:12px" data-a="fijoNuevo">+ Agregar gasto fijo</button>
  ${fijos.length ? `<button class="btn sec" style="margin-top:8px" data-a="fijoCopiar">Copiar estos fijos a los meses vacíos</button>`
    : MESES.indexOf(m.mes) > 0 ? `<button class="btn" style="margin-top:8px" data-a="fijoDelAnterior">Copiar los de ${MESES[MESES.indexOf(m.mes) - 1]}</button>` : ''}`;
}

// ------------------------------------------------------------------ vista: cuentas
function vCuentas() {
  const cfg = S.config;
  if (!cfg.cuentasListas) {
    const viejo = cfg.cuentasListas === undefined;
    return `<div class="card"><h3>Cuentas y saldos</h3>
      <p class="muted small" style="margin:0 0 12px">Aquí verás cuánto hay en cada cuenta: lo que entra, lo que sale y lo que mueves entre cuentas.</p>
      ${viejo ? `<div class="item"><b>1.</b> Tu script de Google es de una versión anterior. En Apps Script pega el <b>Code.gs</b> nuevo, guarda y publica una <b>Nueva versión</b> (Implementar → Administrar implementaciones → ✏ → Nueva versión).</div>` : ''}
      <div class="item"><b>${viejo ? '2' : '1'}.</b> En Apps Script (Extensiones → Apps Script) elige la función <b>instalarCuentas</b> y pulsa <b>Ejecutar</b>. Si dice «Falta un poco», ejecútala otra vez hasta que diga «Listo».</div>
      <div class="item"><b>${viejo ? '3' : '2'}.</b> Vuelve aquí y toca el botón.</div>
      <button class="btn" style="margin-top:12px" data-a="recargar">Ya la activé · actualizar</button></div>`;
  }
  const c = S.cuentas;
  if (!c) { loadCuentas(); return '<div class="sk"></div><div class="sk"></div><div class="sk"></div>'; }
  if (c.error) return `<div class="empty">No se pudieron leer los saldos.<br><button class="pill" data-a="recargarCuentas" style="margin-top:10px">Reintentar</button></div>`;
  if (!c.lista.length) return '<div class="empty">Aún no hay cuentas.<br>Agrégalas en la hoja <b>Listas</b>, columna «Cuenta u origen».</div>';
  const entro = a => a.ing + a.rec, salio = a => a.gas + a.fij + a.aho + a.env;
  const enCuentas = c.lista.reduce((t, a) => t + a.saldo, 0);
  return `
  <div class="card hero"><div class="lbl">Saldo total</div><div class="big num ${c.total.saldo < 0 ? 'neg' : ''}">${money(c.total.saldo)}</div>
    <div class="sub"><span>En tus cuentas <b class="num">${money(enCuentas)}</b></span>${Math.abs(c.sin.saldo) > 0.5 ? `<span>Sin cuenta <b class="num">${money(c.sin.saldo)}</b></span>` : ''}</div></div>
  ${c.lista.map(a => `<button class="card" style="width:100%;text-align:left;display:block" data-a="cuentaDet" data-n="${esc(a.n)}">
      <div class="row between"><b style="font-size:16px">${esc(a.n)}</b><span class="num ${a.saldo < 0 ? 'neg' : ''}" style="font-size:20px;font-weight:700">${money(a.saldo)}</span></div>
      <div class="row between small muted" style="margin-top:8px"><span>Inicial <b class="num" style="color:var(--tx)">${short(a.ini)}</b></span><span>Entró <b class="num pos">+${short(entro(a))}</b></span><span>Salió <b class="num neg">−${short(salio(a))}</b></span></div></button>`).join('')}
  ${Math.abs(c.sin.ing) + Math.abs(c.sin.gas) + Math.abs(c.sin.fij) + Math.abs(c.sin.aho) > 0.5 ? `<div class="card small muted">Hay movimientos sin cuenta asignada: entró ${money(c.sin.ing)} · salió ${money(c.sin.gas + c.sin.fij + c.sin.aho)}. Asígnales cuenta desde el Historial para que los saldos sean exactos.</div>` : ''}
  <p class="small dim" style="margin:6px 4px">Toca una cuenta para ver el detalle o cambiar su saldo inicial. Los saldos se calculan con todo el año.</p>`;
}

function sheetCuenta(n) {
  const a = S.cuentas?.lista.find(x => x.n === n); if (!a) return;
  const fila = (t, v, sg) => `<div class="row between item"><span class="muted">${t}</span><b class="num ${sg < 0 ? 'neg' : sg > 0 ? 'pos' : ''}">${sg < 0 ? '−' : sg > 0 ? '+' : ''}${money(v)}</b></div>`;
  openSheet(`<h2>${esc(a.n)}</h2>
    ${fila('Saldo inicial', a.ini, 0)}${fila('Ingresos', a.ing, 1)}${fila('Transferencias recibidas', a.rec, 1)}
    ${fila('Gastos', a.gas, -1)}${fila('Fijos pagados', a.fij, -1)}${fila('Aportes a metas', a.aho, -1)}${fila('Transferencias enviadas', a.env, -1)}
    <div class="row between item"><b>Saldo actual</b><b class="num ${a.saldo < 0 ? 'neg' : ''}" style="font-size:18px">${money(a.saldo)}</b></div>
    <label>Saldo inicial de la cuenta (lo que tenías al empezar el año)</label>
    <input class="field num" id="m-v" type="number" inputmode="numeric" value="${a.ini}">
    <div style="height:16px"></div><button class="btn" data-a="saldoSave" data-n="${esc(a.n)}">Guardar saldo inicial</button>`);
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
    <div class="sub">${k.saldoIni ? `<span>Saldos iniciales <b class="num">${short(k.saldoIni)}</b></span>` : ''}<span>Tasa de ahorro <b>${pct(k.tasaAhorro, 1)}</b></span><span>Ejecución <b>${pct(k.ejec)}</b></span></div></div>
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
      <div class="grow"><div class="t ell">${esc(x.c)}</div><div class="small muted ell">${tr && S.config.cuentasListas ? `${esc(x.cuenta || 'Ahorro')} → ${esc(x.destino || '¿?')}` : esc(x.cat) + (x.cuenta ? ' · ' + esc(x.cuenta) : '')}${x.control && x.control !== 'OK' ? ` · <span class="neg">${esc(x.control)}</span>` : ''}</div></div>
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
    <div style="height:10px"></div><button class="btn sec" data-a="diag">Diagnosticar la conexión</button>
    <div style="height:10px"></div><button class="btn sec" data-a="demo">Ver con datos de ejemplo</button>
    ${S.cfg && S.config ? `<div style="height:10px"></div><button class="btn sec" data-a="copias">Copias de seguridad</button><div style="height:10px"></div><button class="btn sec" data-a="wzStart">Asistente de configuración</button>` : ''}
    ${S.cfg ? `<div style="height:10px"></div><button class="btn danger" data-a="logout">Desconectar este dispositivo</button>` : ''}
    <p class="small dim" style="margin:14px 0 0">Versión de la app: ${APP_VERSION}. Los datos viven solo en tu Google Sheets. En este dispositivo se guarda la URL, la clave y una copia para ver sin conexión.</p>`);
}

function sheetFijo(row) {
  const f = S.months[S.mes].fijos.find(x => x.row === Number(row)); if (!f) return;
  const pagado = f.estado === 'Pagado';
  openSheet(`<h2>${esc(f.c)}</h2><div class="muted small" style="margin-top:-8px">${esc(f.cat)} · presupuesto ${money(f.p)}${f.dia ? ' · día ' + f.dia : ''}</div>
    ${pagado ? `${f.cuenta ? `<div class="small muted" style="margin-top:10px">Pagado desde <b style="color:var(--tx)">${esc(f.cuenta)}</b></div>` : ''}<div style="height:18px"></div><button class="btn sec" data-a="fijoSet" data-row="${f.row}" data-e="Pendiente">Marcar como pendiente</button>` :
      `<label>Valor pagado</label><input class="field num" id="f-real" type="number" inputmode="numeric" value="${f.p}">
      <div class="small dim" style="margin-top:6px">Si pagaste otro valor, cámbialo. Se cuenta como gasto del mes.</div>
      ${cuentaField('f-cu', f.cuenta || S.entry.cuenta, 'Pagado desde la cuenta')}
      <div style="height:16px"></div><button class="btn" data-a="fijoSet" data-row="${f.row}" data-e="Pagado">Marcar como pagado</button>`}
    <div style="height:10px"></div><button class="btn sec" data-a="fijoEditar" data-row="${f.row}">Editar este gasto fijo</button>`);
}

function sheetFijoForm(f) {
  const cfg = S.config, nuevo = !f;
  const x = f || { c: '', p: '', cat: cfg.categorias[0]?.n, dia: '', cuenta: '' };
  S._fijoRow = f ? f.row : null;
  openSheet(`<h2>${nuevo ? 'Nuevo gasto fijo' : 'Editar gasto fijo'}</h2>
    <label>Nombre</label><input class="field" id="x-c" value="${esc(x.c)}" maxlength="60" placeholder="Ej. Arriendo, Internet, Netflix">
    <div class="grid2"><div><label>Valor mensual</label><input class="field num" id="x-p" type="number" inputmode="numeric" value="${x.p}" placeholder="0"></div>
    <div><label>Día de pago</label><input class="field num" id="x-d" type="number" inputmode="numeric" min="1" max="31" value="${x.dia || ''}" placeholder="1–31"></div></div>
    <label>Categoría</label><select class="field" id="x-cat">${cfg.categorias.map(c => `<option ${c.n === x.cat ? 'selected' : ''}>${esc(c.n)}</option>`).join('')}</select>
    ${cuentaField('x-cu', x.cuenta || S.entry.cuenta, 'Se paga desde la cuenta')}
    <label>${nuevo ? 'Aplicar a' : 'Aplicar el cambio a'}</label>
    <select class="field" id="x-al"><option value="siguientes">Este mes y los siguientes</option><option value="todos">Todo el año</option><option value="este">Solo este mes</option></select>
    <div class="small dim" style="margin-top:6px">${nuevo ? 'Se agrega como pendiente en cada mes elegido.' : 'En los otros meses se busca el gasto por su nombre. Los ya pagados conservan su pago.'}</div>
    <div style="height:16px"></div><button class="btn" data-a="fijoGuardar">${nuevo ? 'Agregar' : 'Guardar cambios'}</button>
    ${nuevo ? '' : '<div style="height:10px"></div><button class="btn danger" data-a="fijoBorrar">Quitar este gasto fijo</button>'}`);
}

function sheetMetaForm(meta) {
  const nuevo = !meta, obj = nuevo ? '' : (S.config.listas?.metas || []).find(x => x.n === meta.n)?.obj;
  S._meta = nuevo ? null : { n: meta.n, mensual: meta.p };
  openSheet(`<h2>${nuevo ? 'Nueva meta de ahorro o inversión' : 'Editar meta'}</h2>
    <label>Nombre</label><input class="field" id="t-n" maxlength="60" value="${nuevo ? '' : esc(meta.n)}" placeholder="Ej. Fondo de emergencia, Viaje, CDT">
    <label>Objetivo del año</label><input class="field num" id="t-o" type="number" inputmode="numeric" value="${obj ?? ''}" placeholder="Cuánto quieres juntar (opcional)">
    <label>Aporte planeado por mes</label><input class="field num" id="t-m" type="number" inputmode="numeric" value="${nuevo || !meta.p ? '' : meta.p}" placeholder="Opcional">
    <label>Aplicar el aporte planeado a</label>
    <select class="field" id="t-al"><option value="siguientes">Este mes y los siguientes</option><option value="todos">Todo el año</option><option value="este">Solo este mes</option></select>
    <div class="small dim" style="margin-top:6px">${nuevo ? 'Después registras cada aporte con «+ Aporte» en la meta. Puedes tener hasta 8 metas.' : 'El nombre y el objetivo cambian en todos los meses. El aporte planeado solo se cambia si modificas ese valor.'}</div>
    <div style="height:16px"></div><button class="btn" data-a="metaGuardar">${nuevo ? 'Agregar meta' : 'Guardar cambios'}</button>
    ${nuevo ? '' : '<div style="height:10px"></div><button class="btn danger" data-a="metaBorrar">Quitar esta meta</button>'}`);
}

function sheetIngresoForm(i) {
  const cfg = S.config, nuevo = !i;
  const x = i || { c: '', p: '', cuenta: '' };
  S._ingRow = i ? i.row : null;
  openSheet(`<h2>${nuevo ? 'Nuevo ingreso mensual' : 'Editar ingreso mensual'}</h2>
    <label>Nombre</label><input class="field" id="g-c" value="${esc(x.c)}" maxlength="60" placeholder="Ej. Salario, Arriendo recibido">
    <label>Valor esperado cada mes</label><input class="field num" id="g-p" type="number" inputmode="numeric" value="${x.p === 0 ? '' : x.p}" placeholder="0">
    ${cuentaField('g-cu', x.cuenta || store.get('cuentaIng', ''), 'Entra a la cuenta')}
    <label>${nuevo ? 'Aplicar a' : 'Aplicar el cambio a'}</label>
    <select class="field" id="g-al"><option value="siguientes">Este mes y los siguientes</option><option value="todos">Todo el año</option><option value="este">Solo este mes</option></select>
    <div class="small dim" style="margin-top:6px">${nuevo ? 'Se agrega en cada mes elegido donde todavía no exista.' : 'En los otros meses se busca el ingreso por su nombre. Lo que ya recibiste no se modifica.'}</div>
    <div style="height:16px"></div><button class="btn" data-a="ingGuardar">${nuevo ? 'Agregar' : 'Guardar cambios'}</button>
    ${nuevo ? '' : '<div style="height:10px"></div><button class="btn danger" data-a="ingBorrar">Quitar este ingreso</button>'}`);
}

function sheetEditar(row) {
  const m = S.months[S.mes]; const x = m.movs.find(z => z.row === Number(row)); if (!x) return;
  const cfg = S.config;
  openSheet(`<h2>Editar movimiento</h2>
    <label>Concepto</label><input class="field" id="e-c" value="${esc(x.c)}" maxlength="80">
    <label>Valor</label><input class="field num" id="e-v" type="number" inputmode="numeric" value="${x.v}">
    <div class="grid2"><div><label>Categoría</label><select class="field" id="e-cat">${cfg.categorias.map(c => `<option ${c.n === x.cat ? 'selected' : ''}>${esc(c.n)}</option>`).join('')}</select></div>
    <div><label>Fecha</label><input class="field" id="e-f" type="date" value="${x.f}"></div>
    <div><label>Cuenta${cfg.cuentasListas ? ' / origen' : ''}</label><select class="field" id="e-cu"><option value="">Sin cuenta</option>${cfg.cuentas.map(c => `<option ${c === x.cuenta ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
    <div><label>Tipo</label><select class="field" id="e-t">${cfg.tipos.map(c => `<option ${c === x.tipo ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div></div>
    ${cfg.cuentasListas ? `<div id="e-dw" style="${x.tipo === 'Transferencia' ? '' : 'display:none'}"><label>Cuenta destino (la que recibe)</label><select class="field" id="e-d"><option value="">Elegir…</option>${cfg.cuentas.map(c => `<option ${c === x.destino ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>` : ''}
    <div style="height:18px"></div><button class="btn" data-a="editSave" data-row="${x.row}">Guardar cambios</button>
    <div style="height:10px"></div><button class="btn danger" data-a="editDel" data-row="${x.row}">Eliminar movimiento</button>`);
}

function sheetMonto(title, label, def, action, extra = '', pie = '') {
  openSheet(`<h2>${esc(title)}</h2><label>${esc(label)}</label><input class="field num" id="m-v" type="number" inputmode="numeric" value="${def ?? ''}" placeholder="0">${extra}
    <div style="height:16px"></div><button class="btn" data-a="${action}">Guardar</button>${pie}`, r => setTimeout(() => $('#m-v', r)?.focus(), 250));
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
    <div style="height:10px"></div><button class="btn sec" data-a="diag">Diagnosticar la conexión</button>
    <div style="height:10px"></div><button class="btn sec" data-a="demo">Probar con datos de ejemplo</button>
    <p class="small dim" style="margin-top:14px">Versión de la app: ${APP_VERSION}</p></div>`;
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
    store.set('cfg', S.cfg); persist(); closeSheet(); toast('Conectado ✓'); render(); maybeWizard();
  } catch (e) {
    S.cfg = prev; toast(e.message, true); if (btn) { btn.disabled = false; btn.textContent = 'Probar y guardar'; }
  }
}


// ------------------------------------------------------------------ diagnóstico de conexión
async function diagnostico() {
  const url = ($('#s-url')?.value || S.cfg?.url || '').trim(), key = ($('#s-key')?.value || S.cfg?.key || '').trim();
  const lines = [];
  const show = fin => openSheet(`<h2>Diagnóstico</h2>${lines.map(l => `<div class="item"><b class="${l[0] === 'ok' ? 'pos' : l[0] === 'bad' ? 'neg' : ''}">${l[0] === 'ok' ? '✓' : l[0] === 'bad' ? '✗' : '•'}</b> ${l[1]}</div>`).join('')}
    ${fin ? '' : '<div class="small muted" style="margin-top:12px">Probando…</div>'}<div style="height:14px"></div><button class="btn sec" data-a="closeSheet">Cerrar</button>`);
  const add = (t, m) => { lines.push([t, m]); show(false); };
  show(false);
  add('info', `Versión de la app: <b>${APP_VERSION}</b>`);
  if (!url) { add('bad', 'No hay URL escrita.'); return show(true); }
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url)) {
    add('bad', `La URL no tiene el formato correcto. Debe ser <b>https://script.google.com/macros/s/…/exec</b> (termina en <b>/exec</b>, no en /dev). La tuya termina en: <b>${esc(url.slice(-12))}</b>`);
  } else add('ok', 'La URL tiene el formato correcto.');
  add(navigator.onLine === false ? 'bad' : 'ok', navigator.onLine === false ? 'El celular no tiene internet.' : 'El celular tiene internet.');
  // GET con lectura (CORS)
  let leido = false;
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow' });
    const j = await r.json(); leido = true;
    add('ok', 'El script responde y la app puede leerlo.');
    if (j.claveEstado === 'no_configurada') add('bad', 'En el script la CLAVE sigue siendo la de ejemplo. Cámbiala, guarda y publica una <b>Nueva versión</b> (Implementar → Administrar implementaciones → ✏ → Nueva versión).');
    else if (j.claveEstado === 'corta') add('bad', `La CLAVE del script tiene solo ${j.claveLongitud} caracteres; debe tener al menos 10. Cámbiala y publica una <b>Nueva versión</b>.`);
    else if (j.claveEstado === 'ok') add('ok', `El script tiene una clave de ${j.claveLongitud} caracteres.` + (key && limpiarClave(key).length !== j.claveLongitud ? ` <b>La de la app tiene ${limpiarClave(key).length}</b>: no son iguales, revisa que no falte o sobre algún carácter.` : ''));
    else add('bad', 'El script desplegado es una versión anterior (no informa el estado de la clave). Publica una <b>Nueva versión</b> con el Code.gs más reciente.');
  } catch (e) {
    add('bad', `No se pudo leer la respuesta (${esc(e.message || e.name)}).`);
    try {
      await fetch(url, { mode: 'no-cors', redirect: 'follow' });
      add('bad', 'Google sí responde, pero bloquea a la app: casi seguro la implementación <b>no está como «Cualquier persona»</b> (puede estar como «Cualquier persona con cuenta de Google» o «Solo yo»). En Apps Script: Implementar → Administrar implementaciones → ✏ → Quién tiene acceso: Cualquier persona → Versión: Nueva versión → Implementar.');
    } catch (e2) {
      add('bad', 'No se llega a script.google.com con esa URL. Revisa que esté completa y bien copiada (sin espacios), y que no haya un bloqueador de anuncios o VPN activo.');
    }
  }
  // POST con clave
  if (leido && key) {
    try {
      const r = await fetch(url, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ token: limpiarClave(key), action: 'bootstrap' }) });
      const j = await r.json();
      if (j.ok) add('ok', `Clave correcta. Hoja leída: año ${j.config.year}, ${j.config.categorias.length} categorías, mes ${esc(j.month.mes)}.`);
      else if (j.error === 'unauthorized') add('bad', 'La clave NO coincide con la del script. Si las longitudes de arriba son iguales, hay algún carácter distinto (por ejemplo O y 0, l e I, o una mayúscula). Lo más seguro: escribe una clave nueva solo con letras minúsculas y números, en el script y en la app.');
      else if (/^clave_/.test(j.error || '')) add('bad', errorTexto(j.error));
      else add('bad', 'El script respondió con un error: <b>' + esc(j.error) + '</b>');
    } catch (e) { add('bad', `El envío con clave falló (${esc(e.message || e.name)}).`); }
  } else if (leido && !key) add('bad', 'Falta escribir la clave.');
  show(true);
}

// ------------------------------------------------------------------ eventos
document.addEventListener('click', async ev => {
  const el = ev.target.closest('[data-a]'); if (!el) return;
  const a = el.dataset.a, k = el.dataset.k, row = el.dataset.row;
  const m = S.months[S.mes];
  switch (a) {
    case 'tab': S.view = k; $('#view').scrollTop = 0; if (k === 'cuentas') S.cuentas = null; render(); if (k === 'anio') loadYear(); break;
    case 'recargar': await loadAll(true); break;
    case 'recargarCuentas': S.cuentas = null; render(); break;
    case 'cuentaDet': sheetCuenta(el.dataset.n); break;
    case 'saldoSave': try { await api('setOpening', { cuenta: el.dataset.n, valor: Number($('#m-v').value) }); closeSheet(); toast('Saldo inicial guardado ✓'); S.cuentas = null; loadCuentas(); } catch (e) { toast(e.message, true); } break;
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
    case 'diag': diagnostico(); break;
    case 'demo': S.entry.fecha = DEMO.config.year + '-09-28'; S.cfg = { demo: true }; store.set('cfg', S.cfg); S.config = DEMO.config; S.mes = DEMO.config.mesActual; S.months = JSON.parse(JSON.stringify(DEMO.months)); S.year = DEMO.year; S.queue = []; closeSheet(); render(); break;
    case 'logout': if (confirm('¿Desconectar este dispositivo? Los datos siguen en tu hoja.')) { ['cfg', 'cache', 'queue'].forEach(x => store.del(x)); S.cfg = null; S.queue = []; S.months = {}; S.year = null; S.config = null; closeSheet(); render(); } break;
    case 'fijo': sheetFijo(row); break;
    case 'fijoSet': {
      const real = $('#f-real') ? Number($('#f-real').value) : null; const f = m.fijos.find(x => x.row === Number(row));
      const cuenta = el.dataset.e === 'Pagado' ? cuentaVal('f-cu') : undefined;
      try { await api('setFixed', { mes: S.mes, row: Number(row), estado: el.dataset.e, real: real != null && real !== f.p ? real : null, cuenta }); closeSheet(); toast(el.dataset.e === 'Pagado' ? 'Marcado como pagado ✓' : 'Marcado como pendiente'); buzz(); await loadMonth(S.mes); }
      catch (e) { toast(e.message, true); } break;
    }
    case 'fijoNuevo': sheetFijoForm(null); break;
    case 'fijoEditar': sheetFijoForm(m.fijos.find(x => x.row === Number(row))); break;
    case 'fijoGuardar': {
      const datos = { mes: S.mes, concepto: $('#x-c').value, presupuesto: Number($('#x-p').value), categoria: $('#x-cat').value, dia: $('#x-d').value === '' ? null : Number($('#x-d').value), cuenta: cuentaVal('x-cu'), alcance: $('#x-al').value };
      if (!datos.concepto.trim()) { toast('Escribe el nombre del gasto', true); break; }
      try {
        const r = await api(S._fijoRow ? 'editFixed' : 'addFixed', S._fijoRow ? { ...datos, row: S._fijoRow } : datos);
        closeSheet(); toast(S._fijoRow ? `Actualizado en ${r.meses} ${r.meses === 1 ? 'mes' : 'meses'} ✓` : `Agregado en ${r.meses} ${r.meses === 1 ? 'mes' : 'meses'} ✓`); await loadMonth(S.mes);
      } catch (e) { toast(e.message, true); } break;
    }
    case 'fijoBorrar': {
      const f = m.fijos.find(x => x.row === S._fijoRow); const al = $('#x-al').value;
      if (!confirm(`¿Quitar «${f.c}» ${al === 'este' ? 'solo de ' + S.mes : al === 'todos' ? 'de todo el año' : 'de ' + S.mes + ' en adelante'}? Los meses donde ya está pagado se conservan.`)) break;
      try { const r = await api('delFixed', { mes: S.mes, row: S._fijoRow, alcance: al }); closeSheet(); toast(`Quitado de ${r.meses} ${r.meses === 1 ? 'mes' : 'meses'}`); await loadMonth(S.mes); } catch (e) { toast(e.message, true); } break;
    }
    case 'fijoCopiar': {
      if (!confirm(`¿Copiar los gastos fijos de ${S.mes} a todos los meses que todavía no tienen? Los meses con datos no se tocan.`)) break;
      try { const r = await api('copyFixed', { desde: S.mes, alcance: 'todos' }); toast(r.meses ? `Copiados a ${r.meses} ${r.meses === 1 ? 'mes' : 'meses'} ✓` : 'Todos los meses ya tienen gastos fijos'); await loadMonth(S.mes); } catch (e) { toast(e.message, true); } break;
    }
    case 'fijoDelAnterior': {
      const prev = MESES[MESES.indexOf(S.mes) - 1];
      try { await api('copyFixed', { desde: prev, alcance: 'siguiente' }); toast(`Copiados de ${prev} ✓`); await loadMonth(S.mes); } catch (e) { toast(e.message, true); } break;
    }
    case 'editar': sheetEditar(row); break;
    case 'editSave': {
      const x = m.movs.find(z => z.row === Number(row));
      try { await api('update', { mes: S.mes, row: Number(row), esperado: { c: x.c, v: x.v }, concepto: $('#e-c').value, valor: Number($('#e-v').value), categoria: $('#e-cat').value, fecha: $('#e-f').value, cuenta: $('#e-cu').value, destino: $('#e-d') ? $('#e-d').value : '', tipo: $('#e-t').value }); closeSheet(); toast('Cambios guardados ✓'); await loadMonth(S.mes); }
      catch (e) { toast(e.message, true); } break;
    }
    case 'editDel': {
      const x = m.movs.find(z => z.row === Number(row)); if (!confirm(`¿Eliminar «${x.c}» por ${money(x.v)}?`)) break;
      try { await api('delete', { mes: S.mes, row: Number(row), esperado: { c: x.c, v: x.v } }); closeSheet(); toast('Eliminado'); await loadMonth(S.mes); } catch (e) { toast(e.message, true); } break;
    }
    case 'ingreso': { const i = m.ingresos.find(z => z.row === Number(row)); S._row = Number(row); sheetMonto(i.c, 'Valor recibido', i.r ?? i.p, 'ingresoSave', cuentaField('m-cu', i.cuenta || store.get('cuentaIng', ''), 'Entró a la cuenta'), `<div style="height:10px"></div><button class="btn sec" data-a="ingEditar" data-row="${i.row}">Editar este ingreso (nombre, valor, meses)</button>`); break; }
    case 'ingresoSave': try { await api('setIncome', { mes: S.mes, row: S._row, real: Number($('#m-v').value), cuenta: cuentaVal('m-cu') }); if (cuentaVal('m-cu')) store.set('cuentaIng', cuentaVal('m-cu')); closeSheet(); toast('Ingreso registrado ✓'); await loadMonth(S.mes); } catch (e) { toast(e.message, true); } break;
    case 'nuevoIngreso': sheetMonto('Nuevo ingreso', 'Valor recibido', '', 'ingresoNuevoSave', '<label>Concepto</label><input class="field" id="m-c" placeholder="Ej. Venta, bono, reembolso" maxlength="60">' + cuentaField('m-cu', store.get('cuentaIng', ''), 'Entró a la cuenta'), '<div style="height:10px"></div><button class="btn sec" data-a="ingNuevoPlan">En cambio, crear un ingreso que se repite cada mes</button>'); break;
    case 'metaNueva': sheetMetaForm(null); break;
    case 'metaEditar': sheetMetaForm(m.ahorro.find(z => z.row === Number(row))); break;
    case 'metaGuardar': {
      const nombre = $('#t-n').value.trim(); if (!nombre) { toast('Escribe el nombre de la meta', true); break; }
      const objetivo = $('#t-o').value === '' ? null : Number($('#t-o').value), mensualTxt = $('#t-m').value, alcance = $('#t-al').value;
      try {
        if (S._meta) {
          const cambio = (mensualTxt === '' ? 0 : Number(mensualTxt)) !== (S._meta.mensual || 0);
          await api('editGoal', { nombre: S._meta.n, nuevoNombre: nombre, objetivo, mensual: cambio ? (mensualTxt === '' ? 0 : Number(mensualTxt)) : undefined, mes: S.mes, alcance });
          closeSheet(); toast('Meta actualizada ✓');
        } else {
          await api('addGoal', { nombre, objetivo, mensual: mensualTxt === '' ? 0 : Number(mensualTxt), mes: S.mes, alcance });
          closeSheet(); toast('Meta agregada ✓');
        }
        S.months = {}; await loadAll(true);
      } catch (e) { toast(e.message, true); } break;
    }
    case 'metaBorrar': {
      const n = S._meta.n;
      if (!confirm(`¿Quitar la meta «${n}» de todos los meses?`)) break;
      try {
        let r = await api('delGoal', { nombre: n });
        if (r.pendiente) {
          if (!confirm(`«${n}» ya tiene aportes por ${money(r.aportes)} en ${r.meses} ${r.meses === 1 ? 'mes' : 'meses'}. Si la quitas, esos aportes se borran (y también los traslados a otras cuentas que se hicieron con ellos). ¿Quitarla de todos modos?`)) break;
          r = await api('delGoal', { nombre: n, forzar: true });
        }
        closeSheet(); toast('Meta quitada'); S.months = {}; await loadAll(true);
      } catch (e) { toast(e.message, true); } break;
    }
    case 'ingEditar': sheetIngresoForm(m.ingresos.find(z => z.row === Number(row))); break;
    case 'ingNuevoPlan': sheetIngresoForm(null); break;
    case 'ingGuardar': {
      const datos = { mes: S.mes, concepto: $('#g-c').value, presupuesto: Number($('#g-p').value) || 0, cuenta: cuentaVal('g-cu'), alcance: $('#g-al').value };
      if (!datos.concepto.trim()) { toast('Escribe el nombre del ingreso', true); break; }
      try {
        const r = await api(S._ingRow ? 'editIncome' : 'addIncomePlan', S._ingRow ? { ...datos, row: S._ingRow } : datos);
        if (datos.cuenta) store.set('cuentaIng', datos.cuenta);
        closeSheet();
        toast(r.meses ? `${S._ingRow ? 'Actualizado' : 'Agregado'} en ${r.meses} ${r.meses === 1 ? 'mes' : 'meses'} ✓` : 'Ese ingreso ya existía en esos meses');
        await loadMonth(S.mes);
      } catch (e) { toast(e.message, true); } break;
    }
    case 'ingBorrar': {
      const i = m.ingresos.find(x => x.row === S._ingRow); const al = $('#g-al').value;
      if (!confirm(`¿Quitar «${i.c}» ${al === 'este' ? 'solo de ' + S.mes : al === 'todos' ? 'de todo el año' : 'de ' + S.mes + ' en adelante'}? Los meses donde ya recibiste dinero se conservan.`)) break;
      try { const r = await api('delIncome', { mes: S.mes, row: S._ingRow, alcance: al }); closeSheet(); toast(`Quitado de ${r.meses} ${r.meses === 1 ? 'mes' : 'meses'}`); await loadMonth(S.mes); } catch (e) { toast(e.message, true); } break;
    }
    case 'ingresoNuevoSave': try { await api('addIncome', { mes: S.mes, concepto: $('#m-c').value, real: Number($('#m-v').value), cuenta: cuentaVal('m-cu') }); if (cuentaVal('m-cu')) store.set('cuentaIng', cuentaVal('m-cu')); closeSheet(); toast('Ingreso agregado ✓'); await loadMonth(S.mes); } catch (e) { toast(e.message, true); } break;
    case 'aporte': {
      const meta = m.ahorro.find(z => z.row === Number(row)); S._row = Number(row);
      const destField = cuentaField('m-cd', store.get('ahDest:' + meta.n, ''), 'Pasa a la cuenta de ahorro (opcional)').replace('Sin cuenta', 'Ninguna (solo suma a la meta)');
      const cats = S.config.categorias.map(c => c.n), catDef = store.get('ahCat:' + meta.n, '') || (cats.includes('Otros') ? 'Otros' : cats[0]);
      const catField = `<div id="m-catw" style="${store.get('ahDest:' + meta.n, '') ? '' : 'display:none'}"><label>Categoría del movimiento</label><select class="field" id="m-cat">${cats.map(c => `<option ${c === catDef ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>`;
      sheetMonto('Aporte a ' + meta.n, 'Valor ahorrado', '', 'aporteSave', cuentaField('m-cu', store.get('ahOrig:' + meta.n, ''), 'Sale de la cuenta') + destField + (destField ? '<div class="small dim" style="margin-top:6px"><b>Con cuenta de ahorro:</b> el dinero sale de la primera y entra a la segunda, y queda un registro en el Historial. <b>Sin ella:</b> el aporte solo suma a la meta y se descuenta de la cuenta de origen (no aparece como movimiento).</div>' + catField : '')); break;
    }
    case 'aporteSave': {
      const meta = m.ahorro.find(z => z.row === S._row), destino = cuentaVal('m-cd') || '', origen = cuentaVal('m-cu');
      const hoy = todayIso(), fecha = hoy.slice(0, 7) === `${S.config.year}-${String(MESES.indexOf(S.mes) + 1).padStart(2, '0')}` ? hoy : `${S.config.year}-${String(MESES.indexOf(S.mes) + 1).padStart(2, '0')}-01`;
      try {
        const categoria = destino && $('#m-cat') ? $('#m-cat').value : undefined;
        await api('addSaving', { mes: S.mes, row: S._row, monto: Number($('#m-v').value), cuenta: origen, destino, categoria, id: destino ? uid() : undefined, fecha });
        if (meta) { store.set('ahDest:' + meta.n, destino); if (origen) store.set('ahOrig:' + meta.n, origen); if (categoria) store.set('ahCat:' + meta.n, categoria); }
        closeSheet(); toast(destino ? `Aporte registrado y pasado a ${destino} ✓` : 'Aporte registrado ✓'); await loadMonth(S.mes);
      } catch (e) { toast(e.message, true); } break;
    }
    case 'descartar': S.queue = S.queue.filter(o => o.id !== el.dataset.id); persist(); render(); break;
    case 'reintentar': { const o = S.queue.find(z => z.id === el.dataset.id); if (o) { delete o.error; persist(); flushQueue(); } break; }
  }
});
document.addEventListener('input', ev => {
  const el = ev.target; if (el.dataset?.a === 'concepto') S.entry.concepto = el.value;
  if (el.id === 'amt') {                                   // monto: teclado numérico del celular, con puntos de miles
    const pos = el.selectionStart ?? el.value.length;
    let antes = el.value.slice(0, pos).replace(/\D/g, '').length;      // dígitos a la izquierda del cursor
    let d = el.value.replace(/\D/g, '');
    if (d === S.entry.digits && ev.inputType === 'deleteContentBackward' && antes > 0) { d = d.slice(0, antes - 1) + d.slice(antes); antes--; }   // borró un punto: quita el dígito
    d = d.replace(/^0+/, '').slice(0, 10); antes = Math.min(antes, d.length);
    S.entry.digits = d;
    el.value = d ? Number(d).toLocaleString('es-CO') : '';
    let c = 0, seen = 0; while (c < el.value.length && seen < antes) { if (/\d/.test(el.value[c])) seen++; c++; }
    try { el.setSelectionRange(c, c); } catch { /* sin cursor */ }
    el.closest('.cur')?.classList.toggle('empty', !d); fitAmt(el);
    const btn = $('[data-a=guardar]'); if (btn) btn.disabled = !puedeGuardar();
  }
});
document.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.id === 'amt') ev.target.blur(); });
document.addEventListener('change', ev => {
  const el = ev.target;
  if (el.dataset?.a === 'fecha' && el.value) { S.entry.fecha = el.value; const i = Number(el.value.slice(5, 7)) - 1; if (MESES[i] !== S.mes) loadMonth(MESES[i]); else render(); }
  if (el.dataset?.a === 'cuenta') { S.entry.cuenta = el.value; store.set('cuenta', el.value); render(); }
  if (el.dataset?.a === 'destino') { S.entry.destino = el.value; render(); }
  if (el.id === 'm-cd') { const w = $('#m-catw'); if (w) w.style.display = el.value ? '' : 'none'; }
  if (el.id === 'e-t') { const w = $('#e-dw'); if (w) w.style.display = el.value === 'Transferencia' ? '' : 'none'; }
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
        case 'editIncome': { const i = m.ingresos.find(z => z.row === d.row); Object.assign(i, { c: d.concepto, p: d.presupuesto, cuenta: d.cuenta || '' }); return res({ ok: true, meses: d.alcance === 'este' ? 1 : d.alcance === 'todos' ? 12 : 12 - MESES.indexOf(d.mes) }); }
        case 'delIncome': { const i = m.ingresos.findIndex(z => z.row === d.row); m.ingresos.splice(i, 1); return res({ ok: true, meses: 1 }); }
        case 'addIncomePlan': { m.ingresos.push({ row: 30, c: d.concepto, p: d.presupuesto, r: null, cuenta: d.cuenta || '' }); return res({ ok: true, meses: d.alcance === 'este' ? 1 : 12 - MESES.indexOf(d.mes) }); }
        case 'addGoal': { const m0 = DEMO.config; m0.metas.push(d.nombre); m.ahorro.push({ row: 31 + m.ahorro.length, n: d.nombre, p: d.mensual || 0, r: 0, dif: -(d.mensual || 0), pc: 0, pIngreso: 0 }); return res({ ok: true, meses: d.mensual ? 1 : 0 }); }
        case 'editGoal': { const g = m.ahorro.find(z => z.n === d.nombre); if (g) { g.n = d.nuevoNombre; if (d.mensual !== undefined) g.p = d.mensual; } return res({ ok: true, meses: 1 }); }
        case 'delGoal': { const i = m.ahorro.findIndex(z => z.n === d.nombre); if (i >= 0) m.ahorro.splice(i, 1); return res({ ok: true, meses: 0 }); }
        case 'addIncome': m.ingresos.push({ row: 30, c: d.concepto, p: 0, r: d.real }); m.kpi.ingReal += d.real; return res({ ok: true });
        case 'accounts': return res({ ok: true, cuentas: DEMO.cuentas });
        case 'backupStatus': case 'backupNow': case 'backupOn': case 'backupOff': { DEMO.copias = DEMO.copias || { permisos: true, activa: true, ultima: new Date(Date.now() - 9 * 864e5).toISOString(), total: 3, carpeta: '', conservar: 12 };
          if (action === 'backupNow') { DEMO.copias.ultima = new Date().toISOString(); DEMO.copias.total = Math.min(12, DEMO.copias.total + 1); } if (action === 'backupOn') DEMO.copias.activa = true; if (action === 'backupOff') DEMO.copias.activa = false;
          return res({ ok: true, copias: DEMO.copias }); }
        case 'setOpening': { const c = DEMO.cuentas.lista.find(z => z.n === d.cuenta); const dif = d.valor - c.ini; c.ini = d.valor; c.saldo += dif; DEMO.cuentas.total.saldo += dif; DEMO.cuentas.total.ini += dif; return res({ ok: true }); }
        case 'addFixed': { const row = 5 + m.fijos.length; m.fijos.push({ row, c: d.concepto, p: d.presupuesto, cat: d.categoria, dia: d.dia || 0, estado: 'Pendiente', real: null, cuenta: d.cuenta || '' }); m.fijosTot.total += d.presupuesto; m.fijosTot.pendiente += d.presupuesto; m.kpi.pendientes += d.presupuesto; return res({ ok: true, meses: d.alcance === 'este' ? 1 : d.alcance === 'todos' ? 12 : 12 - MESES.indexOf(d.mes) }); }
        case 'editFixed': { const f = m.fijos.find(z => z.row === d.row); Object.assign(f, { c: d.concepto, p: d.presupuesto, cat: d.categoria, dia: d.dia || 0, cuenta: d.cuenta || '' }); return res({ ok: true, meses: d.alcance === 'este' ? 1 : 12 - MESES.indexOf(d.mes) }); }
        case 'delFixed': { const i = m.fijos.findIndex(z => z.row === d.row); const f = m.fijos[i]; m.fijosTot.total -= f.p; m.fijosTot.pendiente -= f.p; m.kpi.pendientes -= f.p; m.fijos.splice(i, 1); return res({ ok: true, meses: 1 }); }
        case 'copyFixed': return res({ ok: true, meses: 1, conDatos: [] });
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
