# Lecat 3.2.0 · edición visual

Estado: completado. GSD quick --research --validate --auto, ejecutado inline conforme al adaptador Codex.

La corrección responde al comportamiento pedido: Edición es un documento visual editable con Tiptap/ProseMirror, con selección y operaciones estructurales. Código queda separado y opcional. Se corrigió la implementación anterior que ofrecía código con vista previa como editor principal.

Títulos, párrafos, negrita/cursiva, listas, tareas y celdas se editan sobre su apariencia. Tablas admiten agregar y eliminar filas/columnas. Buscar/reemplazar actúa sobre el texto visible. Mermaid y fórmulas se muestran renderizados; sus expresiones se editan en diálogos específicos.

Bloques Markdown sin cambios conservados literalmente. Cambios visuales sincronizados al estado de documento, guardado, borradores y deshacer/rehacer existente. El modo visual no requiere Internet. Portapapeles enriquecido sanitizado; imágenes locales usan el protocolo de capacidades existente.

Validación: 80 comprobaciones de integración en el portable Windows final y 12 pruebas unitarias (92 total), todas aprobadas. Incluye escritura real mediante Chromium en títulos y tablas; formato sobre selección, tareas, guardar y CRLF, undo/redo, pestañas, fórmulas, diagramas, tablas, pegado seguro y regresiones de la auditoría anterior. npm audit: 0 vulnerabilidades. Capturas visuales claras y oscuras revisadas.

Límites: al modificar un bloque su sintaxis Markdown puede normalizarse; los bloques intactos mantienen su fuente. Bloques especiales que no se pueden representar estructuralmente permanecen conservados con edición específica. No se certifican Narrator ni monitores físicos. ProseMirror/Tiptap sustituye la interacción de edición; no se reutiliza el motor Muya de MarkText.
