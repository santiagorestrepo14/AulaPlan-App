# Plan de pruebas funcionales y offline

Registrar para cada prueba: fecha, integrante, dispositivo/navegador, resultado y evidencia si aplica.

| ID | Prueba | Resultado esperado |
|---|---|---|
| P01 | Abrir la app por primera vez | Entra directamente a Inicio; no solicita registro ni login |
| P02 | Crear materia | Guarda nombre, profesor, días, horario, aula, color y notas |
| P03 | Editar materia | Los cambios persisten |
| P04 | Eliminar materia | Solicita confirmación y elimina sus actividades asociadas |
| P05 | Crear actividad | Guarda título, materia, tipo, fecha/hora, prioridad y descripción |
| P06 | Editar actividad | Los cambios persisten |
| P07 | Consultar actividad | Aparece en Actividades, Detalle de materia y Calendario |
| P08 | Actividad vencida | Se identifica sin depender únicamente del color |
| P09 | Completar actividad | Cambia a completada y desaparece de pendientes |
| P10 | Reabrir actividad | Regresa a pendiente |
| P11 | Filtros | Estado, materia, prioridad y tipo cambian los resultados |
| P12 | Calendario mensual | La actividad aparece en su fecha mediante punto de prioridad |
| P13 | Varias prioridades el mismo día | Se muestran varios puntos de color en la fecha |
| P14 | Agenda del calendario | Muestra actividades y clases de la fecha seleccionada |
| P15 | Clase recurrente | Aparece en la agenda de los días marcados en la materia |
| P16 | Modo oscuro | Cambia todas las vistas y conserva contraste legible |
| P17 | Persistencia del tema | Cerrar y abrir mantiene claro/oscuro seleccionado |
| P18 | Cerrar y volver a abrir | Materias y actividades siguen disponibles |
| P19 | Exportar respaldo | Descarga JSON válido sin datos de cuenta/contraseña |
| P20 | Importar respaldo | Recupera materias, actividades y preferencias |
| P21 | Borrar todos los datos | Solicita confirmación y limpia el almacenamiento |
| P22 | Wi‑Fi y datos apagados | Todas las funciones esenciales siguen funcionando |
| P23 | `npm run verify` | Termina en OK |
| P24 | `npm run build` | Genera `dist/` sin errores |
| P25 | Capacitor Android | `npm run cap:sync` copia el bundle sin errores |
| P26 | APK/emulador sin Internet | App abre, navega, crea y conserva datos |
| P27 | Comparación con Figma | Las 9 vistas, paleta y jerarquía principal corresponden al prototipo actualizado |

## Regresión visual Figma v0.3

- [ ] Barra inferior conserva el orden: Inicio, Materias, Actividades, Calendario, Config.
- [ ] No aparecen los botones flotantes/de cabecera con símbolo `+` de las referencias de Figma.
- [ ] Inicio muestra dos métricas principales, tres métricas de resumen y próximos eventos.
- [ ] Materias usa tarjetas con franja de color, profesor, horario y aula.
- [ ] Formulario de materia permite color identificador y notas.
- [ ] Actividades usa chips Todas/Pendientes/Completadas/Vencidas.
- [ ] Crear actividad usa chips de tipo y prioridad, además de fecha/hora y recordatorio.
- [ ] Detalle de actividad muestra materia, tipo, fecha/hora, prioridad y estado.
- [ ] Calendario es mensual y utiliza rojo/ámbar/azul para alta/media/baja.
- [ ] Configuración incluye modo oscuro y gestión de respaldo local.
- [ ] No aparece scroll horizontal a 390 px.

## Prueba de ancho / viewport

- [ ] Ejecutar el CodePen oficial del profesor en el Android seleccionado.
- [ ] Registrar el ancho real del viewport.
- [ ] Verificar AulaPlan en ese mismo ancho.
- [ ] Confirmar ausencia de scroll horizontal.
- [ ] Guardar capturas como evidencia.

## Restricción de JavaScript

- [ ] Confirmar que no existe jQuery ni como dependencia ni como script.
- [ ] Ejecutar `npm run verify` y comprobar el mensaje `OK: no se detectó jQuery`.

### Estado actual

- Revisión web del 18 de agosto: `npm run verify` y `npm test` aprobados (12/12). El nuevo `npm run build` y `npm run cap:sync` deben reejecutarse en el computador de integración antes de cerrar la entrega.
- QA local a referencia móvil: navegación, crear/editar materia, crear/editar/completar/reabrir actividad, filtros combinados, orden persistente, Inicio calculado, calendario mensual, tema y preferencias comprobados.
- SDK Android local instalado y verificado; `lintDebug`, `testDebugUnitTest` y `assembleDebug` aprobados. El APK 0.3.0 conserva `com.aulaplan.app`, minSdk 24 y targetSdk 36.
- Regresión automática: 12/12 pruebas aprobadas el 18 de agosto. La prueba de escape ya no depende de una fecha fija que pueda quedar vencida.
- Revisión de alta fidelidad: las nueve vistas se compararon a 390 × 844 px con las capturas entregadas y se corrigieron composición, jerarquía, espaciado y controles. La validación final de escala y áreas seguras permanece pendiente en Android físico.
- Prueba offline: **pendiente**.
- Prueba física de ancho/viewport: **pendiente**.
