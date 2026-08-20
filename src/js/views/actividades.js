import { bottomNav, confirmAction, icon, metaIcon, screenHeader, toast } from '../components/layout.js';
import { activityCard, emptyState } from '../components/cards.js';
import { activityStatus, activityTypeLabel, escapeHtml, formatDate, isValidISODate, isValidTime, longDate, priorityRank, todayISO, uid } from '../utils.js';
import { navigate } from '../router.js';

function sortActivities(items, criterion = 'fecha') {
  const copy = [...items];
  if (criterion === 'prioridad') return copy.sort((a,b) => priorityRank(a.prioridad) - priorityRank(b.prioridad) || a.fecha.localeCompare(b.fecha));
  if (criterion === 'materia') return copy.sort((a,b) => (a.materiaNombre || '').localeCompare(b.materiaNombre || '', 'es') || a.fecha.localeCompare(b.fecha));
  return copy.sort((a,b) => a.fecha.localeCompare(b.fecha) || (a.hora || '').localeCompare(b.hora || ''));
}

export function renderActividades(state) {
  return `
    <div class="app-shell">
      <main class="screen screen--with-nav">
        <div class="title-action-row"><h1>Actividades</h1><button class="text-action" type="button" data-route="actividad-form">Nueva actividad</button></div>

        <div class="filter-tabs filter-tabs--figma" id="status-tabs" aria-label="Filtrar por estado">
          <button class="filter-tab is-active" type="button" data-status-filter="" aria-pressed="true">Todas</button>
          <button class="filter-tab" type="button" data-status-filter="pendiente" aria-pressed="false">Pendientes</button>
          <button class="filter-tab" type="button" data-status-filter="completada" aria-pressed="false">Completadas</button>
          <button class="filter-tab" type="button" data-status-filter="vencida" aria-pressed="false">Vencidas</button>
        </div>

        <details class="advanced-filters" id="activity-filter-details">
          <summary>Filtros</summary>
          <div class="filters" id="activity-filters">
            <label class="filter-field"><span>Materia</span><select name="materia"><option value="">Todas las materias</option>${state.materias.map(m => `<option value="${escapeHtml(m.id)}">${escapeHtml(m.nombre)}</option>`).join('')}</select></label>
            <label class="filter-field"><span>Prioridad</span><select name="prioridad"><option value="">Todas</option><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></select></label>
            <label class="filter-field"><span>Tipo</span><select name="tipo"><option value="">Todos</option><option value="tarea">Tarea</option><option value="entrega">Entrega</option><option value="proyecto">Proyecto</option><option value="examen">Examen / evaluación</option><option value="exposicion">Exposición</option><option value="otra">Otra</option></select></label>
            <label class="filter-field"><span>Orden</span><select name="orden"><option value="fecha" ${state.preferencias.criterioOrden === 'fecha' ? 'selected' : ''}>Fecha</option><option value="prioridad" ${state.preferencias.criterioOrden === 'prioridad' ? 'selected' : ''}>Prioridad</option><option value="materia" ${state.preferencias.criterioOrden === 'materia' ? 'selected' : ''}>Materia</option></select></label>
          </div>
        </details>

        <div id="activity-list" class="stack stack--sm activity-list"></div>
      </main>
      ${bottomNav('actividades')}
    </div>`;
}

export function bindActividades(root, state, persist) {
  const list = root.querySelector('#activity-list');
  const filters = root.querySelector('#activity-filters');
  const tabs = root.querySelector('#status-tabs');
  let status = '';
  const renderList = () => {
    const materia = filters?.querySelector('[name="materia"]')?.value || '';
    const prioridad = filters?.querySelector('[name="prioridad"]')?.value || '';
    const tipo = filters?.querySelector('[name="tipo"]')?.value || '';
    const orden = filters?.querySelector('[name="orden"]')?.value || state.preferencias.criterioOrden || 'fecha';
    const materiaById = Object.fromEntries(state.materias.map(m => [m.id, m]));
    const today = todayISO();
    let items = state.actividades.map(item => ({ ...item, materiaNombre: materiaById[item.materiaId]?.nombre || '' }));
    if (status === 'pendiente') items = items.filter(a => a.estado !== 'completada' && a.fecha >= today);
    if (status === 'vencida') items = items.filter(a => a.estado !== 'completada' && a.fecha < today);
    if (status === 'completada') items = items.filter(a => a.estado === 'completada');
    if (materia) items = items.filter(a => a.materiaId === materia);
    if (prioridad) items = items.filter(a => a.prioridad === prioridad);
    if (tipo) items = items.filter(a => a.tipo === tipo);
    items = sortActivities(items, orden);
    list.innerHTML = items.length ? items.map(a => activityCard(a, materiaById[a.materiaId])).join('') : emptyState('Sin resultados', state.actividades.length ? 'No hay actividades con esos filtros.' : 'Todavía no has creado actividades.', state.actividades.length ? '' : 'Crear actividad', state.actividades.length ? '' : 'actividad-form');
    list.querySelectorAll('[data-activity-id]').forEach(el => el.addEventListener('click', () => navigate('actividad-detalle', { id: el.dataset.activityId })));
  };
  tabs.querySelectorAll('[data-status-filter]').forEach(el => el.addEventListener('click', () => {
    status = el.dataset.statusFilter;
    tabs.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.toggle('is-active', tab === el);
      tab.setAttribute('aria-pressed', String(tab === el));
    });
    renderList();
  }));
  filters?.querySelectorAll('select').forEach(el => el.addEventListener('change', () => {
    if (el.name === 'orden') {
      state.preferencias.criterioOrden = el.value;
      persist();
    }
    renderList();
  }));
  renderList();
}

