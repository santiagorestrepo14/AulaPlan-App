import test from 'node:test';
import assert from 'node:assert/strict';

import { loadState, parseImportedState } from '../src/js/storage.js';

function installStorage(entries = {}) {
  const data = new Map(Object.entries(entries));
  globalThis.localStorage = {
    getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: key => data.delete(key),
  };
  return data;
}

test('migra aulaplan_v5 a un semestre inicial sin perder la copia v5', () => {
  const old = {
    materias: [{
      id: 'm1',
      nombre: 'Cálculo',
      dias: ['Lun'],
      horaInicio: '08:00',
      horaFin: '10:00',
      color: '#2563EB',
    }],
    actividades: [{
      id: 'a1',
      titulo: 'Taller',
      materiaId: 'm1',
      fecha: '2026-08-20',
      hora: '10:00',
      tipo: 'tarea',
      prioridad: 'media',
    }],
    preferencias: { tema: 'light' },
  };

  const data = installStorage({ aulaplan_v5: JSON.stringify(old) });
  const state = loadState();

  assert.equal(state.preferencias.versionDatos, 6);
  assert.equal(state.semestres.length, 1);
  assert.equal(state.materias[0].semestreId, state.preferencias.semestreActivoId);
  assert.equal(state.actividades[0].materiaId, state.materias[0].id);
  assert.ok(data.has('aulaplan_v6'));
  assert.ok(data.has('aulaplan_v5'));
});

test('normaliza calificaciones y no permite que un respaldo exceda 100%', () => {
  const state = parseImportedState(JSON.stringify({
    app: 'AulaPlan',
    schemaVersion: 6,
    data: {
      semestres: [{ id: 's1', nombre: '2026 - 2' }],
      materias: [{
        id: 'm1',
        semestreId: 's1',
        nombre: 'Cálculo',
        calificaciones: [
          { id: 'g1', nombre: 'Parcial', porcentaje: 60, calificacion: 4 },
          { id: 'g2', nombre: 'Proyecto', porcentaje: 50, calificacion: null },
        ],
      }],
      actividades: [],
      preferencias: { semestreActivoId: 's1' },
    },
  }));

  assert.equal(state.materias[0].calificaciones.length, 1);
  assert.equal(state.materias[0].calificaciones[0].porcentaje, 60);
});
