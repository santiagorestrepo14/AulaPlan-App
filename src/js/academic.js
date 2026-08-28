function cleanName(value = '') {
  return String(value).trim().replace(/\s+/g, ' ').slice(0, 40);
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getActiveSemester(state) {
  const semesters = Array.isArray(state?.semestres) ? state.semestres : [];
  if (!semesters.length) return null;
  const activeId = state?.preferencias?.semestreActivoId;
  return semesters.find(semester => semester.id === activeId) || semesters[0];
}

export function semesterSubjects(state) {
  const semester = getActiveSemester(state);
  const subjects = Array.isArray(state?.materias) ? state.materias : [];
  if (!semester) return subjects;
  return subjects.filter(subject => subject.semestreId === semester.id);
}

export function semesterActivities(state) {
  const subjectIds = new Set(semesterSubjects(state).map(subject => subject.id));
  return (Array.isArray(state?.actividades) ? state.actividades : [])
    .filter(activity => subjectIds.has(activity.materiaId));
}

export function activeSemesterState(state) {
  return {
    ...state,
    semestres: Array.isArray(state?.semestres) ? state.semestres : [],
    materias: semesterSubjects(state),
    actividades: semesterActivities(state),
    preferencias: state?.preferencias || {},
  };
}

export function createSemester(state, rawName) {
  const nombre = cleanName(rawName);
  if (!nombre) return { semester: null, created: false };

  if (!Array.isArray(state.semestres)) state.semestres = [];
  if (!state.preferencias || typeof state.preferencias !== 'object') state.preferencias = {};

  const existing = state.semestres.find(
    semester => cleanName(semester.nombre).toLocaleLowerCase('es') === nombre.toLocaleLowerCase('es'),
  );

  if (existing) {
    state.preferencias.semestreActivoId = existing.id;
    return { semester: existing, created: false };
  }

  const semester = {
    id: `sem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    nombre,
    fechaCreacion: new Date().toISOString(),
  };

  state.semestres.push(semester);
  state.preferencias.semestreActivoId = semester.id;
  return { semester, created: true };
}

export function calculateGradeSummary(materia = {}) {
  const grades = Array.isArray(materia.calificaciones) ? materia.calificaciones : [];
  const rawMinimum = numberOrNull(materia.notaMinima);
  const notaMinima = Math.min(5, Math.max(0, rawMinimum ?? 3));

  const validWeight = grade => {
    const weight = numberOrNull(grade?.porcentaje);
    return weight !== null && weight > 0 ? weight : 0;
  };

  const porcentajeProgramado = round2(
    grades.reduce((sum, grade) => sum + validWeight(grade), 0),
  );

  const evaluated = grades.filter(grade => numberOrNull(grade?.calificacion) !== null);
  const porcentajeEvaluado = round2(
    evaluated.reduce((sum, grade) => sum + validWeight(grade), 0),
  );

  const acumulado = round2(
    evaluated.reduce((sum, grade) => {
      const weight = validWeight(grade);
      const rawGrade = numberOrNull(grade?.calificacion);
      const gradeValue = Math.min(5, Math.max(0, rawGrade ?? 0));
      return sum + gradeValue * (weight / 100);
    }, 0),
  );

  const promedioEvaluado = porcentajeEvaluado > 0
    ? round2(acumulado / (porcentajeEvaluado / 100))
    : null;

  const porcentajeRestante = round2(Math.max(0, 100 - porcentajeEvaluado));
  const mejorNotaFinal = round2(acumulado + 5 * (porcentajeRestante / 100));

  let notaNecesaria = null;
  let estado = 'en-curso';

  if (acumulado >= notaMinima) {
    estado = 'asegurada';
    notaNecesaria = 0;
  } else if (porcentajeRestante <= 0) {
    estado = 'no-aprobada';
  } else {
    notaNecesaria = round2((notaMinima - acumulado) / (porcentajeRestante / 100));
    if (notaNecesaria > 5) estado = 'imposible';
  }

  return {
    notaMinima,
    porcentajeProgramado,
    porcentajeEvaluado,
    porcentajeRestante,
    acumulado,
    promedioEvaluado,
    notaNecesaria,
    mejorNotaFinal,
    estado,
  };
}
