import test from 'node:test';
import assert from 'node:assert/strict';

import {
  activeSemesterState,
  calculateGradeSummary,
  createSemester,
} from '../src/js/academic.js';

test('cada semestre filtra sus propias materias y actividades', () => {
  const state = {
    semestres: [
      { id: 's1', nombre: '2026 - 1' },
      { id: 's2', nombre: '2026 - 2' },
    ],
    materias: [
      { id: 'm1', semestreId: 's1', nombre: 'Anterior' },
      { id: 'm2', semestreId: 's2', nombre: 'Actual' },
    ],
    actividades: [
      { id: 'a1', materiaId: 'm1' },
      { id: 'a2', materiaId: 'm2' },
    ],
    preferencias: { semestreActivoId: 's2' },
  };

  const scoped = activeSemesterState(state);
  assert.deepEqual(scoped.materias.map(item => item.id), ['m2']);
  assert.deepEqual(scoped.actividades.map(item => item.id), ['a2']);
});

test('crear semestre lo selecciona y evita duplicados por nombre normalizado', () => {
  const state = {
    semestres: [{ id: 's1', nombre: '2026 - 1' }],
    preferencias: { semestreActivoId: 's1' },
  };

  const first = createSemester(state, '2026 - 2');
  assert.equal(first.created, true);
  assert.equal(state.preferencias.semestreActivoId, first.semester.id);

  const duplicate = createSemester(state, '  2026   -   2  ');
  assert.equal(duplicate.created, false);
  assert.equal(state.semestres.length, 2);
});

test('calificaciones pendientes no cuentan como nota cero ni como porcentaje evaluado', () => {
  const result = calculateGradeSummary({
    notaMinima: 3,
    calificaciones: [
      { porcentaje: 20, calificacion: 4 },
      { porcentaje: 20, calificacion: 3 },
      { porcentaje: 30, calificacion: null },
      { porcentaje: 30, calificacion: null },
    ],
  });

  assert.equal(result.porcentajeProgramado, 100);
  assert.equal(result.porcentajeEvaluado, 40);
  assert.equal(result.porcentajeRestante, 60);
  assert.equal(result.promedioEvaluado, 3.5);
  assert.equal(result.acumulado, 1.4);
  assert.equal(result.notaNecesaria, 2.67);
});

test('detecta materia asegurada e imposibilidad matemática', () => {
  const secured = calculateGradeSummary({
    notaMinima: 3,
    calificaciones: [{ porcentaje: 80, calificacion: 4 }],
  });
  assert.equal(secured.estado, 'asegurada');

  const impossible = calculateGradeSummary({
    notaMinima: 3,
    calificaciones: [{ porcentaje: 80, calificacion: 1 }],
  });
  assert.equal(impossible.estado, 'imposible');
  assert.equal(impossible.notaNecesaria, 11);
});
