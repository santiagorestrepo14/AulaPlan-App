import { confirmAction, toast } from './components/layout.js';
import { calculateGradeSummary } from './academic.js';
import { navigate } from './router.js';
import { escapeHtml, uid } from './utils.js';

function closeDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
}

function resultMessage(summary) {
  if (summary.estado === 'asegurada') {
    return '<strong>Materia asegurada</strong><span>Ya alcanzaste la nota mínima para aprobar.</span>';
  }
  if (summary.estado === 'imposible') {
    return `<strong>En riesgo</strong><span>Aun obteniendo 5.0 en el porcentaje restante, la nota máxima posible sería ${summary.mejorNotaFinal.toFixed(2)}.</span>`;
  }
  if (summary.estado === 'no-aprobada') {
    return '<strong>Materia no aprobada</strong><span>Ya se evaluó el 100% y no se alcanzó la nota mínima.</span>';
  }
  return `<strong>Necesitas ${summary.notaNecesaria?.toFixed(2) ?? summary.notaMinima.toFixed(2)}</strong><span>de promedio en el ${summary.porcentajeRestante.toFixed(0)}% restante para llegar a ${summary.notaMinima.toFixed(2)}.</span>`;
}

export function renderGrades(materia) {
  const grades = Array.isArray(materia.calificaciones) ? materia.calificaciones : [];
  const summary = calculateGradeSummary(materia);

  return `
    <section class="detail-section">
      <div class="section-title-row">
        <h2>Rendimiento</h2>
        <span class="grade-target">Meta: ${summary.notaMinima.toFixed(2)}</span>
      </div>

      <div class="performance-grid">
        <article class="performance-card">
          <span>PROMEDIO ACTUAL</span>
          <strong>${summary.promedioEvaluado === null ? '—' : summary.promedioEvaluado.toFixed(2)}</strong>
          <small>sobre lo evaluado</small>
        </article>
        <article class="performance-card">
          <span>EVALUADO</span>
          <strong>${summary.porcentajeEvaluado.toFixed(0)}%</strong>
          <small>resta ${summary.porcentajeRestante.toFixed(0)}%</small>
        </article>
      </div>

      <div class="grade-progress" aria-label="Porcentaje evaluado">
        <i style="--grade-progress:${Math.min(100, summary.porcentajeEvaluado)}%"></i>
      </div>

      <div class="grade-status grade-status--${escapeHtml(summary.estado)}">
        ${resultMessage(summary)}
      </div>

      <p class="grade-programmed">
        Acumulado en la nota final: <strong>${summary.acumulado.toFixed(2)}</strong> ·
        Porcentaje registrado: <strong>${summary.porcentajeProgramado.toFixed(0)}%</strong> de 100%.
      </p>
    </section>

    <section class="detail-section">
      <div class="section-title-row">
        <h2>Calificaciones</h2>
        <button class="text-action" type="button" data-action="new-grade">Nueva calificación</button>
      </div>

      <div class="grade-list stack stack--xs">
        ${grades.length ? grades.map(grade => `
          <button class="grade-row" type="button" data-grade-id="${escapeHtml(grade.id)}">
            <span class="grade-row__body">
              <strong>${escapeHtml(grade.nombre)}</strong>
              <small>${grade.calificacion === null || grade.calificacion === undefined ? 'Pendiente de calificar' : `Nota ${Number(grade.calificacion).toFixed(2)}`}</small>
            </span>
            <span class="grade-row__weight">${Number(grade.porcentaje).toFixed(0)}%</span>
          </button>`).join('') : '<p class="empty-copy">Aún no has registrado calificaciones para esta materia.</p>'}
      </div>
    </section>

    <dialog id="grade-dialog" class="settings-dialog grade-dialog" aria-labelledby="grade-dialog-title">
      <div class="settings-dialog__header">
        <h2 id="grade-dialog-title">Nueva calificación</h2>
        <button type="button" class="text-action" data-action="close-grade">Cerrar</button>
      </div>
      <form id="grade-form" class="settings-form">
        <input type="hidden" name="gradeId">

        <label class="settings-field">
          <span>Nombre</span>
          <input name="nombre" maxlength="60" required placeholder="Parcial 1">
        </label>

        <label class="settings-field">
          <span>Porcentaje</span>
          <input name="porcentaje" type="number" min="0.01" max="100" step="0.01" required placeholder="25">
        </label>

        <label class="settings-field">
          <span>Nota obtenida</span>
          <input name="calificacion" type="number" min="0" max="5" step="0.01" placeholder="Déjala vacía si aún no la tienes">
        </label>

        <button class="btn btn--primary btn--full" type="submit">Guardar calificación</button>
        <button class="danger-link" type="button" data-action="delete-grade" hidden>Eliminar calificación</button>
      </form>
    </dialog>
  `;
}