function activityDateTime(activity) {
  if (!activity) return `${todayISO()}T23:59`;
  return `${activity.fecha || todayISO()}T${activity.hora || '23:59'}`;
}

export function renderActividadForm(state, params) {
  const id = params.get('id');
  const presetMateria = params.get('materiaId');
  const current = state.actividades.find(a => a.id === id);
  if (id && !current) {
    return `<div class="app-shell"><main class="screen screen--with-nav">${screenHeader({ title: 'Actividad no encontrada', back: true })}${emptyState('No se pudo abrir la actividad', 'Es posible que haya sido eliminada en otra vista.', 'Volver a Actividades', 'actividades')}</main>${bottomNav('actividades')}</div>`;
  }
  const types = [['tarea','Tarea'], ['proyecto','Proyecto'], ['examen','Examen'], ['exposicion','Exposición'], ['entrega','Entrega'], ['otra','Otra']];
  const currentType = types.some(([value]) => value === current?.tipo) ? current.tipo : current?.tipo === 'evaluacion' ? 'examen' : 'tarea';
  return `
    <div class="app-shell">
      <main class="screen screen--with-nav form-screen">
        ${screenHeader({ title: current ? 'Editar actividad' : 'Nueva actividad', back: true })}
        ${state.materias.length === 0 ? emptyState('Necesitas una materia', 'Antes de crear una actividad registra al menos una materia.', 'Crear materia', 'materia-form') : `
        <form id="activity-form" class="form form--figma stack">
          <label>TÍTULO DE LA ACTIVIDAD
            <input name="titulo" required maxlength="80" value="${escapeHtml(current?.titulo || '')}" placeholder="Entregar wireframe de interfaz" />
          </label>
          <label>MATERIA VINCULADA
            <select name="materiaId" required><option value="">Selecciona una materia</option>${state.materias.map(m => `<option value="${escapeHtml(m.id)}" ${(current?.materiaId || presetMateria) === m.id ? 'selected' : ''}>${escapeHtml(m.nombre)}</option>`).join('')}</select>
          </label>
          <fieldset>
            <legend>TIPO DE ACTIVIDAD</legend>
            <div class="segmented-choice">${types.map(([value,label]) => `<label><input type="radio" name="tipo" value="${value}" ${currentType === value ? 'checked' : ''}><span>${label}</span></label>`).join('')}</div>
          </fieldset>
          <label>FECHA DE ENTREGA
            <input type="datetime-local" name="fechaHora" required value="${escapeHtml(activityDateTime(current))}" />
          </label>
          <fieldset>
            <legend>PRIORIDAD</legend>
            <div class="priority-choice">
              ${['alta','media','baja'].map(priority => `<label class="priority-option priority-option--${priority}"><input type="radio" name="prioridad" value="${priority}" ${(current?.prioridad || 'media') === priority ? 'checked' : ''}><span><i></i>${priority.charAt(0).toUpperCase()+priority.slice(1)}</span></label>`).join('')}
            </div>
          </fieldset>
          <label>DESCRIPCIÓN
            <textarea name="descripcion" rows="3" maxlength="500" placeholder="Detalles de la actividad">${escapeHtml(current?.descripcion || '')}</textarea>
          </label>
          <label class="switch-row">
            <span><strong>Recordatorio previo</strong><small>Guardar preferencia de recordatorio para esta actividad</small></span>
            <input type="checkbox" name="recordatorio" ${current?.recordatorio ? 'checked' : ''}><i class="switch-control"></i>
          </label>
          <button class="btn btn--primary btn--full" type="submit">Guardar actividad</button>
        </form>`}
      </main>
      ${bottomNav('actividades')}
    </div>`;
}

