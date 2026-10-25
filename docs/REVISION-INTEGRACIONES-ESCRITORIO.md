# Revisión de integraciones de escritorio

Fecha: 23 de octubre de 2026. Base publicada: 3.3.0.
Implementación posterior de la lista: [Integraciones de escritorio 3.4](INTEGRACIONES-3.4.md).
Revisión del código de Lecat, no una lista de funciones ya implementadas.
La corrección de herramientas de formato está en la rama
`codex/reading-toolbar-review`; las funciones pendientes de esta tabla no se
agregaron durante esta revisión.

## Lectura y herramientas de formato

La barra estaba posicionada de forma absoluta dentro de los paneles. El espacio
extra al principio del documento no impedía que tapara texto al desplazarse.
Ahora los grupos tienen una fila propia encima de los paneles, cuya altura
se adapta cuando los botones pasan a otra línea. El texto se desplaza debajo
de esa fila, sin quedar cubierto por la barra. En Lectura se oculta toda la fila.
Se retiraron los márgenes artificiales de compensación de la versión anterior.

También se corrige el inicio: se guardaba el modo de vista, pero se ignoraba
al abrir la aplicación y se forzaba Edición. Ahora se restaura Lectura,
Edición o Código y vista previa según la preferencia guardada. Al cambiar
de modo se cierran los menús de formato abiertos.

## Estado y alcance

| Función solicitada | Estado en Lecat 3.3.0 | Trabajo necesario |
| --- | --- | --- |
| Quick Look en Finder, Spotlight y Mail | Ausente. Asociar `.md` a la app no instala una extensión Quick Look. | Extensión nativa `.appex` de previsualización, UTI Markdown, renderizado sin conexión, empaquetado y validación de registro del sistema. Comprobar Finder y archivos adjuntos por separado; no prometer indexación Spotlight por añadir la vista previa. |
| CLI y URL scheme | Parcial: el ejecutable admite un archivo Markdown con ruta absoluta y la apertura desde Finder/Explorer. No existe comando `mdp` ni manejador público de URL. | Lanzador con rutas relativas/espacios y varios archivos, registro del protocolo, apertura en instancia existente y con app cerrada. Usar nombre propio (`lecat` y `lecat://file/…`) para no apropiarse de `mdp` o `md-preview`, que pertenecen a la referencia. |
| EPUB y PNG, además de PDF y HTML | PDF disponible. SVG disponible para diagramas. EPUB, PNG de documento y exportación HTML no implementados. | HTML autónomo con estilos/recursos; EPUB con estructura y recursos válidos; PNG con límites de tamaño y documentos largos. Reutilizar el renderizado de fórmulas/diagramas y esperar su finalización antes de exportar. |
| Impresión nativa con fuente y escala | Ausente. Exportar PDF no abre un diálogo de impresión. | Acción Imprimir, preparación del documento y `webContents.print` con diálogo nativo. Configuración de tamaño de texto y escala propia si el diálogo del sistema no ofrece esos campos. Mantener independientes el zoom de lectura y los ajustes de impresión. |
| Homebrew cask | Ausente en el repositorio de Lecat; no hay cask o tap mantenido aquí. No se verificó el catálogo completo de terceros. | Cask de Lecat con arquitectura, versión, SHA256 y URL inmutables, instalación de `.app` y actualización con cada release. Puede distribuirse en tap propio; la incorporación al repositorio oficial depende de su revisión y política de admisión. No usar el cask `markdown-preview`, que instala otra aplicación. |
| Compartir nativo de macOS / copiar Markdown fuente | Ausente. El menú Copiar actual opera sobre la selección del editor; no hay botón Compartir. | `ShareMenu` con `texts: [markdownActual]`, más acción explícita Copiar Markdown. Sincronizar primero cambios sin guardar. Para AirDrop como archivo, compartir una copia `.md` del contenido actual mediante `filePaths`; los servicios ofrecidos los decide macOS. |
| Crear archivos/carpetas desde sidebar y portapapeles | Parcial: Nuevo crea un documento sin ubicación y Guardar como permite guardarlo. No hay creación contextual de carpeta ni archivo desde portapapeles. | Acciones en carpeta seleccionada, nombre válido, creación exclusiva sin sobrescritura y refresco. Crear desde texto del portapapeles como acción explícita; tratar por separado texto y archivos copiados. |
| Filtro de archivos y vista Recientes | Parcial: Windows filtra nombres de archivos/carpetas de la carpeta actual; no es una búsqueda recursiva. Mac usa selector nativo y Abrir en Finder, con el filtro web oculto. No existe vista propia de recientes. | Historial persistente y acotado de documentos, quitar entradas inexistentes/limpiar historial; decidir si Mac también ofrece filtro local además de Finder. Las pestañas restauradas no sustituyen a Recientes. |
| Inspector con metadata | Parcial: barra inferior con palabras, caracteres, codificación y EOL. No hay panel inspector ni fechas/tamaño de archivo. | Panel con ruta, bytes, creación/modificación y formato; distinguir tamaño guardado de contenido pendiente y documentos sin guardar. No mostrar un `stat` obsoleto después de guardar o cambiar de pestaña. |
| Zoom con pellizco | Parcial: zoom del documento de 80–150 % mediante botones y atajos. No hay integración explícita de pellizco. | Conectar gesto al mismo zoom del documento, sin agrandar la interfaz ni activar dos mecanismos a la vez. Comprobar trackpad real en Mac y Windows Precision Touchpad. |
| Ventana siempre encima | Ausente. Pantalla completa y estado maximizado son funciones distintas. | Opción Vista/Configuración con `setAlwaysOnTop`, estado visible y persistencia. Comprobar su relación con pantalla completa y escritorios de macOS. |
| Enlaces personalizados con Cancelar / Permitir / Siempre | Ausente. El manejador principal abre HTTP(S) y enlaces locales Markdown; rechaza otros esquemas. `mailto:` se admite en el filtro visual, pero no en el manejador principal. | Política central de protocolos, consultar aplicación registrada, diálogo con Cancelar por defecto, permiso de una vez o persistente por esquema y opción para revocarlo. Alinear sanitizador, editor y vista previa. Mantener bloqueados esquemas ejecutables y de contenido (`javascript:`, `data:`, etc.) y no confundir esta autorización con registrar el protocolo propio de Lecat. |

