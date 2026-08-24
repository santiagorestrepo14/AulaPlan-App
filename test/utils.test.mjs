import test from 'node:test';
import assert from 'node:assert/strict';
import { activityStatus, isValidISODate, isValidTime, priorityRank } from '../src/js/utils.js';

test('valida fechas reales y años bisiestos', () => {
  assert.equal(isValidISODate('2028-02-29'), true);
  assert.equal(isValidISODate('2027-02-29'), false);
  assert.equal(isValidISODate('2026-13-01'), false);
  assert.equal(isValidISODate('texto'), false);
});

test('valida horas de 24 horas', () => {
  assert.equal(isValidTime('00:00'), true);
  assert.equal(isValidTime('23:59'), true);
  assert.equal(isValidTime('24:00'), false);
  assert.equal(isValidTime('', { allowEmpty: false }), false);
});

test('calcula estado semántico y orden de prioridad', () => {
  assert.deepEqual(activityStatus({ fecha: '2026-08-12', estado: 'pendiente' }, '2026-08-13'), { key: 'vencida', label: 'Vencida', overdue: true });
  assert.equal(activityStatus({ fecha: '2026-08-13', estado: 'pendiente' }, '2026-08-13').label, 'Pendiente');
  assert.equal(activityStatus({ fecha: '2020-01-01', estado: 'completada' }, '2026-08-13').label, 'Completada');
  assert.ok(priorityRank('alta') < priorityRank('media'));
  assert.ok(priorityRank('media') < priorityRank('baja'));
});
