# Auditoría de lectura y gráficos — Claro MD 2
Prueba real en Windows con WinForms, WebView2 y recursos empaquetados. Resultado: 37 comprobaciones PASS, SUCCESS. Build Release: cero errores, cero advertencias.

## Cobertura verificada
- Árbol de carpetas diferido, filtro de archivos, estados sin coincidencias, lugares conocidos de Windows y unidades.
- Diez familias Mermaid: flujo, secuencia, clases, entidades, estados, sectores, Gantt, mapa mental, timeline y gráfico XY de barras/línea.
- SVG con viewBox no vacío y barras/título de XY presentes.
- Alternar código de diagrama y abrir vista ampliada.
- Un diagrama inválido falla de forma aislada y conserva el resto del documento.
- Fórmulas inline y bloque con KaTeX; código resaltado.
- SVG y PNG locales; nombres de archivo con espacios y acentos.
- Tablas desplazables sin provocar overflow de toda la lectura.
- HTML/script de Markdown escapado, scripts limitados al host de assets y configuración Mermaid insegura rechazada.
- Imágenes faltantes y remotas desactivadas muestran mensajes legibles.
- Índice de encabezados, búsqueda textual, modos, zoom, tema oscuro y ventana compacta.
- Enlace Markdown con espacios, recarga por cambios externos, historia, ruta inválida y extensión rechazada.
- Icono incrustado/ventana, nueve tamaños ICO y contraste de texto/enlaces claro y oscuro.

## Límites concretos
Mermaid, matemáticas, Markdown e imágenes se procesan localmente. Las remotas requieren activar Vista > Permitir imágenes remotas.
HTML crudo no se ejecuta. Configuración init/frontmatter de Mermaid se rechaza para preservar el contrato seguro.
No se incluyen intérpretes de PlantUML, Graphviz, notebooks ni scripts de gráficos arbitrarios: esos bloques conservan su código.
El auditor no comprobó una petición remota real con el modo habilitado, exportación mediante diálogo SaveFileDialog, Narrator ni monitores con DPI diferente. No hay afirmación de cobertura universal.

Reproducir: ejecutar scripts/audit.ps1 en el repositorio. La prueba cierra su ventana y emite audit-output/audit-results.txt.
Evidencia detallada: AUDIT-RESULTS.txt.