export function bindGrades(root, state, materiaId, persist) {
  const materia = state.materias.find(item => item.id === materiaId);
  if (!materia) return;
  if (!Array.isArray(materia.calificaciones)) materia.calificaciones = [];

  const dialog = root.querySelector('#grade-dialog');
  const form = root.querySelector('#grade-form');
  const title = root.querySelector('#grade-dialog-title');
  const deleteButton = root.querySelector('[data-action="delete-grade"]');

  const open = (grade = null) => {
    if (!form || !dialog || !title || !deleteButton) return;

    form.reset();
    form.elements.gradeId.value = grade?.id || '';
    form.elements.nombre.value = grade?.nombre || '';
    form.elements.porcentaje.value = grade?.porcentaje ?? '';
    form.elements.calificacion.value = grade?.calificacion ?? '';
    title.textContent = grade ? 'Editar calificación' : 'Nueva calificación';
    deleteButton.hidden = !grade;

    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };

  root.querySelector('[data-action="new-grade"]')?.addEventListener('click', () => open());
  root.querySelector('[data-action="close-grade"]')?.addEventListener('click', () => closeDialog(dialog));

  root.querySelectorAll('[data-grade-id]').forEach(button => {
    button.addEventListener('click', () => {
      const grade = materia.calificaciones.find(item => item.id === button.dataset.gradeId);
      if (grade) open(grade);
    });
  });

  form?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);

    const gradeId = String(data.get('gradeId') || '');
    const nombre = String(data.get('nombre') || '').trim();
    const porcentaje = Number(data.get('porcentaje'));
    const rawGrade = String(data.get('calificacion') ?? '').trim();
    const calificacion = rawGrade === '' ? null : Number(rawGrade);

    if (!nombre) {
      toast('Escribe el nombre de la evaluación.');
      return;
    }

    if (!Number.isFinite(porcentaje) || porcentaje <= 0 || porcentaje > 100) {
      toast('El porcentaje debe estar entre 0 y 100.');
      return;
    }

    if (calificacion !== null && (!Number.isFinite(calificacion) || calificacion < 0 || calificacion > 5)) {
      toast('La nota debe estar entre 0.0 y 5.0.');
      return;
    }

    const otherWeight = materia.calificaciones
      .filter(item => item.id !== gradeId)
      .reduce((sum, item) => sum + Number(item.porcentaje || 0), 0);

    if (otherWeight + porcentaje > 100.0001) {
      toast(`Los porcentajes superarían el 100%. Disponible: ${Math.max(0, 100 - otherWeight).toFixed(2)}%.`);
      return;
    }

    const old = materia.calificaciones.find(item => item.id === gradeId);
    const model = {
      id: gradeId || uid('grade'),
      nombre,
      porcentaje,
      calificacion,
      fechaCreacion: old?.fechaCreacion || new Date().toISOString(),
    };

    if (gradeId) {
      const index = materia.calificaciones.findIndex(item => item.id === gradeId);
      if (index < 0) {
        toast('La calificación ya no existe.');
        return;
      }
      materia.calificaciones[index] = model;
    } else {
      materia.calificaciones.push(model);
    }

    persist();
    closeDialog(dialog);
    toast(gradeId ? 'Calificación actualizada.' : 'Calificación creada.');
    navigate('materia-detalle', { id: materiaId });
  });

  deleteButton?.addEventListener('click', async () => {
    const gradeId = String(form?.elements.gradeId?.value || '');
    if (!gradeId) return;

    if (!await confirmAction(state, '¿Eliminar esta calificación?', 'Eliminar calificación')) return;

    materia.calificaciones = materia.calificaciones.filter(item => item.id !== gradeId);
    persist();
    closeDialog(dialog);
    toast('Calificación eliminada.');
    navigate('materia-detalle', { id: materiaId });
  });
}
