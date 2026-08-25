import { bottomNav, confirmAction, icon, toast } from '../components/layout.js';
import { createEmptyState, exportState, parseImportedState } from '../storage.js';
import { navigate } from '../router.js';
import { applyTheme, resolveTheme } from '../theme.js';
import { escapeHtml } from '../utils.js';

export function renderConfiguracion(state) {
  const darkMode = resolveTheme(state.preferencias.tema) === 'dark';
  return `
    <div class="app-shell">
      <main class="screen screen--with-nav settings-screen">
        <h1>Configuración</h1>
        <section class="account-note">
          <strong>Sin cuenta de usuario</strong>
          <p>Tus asignaturas y entregas se almacenan localmente de forma privada en este teléfono móvil.</p>
        </section>

        <section class="settings-group">
          <h2>APARIENCIA</h2>
          <label class="settings-row settings-row--switch">
            <span class="settings-row__icon">${icon('moon')}</span>
            <span class="settings-row__body"><strong>Modo oscuro</strong></span>
            <input id="dark-mode-toggle" type="checkbox" ${darkMode ? 'checked' : ''} aria-label="Modo oscuro">
            <i class="switch-control"></i>
          </label>
          <div class="settings-row">
            <span class="settings-row__icon">${icon('palette')}</span>
            <span class="settings-row__body"><strong>Tema de color</strong></span>
            <span class="settings-row__value">Neutro AulaPlan</span>
          </div>
        </section>

        <section class="settings-group">
          <h2>GESTIÓN DE DATOS</h2>
          <button class="settings-row" type="button" data-action="export"><span class="settings-row__icon">${icon('download')}</span><span class="settings-row__body"><strong>Exportar copia de seguridad</strong></span><span class="settings-row__chevron">${icon('chevron')}</span></button>
          <label class="settings-row settings-row--file"><span class="settings-row__icon">${icon('upload')}</span><span class="settings-row__body"><strong>Importar respaldo local</strong></span><span class="settings-row__chevron">${icon('chevron')}</span><input id="import-file" type="file" accept="application/json,.json"></label>
          <button class="settings-row settings-row--danger" type="button" data-action="reset"><span class="settings-row__icon">${icon('trash')}</span><span class="settings-row__body"><strong>Borrar todos los datos</strong></span><span class="settings-row__chevron">${icon('chevron')}</span></button>
        </section>

        <section class="settings-group">
          <h2>INFORMACIÓN</h2>
          <div class="settings-row"><span class="settings-row__icon">${icon('info')}</span><span class="settings-row__body"><strong>Versión de AulaPlan</strong></span><span class="settings-row__value">v0.3.0</span></div>
          <button class="settings-row" type="button" data-action="terms"><span class="settings-row__icon">${icon('info')}</span><span class="settings-row__body"><strong>Términos y condiciones</strong></span><span class="settings-row__chevron">${icon('chevron')}</span></button>
          <button class="settings-row" type="button" data-action="credits"><span class="settings-row__icon">${icon('users')}</span><span class="settings-row__body"><strong>Desarrolladores y créditos</strong></span><span class="settings-row__chevron">${icon('chevron')}</span></button>
          <button class="settings-row" type="button" data-action="preferences"><span class="settings-row__icon">${icon('settings')}</span><span class="settings-row__body"><strong>Preferencias avanzadas</strong><small>Inicio, orden y confirmaciones</small></span><span class="settings-row__chevron">${icon('chevron')}</span></button>
        </section>
      </main>

      <dialog id="settings-dialog" class="settings-dialog" aria-labelledby="settings-dialog-title">
        <div class="settings-dialog__header"><h2 id="settings-dialog-title">Preferencias avanzadas</h2><button type="button" class="text-action" data-action="close-preferences">Cerrar</button></div>
        <form id="preferences-form" class="settings-form">
          <label class="settings-field"><span>Nombre para el saludo</span><input name="nombreUsuario" maxlength="40" value="${escapeHtml(state.preferencias.nombreUsuario || '')}" placeholder="Estudiante" /></label>
          <label class="settings-field"><span>Vista al abrir</span><select name="vistaInicial"><option value="inicio" ${state.preferencias.vistaInicial === 'inicio' ? 'selected' : ''}>Inicio</option><option value="materias" ${state.preferencias.vistaInicial === 'materias' ? 'selected' : ''}>Materias</option><option value="actividades" ${state.preferencias.vistaInicial === 'actividades' ? 'selected' : ''}>Actividades</option><option value="calendario" ${state.preferencias.vistaInicial === 'calendario' ? 'selected' : ''}>Calendario</option><option value="configuracion" ${state.preferencias.vistaInicial === 'configuracion' ? 'selected' : ''}>Configuración</option></select></label>
          <label class="settings-field"><span>Orden de actividades</span><select name="criterioOrden"><option value="fecha" ${state.preferencias.criterioOrden === 'fecha' ? 'selected' : ''}>Fecha</option><option value="prioridad" ${state.preferencias.criterioOrden === 'prioridad' ? 'selected' : ''}>Prioridad</option><option value="materia" ${state.preferencias.criterioOrden === 'materia' ? 'selected' : ''}>Materia</option></select></label>
          <label class="settings-field"><span>Tema</span><select name="tema"><option value="system" ${state.preferencias.tema === 'system' ? 'selected' : ''}>Sistema</option><option value="light" ${state.preferencias.tema === 'light' ? 'selected' : ''}>Claro</option><option value="dark" ${state.preferencias.tema === 'dark' ? 'selected' : ''}>Oscuro</option></select></label>
          <label class="settings-row settings-row--switch settings-row--in-form">
            <span class="settings-row__icon">${icon('check')}</span><span class="settings-row__body"><strong>Confirmar eliminaciones</strong><small>Pregunta antes de eliminar elementos</small></span>
            <input name="confirmaciones" type="checkbox" ${state.preferencias.confirmaciones ? 'checked' : ''}><i class="switch-control"></i>
          </label>
          <button class="btn btn--primary btn--full" type="submit">Guardar preferencias</button>
        </form>
      </dialog>
      ${bottomNav('configuracion')}
    </div>`;
}

