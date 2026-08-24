import test from 'node:test';
import assert from 'node:assert/strict';

import { renderInicio } from '../src/js/views/inicio.js';
import { renderMaterias, renderMateriaForm, renderMateriaDetalle } from '../src/js/views/materias.js';
import { renderActividades, renderActividadForm, renderActividadDetalle } from '../src/js/views/actividades.js';
import { renderCalendario } from '../src/js/views/calendario.js';
import { renderConfiguracion } from '../src/js/views/configuracion.js';

const state = {
  materias: [{
    id: 'mat-1',
    nombre: 'Diseño <UX>',
    docente: 'Ana Ruiz',
    dias: ['Lun', 'Mié'],
    horaInicio: '08:00',
    horaFin: '10:00',
    bloque: 'B',
    aula: '204',
    color: '#2563EB',
    notas: 'Traer prototipo',
    fechaCreacion: '2026-08-01T12:00:00.000Z',
  }],
  actividades: [{
    id: 'act-1',
    titulo: 'Entrega <final>',
    materiaId: 'mat-1',
    tipo: 'proyecto',
    prioridad: 'alta',
    fecha: '2026-08-15',
    hora: '18:30',
    descripcion: 'Presentar el flujo completo',
    recordatorio: true,
    estado: 'pendiente',
    fechaCreacion: '2026-08-01T12:00:00.000Z',
  }],
  preferencias: {
    nombreUsuario: 'Santiago',
    vistaInicial: 'inicio',
    criterioOrden: 'fecha',
    tema: 'light',
    temaColor: 'neutro',
    confirmaciones: true,
    versionDatos: 5,
  },
};

test('las nueve vistas principales se renderizan con su navegación y acciones', () => {
  const views = [
    renderInicio(state),
    renderMaterias(state),
    renderMateriaForm(state, new URLSearchParams()),
    renderMateriaDetalle(state, new URLSearchParams({ id: 'mat-1' })),
    renderActividades(state),
    renderActividadForm(state, new URLSearchParams()),
    renderActividadDetalle(state, new URLSearchParams({ id: 'act-1' })),
    renderCalendario(state, new URLSearchParams({ date: '2026-08-15' })),
    renderConfiguracion(state),
  ];

  assert.equal(views.length, 9);
  for (const html of views) {
    assert.match(html, /class="app-shell"/);
    assert.match(html, /bottom-nav/);
    assert.doesNotMatch(html, /class="[^"]*\bfab\b/);
    assert.doesNotMatch(html, /icon-btn--create/);
    assert.doesNotMatch(html, />\s*\+\s*</);
    assert.match(html, /aulaplan-icon\.svg/);
  }
});

test('formularios y detalle cubren todos los datos académicos requeridos', () => {
  const subjectForm = renderMateriaForm(state, new URLSearchParams({ id: 'mat-1' }));
  for (const field of ['nombre', 'docente', 'dias', 'horaInicio', 'horaFin', 'aula', 'color', 'notas']) {
    assert.match(subjectForm, new RegExp(`name="${field}"`));
  }

  const activityForm = renderActividadForm(state, new URLSearchParams({ id: 'act-1' }));
  for (const value of ['tarea', 'entrega', 'proyecto', 'examen', 'exposicion', 'otra']) {
    assert.match(activityForm, new RegExp(`value="${value}"`));
  }
  for (const priority of ['alta', 'media', 'baja']) {
    assert.match(activityForm, new RegExp(`value="${priority}"`));
  }
  assert.match(renderActividadDetalle(state, new URLSearchParams({ id: 'act-1' })), /Reabrir actividad|Marcar como completada/);
});

test('el calendario siempre construye una cuadrícula mensual de 42 fechas', () => {
  const html = renderCalendario(state, new URLSearchParams({ date: '2026-08-15' }));
  assert.equal((html.match(/data-date="/g) || []).length, 42);
  assert.match(html, /priority-dot--alta/);
  assert.match(html, /Entrega &lt;final&gt;/);
  assert.match(html, /Prioridad alta/);
});

test('configuración es local, ofrece tres temas y no contiene credenciales', () => {
  const html = renderConfiguracion(state);
  assert.match(html, /Sin cuenta de usuario/);
  assert.match(html, /id="dark-mode-toggle"/);
  assert.match(html, /Preferencias avanzadas/);
  for (const theme of ['system', 'light', 'dark']) assert.match(html, new RegExp(`value="${theme}"`));
  assert.match(html, /Exportar copia de seguridad/);
  assert.match(html, /Importar respaldo local/);
  assert.doesNotMatch(html, /type="(?:email|password)"/);
});

test('contenido ingresado por el usuario se escapa antes de entrar al HTML', () => {
  const rendered = [
    renderMaterias(state),
    renderMateriaDetalle(state, new URLSearchParams({ id: 'mat-1' })),
    renderActividadDetalle(state, new URLSearchParams({ id: 'act-1' })),
  ].join('\n');
  assert.match(rendered, /Diseño &lt;UX&gt;/);
  assert.match(rendered, /Entrega &lt;final&gt;/);
  assert.doesNotMatch(rendered, /Diseño <UX>|Entrega <final>/);
});
