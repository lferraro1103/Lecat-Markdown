# Auditoría GSD de Lecat - Markdown 3.1.1

Fecha: 2026-10-02. Flujo: gsd-audit-fix autónomo, revisión, reproducción, corrección y regresiones; ejecución inline conforme al adaptador de Codex.

Se corrigieron ocho hallazgos:

| ID | Corrección | Evidencia |
| --- | --- | --- |
| F-01 | Guardar conserva la identidad de la pestaña original aunque cambie la pestaña activa | Reproducción negativa antes del arreglo y dos regresiones Electron |
| F-02 | Guardados serializados y cierre cancelado cuando aparecen cambios posteriores | Tres regresiones con escrituras retenidas |
| F-03 | Validación UTF-16, tamaño real codificado y conflicto revalidado antes de reemplazar | Tres pruebas unitarias adicionales |
| F-04 | PDF espera la última vista previa, fuentes e imágenes | Dos regresiones y PDF real |
| F-05 | Capacidades de imágenes reutilizadas, acotadas al archivo y revocadas al cerrar | Cuatro comprobaciones del protocolo |
| F-06 | Navegación ignora respuestas antiguas; enlaces conservan anclas dentro del panel | Tres regresiones Electron |
| F-07 | Fallos de persistencia no eliminan documentos; cierre comprueba cambios; recuperación dañada se conserva | Cuatro regresiones Electron y cuatro pruebas unitarias |
| F-08 | Preferencias atómicas y serializadas; errores al abrir archivos iniciales visibles | Tres regresiones Electron |

Validación final: **67 comprobaciones aprobadas** (55 integración en Electron y 12 unitarias). La auditoría completa también pasó en el ejecutable empaquetado. 
Gráficos: diez familias Mermaid, error aislado de diagramas, fórmulas inline y de bloque, resaltado de código, tablas desplazables e imágenes locales con rutas Unicode. Lectura, edición, historial de deshacer, pestañas, guardado, UTF-8/UTF-16, CRLF, PDF y accesos Windows cubiertos. El renderer no hizo conexiones HTTP/HTTPS durante la auditoría.

Capturas claras, oscuras, matemáticas y ventana de 900 px revisadas visualmente. npm audit: **0 vulnerabilidades**. El portable anterior permanece disponible como recuperación.

Límites: no se certifican Narrator ni distintos monitores físicos. Las pruebas de fallos de escritura son simuladas; no sustituyen un ensayo de corte eléctrico. La comprobación de conflictos antes del reemplazo reduce carreras, pero no constituye una transacción coordinada con editores externos.

Evidencia reproducible: npm test, npm run audit y el ejecutable con --audit. Detalle interno en .planning/phases/01-lecat-audit/01-UAT.md.
