---
status: passed
phase: 01-lecat-audit
source: GSD audit-fix --severity all --max 10, inline Codex adapter
---
# Lecat · auditoría de regresiones y conservación de datos

## Hallazgos clasificados

| ID | Severidad | Hallazgo | Archivo | Clasificación |
| --- | --- | --- | --- | --- |
| F-01 | alta | Guardar y cambiar de pestaña puede escribir otra pestaña y reemplazar su identidad con la respuesta | electron/renderer.js:run | auto-fixable; reproducido en Electron real antes de corregir |
| F-02 | alta | Guardar durante cierre puede descartar cambios hechos mientras la escritura está pendiente; guardados paralelos sin serializar | electron/main.cjs:saveDoc,confirmClose | auto-fixable |
| F-03 | alta | UTF-16 truncado se acepta; tamaño se valida como UTF-8 y puede guardar más de 20 MB; falta revalidación de conflicto antes del rename | electron/core.cjs | auto-fixable |
| F-04 | media | PDF puede usar preview anterior cuando un render está pendiente; promesa no espera la última generación | electron/renderer.js:render,run | auto-fixable |
| F-05 | media | Cada render crea nuevas capacidades de imagen, nunca reutilizadas ni liberadas al cerrar | electron/main.cjs:media,protocol | auto-fixable |
| F-06 | media | Respuestas tardías del explorador revierten la navegación; handler final de anclas no usa el panel acotado | electron/renderer.js:loadFolder,preview.onclick | auto-fixable |
| F-07 | alta | Fallo al persistir borradores después de borrar docs deja pestañas sin documento principal; archivo de recuperación corrupto se omite silenciosamente | electron/main.cjs:saveDrafts,confirmClose,bootstrap | auto-fixable |
| F-08 | media | Errores de archivo inicial se silencian; escrituras de preferencias concurrentes no son atómicas | electron/main.cjs:bootstrap,settings | auto-fixable |

## Alcance

Se mantienen formatos de archivos, identidad Lecat, carpetas Windows, lectura/edición, diálogos y funciones existentes. No se reestructura el producto ni se cambia de framework. Pruebas de regresión con archivos temporales aislados, nunca documentos del usuario. Se conserva el portable previo como recuperación.

## Gates

Pruebas de núcleo tras cambios de escritura/codificación. Auditoría Electron tras cada grupo con su ID. Portable final auditado, capturas revisadas, npm audit y commits atómicos. No se certifican Narrator, monitores físicos ni corte eléctrico: siguen siendo verificaciones manuales, no defectos demostrados.

## Resultado final

Los ocho hallazgos F-01 a F-08 están corregidos y cubiertos por regresiones. 55 comprobaciones de integración aprobadas en código fuente y en el portable 3.1.1; 12 pruebas unitarias aprobadas. npm audit: 0 vulnerabilidades.
