import { bottomNav, confirmAction, icon, metaIcon, screenHeader, toast } from '../components/layout.js';
import { emptyState } from '../components/cards.js';
import { activityStatus, escapeHtml, formatDate, isValidTime, uid } from '../utils.js';
import { navigate } from '../router.js';

const SUBJECT_COLORS = ['#2563EB', '#D97706', '#C2413B', '#7C3AED', '#10B981'];

function scheduleText(materia) {
  const days = materia.dias?.length ? materia.dias.join('/') : 'Sin días';
  const time = materia.horaInicio ? `${materia.horaInicio}${materia.horaFin ? ` - ${materia.horaFin}` : ''}` : 'Sin horario';
  return `${days} ${time}`;
}

function sharedScheduleDays(a, b) {
  const otherDays = new Set(b.dias || []);
  return (a.dias || []).filter(day => otherDays.has(day));
}

function timesOverlap(startA, endA, startB, endB) {
  if (!startA || !endA || !startB || !endB) return false;
  return startA < endB && startB < endA;
}

export function findScheduleConflicts(materias, candidate, excludeId = '') {
  return materias
    .filter(materia => materia.id !== excludeId)
    .map(materia => ({
      materia,
      dias: sharedScheduleDays(candidate, materia),
    }))
    .filter(({ materia, dias }) =>
      dias.length > 0 &&
      timesOverlap(
        candidate.horaInicio,
        candidate.horaFin,
        materia.horaInicio,
        materia.horaFin,
      )
    );
}

export function renderMaterias(state) {
  return `
    <div class="app-shell">
      <main class="screen screen--with-nav">
        <div class="title-action-row">
          <h1>Materias</h1>
          <button class="text-action" type="button" data-route="materia-form">Nueva materia</button>
        </div>
        ${state.materias.length ? `<div class="stack stack--sm subject-list">${state.materias.map(m => `
          <button class="subject-card" type="button" data-subject-id="${escapeHtml(m.id)}" style="--subject-color:${escapeHtml(m.color || '#2563EB')}">
            <span class="subject-card__accent" aria-hidden="true"></span>
            <span class="subject-card__body">
              <strong>${escapeHtml(m.nombre)}</strong>
              <span class="subject-card__line">${metaIcon('user')}${escapeHtml(m.docente || 'Profesor sin definir')} <span class="subject-card__sep">${metaIcon('clock')}${escapeHtml(scheduleText(m))}</span></span>
              <span class="subject-card__line">${metaIcon('pin')}${escapeHtml(m.aula || 'Ubicación sin definir')}</span>
            </span>
            <span class="subject-card__chevron">${icon('chevron')}</span>
          </button>`).join('')}</div>` : emptyState('Aún no hay materias', 'Crea tu primera materia para empezar a organizar el semestre.', 'Crear materia', 'materia-form')}
      </main>
      ${bottomNav('materias')}
    </div>`;
}

export function bindMaterias(root) {
  root.querySelectorAll('[data-subject-id]').forEach(el => el.addEventListener('click', () => navigate('materia-detalle', { id: el.dataset.subjectId })));
}

