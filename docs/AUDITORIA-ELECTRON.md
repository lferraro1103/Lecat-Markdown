# Auditoría · Claro MD 3

Fecha: 2026-10-02. Resultado: **PASS**. GSD quick --research --validate, revisión y verificación inline.

## Evidencia

5 pruebas de núcleo Node y **34 comprobaciones de integración** sobre Electron real: **39 verificaciones aprobadas**. La integración también se ejecutó contra `dist/win-unpacked/Claro MD.exe` con recursos dentro de `app.asar`, sin Node ni WebView2 externos. Durante la auditoría se bloquean HTTP y HTTPS en la sesión Electron; el renderizado continúa funcionando. `npm audit --audit-level=low`: cero vulnerabilidades reportadas en el lockfile de esta entrega.

El núcleo verifica UTF-8/BOM/UTF-16 LE/CRLF, rechazo de bytes inválidos, guardado mediante temporal/rename, limpieza de temporales, detección de cambios o borrado externo y filtrado Markdown del explorador.

La integración verifica sandbox/contextIsolation/nodeIntegration, ausencia de require/process en el renderer, carpetas/discos reales Windows, imagen empaquetada de bienvenida, 10 familias Mermaid (flowchart, XY, pie, sequence, class, ER, state, Gantt, mindmap y timeline), fallo aislado de gráfico inválido, matemáticas en línea/bloque y conservación del estilo de KaTeX, código resaltado, tablas, HTML hostil, imágenes locales Unicode, índice, edición real, guardado en disco, formato, búsqueda, temas, lectura/edición, CRLF al guardar, conflictos, borradores, cancelar cierre/Guardar como, guardar copia, descartar pestaña, deshacer/rehacer, historial entre pestañas/tema, PDF, tamaño compacto, ausencia de conexiones y varias pestañas.

Las respuestas de diálogos Guardar/Descartar/Cancelar y Guardar como se inyectan en la auditoría para verificar las ramas de protección de datos sin intervención humana. Los diálogos de uso normal son nativos Electron/Windows. La escritura, lectura, editor y generación PDF son reales.

## Revisión visual GSD de seis pilares

| Pilar | Resultado | Evidencia |
| --- | --- | --- |
| Jerarquía y layout | 4/4 | Biblioteca, pestañas, título, selector, formato, contenido y estado diferenciados |
| Tipografía | 4/4 | Segoe UI/Consolas, prosa legible, encabezados y metadatos sobrios |
| Color y contraste | 3/4 | Temas completos y estados distinguibles; high contrast físico pendiente |
| Iconos e identidad | 4/4 | Marca original, icono executable/ventana y símbolos Lucide coherentes |
| Interacción y estados | 4/4 | Cambios, errores, vacíos, búsquedas, selección de modo, recuperación y conflictos |
| Adaptación/accesibilidad | 3/4 | 1320 y 900 px, teclado/focus, labels; Narrator y DPI físicos pendientes |

Total: **22/24**, sin bloqueos para el alcance. Se revisaron capturas de lectura clara, edición dividida oscura, compacto y fórmulas/imágenes. Se corrigieron dos problemas encontrados al inspeccionarlas: las fórmulas conservan los estilos de posición generados por KaTeX, y el índice/las anclas desplazan sólo el panel de lectura para mantener visibles las barras.

## Límites honestos

- Edición Markdown con previsualización, no réplica WYSIWYG de Muya/MarkText.
- No se certifica todo tipo de diagrama Mermaid ni documentos arbitrarios ilimitados: se prueban diez familias y fallbacks.
- No se ejecutan PlantUML, DOT, JavaScript del documento ni HTML activo.
- Imágenes remotas desactivadas por diseño; los enlaces web dependen del navegador/conexión al hacer clic.
- Narrator, impresión física, monitores con escalado/DPI diferentes y configuraciones de alto contraste requieren sesión manual adicional.
- La recuperación se verifica mediante persistencia de borradores y su formato; no se corta la energía física del equipo durante las pruebas.
- El portable conserva toda la carpeta Electron; el exe aislado no basta.

Resultados reproducibles con `npm test` y `npm run audit`. Las capturas generadas no se suben al repositorio por las rutas personales visibles. La implementación WinForms anterior queda conservada como historia, con Electron como producto y CI actuales.
