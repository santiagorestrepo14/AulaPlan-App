import { bottomNav, icon } from '../components/layout.js';
import { activityTypeLabel, dayCode, escapeHtml, formatDate, todayISO } from '../utils.js';

function formatTime(value = '') {
  if (!value) return 'Sin hora';
  const [h, m] = value.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m || 0).padStart(2, '0')} ${suffix}`;
}

export function renderInicio(state) {
  const today = todayISO();
  const pending = state.actividades.filter(a => a.estado !== 'completada');
  const overdue = pending.filter(a => a.fecha < today);
  const upcoming = pending.filter(a => a.fecha >= today).sort((a,b) => a.fecha.localeCompare(b.fecha) || (a.hora || '').localeCompare(b.hora || ''));
  const currentDay = dayCode(new Date());
  const todayClasses = state.materias.filter(m => (m.dias || []).includes(currentDay)).sort((a,b) => (a.horaInicio || '').localeCompare(b.horaInicio || ''));
  const configuredName = state.preferencias.nombreUsuario?.trim();
  const firstName = configuredName ? configuredName.split(/\s+/)[0] : 'estudiante';
  const materiaById = Object.fromEntries(state.materias.map(m => [m.id, m]));
  const eventCards = [];
  todayClasses.slice(0, 2).forEach(nextClass => {
    eventCards.push(`
      <button class="event-card" type="button" data-subject-home="${escapeHtml(nextClass.id)}">
        <span class="event-card__dot" style="--event-color:${escapeHtml(nextClass.color || '#2563EB')}"></span>
        <small>${escapeHtml(formatTime(nextClass.horaInicio))}</small>
        <strong>Clase: ${escapeHtml(nextClass.nombre)}</strong>
        <span>${escapeHtml(nextClass.aula || 'Ubicación sin definir')}</span>
      </button>`);
  });
  upcoming.slice(0, Math.max(0, 4 - eventCards.length)).forEach(nextActivity => {
    const isToday = nextActivity.fecha === today;
    eventCards.push(`
      <button class="event-card" type="button" data-activity-id="${escapeHtml(nextActivity.id)}">
        <span class="event-card__dot event-card__dot--${escapeHtml(nextActivity.prioridad || 'media')}"></span>
        <small>${isToday ? `Hoy${nextActivity.hora ? `, ${escapeHtml(nextActivity.hora)}` : ''}` : `${escapeHtml(formatDate(nextActivity.fecha, { short: true }))}${nextActivity.hora ? `, ${escapeHtml(nextActivity.hora)}` : ''}`}</small>
        <strong>${escapeHtml(nextActivity.titulo)}</strong>
        <span>${escapeHtml(materiaById[nextActivity.materiaId]?.nombre || 'Sin materia')} · ${escapeHtml(activityTypeLabel(nextActivity.tipo))} · Prioridad ${escapeHtml(nextActivity.prioridad)}</span>
      </button>`);
  });

  return `
    <div class="app-shell">
      <main class="screen screen--with-nav home-screen">
        <header class="home-hero">
          <h1>Hola, ${escapeHtml(firstName)}</h1>
          <p>${new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</p>
        </header>

        <section class="home-primary-stats">
          <article class="big-stat"><span>PENDIENTES</span><div><strong>${pending.length}</strong><small>actividades</small></div></article>
          <article class="big-stat"><span>CLASES DE HOY</span><div><strong>${todayClasses.length}</strong><small>materias</small></div></article>
        </section>

        <section class="home-section">
          <h2>Resumen académico</h2>
          <div class="mini-stat-grid">
            <article><strong>${state.materias.length}</strong><span>Materias Activas</span></article>
            <article><strong>${upcoming.length}</strong><span>Actividades Próximas</span></article>
            <article class="mini-stat--danger"><strong>${overdue.length}</strong><span>Vencidas</span></article>
          </div>
        </section>

        <section class="home-section">
          <h2>Próximos eventos</h2>
          <div class="event-grid">
            ${eventCards.length ? eventCards.join('') : '<p class="empty-copy">No hay eventos próximos registrados.</p>'}
          </div>
        </section>
      </main>
      ${bottomNav('inicio')}
    </div>`;
}

export function bindInicio(root) {
  root.querySelectorAll('[data-subject-home]').forEach(el => {
    el.addEventListener('click', event => {
      event.preventDefault();
      window.location.hash = `materia-detalle?id=${encodeURIComponent(el.dataset.subjectHome)}`;
    });
  });
}
