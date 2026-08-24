# AulaPlan — Entrega 2

AulaPlan es una aplicación móvil híbrida para organizar materias, clases y actividades académicas. Es una SPA local: no requiere cuenta, servidor, API ni conexión a Internet para sus funciones esenciales.

## Equipo

- Santiago Restrepo Salazar
- Josué Pino Pino
- Sebastián Cruz

## Prototipo de referencia

[Figma de AulaPlan](https://www.figma.com/design/e9clnOMGSovONxaqaLJ0GX)

El prototipo vigente contiene nueve vistas principales, con referencia clara y oscura a 390 × 844 px. La implementación conserva esa jerarquía y la navegación inferior Inicio, Materias, Actividades, Calendario y Config. Los botones grandes con símbolo `+` de algunas referencias no se implementaron; las acciones se presentan como “Nueva materia” y “Nueva actividad”.

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

## Instalación y desarrollo

```bash
npm install
npm run dev
```

En Windows con una política de PowerShell restrictiva se puede usar `npm.cmd` en lugar de `npm`.

## Verificación y pruebas automáticas

```bash
npm run verify
npm test
npm run build
```

También se puede ejecutar toda la comprobación web con:

```bash
npm run check
```

`verify` revisa estructura, sintaxis JavaScript, SASS, paleta, viewport, dependencias prohibidas, recursos remotos, PWA, Capacitor, documentación base y configuración Android. `npm test` cubre fechas, horas, estados, normalización, respaldo y migración de datos.

## Bundle y funcionamiento offline

```bash
npm run build
```

Vite genera `dist/` con rutas relativas. Durante el build se inyecta en `sw.js` la lista de archivos locales versionados para evitar que un recurso esencial dependa de la red. En Capacitor, el contenido se empaqueta desde `dist/`.

El código está **preparado para funcionamiento offline**, pero la prueba física continúa **pendiente**: debe instalarse en el Android elegido, apagar Wi‑Fi y datos, abrir la app, ejecutar CRUD, cerrarla y volverla a abrir. No se considera aprobada solo por el build.

## Persistencia y compatibilidad de datos

El estado actual se guarda en `aulaplan_v5` y contiene materias, actividades y preferencias. Al cargar se normalizan IDs, fechas, horas, valores permitidos y relaciones. Se migran `aulaplan_v1` a `aulaplan_v4` y, cuando existen, los datos de la versión React anterior asociados a la sesión local activa. Las claves antiguas de esa versión se conservan como respaldo; no se migran contraseñas, correos ni sesiones.

La importación acepta únicamente respaldos JSON identificados como AulaPlan, limita el archivo a 2 MB, normaliza los datos y pide confirmación antes de reemplazar el estado actual.

## Android / Capacitor

La carpeta `android/` ya existe. **No ejecutar `npx cap add android`.** Después de cambiar el frontend:

```bash
npm run cap:sync
```

Este comando vuelve a compilar y ejecuta `npx cap sync android`. La configuración conserva:

- `appId`: `com.aulaplan.app`
- `webDir`: `dist`
- `minSdkVersion`: 24
- `compileSdkVersion`: 36
- `targetSdkVersion`: 36
- `versionCode`: 3
- `versionName`: 0.3.0

Para abrir el proyecto nativo, solo cuando se vaya a probar manualmente:

```bash
npm run cap:open:android
```

Ver [docs/GUIA_ANDROID.md](docs/GUIA_ANDROID.md).

El APK debug validado se genera en `android/app/build/outputs/apk/debug/app-debug.apk`. Para esta revisión también se dejó una copia entregable en `outputs/AulaPlan-v0.3.0-debug.apk` (carpeta ignorada por Git para no versionar binarios). Su resultado técnico y huella SHA-256 están en [docs/RESULTADO_QA_0.3.0.md](docs/RESULTADO_QA_0.3.0.md).

## Estructura

```text
├── android/                 plataforma nativa existente
├── docs/                    rúbrica, pruebas y guías de entrega
├── public/                  manifest, icono y service worker
├── scripts/verify-project.mjs
├── src/
│   ├── js/
│   │   ├── components/
│   │   ├── views/
│   │   ├── app.js
│   │   ├── router.js
│   │   └── storage.js
│   ├── scss/
│   │   ├── abstracts/
│   │   ├── base/
│   │   ├── components/
│   │   └── pages/
│   └── main.js
├── tests/
├── index.html
├── package.json
└── vite.config.js
```

## Pruebas y entrega

- [Plan de pruebas funcionales](docs/PRUEBAS_FUNCIONALES.md)
- [Prueba física de viewport](docs/PRUEBA_ANCHO_VIEWPORT.md)
- [Matriz de rúbrica](docs/MATRIZ_RUBRICA.md)
- [Resultado técnico de QA 0.3.0](docs/RESULTADO_QA_0.3.0.md)
- [Guía Android](docs/GUIA_ANDROID.md)
- [Flujo de sustentación](docs/FLUJO_SUSTENTACION.md)

Las pruebas automatizadas no sustituyen las evidencias manuales de Android físico, funcionamiento offline, viewport ni comparación visual exacta con Figma. Tampoco se inventan commits, autores o resultados de pruebas no ejecutadas.
