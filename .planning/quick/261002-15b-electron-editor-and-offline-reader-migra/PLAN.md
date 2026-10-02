# GSD quick --research --validate --auto · Claro MD 3

Fecha: 2026-10-02. Ejecución inline conforme adaptador Codex, sin agentes ni preguntas por pedido autónomo del usuario.

## Decisiones y requisitos

Migrar a Electron y distribuir Chromium; añadir edición y lectura. Referencia MarkText con identidad propia. Mantener accesos rápidos Windows, discos, icono y renderizado offline. Actualizar GitHub al finalizar. Investigación en docs/INVESTIGACION-ELECTRON.md y contrato docs/UI-SPEC-ELECTRON.md.

## Tareas y dependencias

1. Investigar MarkText, Electron seguro, CodeMirror y bibliotecas de renderizado; revisar alcance y contrato visual.
2. Implementar proceso principal/preload, explorador Shell, manejo de documentos, guardado explícito con conflictos y borradores.
3. Implementar interfaz Electron, edición con formato/deshacer/búsqueda, pestañas, modos, temas y vista previa offline.
4. Verificar con pruebas de núcleo y auditoría Electron real, revisar capturas y corregir fallos; generar portable con icono y licencias.
5. Auditar portable real, documentar limitaciones, confirmar commit/push y abrir la entrega.

## Plan checker inline

PASS: requisitos cubiertos por criterios UI y pruebas: motor incluido, edición/lectura, guardar, conflictos, cierre, gráficos, acceso rápido y discos, offline, icono, portable y actualización GitHub.
Riesgos mitigados: pérdida de datos (hash, temporales, confirmación y borradores), IPC privilegiado (sandbox/aislamiento/validación), HTML (desactivado/saneado), carreras de render (generación), dependencias (lock y auditoría).
Alcance aclarado por criterio de implementación: edición Markdown con preview, no réplica de Muya/WYSIWYG de MarkText. No bloqueos de planificación pendientes.
