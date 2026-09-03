import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { navigate, readRoute } from './router.js';

const parentRoutes = {
  'materia-form': 'materias',
  'materia-detalle': 'materias',
  'actividad-form': 'actividades',
  'actividad-detalle': 'actividades',
  materias: 'inicio',
  actividades: 'inicio',
  calendario: 'inicio',
  configuracion: 'inicio',
};

let registered = false;

export function registerNativeBackButton() {
  if (registered || Capacitor.getPlatform() !== 'android') return;

  registered = true;

  App.addListener('backButton', async () => {
    const openDialog = document.querySelector('dialog[open]');

    if (openDialog) {
      if (typeof openDialog.close === 'function') {
        openDialog.close();
      } else {
        openDialog.removeAttribute('open');
      }
      return;
    }

    const { route } = readRoute();

    if (route === 'inicio') {
      await App.minimizeApp();
      return;
    }

    const destination = parentRoutes[route] || 'inicio';
    navigate(destination);
  }).catch(error => {
    registered = false;
    console.error(
      'No fue posible registrar el boton Atrás de Android.',
      error,
    );
  });
}