export function bindConfiguracion(root, state, persist, replaceState) {
  root.querySelector('#dark-mode-toggle')?.addEventListener('change', event => {
    state.preferencias.tema = event.target.checked ? 'dark' : 'light';
    applyTheme(state.preferencias.tema);
    persist();
    toast(event.target.checked ? 'Modo oscuro activado.' : 'Modo claro activado.');
  });

  const preferencesDialog = root.querySelector('#settings-dialog');
  root.querySelector('[data-action="preferences"]')?.addEventListener('click', () => {
    if (typeof preferencesDialog?.showModal === 'function') preferencesDialog.showModal();
    else preferencesDialog?.setAttribute('open', '');
  });
  root.querySelector('[data-action="close-preferences"]')?.addEventListener('click', () => preferencesDialog?.close());
  root.querySelector('#preferences-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.preferencias.nombreUsuario = String(data.get('nombreUsuario') || '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 40);
    state.preferencias.vistaInicial = String(data.get('vistaInicial') || 'inicio');
    state.preferencias.criterioOrden = String(data.get('criterioOrden') || 'fecha');
    state.preferencias.tema = String(data.get('tema') || 'system');
    state.preferencias.confirmaciones = data.get('confirmaciones') === 'on';
    applyTheme(state.preferencias.tema);
    persist();
    preferencesDialog?.close();
    toast('Preferencias guardadas.');
    navigate('configuracion');
  });

  root.querySelector('[data-action="export"]')?.addEventListener('click', () => {
    const blob = new Blob([exportState(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aulaplan-respaldo-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    toast('Copia de seguridad exportada.');
  });
  root.querySelector('#import-file')?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('El respaldo supera el límite de 2 MB.');
      const imported = parseImportedState(await file.text());
      if (!await confirmAction(state, 'La importación reemplazará los datos actuales. ¿Deseas continuar?', 'Importar y reemplazar')) return;
      replaceState(imported);
      applyTheme(imported.preferencias.tema);
      toast('Respaldo importado.');
      navigate('configuracion');
    } catch (error) { toast(error.message || 'No se pudo importar el respaldo.'); }
    finally { event.target.value = ''; }
  });
  root.querySelector('[data-action="reset"]')?.addEventListener('click', async () => {
    if (!await confirmAction(state, '¿Borrar todas las materias, actividades y preferencias guardadas? Esta acción no se puede deshacer.', 'Borrar todos los datos')) return;
    const empty = createEmptyState();
    replaceState(empty);
    applyTheme(empty.preferencias.tema);
    toast('Todos los datos fueron eliminados.');
    navigate('inicio');
  });
  root.querySelector('[data-action="terms"]')?.addEventListener('click', () => alert('AulaPlan funciona de forma local y académica. No recopila datos ni requiere una cuenta de usuario.'));
  root.querySelector('[data-action="credits"]')?.addEventListener('click', () => alert('AulaPlan · Proyecto académico desarrollado por Santiago Restrepo, Josué Pino y Sebastián Cruz.'));
}
