/* Finanzas · asistente de primera vez y copias de seguridad. Usa las utilidades de app.js (S, api, esc, openSheet, toast…). */
'use strict';

const WZ_PASOS = ['bienvenida', 'cuentas', 'categorias', 'ingresos', 'fijos', 'presupuestos', 'metas', 'copias', 'resumen'];
const WZ_MAX = { cuentas: 10, cats: 20, metas: 8 };

// ------------------------------------------------------------------ datos iniciales (leídos de la hoja)
function wzListas() {
  const c = S.config || {};
  const pad = (arr, n, vacio) => Array.from({ length: n }, (_, i) => arr[i] || vacio);
  const L = c.listas || {
    cats: (c.categorias || []).map(x => ({ n: x.n, ocio: x.ocio })),
    cuentas: (c.cuentas || []).map(n => ({ n, ini: 0 })),
    metas: (c.metas || []).map(n => ({ n, obj: null })),
  };
  return {
    cats: pad(L.cats, WZ_MAX.cats, { n: '', ocio: false }),
    cuentas: pad(L.cuentas, WZ_MAX.cuentas, { n: '', ini: 0 }),
    metas: pad(L.metas, WZ_MAX.metas, { n: '', obj: null }),
  };
}

function wzInicial() {
  const L = wzListas();
  const filas = (arr, mk) => arr.map((x, i) => x.n ? { pos: i, ...mk(x) } : null).filter(Boolean);
  const d = {
    cuentas: filas(L.cuentas, x => ({ n: x.n, ini: x.ini || '' })),
    cats: filas(L.cats, x => ({ n: x.n, ocio: !!x.ocio, pres: '' })),
    metas: filas(L.metas, x => ({ n: x.n, obj: x.obj ?? '', mensual: '' })),
    ingresos: [{ c: '', p: '', cuenta: '' }],
    fijos: [{ c: '', p: '', dia: '', cat: '', cuenta: '' }],
    copias: true,
  };
  if (!d.cuentas.length) d.cuentas.push({ pos: null, n: '', ini: '' });
  if (!d.metas.length) d.metas.push({ pos: null, n: '', obj: '', mensual: '' });
  return d;
}

function startWizard(desdeCero) {
  const guardado = desdeCero ? null : store.get('wz', null);
  S.wz = guardado && guardado.d ? { on: true, step: guardado.step || 0, d: guardado.d, run: null } : { on: true, step: 0, d: wzInicial(), run: null };
  closeSheet(); render();
}
const wzSave = () => { if (S.wz) store.set('wz', { step: S.wz.step, d: S.wz.d }); };
const wzNombres = (lista) => S.wz.d[lista].map(r => (r.n || '').trim()).filter(Boolean);

function maybeWizard() {
  if (S.config?.asistente === 'pendiente' && !S.wz && !S.cfg?.demo) startWizard(false);
}

