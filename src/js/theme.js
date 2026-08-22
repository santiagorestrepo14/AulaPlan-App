const MEDIA_QUERY = '(prefers-color-scheme: dark)';
let listenerBound = false;

export function normalizeThemePreference(value) {
  return ['system', 'light', 'dark'].includes(value) ? value : 'system';
}

export function resolveTheme(preference = 'system') {
  const normalized = normalizeThemePreference(preference);
  if (normalized !== 'system') return normalized;
  return window.matchMedia?.(MEDIA_QUERY).matches ? 'dark' : 'light';
}

export function applyTheme(preference = 'system') {
  const normalized = normalizeThemePreference(preference);
  const resolved = resolveTheme(normalized);
  document.documentElement.dataset.themePreference = normalized;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', resolved === 'dark' ? '#121212' : '#F7F7F5');
  return resolved;
}

export function bindSystemThemeListener(getPreference) {
  if (listenerBound || !window.matchMedia) return;
  const media = window.matchMedia(MEDIA_QUERY);
  media.addEventListener?.('change', () => {
    if (normalizeThemePreference(getPreference?.()) === 'system') applyTheme('system');
  });
  listenerBound = true;
}
