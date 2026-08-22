<div align="center">

# AulaPlan — Rama `feature/sebastian`

### Persistencia · Actividades · Calendario · Offline · Capacitor · Android

![Commits](https://img.shields.io/badge/commits-15-blue?style=flat-square)
![Branch](https://img.shields.io/badge/branch-feature%2Fsebastian-orange?style=flat-square)
![Status](https://img.shields.io/badge/status-en%20progreso-yellow?style=flat-square)

</div>

---

## Responsable

**Sebastián** — integrante del equipo AulaPlan.

**Módulos a cargo:**
persistencia · lógica de datos · Actividades · Calendario · soporte offline · configuración de Capacitor · integración Android · pruebas lógicas.

---

## Plan de commits

<table>
<tr>
<th>#</th><th>Día</th><th>Tipo</th><th>Commit</th><th>Archivo(s)</th>
</tr>

<tr>
<td>1</td><td>19 ago</td><td>feat</td>
<td>integrar persistencia local de aulaplan</td>
<td><code>src/js/storage.js</code></td>
</tr>

<tr>
<td>2</td><td>19 ago</td><td>feat</td>
<td>integrar utilidades de fechas estados y prioridades</td>
<td><code>src/js/utils.js</code></td>
</tr>

<tr>
<td>3</td><td>20 ago</td><td>feat</td>
<td>integrar gestion completa de actividades</td>
<td><code>src/js/views/actividades.js</code></td>
</tr>

<tr>
<td>4</td><td>20 ago</td><td>feat</td>
<td>integrar calendario mensual y agenda</td>
<td><code>src/js/views/calendario.js</code></td>
</tr>

<tr>
<td>5</td><td>21 ago</td><td>feat</td>
<td>integrar registro de soporte offline</td>
<td><code>src/js/offline.js</code></td>
</tr>

<tr>
<td>6</td><td>21 ago</td><td>feat</td>
<td>integrar manifest local de la aplicacion</td>
<td><code>public/manifest.webmanifest</code></td>
</tr>

<tr>
<td>7</td><td>21 ago</td><td>feat</td>
<td>integrar service worker y cache local</td>
<td><code>public/sw.js</code></td>
</tr>

<tr>
<td>8</td><td>22 ago</td><td>chore</td>
<td>integrar configuracion de capacitor</td>
<td><code>capacitor.config.json</code></td>
</tr>

<tr>
<td>9</td><td>22 ago</td><td>chore</td>
<td>integrar estructura base del proyecto android</td>
<td>
<code>android/.gitignore</code><br>
<code>android/build.gradle</code><br>
<code>android/settings.gradle</code><br>
<code>android/variables.gradle</code><br>
<code>android/gradle.properties</code><br>
<code>android/gradlew</code><br>
<code>android/gradlew.bat</code><br>
<code>android/gradle/wrapper/</code><br>
<code>android/capacitor.settings.gradle</code>
</td>
</tr>

<tr>
<td>10</td><td>22 ago</td><td>chore</td>
<td>integrar configuracion de la aplicacion android</td>
<td>
<code>android/app/.gitignore</code><br>
<code>android/app/build.gradle</code><br>
<code>android/app/capacitor.build.gradle</code><br>
<code>android/app/proguard-rules.pro</code><br>
<code>android/app/lint.xml</code>
</td>
</tr>

<tr>
<td>11</td><td>23 ago</td><td>feat</td>
<td>integrar runtime nativo de aulaplan</td>
<td>
<code>MainActivity.java</code><br>
<code>AndroidManifest.xml</code><br>
<code>activity_main.xml</code><br>
<code>strings.xml</code><br>
<code>styles.xml</code>
</td>
</tr>

<tr>
<td>12</td><td>23 ago</td><td>chore</td>
<td>integrar reglas de datos y seguridad android</td>
<td>
<code>backup_rules.xml</code><br>
<code>data_extraction_rules.xml</code><br>
<code>file_paths.xml</code>
</td>
</tr>

<tr>
<td>13</td><td>23 ago</td><td>test</td>
<td>integrar pruebas nativas con appid de aulaplan</td>
<td>
<code>ExampleUnitTest.java</code><br>
<code>ExampleInstrumentedTest.java</code>
</td>
</tr>

<tr>
<td>14</td><td>24 ago</td><td>test</td>
<td>integrar pruebas de almacenamiento local</td>
<td><code>tests/storage.test.mjs</code></td>
</tr>

<tr>
<td>15</td><td>24 ago</td><td>test</td>
<td>integrar pruebas de utilidades y fechas</td>
<td><code>tests/utils.test.mjs</code></td>
</tr>

</table>

---

<div align="center">

**Leyenda:** `feat` nueva funcionalidad · `chore` configuración/estructura · `test` pruebas

</div>
