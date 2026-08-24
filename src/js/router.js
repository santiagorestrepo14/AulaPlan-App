const validRoutes = new Set([
  'inicio', 'materias', 'materia-form', 'materia-detalle',
  'actividades', 'actividad-form', 'actividad-detalle',
  'calendario', 'configuracion',
]);

const legacyAccessRoutes = new Set(['bienvenida', 'login', 'registro', 'crear-cuenta', 'iniciar-sesion', 'access']);

export function readRoute() {
  const raw = window.location.hash.replace(/^#\/?/, '') || 'inicio';
  const [path, query = ''] = raw.split('?');
  const route = validRoutes.has(path) ? path : legacyAccessRoutes.has(path) ? 'inicio' : 'inicio';
  return { route, params: new URLSearchParams(query) };
}

export function navigate(route, params = {}) {
  const safeRoute = validRoutes.has(route) ? route : 'inicio';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  }
  const target = `#${safeRoute}${search.toString() ? `?${search}` : ''}`;
  if (window.location.hash === target) {
    window.dispatchEvent(new Event('aulaplan:navigate'));
    return;
  }
  window.location.hash = target;
}

export function goBack(fallback = 'inicio') {
  navigate(fallback);
}
