# Plan: edición sobre el documento visual

GSD quick --research --validate --auto, ejecución inline por restricción de spawn.

1. Investigar edición visual y serialización Markdown. Elegir ProseMirror/Tiptap para selección, listas, tablas, portapapeles y edición estructural real.
2. Edición por defecto sobre documento renderizado, código separado como opción. Preservar bloques originales no modificados y extensiones como Mermaid y matemáticas.
3. Mantener guardado, pestañas, recuperación, seguridad local y funcionamiento offline. Auditar interacciones visuales reales y regresiones anteriores.
4. Empaquetar, abrir versión corregida y subir actualización a GitHub.

Aceptación: teclear en un título renderizado modifica el MD guardado; negrita/listas/tablas visuales; deshacer y pestañas; gráfico y fórmula visibles en edición; ningún cambio al abrir o alternar modos; Markdown no editado conservado.
