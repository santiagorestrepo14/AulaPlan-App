import { activityStatus, activityTypeLabel, escapeHtml, formatDate, todayISO } from '../utils.js';
import { icon } from './layout.js';

export function activityCard(activity, materia) {
  const status = activityStatus(activity, todayISO());
  const priority = ['alta', 'media', 'baja'].includes(activity.prioridad) ? activity.prioridad : 'media';
  return `
    <button class="activity-card" type="button" data-activity-id="${escapeHtml(activity.id)}" aria-label="Ver actividad ${escapeHtml(activity.titulo)}">
      <span class="priority-dot priority-dot--${priority}" aria-label="Prioridad ${priority}"></span>
      <span class="activity-card__body">
        <strong>${escapeHtml(activity.titulo)}</strong>
        <span class="activity-card__meta">
          <span class="subject-tag">${escapeHtml(materia?.nombre ?? 'Sin materia')}</span>
          <span>${escapeHtml(activityTypeLabel(activity.tipo))}</span>
          <span>Prioridad ${priority}</span>
          <span class="meta-clock">${icon('clock')}${status.overdue ? 'Vencida' : activity.fecha === todayISO() ? `Hoy${activity.hora ? `, ${escapeHtml(activity.hora)}` : ''}` : `${formatDate(activity.fecha, { short: true })}${activity.hora ? `, ${escapeHtml(activity.hora)}` : ''}`}</span>
        </span>
      </span>
      <span class="activity-card__chevron" aria-hidden="true">${icon('chevron')}</span>
    </button>`;
}

export function emptyState(title, text, actionLabel = '', action = '') {
  return `
    <section class="empty-state" aria-live="polite">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(text)}</p>
      ${actionLabel ? `<button class="btn btn--secondary" type="button" data-route="${escapeHtml(action)}">${escapeHtml(actionLabel)}</button>` : ''}
    </section>`;
}