export function bindActividadForm(root, state, params, persist) {
  const id = params.get('id');
  root.querySelector('#activity-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const titulo = String(data.get('titulo') || '').trim();
    const materiaId = String(data.get('materiaId') || '');
    const fechaHora = String(data.get('fechaHora') || '');
    if (!titulo || !materiaId || !fechaHora.includes('T')) { toast('Completa título, materia y fecha de entrega.'); return; }
    const [fecha, hora = ''] = fechaHora.split('T');
    if (!state.materias.some(m => m.id === materiaId)) { toast('Selecciona una materia válida.'); return; }
    if (!isValidISODate(fecha) || !isValidTime(hora, { allowEmpty: false })) { toast('Selecciona una fecha y hora válidas.'); return; }
    const old = state.actividades.find(a => a.id === id);
    if (id && !old) { toast('La actividad ya no existe.'); navigate('actividades'); return; }
    const model = {
      id: id || uid('act'), titulo, materiaId,
      tipo: String(data.get('tipo') || 'tarea'),
      prioridad: String(data.get('prioridad') || 'media'),
      fecha, hora,
      descripcion: String(data.get('descripcion') || '').trim(),
      recordatorio: data.get('recordatorio') === 'on',
      estado: old?.estado || 'pendiente',
      fechaCreacion: old?.fechaCreacion || new Date().toISOString(),
    };
    if (id) state.actividades[state.actividades.findIndex(a => a.id === id)] = model;
    else state.actividades.push(model);
    persist();
    toast(id ? 'Actividad actualizada.' : 'Actividad creada.');
    navigate('actividad-detalle', { id: model.id });
  });
}

export function renderActividadDetalle(state, params) {
  const id = params.get('id');
  const activity = state.actividades.find(a => a.id === id);
  if (!activity) return `<div class="app-shell"><main class="screen"><h1>Actividad no encontrada</h1></main>${bottomNav('actividades')}</div>`;
  const materia = state.materias.find(m => m.id === activity.materiaId);
  const status = activityStatus(activity);
  return `
    <div class="app-shell">
      <main class="screen screen--with-nav detail-screen">
        ${screenHeader({ title: 'Detalle', back: true, action: 'edit-activity', actionLabel: 'Editar actividad' })}
        <section class="activity-detail-card">
          <div class="activity-detail-card__top">
            <span class="subject-tag">${escapeHtml(materia?.nombre || 'Sin materia')}</span>
            <span class="priority-badge priority-badge--${escapeHtml(activity.prioridad)}"><i></i>${escapeHtml(activity.prioridad.charAt(0).toUpperCase()+activity.prioridad.slice(1))} prioridad</span>
          </div>
          <h2 class="activity-detail-card__title">${escapeHtml(activity.titulo)}</h2>
          <div class="divider"></div>
          <p>${metaIcon('book')}${escapeHtml(materia?.nombre || 'Sin materia')}</p>
          <p>${metaIcon('check')}${escapeHtml(activityTypeLabel(activity.tipo))}</p>
          <p>${metaIcon('clock')}${escapeHtml(longDate(activity.fecha))}${activity.hora ? ` · ${escapeHtml(activity.hora)}` : ''}</p>
          <p class="status-line ${status.overdue ? 'status-line--danger' : ''}"><span class="priority-dot priority-dot--${status.key === 'completada' ? 'completed' : activity.prioridad}"></span>${escapeHtml(status.label)}</p>
        </section>
        <section class="detail-section">
          <h2 class="detail-section__label">DESCRIPCIÓN</h2>
          <div class="notes-card">${escapeHtml(activity.descripcion || 'Sin descripción.')}</div>
        </section>
        <div class="activity-actions">
          <button class="btn btn--primary btn--full" type="button" data-action="toggle-complete">${activity.estado === 'completada' ? 'Reabrir actividad' : 'Marcar como completada'}</button>
          <button class="btn btn--secondary btn--full" type="button" data-action="edit-activity">Editar actividad</button>
          <button class="danger-link" type="button" data-action="delete-activity">Eliminar actividad</button>
        </div>
      </main>
      ${bottomNav('actividades')}
    </div>`;
}

export function bindActividadDetalle(root, state, params, persist) {
  const id = params.get('id');
  root.querySelectorAll('[data-action="edit-activity"]').forEach(el => el.addEventListener('click', () => navigate('actividad-form', { id })));
  root.querySelector('[data-action="toggle-complete"]')?.addEventListener('click', () => {
    const activity = state.actividades.find(a => a.id === id);
    if (!activity) return;
    activity.estado = activity.estado === 'completada' ? 'pendiente' : 'completada';
    persist();
    toast(activity.estado === 'completada' ? 'Actividad completada.' : 'Actividad reabierta.');
    navigate('actividad-detalle', { id });
  });
  root.querySelector('[data-action="delete-activity"]')?.addEventListener('click', async () => {
    if (!await confirmAction(state, '¿Eliminar esta actividad? Esta acción no se puede deshacer.', 'Eliminar actividad')) return;
    state.actividades = state.actividades.filter(a => a.id !== id);
    persist();
    toast('Actividad eliminada.');
    navigate('actividades');
  });
}
