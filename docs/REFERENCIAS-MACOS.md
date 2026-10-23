# Referencia de navegación y diseño en macOS

Repositorio solicitado por el usuario:
[pluk-inc/markdown-preview](https://github.com/pluk-inc/markdown-preview).
Revisión consultada: `a54b4c171ed4ba9bfa4eae1283705b770049cf5f`.
Licencia del proyecto de referencia: [MIT](https://github.com/pluk-inc/markdown-preview/blob/a54b4c171ed4ba9bfa4eae1283705b770049cf5f/LICENSE).

## Patrones utilizados

- [ProjectNavigatorView.swift](https://github.com/pluk-inc/markdown-preview/blob/a54b4c171ed4ba9bfa4eae1283705b770049cf5f/md-preview/Features/Sidebar/ProjectNavigatorView.swift): navegación de carpetas y documentos con NSOutlineView, selección y conservación del contexto al filtrar.
- [ProjectNavigatorFilterBar.swift](https://github.com/pluk-inc/markdown-preview/blob/a54b4c171ed4ba9bfa4eae1283705b770049cf5f/md-preview/Features/Sidebar/ProjectNavigatorFilterBar.swift): búsqueda de nombres y controles agrupados junto al explorador.
- [SidebarViewController.swift](https://github.com/pluk-inc/markdown-preview/blob/a54b4c171ed4ba9bfa4eae1283705b770049cf5f/md-preview/Features/Sidebar/SidebarViewController.swift): barra lateral plegable y navegación orientada al documento.
- README del proyecto: preferencias de idioma, barra de edición agrupada, navegación de archivos y búsqueda de documentos.

## Adaptación en Lecat

Markdown Preview es una aplicación AppKit; su navegador es propio y no incrusta
una ventana de Finder. Lecat conserva Electron y usa el selector de archivos
nativo de macOS mediante `dialog.showOpenDialog` (NSOpenPanel), con selección
múltiple, búsqueda del sistema y carpeta inicial del documento. La acción
**Abrir en Finder** muestra esa carpeta en Finder.

En macOS se reemplaza el filtro web de archivos por esas acciones nativas.
Se conservan accesos rápidos y documentos en la barra lateral de Lecat.
En Windows se mantiene el filtro local y se agrega historial para volver atrás
sin confundirlo con subir a la carpeta padre.

Las pestañas se integran en la barra superior y los controles de edición se
agrupan en una barra flotante, siguiendo las capturas proporcionadas por el usuario.
No se copian el renderizador, las extensiones Quick Look ni la telemetría del
proyecto de referencia. Su requisito macOS 15 no reemplaza los canales de
compatibilidad de Lecat para macOS 12 y macOS 13 o posterior.

Esta adaptación aplica patrones de interacción con implementación propia;
no se incorporó código Swift del repositorio de referencia.
