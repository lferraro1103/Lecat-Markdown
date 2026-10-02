# Contrato UI · Claro MD 3

Estado: aprobado inline, 2026-10-02. Fuente: INVESTIGACION-ELECTRON.md y pedido explícito autónomo.

Entrega: Electron con Chromium incluido; edición Markdown transaccional, lectura renderizada y modo dividido. Mantener icono original, acceso rápido real y unidades separadas.

## Criterios de aceptación

1. Biblioteca visible al iniciar, shortcuts reales y línea antes de discos; ruta escrita permite navegar, filtro sólo afecta la lista.
2. Abrir/nuevo/pestañas conservan contenido e historial por documento. El indicador de modificación se actualiza al editar.
3. Ctrl+S guarda; Ctrl+Shift+S permite nueva ubicación; cerrar con cambios protege el documento mediante diálogo.
4. Toolbar de formato modifica la selección Markdown con transacciones deshacibles. Buscar/reemplazar pertenece al editor.
5. Lectura/Edición/Dividida tienen selección exclusiva. La vista previa se actualiza después de una pausa breve y no sustituye una versión más nueva por otra antigua.
6. Temas claro/oscuro completos, botones con labels/tooltips, controles focus-visible, índice navegable y separador con teclado.
7. Diagramas, matemáticas, imágenes locales y resaltado funcionan sin conexión; errores por bloque no bloquean el documento.
8. Node queda fuera del renderer; IPC sólo frame principal; Markdown sin HTML activo. Los archivos se escriben sólo si están abiertos o elegidos mediante diálogo de guardado.
9. Capturas a 1320×860 y 900×650; el shell no debe desbordar horizontalmente. Código/gráficos/tablas tienen overflow interno.
10. Verificar núcleo, auditoría Electron y portable empaquetado; actualizar README, build/CI y GitHub después de aprobar.

## Inventario de estados

Documento nuevo/vacío, existente/guardado, modificado, guardado cancelado, conflicto externo, error de permisos, borrador recuperado, carpeta vacía, filtro sin resultados, imagen ausente/remota, diagrama inválido, fórmula inválida, ventana compacta, tema oscuro, sólo lectura, sólo edición, vista dividida, índice y búsqueda abiertos.

## Revisión previa de diseño y plan

PASS: jerarquía, identidad propia, agrupación de comandos, feedback de guardado, acceso rápido/drive separator, manejo de errores, offline, idiomas y contraste de superficies.
FLAG: WYSIWYG de MarkText no se replica; se elige vista de Markdown más renderizado para conservar texto sin pérdidas. Documentado en investigación y README.
No bloqueos pendientes para implementar el alcance solicitado de editar y leer con Electron.
