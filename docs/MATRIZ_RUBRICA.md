# Matriz de verificación de la rúbrica

Actualizada el 18 de agosto de 2026. Los estados distinguen comprobación automatizada/local de evidencia física.

| Requisito | Estado | Evidencia disponible | Pendiente real |
|---|---|---|---|
| HTML + Vanilla JavaScript | CUMPLE | `index.html`, módulos en `src/js/`; verificador sin frameworks prohibidos | — |
| SASS y parciales | CUMPLE | `src/scss/` dividido en abstracts, base, components y pages; build compila SASS | — |
| Vite / bundle | PARCIAL | Configuración Vite correcta; `npm run verify` y tests pasan tras las correcciones | Reejecutar `npm run build` y conservar evidencia del bundle corregido |
| Git / historial | PENDIENTE | El historial real fue conservado y no se generaron commits artificiales | El equipo confirmará 40+ commits y 10+ por integrante en el repositorio final |
| README / `.gitignore` | CUMPLE | Ejecución, Android, Figma y QA documentados; dependencias, builds, APK y configuración local ignorados | — |
| Bundle sin Internet | CUMPLE | Sin CDN/API/recursos remotos; precache del bundle, rutas relativas y `cap:sync` exitoso | — |
| Offline en dispositivo | PENDIENTE FÍSICO | APK contiene íntegramente el bundle local | Probar con Wi‑Fi y datos apagados en el Android escogido |
| Nueve vistas y navegación | CUMPLE | Las nueve rutas se renderizan y tienen barra inferior; regresión automatizada en `tests/views.test.mjs` | — |
| Comparación con alta fidelidad | PARCIAL | Las nueve vistas se compararon en navegador a 390 × 844 px contra las capturas suministradas; se ajustaron composición, jerarquía, espaciado y controles | Confirmar escala y áreas seguras en el Android físico; el acceso remoto al archivo Figma sigue limitado por la cuenta Starter |
| CRUD y persistencia | CUMPLE | Crear/editar/eliminar, completar/reabrir, migración y respaldo validados en navegador y pruebas | — |
| Filtros y orden | CUMPLE | Estado, materia, prioridad, tipo y orden implementados; filtro combinado validado | — |
| Calendario | CUMPLE | Mes navegable, 42 celdas, fecha seleccionable, prioridades, agenda y clases recurrentes; prueba automatizada | — |
| Configuración y respaldo | CUMPLE | Tema, preferencias, exportación/importación, validación de JSON y borrado local implementados y probados | — |
| Dark mode | CUMPLE | Sistema/Claro/Oscuro con tokens, contraste semántico y persistencia; tema cambiado en QA de navegador | — |
| Viewport / ancho en código | CUMPLE | Meta viewport, shell de 390 px máximo y protección contra overflow verificadas automáticamente y en navegador | — |
| Medición de viewport del profesor | PENDIENTE FÍSICO | Guion y criterios documentados | Medir en el dispositivo Android seleccionado y guardar captura |
| Capacitor / APK Android | PARCIAL | Capacitor 8.4.2, SDK 24/36/36 y `appId` correctos; las pruebas nativas fueron alineadas con `com.aulaplan.app` | Reejecutar `cap:sync`, pruebas Gradle y regenerar APK tras las correcciones |
| Ejecución Android | PENDIENTE FÍSICO | APK debug firmado e inspeccionado | Instalar, cerrar/reabrir y repetir CRUD/offline en el dispositivo seleccionado |
| Accesibilidad básica | CUMPLE | Labels, botones reales, foco visible, targets táctiles y prioridad/estado textual | Revisión con lector de pantalla no exigida |

## Evidencia final que debe capturar el equipo

- Historial de GitHub con el conteo real por integrante.
- Terminal con `npm run check`, `npm run cap:sync` y las tareas Gradle.
- Aplicación instalada y reabierta en Android.
- CRUD y respaldo con Wi‑Fi/datos apagados.
- Medición física de viewport y ausencia de scroll horizontal.
- Las nueve vistas junto al Figma vigente en claro y oscuro.