export function renderMateriaForm(state, params) {
  const id = params.get('id');
  const current = state.materias.find(m => m.id === id);
  if (id && !current) {
    return `<div class="app-shell"><main class="screen screen--with-nav">${screenHeader({ title: 'Materia no encontrada', back: true })}${emptyState('No se pudo abrir la materia', 'Es posible que haya sido eliminada en otra vista.', 'Volver a Materias', 'materias')}</main>${bottomNav('materias')}</div>`;
  }
const days = ['Lun','Mar','Mié','Jue','Vie','Sáb'];
  return `
    <div class="app-shell">
      <main class="screen screen--with-nav form-screen">
        ${screenHeader({ title: current ? 'Editar materia' : 'Nueva materia', back: true })}
        <form id="subject-form" class="form form--figma stack">
          <label>Nombre de la materia
            <input name="nombre" required maxlength="60" value="${escapeHtml(current?.nombre || '')}" placeholder="Cálculo Multivariable" />
          </label>
          <label>Profesor
            <input name="docente" maxlength="60" value="${escapeHtml(current?.docente || '')}" placeholder="Dr. Arturo Marcos" />
          </label>
          <fieldset>
            <legend>Días de clase</legend>
            <div class="day-chip-row">${days.map(day => `<label class="check-chip"><input type="checkbox" name="dias" value="${day}" ${(current?.dias || []).includes(day) ? 'checked' : ''}><span>${day}</span></label>`).join('')}</div>
          </fieldset>
          <div class="time-range-field">
            ${icon('clock')}
            <label><span>Inicio</span><input type="time" name="horaInicio" aria-label="Hora de inicio" value="${escapeHtml(current?.horaInicio || '')}" /></label>
            <span class="time-separator">–</span>
            <label><span>Fin</span><input type="time" name="horaFin" aria-label="Hora de fin" value="${escapeHtml(current?.horaFin || '')}" /></label>
          </div>
          <label>Aula
            <input name="aula" maxlength="40" value="${escapeHtml(current?.aula || '')}" placeholder="Aula 204" />
          </label>
          <fieldset>
            <legend>Color identificador</legend>
            <div class="color-picker">${SUBJECT_COLORS.map((color, index) => `<label class="color-choice" style="--choice-color:${color}"><input type="radio" name="color" value="${color}" ${(current?.color || SUBJECT_COLORS[0]) === color || (!current && index === 0) ? 'checked' : ''}><span aria-label="Color ${index + 1}"></span></label>`).join('')}</div>
          </fieldset>
          <label>Notas de la materia
            <textarea name="notas" rows="3" maxlength="500" placeholder="Notas importantes de esta materia">${escapeHtml(current?.notas || '')}</textarea>
          </label>
          <button class="btn btn--primary btn--full" type="submit">Guardar materia</button>
          ${current ? '<button class="danger-link" type="button" data-action="delete-subject">Eliminar materia</button>' : ''}
        </form>
      </main>
      ${bottomNav('materias')}
    </div>`;
}

export function bindMateriaForm(root, state, params, persist, back) {
  const id = params.get('id');
  root.querySelector('#subject-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nombre = String(data.get('nombre') || '').trim();
    if (!nombre) { toast('El nombre de la materia es obligatorio.'); return; }
    const horaInicio = String(data.get('horaInicio') || '');
    const horaFin = String(data.get('horaFin') || '');
    if (!isValidTime(horaInicio) || !isValidTime(horaFin)) { toast('Revisa el formato del horario.'); return; }
    if (horaInicio && horaFin && horaFin <= horaInicio) { toast('La hora de fin debe ser posterior a la hora de inicio.'); return; }
    const previous = state.materias.find(m => m.id === id);
    if (id && !previous) { toast('La materia ya no existe.'); navigate('materias'); return; }
    const model = {
      id: id || uid('mat'),
      nombre,
      docente: String(data.get('docente') || '').trim(),
      dias: data.getAll('dias').map(String),
      horaInicio,
      horaFin,
      bloque: previous?.bloque || '',
      aula: String(data.get('aula') || '').trim(),
      color: String(data.get('color') || SUBJECT_COLORS[0]),
      notas: String(data.get('notas') || '').trim(),
      fechaCreacion: previous?.fechaCreacion || new Date().toISOString(),
    };

    const conflicts = findScheduleConflicts(state.materias, model, id);

    if (conflicts.length) {
      const conflictSummary = conflicts
        .map(({ materia, dias }) =>
          `${materia.nombre} (${dias.join('/')} ${materia.horaInicio} - ${materia.horaFin})`
        )
        .join('\n• ');

      const keepSchedule = window.confirm(
        `Advertencia: este horario se cruza con:\n\n• ${conflictSummary}\n\n¿Deseas guardar la materia de todas formas?`
      );

      if (!keepSchedule) {
        toast('No se guardó la materia. Ajusta el horario para evitar el cruce.');
        return;
      }
    }

    if (id) state.materias[state.materias.findIndex(m => m.id === id)] = model;
    else state.materias.push(model);
    persist();
    toast(id ? 'Materia actualizada.' : 'Materia creada.');
    navigate('materia-detalle', { id: model.id });
  });

  root.querySelector('[data-action="delete-subject"]')?.addEventListener('click', async () => {
    const relatedCount = state.actividades.filter(a => a.materiaId === id).length;
    const relatedText = relatedCount === 1 ? '1 actividad asociada' : `${relatedCount} actividades asociadas`;
    if (!await confirmAction(state, `¿Eliminar esta materia? También se eliminarán ${relatedText}. Esta acción no se puede deshacer.`, 'Eliminar materia')) return;
    state.materias = state.materias.filter(m => m.id !== id);
    state.actividades = state.actividades.filter(a => a.materiaId !== id);
    persist();
    toast('Materia eliminada.');
    navigate('materias');
  });
}

