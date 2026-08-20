import { bottomNav, icon, metaIcon } from '../components/layout.js';
import { activityStatus, activityTypeLabel, dayCode, escapeHtml, isValidISODate, longDate, todayISO } from '../utils.js';
import { navigate } from '../router.js';

function isoDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
function monthTitle(date) {
  const value = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(date);
  return value.charAt(0).toUpperCase() + value.slice(1);
}
function shiftMonth(selected, delta) {
  const d = new Date(`${selected}T12:00:00`);
  d.setDate(1);
  d.setMonth(d.getMonth() + delta);
  return isoDate(d);
}

export function renderCalendario(state, params) {
  const requestedDate = params.get('date');
  const selected = isValidISODate(requestedDate) ? requestedDate : todayISO();
  const selectedDate = new Date(`${selected}T12:00:00`);
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const first = new Date(year, month, 1, 12);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset, 12);
  const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const materiaById = Object.fromEntries(state.materias.map(m => [m.id, m]));
  const selectedActivities = state.actividades.filter(a => a.fecha === selected).sort((a,b) => (a.hora || '').localeCompare(b.hora || ''));
  const selectedClasses = state.materias.filter(m => (m.dias || []).includes(dayCode(selectedDate))).sort((a,b) => (a.horaInicio || '').localeCompare(b.horaInicio || ''));

  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = isoDate(date);
    const activities = state.actividades.filter(a => a.fecha === iso && a.estado !== 'completada').slice(0, 3);
    return { date, iso, activities, currentMonth: date.getMonth() === month };
  });

  const agenda = [
    ...selectedActivities.map(a => ({ kind: 'activity', activity: a, time: a.hora || '23:59' })),
    ...selectedClasses.map(m => ({ kind: 'class', materia: m, time: m.horaInicio || '23:59' })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  return `
    <div class="app-shell">
      <main class="screen screen--with-nav calendar-screen">
        <div class="calendar-title-row">
          <h1>${escapeHtml(monthTitle(selectedDate))}</h1>
          <div class="calendar-month-controls">
            <button class="icon-btn icon-btn--xs icon-btn--reverse" type="button" data-action="prev-month" aria-label="Mes anterior">${icon('chevron')}</button>
            <button class="icon-btn icon-btn--xs" type="button" data-action="next-month" aria-label="Mes siguiente">${icon('chevron')}</button>
          </div>
        </div>

        <section class="month-calendar" aria-label="Calendario mensual">
          <div class="month-calendar__weekdays">${weekdays.map(day => `<span>${day}</span>`).join('')}</div>
          <div class="month-calendar__grid">
            ${cells.map(cell => `<button type="button" class="month-day ${cell.currentMonth ? '' : 'is-outside'} ${cell.iso === selected ? 'is-selected' : ''} ${cell.iso === todayISO() ? 'is-today' : ''}" data-date="${cell.iso}" aria-label="${escapeHtml(longDate(cell.iso))}${cell.activities.length ? `, ${cell.activities.length} ${cell.activities.length === 1 ? 'actividad pendiente' : 'actividades pendientes'}` : ', sin actividades pendientes'}">
              <span>${cell.date.getDate()}</span>
              <i class="month-day__dots">${cell.activities.map(a => `<b class="priority-dot priority-dot--${escapeHtml(a.prioridad)}"></b>`).join('')}</i>
            </button>`).join('')}
          </div>
        </section>

        <section class="agenda-section">
          <h2>${selected === todayISO() ? 'AGENDA DE HOY' : 'AGENDA DEL'}${selected === todayISO() ? `, ${escapeHtml(longDate(selected).toUpperCase())}` : ` ${escapeHtml(longDate(selected).toUpperCase())}`}</h2>
          <div class="stack stack--sm">
            ${agenda.length ? agenda.map(item => {
              if (item.kind === 'activity') {
                const a = item.activity;
                const materia = materiaById[a.materiaId];
                const status = activityStatus(a);
                return `<button class="agenda-row" type="button" data-activity-id="${escapeHtml(a.id)}">
                  <span class="priority-dot priority-dot--${a.estado === 'completada' ? 'completed' : escapeHtml(a.prioridad)}"></span>
                  <span class="agenda-row__body"><strong>${escapeHtml(a.titulo)}</strong><span><span class="subject-tag">${escapeHtml(materia?.nombre || 'Sin materia')}</span> ${escapeHtml(activityTypeLabel(a.tipo))} · Prioridad ${escapeHtml(a.prioridad)} · ${escapeHtml(status.label)} ${a.hora ? `· ${escapeHtml(a.hora)}` : ''}</span></span>
                </button>`;
              }
              const m = item.materia;
              return `<button class="agenda-row" type="button" data-subject-id="${escapeHtml(m.id)}">
                <span class="subject-color-dot" style="--subject-color:${escapeHtml(m.color || '#2563EB')}"></span>
                <span class="agenda-row__body"><strong>${escapeHtml(m.nombre)}</strong><span>${metaIcon('clock')}${escapeHtml(m.horaInicio || 'Sin hora')} ${m.aula ? `· ${escapeHtml(m.aula)}` : ''}</span></span>
              </button>`;
            }).join('') : '<p class="empty-copy">No hay actividades ni clases registradas para este día.</p>'}
          </div>
        </section>
      </main>
      ${bottomNav('calendario')}
    </div>`;
}

export function bindCalendario(root, params) {
  const requestedDate = params.get('date');
  const selected = isValidISODate(requestedDate) ? requestedDate : todayISO();
  root.querySelectorAll('[data-date]').forEach(el => el.addEventListener('click', () => navigate('calendario', { date: el.dataset.date })));
  root.querySelectorAll('[data-activity-id]').forEach(el => el.addEventListener('click', () => navigate('actividad-detalle', { id: el.dataset.activityId })));
  root.querySelectorAll('[data-subject-id]').forEach(el => el.addEventListener('click', () => navigate('materia-detalle', { id: el.dataset.subjectId })));
  root.querySelector('[data-action="prev-month"]')?.addEventListener('click', () => navigate('calendario', { date: shiftMonth(selected, -1) }));
  root.querySelector('[data-action="next-month"]')?.addEventListener('click', () => navigate('calendario', { date: shiftMonth(selected, 1) }));
}
