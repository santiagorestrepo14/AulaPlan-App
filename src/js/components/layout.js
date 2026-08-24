import { navigate } from '../router.js';
import { escapeHtml } from '../utils.js';

const navItems = [
  ['inicio', 'Inicio', 'home'],
  ['materias', 'Materias', 'book'],
  ['actividades', 'Actividades', 'check'],
  ['calendario', 'Calendario', 'calendar'],
  ['configuracion', 'Config', 'settings'],
];

const icons = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.5 12 3.8l8.5 6.7v9.2a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22V5.5Z"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5h6M9 12l2 2 4-4"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
  settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.2 13.5c.1-.5.1-1 0-1.5l1.8-1.4-1.8-3.1-2.2.9a7.5 7.5 0 0 0-1.4-.8L15.3 5h-3.6l-.3 2.6a7.5 7.5 0 0 0-1.4.8l-2.2-.9L6 10.6 7.8 12c-.1.5-.1 1 0 1.5L6 14.9 7.8 18l2.2-.9c.4.3.9.6 1.4.8l.3 2.6h3.6l.3-2.6c.5-.2 1-.5 1.4-.8l2.2.9 1.8-3.1z"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M6 20c0-3.2 2.7-5.5 6-5.5s6 2.3 6 5.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 15v5h14v-5"/></svg>',
  upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V5m0 0 4 4m-4-4-4 4M5 15v5h14v-5"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.2v.2"/></svg>',
  users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3 2.4-5 5.5-5s5.5 2 5.5 5M16 6.5a2.5 2.5 0 0 1 0 5M16.5 15c2.4.3 4 2.1 4 4.5"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.2A8 8 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z"/></svg>',
  palette: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0 0 18h1.6a2 2 0 0 0 1.7-3c-.7-1.1.1-2.5 1.4-2.5H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="9.5" cy="7.5" r="1"/><circle cx="14" cy="7" r="1"/><circle cx="17" cy="10" r="1"/></svg>',
};

export function icon(name) {
  return `<span class="ui-icon" aria-hidden="true">${icons[name] || ''}</span>`;
}

export function screenHeader({ title, back = false, backLabel = '', action = '', actionLabel = 'Editar' }) {
  return `
    <header class="screen-header">
      <div class="screen-header__lead">
        ${back ? `<button class="back-link" type="button" data-action="back" aria-label="Volver">${icon('back')}${backLabel ? `<span>${escapeHtml(backLabel)}</span>` : ''}</button>` : ''}
        ${title ? `<h1>${escapeHtml(title)}</h1>` : ''}
      </div>
      ${action ? `<button class="icon-btn icon-btn--sm" type="button" data-action="${escapeHtml(action)}" aria-label="${escapeHtml(actionLabel)}">${icon('edit')}</button>` : ''}
    </header>`;
}

export function bottomNav(active) {
  return `
    <nav class="bottom-nav" aria-label="Navegación principal">
      ${navItems.map(([route, label, iconName]) => `
        <button class="bottom-nav__item ${active === route ? 'is-active' : ''}" type="button" data-route="${route}" aria-current="${active === route ? 'page' : 'false'}">
          <span class="bottom-nav__icon" aria-hidden="true">${route === 'inicio' ? '<img class="bottom-nav__brand" src="./aulaplan-icon.svg" alt="" />' : icon(iconName)}</span>
          <span class="bottom-nav__label">${label}</span>
        </button>`).join('')}
    </nav>`;
}

export function metaIcon(name) {
  return `<span class="meta-icon" aria-hidden="true">${icons[name] || ''}</span>`;
}

export function toast(message) {
  const old = document.querySelector('.toast');
  old?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-visible'));
  setTimeout(() => {
    el.classList.remove('is-visible');
    setTimeout(() => el.remove(), 250);
  }, 1900);
}

export function confirmAction(state, message, confirmLabel = 'Eliminar') {
  if (state?.preferencias?.confirmaciones === false) return Promise.resolve(true);
  if (typeof HTMLDialogElement === 'undefined' || typeof HTMLDialogElement.prototype.showModal !== 'function') {
    return Promise.resolve(window.confirm(message));
  }

  return new Promise(resolve => {
    const dialog = document.createElement('dialog');
    dialog.className = 'confirm-dialog';
    dialog.setAttribute('aria-labelledby', 'confirm-dialog-title');

    const title = document.createElement('h2');
    title.id = 'confirm-dialog-title';
    title.textContent = 'Confirmar acción';
    const copy = document.createElement('p');
    copy.textContent = message;
    const actions = document.createElement('div');
    actions.className = 'confirm-dialog__actions';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'btn btn--secondary';
    cancel.textContent = 'Cancelar';
    const accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'btn btn--danger';
    accept.textContent = confirmLabel;
    actions.append(cancel, accept);
    dialog.append(title, copy, actions);
    document.body.appendChild(dialog);

    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      dialog.close();
      dialog.remove();
      resolve(value);
    };
    cancel.addEventListener('click', () => finish(false));
    accept.addEventListener('click', () => finish(true));
    dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
    dialog.addEventListener('click', event => { if (event.target === dialog) finish(false); });
    dialog.showModal();
    cancel.focus();
  });
}

export function bindCommonNavigation(container, onBack) {
  container.querySelectorAll('[data-route]').forEach((el) => {
    if (el.dataset.routeBound) return;
    el.dataset.routeBound = '1';
    el.addEventListener('click', () => navigate(el.dataset.route));
  });
  container.querySelector('[data-action="back"]')?.addEventListener('click', onBack);
}
