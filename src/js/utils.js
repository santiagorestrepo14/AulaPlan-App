export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
export function escapeHtml(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
export function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
export function isValidISODate(value) {
  const input = String(value || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;
  const [year, month, day] = input.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
export function isValidTime(value, { allowEmpty = true } = {}) {
  const input = String(value || '');
  return (allowEmpty && input === '') || /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input);
}
export function formatDate(iso, options = {}) {
  if (!isValidISODate(iso)) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', options.short ? { day: '2-digit', month: 'short' } : { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${iso}T12:00:00`));
}
export function longDate(iso) {
  if (!isValidISODate(iso)) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${iso}T12:00:00`));
}
export function compareDate(a, b) { return String(a ?? '').localeCompare(String(b ?? '')); }
export function priorityRank(priority) { return { alta: 0, media: 1, baja: 2 }[priority] ?? 9; }
export function activityStatus(activity, today = todayISO()) {
  if (activity?.estado === 'completada') return { key: 'completada', label: 'Completada', overdue: false };
  if (isValidISODate(activity?.fecha) && activity.fecha < today) return { key: 'vencida', label: 'Vencida', overdue: true };
  return { key: 'pendiente', label: 'Pendiente', overdue: false };
}
export function capitalize(value = '') { const str = String(value); return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }
export function activityTypeLabel(type = '') {
  return {
    tarea: 'Tarea', proyecto: 'Proyecto', examen: 'Examen', exposicion: 'Exposición',
    evaluacion: 'Evaluación', entrega: 'Entrega', otra: 'Otra',
  }[String(type)] || 'Actividad';
}
export function dayCode(date = new Date()) {
  return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()];
}
