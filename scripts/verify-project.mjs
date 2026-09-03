import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const required = [
  'index.html', 'package.json', 'vite.config.js', 'capacitor.config.json', '.gitignore', '.nvmrc', 'README.md',
  'src/main.js', 'src/js/app.js', 'src/js/router.js', 'src/js/storage.js', 'src/js/theme.js', 'src/js/offline.js',
  'src/js/views/inicio.js', 'src/js/views/materias.js', 'src/js/views/actividades.js',
  'src/js/views/calendario.js', 'src/js/views/configuracion.js',
  'src/scss/main.scss', 'src/scss/abstracts/_variables.scss', 'src/scss/base/_theme.scss',
  'src/scss/components/_forms.scss', 'src/scss/components/_navigation.scss', 'src/scss/pages/_app.scss',
  'public/aulaplan-icon.svg', 'public/sw.js', 'public/manifest.webmanifest',
  'docs/PRUEBAS_FUNCIONALES.md', 'docs/PRUEBA_ANCHO_VIEWPORT.md', 'docs/MATRIZ_RUBRICA.md',
];
let errors = 0;

function fail(message) { console.error(message); errors += 1; }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

for (const rel of required) if (!fs.existsSync(path.join(root, rel))) fail(`FALTA: ${rel}`);
if (errors) {
  console.error('\nNo se pueden ejecutar las demás comprobaciones hasta recuperar la estructura requerida.');
  process.exit(1);
}

