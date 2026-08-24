export function registerOfflineSupport() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations?.().then(registrations => registrations.forEach(registration => registration.unregister()));
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .catch(() => {
        // La app sigue funcionando offline en Capacitor/dist aunque el service worker no se registre.
      });
  });
}
