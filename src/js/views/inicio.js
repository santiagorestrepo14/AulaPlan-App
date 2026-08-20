import { bottomNav } from '../components/layout.js';
import { escapeHtml } from '../utils.js';

export function renderInicio(state) {
  const configuredName = state.preferencias.nombreUsuario?.trim();
  const firstName = configuredName
    ? configuredName.split(/\s+/)[0]
    : 'estudiante';

  return `
    <div class="app-shell">
      <main class="screen screen--with-nav home-screen">
        <header class="home-hero">
          <h1>Hola, ${escapeHtml(firstName)}</h1>
          <p>${new Intl.DateTimeFormat('es-CO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          }).format(new Date())}</p>
        </header>

        <section class="home-primary-stats">
          <article class="big-stat">
            <span>PENDIENTES</span>
            <div>
              <strong>${state.actividades.length}</strong>
              <small>actividades</small>
            </div>
          </article>

          <article class="big-stat">
            <span>MATERIAS</span>
            <div>
              <strong>${state.materias.length}</strong>
              <small>activas</small>
            </div>
          </article>
        </section>

        <section class="home-section">
          <h2>Resumen académico</h2>

          <div class="mini-stat-grid">
            <article>
              <strong>${state.materias.length}</strong>
              <span>Materias Activas</span>
            </article>

            <article>
              <strong>${state.actividades.length}</strong>
              <span>Actividades</span>
            </article>
          </div>
        </section>

        <section class="home-section">
          <h2>Próximos eventos</h2>
          <p class="empty-copy">
            Consulta aquí tus próximas clases y actividades.
          </p>
        </section>
      </main>

      ${bottomNav('inicio')}
    </div>
  `;
}

export function bindInicio(root) {
}
