# Auditoría visual — Claro MD 2
Fecha: 2026-10-02. Método: contrato GSD UI-SPEC, inspección de código, revisión de capturas generadas por la aplicación y prueba real WinForms/WebView2.
Resultado: sin bloqueos de entrega. 21/24 puntos; las observaciones siguientes distinguen lo comprobado de lo pendiente.

| Pilar | Puntos | Evidencia y observación |
|---|---|---|
| Copywriting | 4/4 | Abrir Markdown, modos claros, vacío sin documentos y filtro sin coincidencias; errores recuperables. INFO: copy conforme al contrato. |
| Visuales | 4/4 | Familia original de iconos, ICO de nueve resoluciones en ejecutable y ventana; lectura jerárquica y accesos separados. INFO: no se usan símbolos de texto como iconos principales. |
| Color | 3/4 | Contraste medido >=4.5:1 en texto/enlaces claro y oscuro; selección reconocible. WARNING: el marco no cliente sigue dependiendo del tema/compositor de Windows; en el entorno de auditoría conserva un título claro. |
| Tipografía | 3/4 | Segoe UI y Consolas, jerarquía visible, rutas abreviadas. WARNING: la medida de 76ch favorece documentos técnicos; para lectura literaria extensa puede preferirse una columna más estrecha. |
| Espaciado | 4/4 | Escala coherente, botones de 36x40 px en 96 DPI, filas de 48 px; ruta flexible y barra de lectura completa en 900 px. INFO: separadores de 1 px son excepción óptica documentada. |
| Experiencia | 3/4 | Menús, atajos, índice, zoom, búsqueda, carga diferida y fallbacks verificados. WARNING: Narrator, alto contraste del sistema y cambio real de monitor a 150/200% DPI necesitan comprobación manual; no se presentan como certificados. |

## Hallazgos corregidos durante la auditoría
- La expansión inicial del árbol desplazaba el acceso rápido fuera de la vista. Ahora se vuelve al primer grupo.
- Los accesos adicionales de Windows se agrupan en “Más accesos de Windows”, manteniendo visibles las carpetas comunes y la línea de unidades.
- Se impide que la ruta vaya al desbordamiento de la barra.
- Se regeneran los iconos y alturas de filas al cambiar DPI.
- El bootstrap acepta delimitadores de matemáticas inline y bloque.
- La captura de evidencia respeta el marco no cliente, evitando superponer la preview sobre la barra del documento.
- Se evita procesar dos veces un bloque Mermaid que ya recibe clase de diagramas.

## Evidencia
Capturas locales (no se suben al repositorio porque pueden contener nombres de accesos personales):
- previews/light.png — biblioteca, navegación, modos y diagrama.
- previews/dark.png — colores y gráficos en tema oscuro.
- previews/compact.png — ventana de 900x650.
- previews/math-images.png — fórmulas, código y SVG.

UI-STATE-COVERAGE.json: probe de GSD ejecutado con elementos declarados explícitamente. Resoluciones concretas para vacío, carga, error, normal, parcial, overflow y textos extensos.

La puntuación es evaluación interna de este diseño, no certificación de accesibilidad ni revisión independiente.
