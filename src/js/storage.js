import { isValidISODate, isValidTime, todayISO } from './utils.js';

const ROOT_KEY = 'aulaplan_v6';
const LEGACY_KEYS = ['aulaplan_v5', 'aulaplan_v4', 'aulaplan_v3', 'aulaplan_v2', 'aulaplan_v1'];
const VALID_PRIORITIES = new Set(['alta', 'media', 'baja']);
const VALID_TYPES = new Set(['tarea', 'proyecto', 'examen', 'exposicion', 'evaluacion', 'entrega', 'otra']);
const VALID_ORDERS = new Set(['fecha', 'prioridad', 'materia']);
const VALID_INITIAL_VIEWS = new Set(['inicio', 'materias', 'actividades', 'calendario', 'configuracion']);
const VALID_THEMES = new Set(['system', 'light', 'dark']);
const VALID_DAYS = new Set(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']);
const VALID_SUBJECT_COLORS = new Set(['#2563EB', '#D97706', '#C2413B', '#7C3AED', '#10B981']);

function defaultSemester() {
  const now = new Date();
  const period = now.getMonth() < 6 ? 1 : 2;
  return {
    id: `sem-${now.getFullYear()}-${period}`,
    nombre: `${now.getFullYear()} - ${period}`,
    fechaCreacion: now.toISOString(),
  };
}

const initialSemester = defaultSemester();

const initialState = {
  semestres: [initialSemester],
  materias: [],
  actividades: [],
  preferencias: {
    nombreUsuario: '',
    vistaInicial: 'inicio',
    criterioOrden: 'fecha',
    tema: 'system',
    temaColor: 'neutro',
    confirmaciones: true,
    semestreActivoId: initialSemester.id,
    versionDatos: 6,
  },
};

function cloneInitial() {
  return typeof structuredClone === 'function' ? structuredClone(initialState) : JSON.parse(JSON.stringify(initialState));
}
function safeRead(key) { try { return localStorage.getItem(key); } catch { return null; } }
function safeWrite(key, value) { try { localStorage.setItem(key, value); } catch { /* memoria */ } }
function safeRemove(key) { try { localStorage.removeItem(key); } catch { /* noop */ } }
function text(value, fallback = '') { return String(value ?? fallback).trim(); }
function uniqueId(value, prefix, used) {
  let candidate = text(value) || `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  while (used.has(candidate)) candidate = `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  used.add(candidate);
  return candidate;
}

function normalizeSemester(item = {}, usedIds = new Set()) {
  return {
    id: uniqueId(item.id, 'sem', usedIds),
    nombre: text(item.nombre, 'Semestre sin nombre').replace(/\s+/g, ' ').slice(0, 40) || 'Semestre sin nombre',
    fechaCreacion: text(item.fechaCreacion) || new Date().toISOString(),
  };
}

function normalizeGrades(items = []) {
  const usedIds = new Set();
  const normalized = [];
  let totalWeight = 0;

  for (const item of Array.isArray(items) ? items : []) {
    const porcentaje = Number(item?.porcentaje);
    if (!Number.isFinite(porcentaje) || porcentaje <= 0 || porcentaje > 100) continue;
    if (totalWeight + porcentaje > 100.0001) continue;

    const rawGrade = item?.calificacion;
    const calificacion = rawGrade === null || rawGrade === undefined || rawGrade === ''
      ? null
      : Number(rawGrade);

    if (calificacion !== null && (!Number.isFinite(calificacion) || calificacion < 0 || calificacion > 5)) continue;

    normalized.push({
      id: uniqueId(item?.id, 'grade', usedIds),
      nombre: text(item?.nombre, 'Evaluación').slice(0, 60) || 'Evaluación',
      porcentaje,
      calificacion,
      fechaCreacion: text(item?.fechaCreacion) || new Date().toISOString(),
    });

    totalWeight += porcentaje;
  }

  return normalized;
}

function normalizeMateria(item = {}, index = 0, usedIds = new Set(), semesterIds = new Set(), fallbackSemesterId = '') {
  const palette = ['#2563EB', '#D97706', '#C2413B', '#7C3AED', '#10B981'];
  const incomingColor = text(item.color).toUpperCase();
  const rawMinimum = item.notaMinima === null || item.notaMinima === undefined || item.notaMinima === ''
    ? NaN
    : Number(item.notaMinima);

  return {
    id: uniqueId(item.id, 'mat', usedIds),
    semestreId: semesterIds.has(text(item.semestreId)) ? text(item.semestreId) : fallbackSemesterId,
    nombre: text(item.nombre, 'Materia sin nombre') || 'Materia sin nombre',
    docente: text(item.docente),
    dias: Array.isArray(item.dias) ? item.dias.map(String).filter(day => VALID_DAYS.has(day)) : [],
    horaInicio: isValidTime(item.horaInicio) ? text(item.horaInicio) : '',
    horaFin: isValidTime(item.horaFin) ? text(item.horaFin) : '',
    bloque: text(item.bloque),
    aula: text(item.aula),
    color: VALID_SUBJECT_COLORS.has(incomingColor) ? incomingColor : palette[index % palette.length],
    notas: text(item.notas),
    notaMinima: Number.isFinite(rawMinimum) && rawMinimum >= 0 && rawMinimum <= 5 ? rawMinimum : 3,
    calificaciones: normalizeGrades(item.calificaciones),
    fechaCreacion: text(item.fechaCreacion) || new Date().toISOString(),
  };
}

function normalizeActividad(item = {}, materias = [], usedIds = new Set()) {
  const validSubjectIds = new Set(materias.map(materia => materia.id));
  const materiaId = validSubjectIds.has(text(item.materiaId)) ? text(item.materiaId) : '';
  return {
    id: uniqueId(item.id, 'act', usedIds),
    titulo: text(item.titulo, 'Actividad sin título') || 'Actividad sin título',
    materiaId,
    tipo: VALID_TYPES.has(item.tipo) ? item.tipo : 'tarea',
    prioridad: VALID_PRIORITIES.has(item.prioridad) ? item.prioridad : 'media',
    fecha: isValidISODate(item.fecha) ? item.fecha : todayISO(),
    hora: isValidTime(item.hora) ? text(item.hora) : '',
    descripcion: text(item.descripcion),
    recordatorio: item.recordatorio === true,
    estado: item.estado === 'completada' ? 'completada' : 'pendiente',
    fechaCreacion: text(item.fechaCreacion) || new Date().toISOString(),
  };
}

function normalizeState(parsed = {}) {
  const base = cloneInitial();
  const preferencias = parsed?.preferencias ?? {};

  const semesterIds = new Set();
  let semestres = Array.isArray(parsed?.semestres)
    ? parsed.semestres.map(item => normalizeSemester(item, semesterIds))
    : [];

  if (!semestres.length) {
    semesterIds.clear();
    semestres = base.semestres.map(item => normalizeSemester(item, semesterIds));
  }

  const requestedSemesterId = text(preferencias.semestreActivoId);
  const activeSemesterId = semesterIds.has(requestedSemesterId)
    ? requestedSemesterId
    : semestres[0].id;

  const subjectIds = new Set();
  const activityIds = new Set();

  const materias = Array.isArray(parsed?.materias)
    ? parsed.materias.map((item, index) =>
        normalizeMateria(item, index, subjectIds, semesterIds, activeSemesterId))
    : [];

  const actividades = Array.isArray(parsed?.actividades)
    ? parsed.actividades.map(item => normalizeActividad(item, materias, activityIds)).filter(item => item.materiaId)
    : [];

  return {
    semestres,
    materias,
    actividades,
    preferencias: {
      ...base.preferencias,
      nombreUsuario: text(preferencias.nombreUsuario).slice(0, 40),
      vistaInicial: VALID_INITIAL_VIEWS.has(preferencias.vistaInicial) ? preferencias.vistaInicial : 'inicio',
      criterioOrden: VALID_ORDERS.has(preferencias.criterioOrden) ? preferencias.criterioOrden : 'fecha',
      tema: VALID_THEMES.has(preferencias.tema) ? preferencias.tema : 'system',
      temaColor: ['neutro', 'menta', 'azul'].includes(preferencias.temaColor) ? preferencias.temaColor : 'neutro',
      confirmaciones: preferencias.confirmaciones !== false,
      semestreActivoId: activeSemesterId,
      versionDatos: 6,
    },
  };
}

function parseStoredState(raw) {
  if (!raw) return null;
  try { return normalizeState(JSON.parse(raw)); } catch { return null; }
}

function findVersionedState() {
  const current = parseStoredState(safeRead(ROOT_KEY));
  if (current) return current;
  for (const key of LEGACY_KEYS) {
    const legacy = parseStoredState(safeRead(key));
    if (legacy) return legacy;
  }
  return null;
}

function legacyDayCodes(values) {
  const codes = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return Array.isArray(values) ? values.map(Number).filter(day => Number.isInteger(day) && day >= 0 && day <= 6).map(day => codes[day]) : [];
}

function migratePreviousAppState() {
  let userId = text(safeRead('aulaplan_session_v1'));
  let displayName = '';
  try {
    const accounts = JSON.parse(safeRead('aulaplan_accounts_v1') || '[]');
    const account = Array.isArray(accounts) ? accounts.find(item => text(item?.id) === userId) : null;
    displayName = text(account?.name);
  } catch { /* respaldo antiguo inválido */ }

  const subjectKeys = userId ? [`aulaplan_${userId}_subjects_v2`, 'aulaplan_subjects_v1'] : ['aulaplan_subjects_v1'];
  const activityKeys = userId ? [`aulaplan_${userId}_activities_v2`, 'aulaplan_activities_v1'] : ['aulaplan_activities_v1'];
  const preferenceKeys = userId ? [`aulaplan_${userId}_preferences_v2`, 'aulaplan_preferences_v1'] : ['aulaplan_preferences_v1'];
  const readFirstArray = (keys) => {
    for (const key of keys) {
      try {
        const value = JSON.parse(safeRead(key) || 'null');
        if (Array.isArray(value)) return value;
      } catch { /* probar siguiente clave */ }
    }
    return [];
  };
  const oldSubjects = readFirstArray(subjectKeys);
  const oldActivities = readFirstArray(activityKeys);
  if (!oldSubjects.length && !oldActivities.length) return null;

  let oldPreferences = {};
  for (const key of preferenceKeys) {
    try {
      const value = JSON.parse(safeRead(key) || 'null');
      if (value && typeof value === 'object' && !Array.isArray(value)) { oldPreferences = value; break; }
    } catch { /* probar siguiente clave */ }
  }

  const materias = oldSubjects.map(item => ({
    id: item.id,
    nombre: item.nombre ?? item.name,
    docente: item.docente ?? item.teacher,
    dias: Array.isArray(item.dias) ? item.dias : legacyDayCodes(item.daysOfWeek),
    horaInicio: item.horaInicio ?? item.startTime,
    horaFin: item.horaFin ?? item.endTime,
    bloque: item.bloque ?? item.block,
    aula: item.aula ?? item.classroom,
    color: item.color,
    notas: item.notas,
    fechaCreacion: item.fechaCreacion ?? item.createdAt,
  }));
  const priorityMap = { high: 'alta', medium: 'media', low: 'baja' };
  const typeMap = { Tarea: 'tarea', Entrega: 'entrega', Proyecto: 'proyecto', Examen: 'examen', Evaluación: 'evaluacion', Exposición: 'exposicion', Otro: 'otra', Otra: 'otra' };
  const actividades = oldActivities.map(item => {
    const dueAt = text(item.dueAt);
    return {
      id: item.id,
      titulo: item.titulo ?? item.title,
      materiaId: item.materiaId ?? item.subjectId,
      tipo: item.tipo ?? typeMap[item.type] ?? text(item.type).toLowerCase(),
      prioridad: item.prioridad ?? priorityMap[item.priority] ?? item.priority,
      fecha: item.fecha ?? dueAt.slice(0, 10),
      hora: item.hora ?? dueAt.slice(11, 16),
      descripcion: item.descripcion ?? item.description,
      recordatorio: item.recordatorio,
      estado: item.estado ?? (item.status === 'completed' ? 'completada' : 'pendiente'),
      fechaCreacion: item.fechaCreacion ?? item.createdAt,
    };
  });

  return normalizeState({
    materias,
    actividades,
    preferencias: {
      nombreUsuario: oldPreferences.nombreUsuario ?? oldPreferences.userName ?? displayName,
      criterioOrden: oldPreferences.criterioOrden ?? ({ date: 'fecha', priority: 'prioridad' }[oldPreferences.defaultSort]),
      tema: oldPreferences.tema,
    },
  });
}

export function loadState() {
  const normalized = findVersionedState() || migratePreviousAppState();
  if (!normalized) return cloneInitial();
  safeWrite(ROOT_KEY, JSON.stringify(normalized));
  // Las claves anteriores se conservan como respaldo local de rollback.
  return normalized;
}
export function saveState(state) { safeWrite(ROOT_KEY, JSON.stringify(normalizeState(state))); }
export function clearState() { safeRemove(ROOT_KEY); LEGACY_KEYS.forEach(safeRemove); }
export function createEmptyState() { return cloneInitial(); }
export function exportState(state) {
  return JSON.stringify({ app: 'AulaPlan', schemaVersion: 6, exportedAt: new Date().toISOString(), data: normalizeState(state) }, null, 2);
}
export function parseImportedState(value) {
  const parsed = JSON.parse(value);
  if (parsed?.app !== 'AulaPlan' || !parsed?.data || typeof parsed.data !== 'object' || !Array.isArray(parsed.data.materias) || !Array.isArray(parsed.data.actividades)) {
    throw new Error('El archivo no parece ser un respaldo válido de AulaPlan.');
  }
  return normalizeState(parsed.data);
}