// ------------------------------------------------------------------ interfaz
const wzIn = (path, val, ph, extra = '') => `<input class="field" data-w="${path}" value="${esc(val ?? '')}" placeholder="${esc(ph)}" maxlength="60" autocomplete="off" ${extra}>`;
const wzNum = (path, val, ph) => `<input class="field num" data-w="${path}" data-num="1" type="number" inputmode="numeric" value="${val === '' || val == null ? '' : val}" placeholder="${ph}">`;
const wzSel = (path, val, opciones, vacio) => `<select class="field" data-w="${path}"><option value="">${vacio}</option>${opciones.map(o => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
const wzDelBtn = (lista, i) => `<button class="wz-x" data-a="wzDel" data-l="${lista}" data-i="${i}" aria-label="Quitar">✕</button>`;
const wzAddBtn = (lista, txt) => `<button class="btn sec" style="height:42px;font-size:14px;margin-top:8px" data-a="wzAdd" data-l="${lista}">+ ${txt}</button>`;

function wzCuerpo(paso, d) {
  const cuentas = wzNombres('cuentas'), cats = wzNombres('cats');
  const conSaldo = !!S.config?.cuentasListas;
  switch (paso) {
    case 'bienvenida': return `<h1>Dejemos tu hoja lista</h1>
      <p class="muted">En unos minutos configuramos lo que se hace una sola vez, para que después solo tengas que registrar tus gastos.</p>
      <div class="card" style="padding:6px 16px">${['Tus cuentas y cuánto tienen hoy', 'Tus categorías de gasto', 'Tus ingresos de cada mes', 'Tus gastos fijos (se copian a todo el año)', 'Presupuesto por categoría y metas de ahorro', 'Copia de seguridad automática'].map((t, i) => `<div class="item row" style="gap:12px"><b class="pos">${i + 1}</b><span>${t}</span></div>`).join('')}</div>
      <p class="small dim">Todo se puede cambiar después. Puedes saltar cualquier paso.</p>`;
    case 'cuentas': return `<h1>¿Dónde tienes tu plata?</h1>
      <p class="muted">Efectivo, cuentas de banco, billeteras digitales… ${conSaldo ? 'Escribe cuánto tiene cada una hoy.' : ''}</p>
      ${d.cuentas.map((r, i) => `<div class="wz-row"><div class="wz-main wz-two">${wzIn(`cuentas.${i}.n`, r.n, 'Nombre (ej. Bancolombia)')}${conSaldo ? wzNum(`cuentas.${i}.ini`, r.ini, 'Saldo actual') : ''}</div>${wzDelBtn('cuentas', i)}</div>`).join('')}
      ${d.cuentas.length < WZ_MAX.cuentas ? wzAddBtn('cuentas', 'Agregar cuenta') : ''}`;
    case 'categorias': return `<h1>¿En qué gastas?</h1>
      <p class="muted">Estas son tus categorías. Quita las que no uses o agrega otras. Marca <b>Ocio</b> en las que sean gustos o salidas: tienen su propio indicador.</p>
      ${d.cats.map((r, i) => `<div class="wz-row"><div class="wz-main wz-cat">${wzIn(`cats.${i}.n`, r.n, 'Nombre de la categoría')}<label class="wz-chk"><input type="checkbox" data-w="cats.${i}.ocio" ${r.ocio ? 'checked' : ''}> Ocio</label></div>${wzDelBtn('cats', i)}</div>`).join('')}
      ${d.cats.length < WZ_MAX.cats ? wzAddBtn('cats', 'Agregar categoría') : ''}
      <p class="small dim">Las categorías que ya tienen movimientos en la hoja no se pueden quitar ni renombrar.</p>`;
    case 'ingresos': return `<h1>¿Qué dinero te entra?</h1>
      <p class="muted">Sueldo, arriendos, pagos que recibes cada mes. Se agrega como «esperado» en todos los meses; cuando llegue, lo marcas como recibido.</p>
      ${d.ingresos.map((r, i) => `<div class="card wz-card"><div class="row between"><b class="small muted">Ingreso ${i + 1}</b>${wzDelBtn('ingresos', i)}</div>
        ${wzIn(`ingresos.${i}.c`, r.c, 'Nombre (ej. Salario)')}<div class="grid2">${wzNum(`ingresos.${i}.p`, r.p, 'Valor mensual')}${conSaldo ? wzSel(`ingresos.${i}.cuenta`, r.cuenta, cuentas, 'Entra a…') : '<div></div>'}</div></div>`).join('')}
      ${wzAddBtn('ingresos', 'Agregar otro ingreso')}`;
    case 'fijos': return `<h1>Tus gastos fijos</h1>
      <p class="muted">Arriendo, servicios, suscripciones, cuotas… Los escribes <b>una sola vez</b> y quedan en los 12 meses.</p>
      ${d.fijos.map((r, i) => `<div class="card wz-card"><div class="row between"><b class="small muted">Gasto fijo ${i + 1}</b>${wzDelBtn('fijos', i)}</div>
        ${wzIn(`fijos.${i}.c`, r.c, 'Nombre (ej. Arriendo)')}
        <div class="grid2">${wzNum(`fijos.${i}.p`, r.p, 'Valor mensual')}${wzNum(`fijos.${i}.dia`, r.dia, 'Día de pago (1–31)')}</div>
        <div class="grid2">${wzSel(`fijos.${i}.cat`, r.cat, cats, 'Categoría')}${conSaldo ? wzSel(`fijos.${i}.cuenta`, r.cuenta, cuentas, 'Se paga desde…') : '<div></div>'}</div></div>`).join('')}
      ${wzAddBtn('fijos', 'Agregar otro gasto fijo')}`;
    case 'presupuestos': return `<h1>Presupuesto por categoría</h1>
      <p class="muted">Cuánto piensas gastar al mes en lo variable (sin contar los fijos). Es opcional: déjalo vacío donde no quieras límite.</p>
      <div class="card" style="padding:6px 16px">${d.cats.filter(r => r.n.trim()).map(r => { const i = d.cats.indexOf(r); return `<div class="item row between" style="gap:12px"><span class="grow ell">${esc(r.n)}</span><div style="width:140px">${wzNum(`cats.${i}.pres`, r.pres, '$ al mes')}</div></div>`; }).join('') || '<div class="empty">Primero agrega categorías</div>'}</div>`;
    case 'metas': return `<h1>Metas de ahorro</h1>
      <p class="muted">Fondo de emergencia, un viaje, la universidad… El ahorro no cuenta como gasto.</p>
      ${d.metas.map((r, i) => `<div class="card wz-card"><div class="row between"><b class="small muted">Meta ${i + 1}</b>${wzDelBtn('metas', i)}</div>
        ${wzIn(`metas.${i}.n`, r.n, 'Nombre (ej. Fondo de emergencia)')}<div class="grid2">${wzNum(`metas.${i}.obj`, r.obj, 'Objetivo del año')}${wzNum(`metas.${i}.mensual`, r.mensual, 'Ahorro por mes')}</div></div>`).join('')}
      ${d.metas.length < WZ_MAX.metas ? wzAddBtn('metas', 'Agregar meta') : ''}`;
    case 'copias': return `<h1>Copia de seguridad</h1>
      <p class="muted">Cada mes se guarda una copia completa de tu hoja en una carpeta de tu Google Drive (se conservan las últimas 12). Si algo se daña o se borra por error, puedes volver a una copia.</p>
      <label class="card wz-check"><input type="checkbox" data-w="copias" ${d.copias ? 'checked' : ''}><div><b>Activar la copia mensual automática</b><div class="small muted">Además se hace una primera copia ahora.</div></div></label>
      <p class="small dim">Para esto el script de Google necesita permiso de Drive, que se da una sola vez (ver la guía, «autorizarPermisos»). Si todavía no lo diste, el asistente seguirá y podrás activarla después en Ajustes → Copias de seguridad.</p>`;
    case 'resumen': {
      const n = (a) => a.filter(r => (r.c ?? r.n ?? '').trim()).length;
      return `<h1>Todo listo para guardar</h1>
      <div class="card" style="padding:6px 16px">
        ${[['Cuentas', n(d.cuentas)], ['Categorías', n(d.cats)], ['Ingresos mensuales', n(d.ingresos)], ['Gastos fijos', n(d.fijos)], ['Categorías con presupuesto', d.cats.filter(r => Number(r.pres) > 0).length], ['Metas de ahorro', n(d.metas)]].map(([t, v]) => `<div class="item row between"><span>${t}</span><b class="num">${v}</b></div>`).join('')}
        <div class="item row between"><span>Copia automática</span><b>${d.copias ? 'Sí' : 'No'}</b></div></div>
      <p class="muted small">Al guardar, todo se escribe en tu hoja de Google (puede tardar un minuto). Nada de lo que ya tienes se borra.</p>`;
    }
  }
  return '';
}

function renderWizard() {
  const w = S.wz, paso = WZ_PASOS[w.step], d = w.d;
  $('#top').innerHTML = ''; $('#nav').innerHTML = '';
  if (w.run) return renderWizardRun();
  const ultimo = w.step === WZ_PASOS.length - 1, primero = w.step === 0;
  $('#view').innerHTML = `<div class="wz">
    <div class="wz-prog">${WZ_PASOS.map((_, i) => `<i class="${i <= w.step ? 'on' : ''}"></i>`).join('')}</div>
    <div class="small dim" style="margin:6px 0 14px">Paso ${w.step + 1} de ${WZ_PASOS.length}</div>
    ${wzCuerpo(paso, d)}
    <div class="wz-bar">
      ${primero ? '<button class="btn sec" data-a="wzOmitir">Ahora no</button>' : '<button class="btn sec" data-a="wzBack">Atrás</button>'}
      ${ultimo ? '<button class="btn" data-a="wzRun">Guardar todo</button>' : `<button class="btn" data-a="wzNext">${primero ? 'Empezar' : 'Siguiente'}</button>`}
    </div></div>`;
}

// ------------------------------------------------------------------ validación y conversión a lo que entiende la hoja
function wzValidar(paso) {
  const d = S.wz.d, cuentas = wzNombres('cuentas'), cats = wzNombres('cats');
  const repetidos = arr => arr.find((x, i) => arr.findIndex(y => y.toLowerCase() === x.toLowerCase()) !== i);
  if (paso === 'cuentas' && repetidos(cuentas)) return `«${repetidos(cuentas)}» está repetida`;
  if (paso === 'categorias') {
    if (!cats.length) return 'Deja al menos una categoría';
    if (repetidos(cats)) return `«${repetidos(cats)}» está repetida`;
  }
  if (paso === 'ingresos') for (const r of d.ingresos) if (r.c.trim() && !(Number(r.p) >= 0)) return `Escribe el valor de «${r.c}»`;
  if (paso === 'fijos') for (const r of d.fijos) {
    if (!r.c.trim() && !r.p) continue;
    if (!r.c.trim()) return 'Falta el nombre de un gasto fijo';
    if (!(Number(r.p) > 0)) return `Escribe el valor de «${r.c}»`;
    if (!r.cat) return `Elige la categoría de «${r.c}»`;
    if (r.dia !== '' && (Number(r.dia) < 1 || Number(r.dia) > 31)) return `El día de «${r.c}» debe estar entre 1 y 31`;
  }
  return null;
}

function wzPosicional(filas, original, largo, mk) {
  const out = Array.from({ length: largo }, () => mk({ n: '' }));
  const usados = new Set();
  filas.filter(r => r.pos !== null && r.n.trim()).forEach(r => { out[r.pos] = mk(r); usados.add(r.pos); });
  const nuevos = filas.filter(r => r.pos === null && r.n.trim());
  const libres = [...Array(largo).keys()].filter(i => !usados.has(i))
    .sort((a, b) => (original[a].n ? 1 : 0) - (original[b].n ? 1 : 0) || a - b);   // primero huecos que nunca tuvieron nada
  if (nuevos.length > libres.length) throw new Error(`Máximo ${largo} elementos`);
  nuevos.forEach((r, k) => { out[libres[k]] = mk(r); });
  return out;
}

function wzTareas() {
  const d = S.wz.d, L = wzListas(), conCuentas = !!S.config?.cuentasListas;
  const cuentasOk = new Set(wzNombres('cuentas').map(x => x));
  const cuenta = c => (conCuentas && cuentasOk.has(c)) ? c : '';
  const t = [];
  const listas = {
    cuentas: wzPosicional(d.cuentas, L.cuentas, WZ_MAX.cuentas, r => ({ n: (r.n || '').trim(), ini: r.ini === '' || r.ini == null ? '' : Number(r.ini) })),
    categorias: wzPosicional(d.cats, L.cats, WZ_MAX.cats, r => ({ n: (r.n || '').trim(), ocio: !!r.ocio })),
    metas: wzPosicional(d.metas, L.metas, WZ_MAX.metas, r => ({ n: (r.n || '').trim(), obj: r.obj === '' || r.obj == null ? '' : Number(r.obj) })),
  };
  t.push({ txt: 'Cuentas, categorías y metas', f: () => api('setLists', listas) });
  d.ingresos.filter(r => r.c.trim()).forEach(r => t.push({ txt: `Ingreso «${r.c.trim()}»`, f: () => api('addIncomePlan', { mes: 'Enero', concepto: r.c.trim(), presupuesto: Number(r.p) || 0, cuenta: conCuentas ? cuenta(r.cuenta) : undefined, alcance: 'todos' }) }));
  d.fijos.filter(r => r.c.trim()).forEach(r => t.push({ txt: `Gasto fijo «${r.c.trim()}»`, f: () => api('addFixed', { mes: 'Enero', concepto: r.c.trim(), presupuesto: Number(r.p), categoria: r.cat, dia: r.dia === '' ? null : Number(r.dia), cuenta: conCuentas ? cuenta(r.cuenta) : undefined, alcance: 'todos', suave: true }) }));
  d.cats.filter(r => r.n.trim() && Number(r.pres) > 0).forEach(r => t.push({ txt: `Presupuesto de ${r.n.trim()}`, f: () => api('setPlan', { tipo: 'categoria', nombre: r.n.trim(), valor: Number(r.pres), alcance: 'todos' }) }));
  d.metas.filter(r => r.n.trim() && Number(r.mensual) > 0).forEach(r => t.push({ txt: `Ahorro mensual de ${r.n.trim()}`, f: () => api('setPlan', { tipo: 'meta', nombre: r.n.trim(), valor: Number(r.mensual), alcance: 'todos' }) }));
  if (d.copias) t.push({ txt: 'Copia de seguridad mensual', opcional: true, f: () => api('backupOn', {}, 120000) });
  t.push({ txt: 'Terminando', f: () => api('wizard', { estado: 'hecho' }) });
  return t;
}

function renderWizardRun() {
  const r = S.wz.run;
  $('#view').innerHTML = `<div class="wz"><h1>${r.fin ? '¡Listo!' : 'Guardando en tu hoja…'}</h1>
    <div class="card" style="padding:6px 16px">${r.tareas.map((t, i) => `<div class="item row" style="gap:10px"><b class="${t.ok ? 'pos' : t.err ? 'neg' : 'dim'}">${t.ok ? '✓' : t.err ? '✗' : i === r.i && !r.error ? '…' : '·'}</b><div class="grow"><div>${esc(t.txt)}</div>${t.err ? `<div class="small ${t.opcional ? 'muted' : 'neg'}">${esc(t.err)}</div>` : ''}</div></div>`).join('')}</div>
    ${r.error ? `<div class="wz-bar"><button class="btn sec" data-a="wzVolver">Volver a editar</button><button class="btn" data-a="wzRun">Reintentar</button></div>` : ''}
    ${r.fin ? `<p class="muted">Tu hoja quedó configurada. Los gastos fijos están en los 12 meses y los ingresos esperados también.</p><div class="wz-bar"><button class="btn" data-a="wzCerrar">Empezar a usar la app</button></div>` : ''}</div>`;
}

async function wzRun() {
  const w = S.wz;
  try { w.run = { tareas: wzTareas().map(t => ({ ...t })), i: 0, error: false, fin: false }; }
  catch (e) { return toast(e.message, true); }
  renderWizardRun();
  for (; w.run.i < w.run.tareas.length; w.run.i++) {
    const t = w.run.tareas[w.run.i]; t.err = null; renderWizardRun();
    try { await t.f(); t.ok = true; }
    catch (e) {
      t.err = e.message;
      if (t.opcional) { t.err = e.message + ' (puedes activarla después en Ajustes → Copias de seguridad)'; continue; }
      w.run.error = true; renderWizardRun(); return;
    }
  }
  w.run.fin = true; store.del('wz'); S.config = { ...S.config, asistente: 'hecho' }; renderWizardRun();
}

// ------------------------------------------------------------------ eventos del asistente
function wzSet(path, val) {
  const ks = path.split('.'); let o = S.wz.d;
  for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]];
  o[ks[ks.length - 1]] = val; wzSave();
}
document.addEventListener('input', ev => {
  const el = ev.target; if (!el.dataset?.w || !S.wz) return;
  const val = el.type === 'checkbox' ? el.checked : el.dataset.num ? (el.value === '' ? '' : Number(el.value)) : el.value;
  wzSet(el.dataset.w, val);
});
document.addEventListener('change', ev => {
  const el = ev.target; if (!el.dataset?.w || !S.wz || el.type === 'text' || el.type === 'number') return;
  wzSet(el.dataset.w, el.type === 'checkbox' ? el.checked : el.value);
});
document.addEventListener('click', async ev => {
  const el = ev.target.closest('[data-a]'); if (!el || !el.dataset.a.startsWith('wz')) { if (el?.dataset.a === 'copias') sheetCopias(); return; }
  const a = el.dataset.a, w = S.wz;
  const ir = n => { w.step = n; wzSave(); render(); $('#view').scrollTop = 0; };
  switch (a) {
    case 'wzStart': startWizard(true); break;
    case 'wzNext': { const err = wzValidar(WZ_PASOS[w.step]); if (err) { toast(err, true); break; } ir(Math.min(w.step + 1, WZ_PASOS.length - 1)); break; }
    case 'wzBack': ir(Math.max(w.step - 1, 0)); break;
    case 'wzAdd': {
      const l = el.dataset.l;
      const nuevo = { cuentas: { pos: null, n: '', ini: '' }, cats: { pos: null, n: '', ocio: false, pres: '' }, metas: { pos: null, n: '', obj: '', mensual: '' },
        ingresos: { c: '', p: '', cuenta: '' }, fijos: { c: '', p: '', dia: '', cat: '', cuenta: '' } }[l];
      w.d[l].push(nuevo); wzSave(); render(); break;
    }
    case 'wzDel': { const l = el.dataset.l, i = Number(el.dataset.i); w.d[l].splice(i, 1); if (!w.d[l].length && ['cuentas', 'metas', 'ingresos', 'fijos'].includes(l)) { w.d[l].push({ cuentas: { pos: null, n: '', ini: '' }, metas: { pos: null, n: '', obj: '', mensual: '' }, ingresos: { c: '', p: '', cuenta: '' }, fijos: { c: '', p: '', dia: '', cat: '', cuenta: '' } }[l]); } wzSave(); render(); break; }
    case 'wzOmitir': { try { await api('wizard', { estado: 'omitido' }); } catch { /* se ofrecerá de nuevo */ } S.wz = null; store.del('wz'); S.config = { ...S.config, asistente: 'omitido' }; render(); toast('Puedes abrir el asistente cuando quieras en Ajustes'); break; }
    case 'wzRun': { const err = WZ_PASOS.map(wzValidar).find(Boolean); if (err) { toast(err, true); break; } wzRun(); break; }
    case 'wzVolver': w.run = null; render(); break;
    case 'wzCerrar': S.wz = null; store.del('wz'); S.months = {}; S.cuentas = null; S.mes = null; await loadAll(true); break;
  }
});

// ------------------------------------------------------------------ copias de seguridad (Ajustes)
const fechaCopia = iso => { if (!iso) return 'todavía no se ha hecho ninguna'; const d = new Date(iso); return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }); };

async function sheetCopias(estado) {
  if (!estado) {
    openSheet('<h2>Copias de seguridad</h2><div class="sk"></div><div class="sk"></div>');
    try { estado = (await api('backupStatus')).copias; }
    catch (e) { return openSheet(`<h2>Copias de seguridad</h2><p class="muted">${esc(e.message)}</p><button class="btn sec" data-a="closeSheet">Cerrar</button>`); }
  }
  if (!estado.permisos) {
    return openSheet(`<h2>Copias de seguridad</h2>
      <p class="muted">Falta darle permiso al script para usar Drive (se hace una sola vez):</p>
      <div class="item"><b>1.</b> En Apps Script (Extensiones → Apps Script) elige la función <b>autorizarPermisos</b> y pulsa <b>Ejecutar</b>. Acepta los permisos.</div>
      <div class="item"><b>2.</b> Publica una <b>Nueva versión</b> (Implementar → Administrar implementaciones → ✏ → Nueva versión).</div>
      <div class="item"><b>3.</b> Vuelve aquí y abre esta pantalla otra vez.</div>
      <div class="small dim" style="margin:8px 0">${esc(estado.error || '')}</div>
      <button class="btn sec" data-a="closeSheet">Cerrar</button>`);
  }
  const vieja = estado.ultima && (Date.now() - new Date(estado.ultima).getTime()) > 40 * 864e5;
  openSheet(`<h2>Copias de seguridad</h2>
    <div class="item row between"><span>Copia mensual automática</span><b class="${estado.activa ? 'pos' : 'neg'}">${estado.activa ? 'Activa' : 'Apagada'}</b></div>
    <div class="item"><span class="muted">Última copia</span><br><b>${esc(fechaCopia(estado.ultima))}</b>${vieja && estado.activa ? '<div class="small neg">Hace más de un mes: revisa que el disparador siga funcionando.</div>' : ''}</div>
    <div class="item row between"><span>Copias guardadas</span><b class="num">${estado.total} de ${estado.conservar}</b></div>
    <p class="small dim">Se guardan en la carpeta «Finanzas · copias de seguridad» de tu Drive. Cada copia es una hoja completa: ábrela para ver cómo estaba tu información ese día. Se conservan las últimas ${estado.conservar}.</p>
    <button class="btn" data-a="copiaAhora">Hacer una copia ahora</button>
    <div style="height:10px"></div><button class="btn sec" data-a="copiaToggle" data-on="${estado.activa ? 0 : 1}">${estado.activa ? 'Apagar la copia automática' : 'Activar la copia mensual'}</button>
    ${estado.carpeta ? `<div style="height:10px"></div><a class="btn sec" style="display:flex;align-items:center;justify-content:center;text-decoration:none" href="${esc(estado.carpeta)}" target="_blank" rel="noopener">Abrir la carpeta en Drive</a>` : ''}`);
}

document.addEventListener('click', async ev => {
  const el = ev.target.closest('[data-a]'); if (!el) return;
  if (el.dataset.a === 'copiaAhora' || el.dataset.a === 'copiaToggle') {
    const btn = el; btn.disabled = true; const t = btn.textContent; btn.textContent = 'Trabajando… (puede tardar)';
    try {
      const r = el.dataset.a === 'copiaAhora' ? await api('backupNow', {}, 120000) : await api(el.dataset.on === '1' ? 'backupOn' : 'backupOff', {}, 120000);
      toast(el.dataset.a === 'copiaAhora' ? 'Copia hecha ✓' : el.dataset.on === '1' ? 'Copia mensual activada ✓' : 'Copia automática apagada');
      sheetCopias(r.copias);
    } catch (e) { toast(e.message, true); btn.disabled = false; btn.textContent = t; }
  }
});
