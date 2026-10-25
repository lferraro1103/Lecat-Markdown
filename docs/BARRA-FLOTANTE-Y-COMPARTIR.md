# Barra flotante y Compartir de Windows

Funciones de Lecat Markdown 3.5.0.

## Herramientas de formato

- Botón junto a la lupa para desplegar u ocultar los grupos de formato.
- Inicio plegado en perfiles que aún no tengan una preferencia guardada.
- Clic derecho en el botón o en la barra para elegir:
  - Horizontal: centro, izquierda o derecha.
  - Vertical: izquierda o derecha.
- Las posiciones verticales quedan ancladas **arriba**, a 12 px del borde
  superior del área del documento, según la corrección solicitada después
  de revisar la posición centrada anterior.
- Posición y visibilidad persistentes en `desktop.json`, independientes del
  idioma, canal de actualizaciones y documento activo.
- Seleccionar una posición despliega la barra. Escape la pliega cuando no
  hay un menú de formato abierto. Shift+F10 permite abrir el menú contextual
  desde el teclado.
- La barra puede desplegarse en Lectura; usar una herramienta cambia a Edición.
  Los menús mantienen su capa emergente y los límites de la ventana.

En Mac el botón queda junto al buscador superior; en Windows queda junto a la
lupa de los controles del documento.

## Compartir en Windows

Compartir abre el panel nativo de Windows, mediante
`IDataTransferManagerInterop` y un componente C++/WinRT incluido en el paquete.
Se entrega una copia `.md` del contenido actual, incluidos cambios sin guardar,
y el texto fuente para destinos compatibles. El documento original no se mueve
ni se sobrescribe.

Windows muestra las aplicaciones y destinos registrados para ese tipo de
contenido. No se fuerza una lista de ejecutables ni se inician envíos automáticos.
**Copiar Markdown** continúa como acción independiente en el menú Archivo.

La cancelación devuelve el control a Lecat y cierra el componente auxiliar;
las copias temporales se eliminan al terminar ese proceso. Si Windows no
dispone de Compartir en la sesión, se informa el error sin sustituirlo por
una copia silenciosa al portapapeles.

## Compilación

El paquete incluye `resources/native/LecatShare.exe`. Compilar desde fuentes en
Windows requiere las herramientas C++ de Visual Studio y el Windows SDK;
la aplicación instalada incluye el componente y no necesita esos compiladores.
La compilación Mac mantiene su implementación de Compartir existente.

Referencia oficial: [integración con Windows Share](https://learn.microsoft.com/en-us/windows/apps/develop/windows-integration/integrate-sharesheet-send).

