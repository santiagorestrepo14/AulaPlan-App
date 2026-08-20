# AulaPlan — Entrega 2

AulaPlan es una aplicación móvil híbrida para organizar materias, clases y actividades académicas. Es una SPA local: no requiere cuenta, servidor, API ni conexión a Internet para sus funciones esenciales.

## Equipo

- Santiago Restrepo Salazar
- Josué Pino Pino
- Sebastián Cruz

## Prototipo de referencia

[Figma de AulaPlan](https://www.figma.com/design/e9clnOMGSovONxaqaLJ0GX)


## Tecnologías y restricciones

- HTML5, SASS por parciales y Vanilla JavaScript.
- Vite 8 para desarrollo y bundle.
- `localStorage` para persistencia.
- Capacitor 8.4.2 para Android.
- Sin jQuery, React, Vue, Angular, Bootstrap, CDN, fuentes remotas ni APIs de funcionamiento.

## Funcionalidad

- CRUD de materias con profesor, días, horario, aula, color y notas.
- CRUD de actividades con materia, tipo, fecha/hora, prioridad, descripción y estado.
- Completar y reabrir actividades.
- Tipos: tarea, entrega, proyecto, examen/evaluación, exposición y otra.
- Filtros por estado, materia, prioridad y tipo; orden persistente por fecha, prioridad o materia.
- Inicio calculado desde los datos guardados: pendientes, clases del día, materias, próximas y vencidas.
- Calendario mensual navegable, selección de fecha, clases recurrentes e indicadores por prioridad.
- Tema Sistema, Claro u Oscuro, aplicado mediante tokens y persistido localmente.
- Nombre opcional para el saludo, vista inicial y confirmaciones configurables.
- Exportación, importación validada y borrado de datos locales.
- El recordatorio es una preferencia almacenada en la actividad; esta versión no programa notificaciones del sistema operativo.

## Requisitos

- Node.js 22 o superior (`.nvmrc` fija la línea 22).
- Para Android: Android Studio y Android SDK 36 instalados.
