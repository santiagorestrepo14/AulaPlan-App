import { loadState, saveState } from './storage.js';
import { activeSemesterState } from './academic.js';
import { readRoute, navigate } from './router.js';
import { bindCommonNavigation } from './components/layout.js';
import { applyTheme, bindSystemThemeListener } from './theme.js';
import { renderInicio, bindInicio } from './views/inicio.js';
import { renderMaterias, bindMaterias, renderMateriaForm, bindMateriaForm, renderMateriaDetalle, bindMateriaDetalle } from './views/materias.js';
import { renderActividades, bindActividades, renderActividadForm, bindActividadForm, renderActividadDetalle, bindActividadDetalle } from './views/actividades.js';
import { renderCalendario, bindCalendario } from './views/calendario.js';
import { renderConfiguracion, bindConfiguracion } from './views/configuracion.js';

let state = loadState();
const root = document.querySelector('#app');

function persist() { saveState(state); }
function replaceState(next) { state = next; persist(); }

function render() {
  applyTheme(state.preferencias.tema);
  const { route, params } = readRoute();
  const scopedState = activeSemesterState(state);

  const map = {
    inicio: () => renderInicio(scopedState),
    materias: () => renderMaterias(scopedState),
    'materia-form': () => renderMateriaForm(scopedState, params),
    'materia-detalle': () => renderMateriaDetalle(scopedState, params),
    actividades: () => renderActividades(scopedState),
    'actividad-form': () => renderActividadForm(scopedState, params),
    'actividad-detalle': () => renderActividadDetalle(scopedState, params),
    calendario: () => renderCalendario(scopedState, params),
    configuracion: () => renderConfiguracion(state),
  };

  root.innerHTML = map[route]?.() ?? renderInicio(scopedState);
  root.scrollTop = 0;
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

  const backRoutes = {
    'materia-form': 'materias',
    'materia-detalle': 'materias',
    'actividad-form': 'actividades',
    'actividad-detalle': 'actividades',
  };

  bindCommonNavigation(root, () => navigate(backRoutes[route] || 'inicio'));

  if (route === 'inicio') bindInicio(root, state, persist);
  if (route === 'materias') bindMaterias(root);
  if (route === 'materia-form') bindMateriaForm(root, state, params, persist);
  if (route === 'materia-detalle') bindMateriaDetalle(root, state, params, persist);
  if (route === 'actividades') bindActividades(root, scopedState, persist);
  if (route === 'actividad-form') bindActividadForm(root, state, params, persist);
  if (route === 'actividad-detalle') bindActividadDetalle(root, state, params, persist);
  if (route === 'calendario') bindCalendario(root, params);
  if (route === 'configuracion') bindConfiguracion(root, state, persist, replaceState);

  root.querySelectorAll('[data-activity-id]').forEach(el => {
    if (!el.dataset.bound) {
      el.dataset.bound = '1';
      el.addEventListener('click', () => navigate('actividad-detalle', { id: el.dataset.activityId }));
    }
  });
}

export function startApp() {
  applyTheme(state.preferencias.tema);
  bindSystemThemeListener(() => state.preferencias.tema);
  window.addEventListener('hashchange', render);
  window.addEventListener('aulaplan:navigate', render);

  if (!window.location.hash) {
    navigate(state.preferencias.vistaInicial || 'inicio');
  } else {
    render();
  }
}
