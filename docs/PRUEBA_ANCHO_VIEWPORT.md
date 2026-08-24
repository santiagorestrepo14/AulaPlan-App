# Prueba de ancho / viewport — requisito del curso

## Regla del profesor
La interfaz debe verse y funcionar bien **en un solo dispositivo seleccionado**. Para esta primera versión no se exige que funcione perfectamente en todos los celulares.

La medida prioritaria es el **ancho disponible de la aplicación dentro de la pantalla (viewport)**, no el ancho físico total de la pantalla. El alto es secundario porque el desplazamiento vertical (scroll) es normal en una app móvil.

## Herramienta indicada por el curso
Abrir en el celular seleccionado:

https://codepen.io/xaca/pen/yLNyNyy

En esa prueba se modifica el ancho del bloque hasta que ocupe correctamente el ancho disponible de la aplicación. El resultado se usa como referencia para el diseño.

## Meta viewport obligatoria
El HTML de AulaPlan debe conservar:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

Esto evita que el navegador represente la página a una escala distinta de la esperada.

## Estado actual de AulaPlan
- El Figma usa frames de **390 px de ancho**.
- SASS usa `390px` como ancho máximo de referencia.
- La aplicación usa `width: min(100%, 390px)`, por lo que no genera desbordamiento si el viewport real resulta menor.
- **390 px es la referencia de diseño, no se considerará la prueba física aprobada hasta ejecutarla en el dispositivo Android elegido.**

## Evidencia que debemos guardar
Cuando el equipo seleccione el Android de prueba:

1. Abrir el CodePen indicado por el profesor.
2. Encontrar el ancho que llena correctamente el viewport.
3. Anotar:
   - Marca y modelo del celular.
   - Ancho de viewport obtenido.
   - Alto de viewport observado (solo como referencia).
   - Orientación utilizada: vertical.
4. Tomar una captura del CodePen funcionando.
5. Abrir AulaPlan en el mismo dispositivo.
6. Comprobar que:
   - no exista scroll horizontal;
   - no se corten botones o textos;
   - barra inferior y formularios entren completos;
   - tarjetas ocupen correctamente el ancho;
   - el scroll sea únicamente vertical cuando sea necesario.
7. Guardar captura de Inicio, Materias, Actividades y Calendario.

## Registro de prueba
- Dispositivo: PENDIENTE
- Viewport medido: PENDIENTE
- Fecha: PENDIENTE
- Resultado: PENDIENTE

> No marcar este punto como completado hasta probarlo en el dispositivo físico seleccionado.