const sourceFiles = walk(path.join(root, 'src'));
const runtimeFiles = [
  path.join(root, 'index.html'),
  path.join(root, 'package.json'),
  path.join(root, 'vite.config.js'),
  ...sourceFiles,
  ...walk(path.join(root, 'public')).filter(file => !file.endsWith('.svg')),
];
for (const file of runtimeFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (/https?:\/\//i.test(content)) fail(`RECURSO REMOTO DETECTADO: ${path.relative(root, file)}`);
  if (/\bjquery\b|jquery\.min/i.test(content)) fail(`JQUERY PROHIBIDO: referencia en ${path.relative(root, file)}`);
}

const indexHtml = read('index.html');
if (!/<meta\s+name=["']viewport["'][^>]*width=device-width[^>]*initial-scale=1(?:\.0)?/i.test(indexHtml)) {
  fail('VIEWPORT: falta width=device-width e initial-scale=1.');
}
if (!/<html\s+lang=["']es["']/i.test(indexHtml)) fail('ACCESIBILIDAD: index.html debe declarar lang="es".');
if (!/<meta\s+name=["']description["']/i.test(indexHtml)) fail('SEO/PWA: falta meta description.');


const materiasView = read('src/js/views/materias.js');
const actividadesView = read('src/js/views/actividades.js');
const layoutJs = read('src/js/components/layout.js');
const navigationScss = read('src/scss/components/_navigation.scss');
if (/icon-btn--create|icon\(['"]plus['"]\)/.test(`${materiasView}
${actividadesView}
${layoutJs}`)) {
  fail('UX: no deben existir botones de creación con símbolo + en Materias o Actividades.');
}
if (!/Nueva materia/.test(materiasView) || !/Nueva actividad/.test(actividadesView)) {
  fail('UX: faltan acciones textuales claras para crear materias o actividades.');
}
if (!/aulaplan-icon\.svg/.test(layoutJs) || !/bottom-nav__brand/.test(navigationScss)) {
  fail('IDENTIDAD: la navegación principal debe mostrar el icono local de AulaPlan.');
}

const sassFiles = sourceFiles.filter(file => file.endsWith('.scss'));
const sassPartials = sassFiles.filter(file => path.basename(file).startsWith('_'));
if (sassPartials.length < 7) fail('SASS: se esperaban al menos 7 parciales organizados.');
const mainScss = read('src/scss/main.scss');
for (const group of ['abstracts/', 'base/', 'components/', 'pages/']) {
  if (!mainScss.includes(group)) fail(`SASS: main.scss no integra el grupo ${group}`);
}
const varsScss = read('src/scss/abstracts/_variables.scss');
if (!/\$app-width\s*:\s*390px\s*;/i.test(varsScss)) fail('ANCHO: falta la referencia $app-width: 390px.');
const appScss = read('src/scss/pages/_app.scss');
if (!/width\s*:\s*min\(100%\s*,\s*v\.\$app-width\)/i.test(appScss)) fail('ANCHO: .app-shell debe usar width: min(100%, $app-width).');
if (!/overflow-x\s*:\s*(?:hidden|clip)/i.test(`${read('src/scss/base/_reset.scss')}\n${appScss}`)) fail('ANCHO: falta una protección explícita contra overflow horizontal.');

const themeScss = read('src/scss/base/_theme.scss');
if (!/:root\[data-theme=['"]dark['"]\]/i.test(themeScss)) fail('TEMA: falta el modo oscuro en _theme.scss.');
for (const color of ['#F7F7F5', '#171717', '#C2413B', '#D97706', '#2563EB', '#121212', '#F87171', '#FBBF24', '#60A5FA']) {
  if (!themeScss.toUpperCase().includes(color)) fail(`PALETA: falta el token requerido ${color}.`);
}

const jsFiles = [
  ...sourceFiles.filter(file => file.endsWith('.js')),
  path.join(root, 'vite.config.js'),
  path.join(root, 'public/sw.js'),
];
for (const file of jsFiles) {
  try { execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }); }
  catch (error) {
    fail(`ERROR DE SINTAXIS: ${path.relative(root, file)}`);
    console.error(error.stderr?.toString() || error.message);
  }
}

const pkg = JSON.parse(read('package.json'));
const allDependencies = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
for (const forbidden of ['jquery', 'react', 'react-dom', 'vue', 'angular', 'bootstrap']) {
  if (Object.keys(allDependencies).some(name => name.toLowerCase() === forbidden)) fail(`DEPENDENCIA PROHIBIDA: ${forbidden}.`);
}
for (const requiredDependency of ['vite', 'sass', '@capacitor/core', '@capacitor/android', '@capacitor/cli']) {
  if (!allDependencies[requiredDependency]) fail(`DEPENDENCIA: falta ${requiredDependency}.`);
}
if (pkg.engines?.node !== '>=22') fail('CONFIGURACIÓN: package.json debe declarar Node >=22.');
if (pkg.scripts?.['cap:sync'] !== 'npm run build && npx cap sync android') fail('CAPACITOR: cap:sync debe compilar y sincronizar Android explícitamente.');
for (const dep of ['@capacitor/core', '@capacitor/android', '@capacitor/cli']) {
  if (allDependencies[dep] !== '8.4.2') fail(`CONFIGURACIÓN: ${dep} debe quedar fijado en 8.4.2.`);
}

const capacitor = JSON.parse(read('capacitor.config.json'));
if (capacitor.appId !== 'com.aulaplan.app') fail('CAPACITOR: appId cambió respecto al identificador existente.');
if (capacitor.appName !== 'AulaPlan') fail('CAPACITOR: appName debe ser AulaPlan.');
if (capacitor.webDir !== 'dist') fail('CAPACITOR: webDir debe ser dist.');
const viteConfig = read('vite.config.js');
if (!/base\s*:\s*['"]\.\/['"]/i.test(viteConfig)) fail('VITE: base debe ser ./ para funcionar en WebView.');

const manifest = JSON.parse(read('public/manifest.webmanifest'));
if (!String(manifest.start_url || '').startsWith('./')) fail('PWA: manifest.start_url debe ser relativo.');
if (!Array.isArray(manifest.icons) || !manifest.icons.length || manifest.icons.some(icon => /^(?:https?:)?\/\//i.test(icon.src))) fail('PWA: el manifest debe declarar iconos locales.');
const worker = read('public/sw.js');
if (!worker.includes('__AULAPLAN_PRECACHE__')) fail('OFFLINE: el service worker debe recibir el precache del build.');
if (!/url\.origin\s*!==\s*self\.location\.origin/.test(worker)) fail('OFFLINE: el service worker debe limitar el caché al mismo origen.');

const gitignore = read('.gitignore');
for (const entry of ['node_modules/', 'dist/', 'android/.gradle/', 'android/local.properties']) {
  if (!gitignore.includes(entry)) fail(`GITIGNORE: falta ${entry}`);
}
const readme = read('README.md');
if (!/figma\.com\/design\//i.test(readme)) fail('README: falta el enlace de Figma.');
const offlineMention = /(?:offline|sin conexión)/i.test(readme);
const pendingPhysicalTest = /prueba\s+física[\s\S]{0,100}pendiente|pendiente[\s\S]{0,100}prueba\s+física/i.test(readme);
if (!offlineMention || !pendingPhysicalTest) fail('README: debe indicar honestamente que la prueba offline física está pendiente.');

const androidVars = path.join(root, 'android', 'variables.gradle');
if (fs.existsSync(androidVars)) {
  const text = fs.readFileSync(androidVars, 'utf8');
  for (const [key, value] of [['minSdkVersion', '24'], ['compileSdkVersion', '36'], ['targetSdkVersion', '36']]) {
    if (!(new RegExp(`${key}\\s*=\\s*${value}\\b`)).test(text)) fail(`ANDROID: se esperaba ${key} = ${value}.`);
  }
  const androidBuild = read('android/app/build.gradle');
  if (!/applicationId\s+["']com\.aulaplan\.app["']/.test(androidBuild)) fail('ANDROID: applicationId no coincide con Capacitor.');
  if (!/versionCode\s+4\b/.test(androidBuild) || !/versionName\s+["']1\.0\.0["']/.test(androidBuild)) fail('ANDROID: versionCode/versionName deben corresponder a AulaPlan 1.0.0.');
  const androidManifest = read('android/app/src/main/AndroidManifest.xml');
  if (!/android:allowBackup=["']false["']/.test(androidManifest)) fail('ANDROID: las copias automáticas deben quedar desactivadas para datos académicos locales.');
  if (!/android:dataExtractionRules=["']@xml\/data_extraction_rules["']/.test(androidManifest)) fail('ANDROID: falta la política moderna que excluye datos académicos de respaldos del sistema.');
  if (!/android:usesCleartextTraffic=["']false["']/.test(androidManifest)) fail('ANDROID: el tráfico HTTP sin cifrar debe quedar desactivado.');
  const mainActivity = read('android/app/src/main/java/com/aulaplan/app/MainActivity.java');
  if (!/package\s+com\.aulaplan\.app\s*;/.test(mainActivity)) fail('ANDROID: MainActivity no coincide con el appId.');
  const instrumentedTestPath = 'android/app/src/androidTest/java/com/aulaplan/app/ExampleInstrumentedTest.java';
  if (!fs.existsSync(path.join(root, instrumentedTestPath))) fail('ANDROID: la prueba instrumentada debe usar el paquete real com.aulaplan.app.');
  else {
    const instrumentedTest = read(instrumentedTestPath);
    if (!/package\s+com\.aulaplan\.app\s*;/.test(instrumentedTest) || !/assertEquals\(["']com\.aulaplan\.app["']/.test(instrumentedTest)) {
      fail('ANDROID: ExampleInstrumentedTest no está alineado con com.aulaplan.app.');
    }
  }
} else {
  fail('ANDROID: falta la plataforma existente; no debe recrearse ni omitirse en esta entrega.');
}

if (errors) {
  console.error(`\nVerificación terminada con ${errors} problema(s).`);
  process.exit(1);
}
console.log('OK: estructura, SASS, paleta, viewport y documentación base validados.');
console.log('OK: no se detectaron recursos remotos, frameworks prohibidos ni jQuery en runtime.');
console.log(`OK: ${jsFiles.length} archivos JavaScript pasaron node --check.`);
console.log('OK: Vite, Capacitor, PWA y almacenamiento local tienen la configuración requerida.');
console.log('OK: Android conserva appId y está configurado para minSdk 24 / compileSdk 36 / targetSdk 36.');
console.log('PENDIENTE MANUAL: pruebas físicas de Android, offline, viewport y comparación visual exacta con Figma.');