## Orden propuesto para implementación

1. Herramientas sin superposición y restauración del modo de lectura (corregido en esta rama).
2. Compartir/copiar Markdown, creación contextual, Recientes, inspector y siempre encima.
3. Impresión, HTML/PNG/EPUB y zoom por gesto.
4. CLI y protocolo propio junto con permisos para enlaces de aplicaciones externas.
5. Quick Look y distribución Homebrew, con empaquetado y comprobación nativa de Mac.

Cada bloque necesita controles en las plataformas correspondientes. Esta revisión
no demuestra que las funciones nativas pendientes estén operativas.

## Evidencia en Lecat

- `electron/main.cjs`: menús, argumentos de apertura, IPC de creación de documento,
  enlaces, selector de archivos, Finder, exportación SVG y PDF.
- `electron/renderer.js`: Nuevo, filtro local, zoom, estadísticas, modo inicial y comandos.
- `electron/visual.js`: pegado de texto enriquecido y política de enlaces del editor.
- `electron/session.cjs`: persistencia de pestañas abiertas; no historial de recientes.
- `electron/preload.cjs`: API expuesta; sin compartir, inspector o impresión.
- `package.json`: asociaciones de archivos y empaquetado; sin extensión Quick Look,
  protocolo público o lanzador CLI.
- `electron/index.html` y `electron/preferences.css`: barra de herramientas fuera
  del área desplazable después de esta corrección.

## Referencias consultadas

- [Proyecto de referencia Markdown Preview](https://github.com/pluk-inc/markdown-preview).
  Sus funciones no se incorporan a Lecat al tomarlo como referencia visual.
- [Apple Quick Look](https://developer.apple.com/documentation/quicklook).
- [Electron ShareMenu](https://www.electronjs.org/docs/latest/api/share-menu) y
  [SharingItem](https://www.electronjs.org/docs/latest/api/structures/sharing-item):
  datos de texto y archivos para servicios nativos.
- [Electron webContents](https://www.electronjs.org/docs/latest/api/web-contents):
  impresión con diálogo y escala; diferenciar zoom del documento e interfaz.
- [Electron BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window):
  ventana siempre encima.
- [Electron Deep Links](https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app):
  registro de protocolos y tratamiento de instancias abiertas/cerradas.
- [Homebrew: Adding Software](https://docs.brew.sh/Adding-Software-to-Homebrew):
  distribución con cask y política de admisión.