export function renderMateriaDetalle(state, params) {
  const id = params.get('id');
  const materia = state.materias.find(m => m.id === id);
  if (!materia) return `<div class="app-shell"><main class="screen"><h1>Materia no encontrada</h1></main>${bottomNav('materias')}</div>`;
  const acts = state.actividades.filter(a => a.materiaId === id).sort((a,b) => {
    if (a.estado !== b.estado) return a.estado === 'completada' ? 1 : -1;
    return a.fecha.localeCompare(b.fecha) || (a.hora || '').localeCompare(b.hora || '');
  });
  return `
    <div class="app-shell">
      <main class="screen screen--with-nav detail-screen">
        ${screenHeader({ title: '', back: true, backLabel: 'Materias', action: 'edit-subject', actionLabel: 'Editar materia' })}
        <section class="subject-detail-card" style="--subject-color:${escapeHtml(materia.color || '#2563EB')}">
          <h1>${escapeHtml(materia.nombre)}</h1>
          <div class="divider"></div>
          <p>${metaIcon('user')}${escapeHtml(materia.docente || 'Profesor sin definir')}</p>
          <p>${metaIcon('clock')}${escapeHtml(scheduleText(materia))}</p>
          <p>${metaIcon('pin')}${escapeHtml(materia.aula || 'Ubicación sin definir')}</p>
        </section>

        <section class="detail-section">
          <div class="section-title-row"><h2>Actividades de esta materia</h2><button class="text-action" type="button" data-action="new-activity">Nueva actividad</button></div>
          <div class="stack stack--xs">
            ${acts.length ? acts.map(a => {
              const status = activityStatus(a);
              return `<button class="subject-activity-row" type="button" data-activity-id="${escapeHtml(a.id)}"><span class="priority-dot priority-dot--${a.estado === 'completada' ? 'completed' : escapeHtml(a.prioridad)}"></span><span class="subject-activity-row__body"><strong>${escapeHtml(a.titulo)}</strong><small>Prioridad ${escapeHtml(a.prioridad)} · ${escapeHtml(status.label)}</small></span><span>${a.fecha ? escapeHtml(formatDate(a.fecha, { short: true })) : ''}</span></button>`;
            }).join('') : '<p class="empty-copy">No hay actividades registradas en esta materia.</p>'}
          </div>
        </section>

        <section class="detail-section">
          <h2>Notas</h2>
          <div class="notes-card">${escapeHtml(materia.notas || 'Sin notas registradas.')}</div>
        </section>
      </main>
      ${bottomNav('materias')}
    </div>`;
}

export function bindMateriaDetalle(root, state, params) {
  const id = params.get('id');
  root.querySelector('[data-action="edit-subject"]')?.addEventListener('click', () => navigate('materia-form', { id }));
  root.querySelector('[data-action="new-activity"]')?.addEventListener('click', () => navigate('actividad-form', { materiaId: id }));
  root.querySelectorAll('[data-activity-id]').forEach(el => el.addEventListener('click', () => navigate('actividad-detalle', { id: el.dataset.activityId })));
}
