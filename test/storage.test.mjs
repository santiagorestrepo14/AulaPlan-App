import test from 'node:test';
import assert from 'node:assert/strict';
import { exportState, loadState, parseImportedState } from '../src/js/storage.js';

function installStorage(entries = {}) {
  const data = new Map(Object.entries(entries));
  globalThis.localStorage = {
    getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: key => data.delete(key),
  };
  return data;
}

test('importa un respaldo válido, normaliza campos y evita IDs duplicados', () => {
  const imported = parseImportedState(JSON.stringify({
    app: 'AulaPlan',
    schemaVersion: 5,
    data: {
      materias: [
        { id: 'mat-1', nombre: 'Cálculo', dias: ['Lun'], color: '#2563EB' },
        { id: 'mat-1', nombre: 'Física', dias: ['Mar'], color: '#D97706' },
      ],
      actividades: [
        { id: 'act-1', titulo: 'Taller', materiaId: 'mat-1', fecha: '2026-08-20', hora: '10:30', prioridad: 'alta', tipo: 'entrega' },
        { id: 'act-1', titulo: 'Huérfana', materiaId: 'inexistente', fecha: '2026-08-21' },
      ],
      preferencias: { tema: 'dark', vistaInicial: 'calendario' },
    },
  }));

  assert.equal(imported.materias.length, 2);
  assert.notEqual(imported.materias[0].id, imported.materias[1].id);
  assert.equal(imported.actividades.length, 1);
  assert.equal(imported.actividades[0].tipo, 'entrega');
  assert.equal(imported.preferencias.tema, 'dark');
});

test('rechaza archivos que no tienen el contrato de respaldo', () => {
  assert.throws(() => parseImportedState('{"materias":[]}'), /respaldo válido/);
  assert.throws(() => parseImportedState('no es json'), SyntaxError);
});

test('migra datos de la versión React anterior sin borrar sus claves', () => {
  const data = installStorage({
    aulaplan_session_v1: 'usuario-1',
    aulaplan_accounts_v1: JSON.stringify([{ id: 'usuario-1', name: 'Valentina' }]),
    'aulaplan_usuario-1_subjects_v2': JSON.stringify([{ id: 'subject-1', name: 'Programación', teacher: 'Ana', daysOfWeek: [1, 3], startTime: '18:00', endTime: '20:00', classroom: '304' }]),
    'aulaplan_usuario-1_activities_v2': JSON.stringify([{ id: 'activity-1', title: 'Entrega', subjectId: 'subject-1', type: 'Entrega', dueAt: '2026-08-20T20:00', priority: 'high', status: 'pending' }]),
    'aulaplan_usuario-1_preferences_v2': JSON.stringify({ userName: 'Vale', defaultSort: 'priority' }),
  });

  const state = loadState();
  assert.equal(state.materias[0].nombre, 'Programación');
  assert.deepEqual(state.materias[0].dias, ['Lun', 'Mié']);
  assert.equal(state.actividades[0].prioridad, 'alta');
  assert.equal(state.preferencias.nombreUsuario, 'Vale');
  assert.equal(state.preferencias.criterioOrden, 'prioridad');
  assert.ok(data.has('aulaplan_v5'));
  assert.ok(data.has('aulaplan_usuario-1_subjects_v2'));
});

test('exporta un respaldo que vuelve a importarse', () => {
  installStorage();
  const state = {
    materias: [{ id: 'm1', nombre: 'Diseño', dias: [], color: '#7C3AED' }],
    actividades: [{ id: 'a1', titulo: 'Prototipo', materiaId: 'm1', tipo: 'proyecto', prioridad: 'media', fecha: '2026-08-25', estado: 'pendiente' }],
    preferencias: { tema: 'system' },
  };
  const parsed = parseImportedState(exportState(state));
  assert.equal(parsed.materias[0].nombre, 'Diseño');
  assert.equal(parsed.actividades[0].titulo, 'Prototipo');
});
