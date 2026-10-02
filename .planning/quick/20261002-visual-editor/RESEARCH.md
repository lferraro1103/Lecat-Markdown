# Investigación

- Tiptap/ProseMirror ofrece un documento editable estructurado y operaciones de selección, tablas, listas, historial y portapapeles. Markdown bidireccional: https://tiptap.dev/docs/editor/markdown/getting-started/basic-usage
- Extensiones de importación y serialización: https://tiptap.dev/docs/editor/markdown/guides/integrate-markdown-in-your-extension
- Matemáticas como nodos renderizados y edición al hacer clic: https://tiptap.dev/docs/editor/extensions/nodes/mathematics
- Se descarta un contenteditable artesanal completo: selección entre bloques e historial requieren un modelo estructurado. execCommand está obsoleto: https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand

Decisión: Tiptap como editor visual; CodeMirror conserva código e historial unificado. Guardar el Markdown original de bloques intactos evita reescribir diagramas, estilos de listas y referencias durante cambios de otros bloques. Los nodos opacos conservan sintaxis no representable y se editan mediante un diálogo específico. Dependencias incluidas, sin servicios remotos.
