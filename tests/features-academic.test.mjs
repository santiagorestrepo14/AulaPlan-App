import test from 'node:test';
import assert from 'node:assert/strict';

import { renderInicio } from '../src/js/views/inicio.js';
import { renderMateriaDetalle } from '../src/js/views/materias.js';

const state = {
  semestres: [
    { id: 'sem-1', nombre: '2026 - 1' },
    { id: 'sem-2', nombre: '2026 - 2' },
  ],
  materias: [{
    id: 'mat-1',
    semestreId: 'sem-2',
    nombre: 'Cálculo',
    docente: 'Laura',
    dias: ['Lun'],
    horaInicio: '08:00',
    horaFin: '10:00',
    aula: '201',
    color: '#2563EB',
    notas: '',
    notaMinima: 3,
    calificaciones: [
      { id: 'g1', nombre: 'Parcial 1', porcentaje: 20, calificacion: 4 },
      { id: 'g2', nombre: 'Quiz', porcentaje: 20, calificacion: 3 },
      { id: 'g3', nombre: 'Parcial 2', porcentaje: 30, calificacion: null },
      { id: 'g4', nombre: 'Proyecto', porcentaje: 30, calificacion: null },
    ],
  }],
  actividades: [],
  preferencias: {
    nombreUsuario: 'Santiago Restrepo',
    semestreActivoId: 'sem-2',
    criterioOrden: 'fecha',
    tema: 'light',
    confirmaciones: true,
  },
};

test('inicio muestra selector de semestre y conserva el semestre activo', () => {
  const html = renderInicio(state);
  assert.match(html, /id="semester-select"/);
  assert.match(html, /2026 - 2/);
  assert.match(html, /Nuevo semestre/);
});

test('detalle de materia muestra rendimiento, calificaciones y nota necesaria', () => {
  const html = renderMateriaDetalle(state, new URLSearchParams({ id: 'mat-1' }));
  assert.match(html, /Rendimiento/);
  assert.match(html, /Calificaciones/);
  assert.match(html, /PROMEDIO ACTUAL/);
  assert.match(html, /Necesitas 2\.67/);
  assert.match(html, /Pendiente de calificar/);
});
