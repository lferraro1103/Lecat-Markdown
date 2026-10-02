# Investigación de apariencia visual y diseño gráfico — Claro MD 2
Fecha: 2026-10-02. Flujo GSD: investigación → contrato UI → plan → implementación → auditoría.
Investigación y ejecución inline: la adaptación de GSD para Codex restringe el uso automático de subagentes. El usuario autorizó resolver el diseño sin preguntas.

## Objetivo y diagnóstico
La primera versión funciona pero la barra mezcla rutas, navegación, lectura y apariencia sin jerarquía. Usa símbolos de texto como iconos, tiene una ruta de ancho fijo y no muestra lugares frecuentes. Los archivos carecen de estado vacío, metadatos e identidad gráfica. La vista previa no interpreta Mermaid ni fórmulas. La mejora debe hacer más fácil ubicar un documento y leer sus gráficos, manteniendo una aplicación nativa, portable y de solo lectura.

La evaluación se divide en arquitectura de información, barras y menús, identidad, iconografía, tipografía, color, espaciado, estados, accesibilidad, densidad y renderizado. Las dimensiones concretas son decisiones de este proyecto; las fuentes describen principios y controles, no garantizan que WinForms implemente automáticamente WinUI.

## 1. Referentes y criterios
| Referente primario | Hallazgo | Decisión propia |
|---|---|---|
| [Navegación de Windows](https://learn.microsoft.com/en-us/windows/apps/design/basics/navigation-basics) | Consistencia, simplicidad y claridad organizan la orientación | Lugares conocidos arriba, unidades abajo, ruta editable siempre visible |
| [Command bar](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/command-bar) | Comandos frecuentes visibles; secundarios en menús y desbordamiento | Barra de navegación independiente de la barra del documento |
| [Menús de Windows](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/menus) | Menús agrupan órdenes relacionadas y acciones contextuales | Archivo, Navegación, Vista y Ayuda; menú contextual de archivo |
| [Markdown en VS Code](https://code.visualstudio.com/docs/languages/markdown) | Preview, esquema de encabezados y navegación ayudan con documentos largos | Lectura/código explícitos y panel opcional de índice |
| [Sintaxis avanzada de Obsidian](https://obsidian.md/help/advanced-syntax) | Diagramas y matemáticas son contenido habitual en notas Markdown | Mermaid y KaTeX locales, sin depender de una CDN |

No se intenta replicar visualmente un editor de código ni convertir el lector en editor. El producto prioriza la lectura y exploración del disco. Se conserva la estructura familiar del Explorador de Windows, pero el lienzo de lectura recibe más espacio.

## 2. Arquitectura y navegación
Jerarquía de arriba hacia abajo: menú global, barra de navegación, área de trabajo, estado. El área de trabajo contiene una biblioteca lateral y el documento. La biblioteca distingue “Acceso rápido”, una línea divisoria y “Este equipo”. Se incluyen Escritorio, Descargas, Documentos, Imágenes, Música y Vídeos usando las ubicaciones reales de Windows, incluso si están redirigidas a OneDrive o a otra unidad. Se intenta incorporar las carpetas expuestas por Acceso rápido de Shell; esto es una integración oportunista, pues no se promete una API pública estable para los elementos fijados.

El árbol usa carga diferida y conserva el padre al entrar en una carpeta. El listado inferior muestra únicamente Markdown y puede filtrarse sin cambiar la carpeta. Atrás, adelante, subir y actualizar usan orden e iconos convencionales; los botones se deshabilitan cuando no tienen destino. Un cambio de carpeta no borra el documento ya abierto.

Base técnica: [Known folders](https://learn.microsoft.com/en-us/windows/win32/shell/knownfolderid). Decisión: SHGetKnownFolderPath evita asumir que Descargas equivale a una ruta concatenada al perfil. Los directorios sin permisos producen una explicación y permiten seguir navegando.

## 3. Barras, menús y orden de las acciones
La barra principal muestra atrás, adelante, subir, ruta flexible, actualizar y Abrir. “Carpeta” queda disponible y todas las operaciones tienen equivalentes en el menú. La ruta crece con la ventana y puede seleccionarse con Ctrl+L. La barra del documento muestra icono de Markdown, título y ruta abreviada; debajo, Lectura y Código se comportan como modos exclusivos. Índice, búsqueda, zoom y tema pertenecen al documento y se agrupan a la derecha.

Archivo: abrir documento, abrir carpeta, copiar ruta, mostrar en Explorador y salir. Navegación: atrás, adelante, subir, actualizar y enfocar ruta. Vista: lectura, código, índice, ocultar biblioteca, tamaño de lectura, tema e imágenes remotas. Ayuda: atajos y acerca de. Acciones que necesitan un documento quedan deshabilitadas sin él. No hay comandos destructivos.

Base: [Command bar](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/command-bar), [Menús](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/menus). Decisión: icono y etiqueta en las acciones menos evidentes, tooltips con atajos en las compactas; desbordamiento de ToolStrip cuando se reduce el ancho.

## 4. Identidad gráfica y logotipo
Concepto propio: un documento claro sobre una base azul, con una marca Markdown simplificada. Una sola silueta reconocible sirve para ejecutable, título y taskbar. La versión vectorial es la fuente de verdad; el ICO contiene 16, 20, 24, 32, 40, 48, 64, 128 y 256 px, generado con transparencia. El PNG de 256 px permite reutilización; no es una captura de otro logo.

Base: [Iconos de aplicación](https://learn.microsoft.com/en-us/windows/apps/design/iconography/app-icons), [Diseño](https://learn.microsoft.com/en-us/windows/apps/design/iconography/app-icon-design), [Construcción](https://learn.microsoft.com/en-us/windows/apps/design/iconography/app-icon-construction). Decisión: composición simple y reconocible al reducirse, margen transparente, sin texto del nombre dentro del icono. El ICO queda vinculado a ApplicationIcon y al Form.Icon para evitar que solo cambie la imagen dentro de la interfaz.

## 5. Iconografía funcional
Familia propia de trazos vectoriales: grosor coherente, esquinas redondeadas, área de 24 unidades y dibujos a tamaño de destino. Flechas, carpeta, unidad, documento, descarga, escritorio, imagen, música, vídeo, búsqueda, lista, código, tema, zoom, copia e información. Los iconos se recolorean por tema y se regeneran a la densidad de pantalla; no se depende de glifos que pueden faltar en el equipo. La carpeta mantiene una señal cálida discreta; el documento y la selección emplean azul. Se conserva texto en menús y nombre accesible en cada control.

Base: [Iconografía Windows](https://learn.microsoft.com/en-us/windows/apps/design/iconography/app-icons). El sistema concreto de trazos es una decisión original de Claro MD.

## 6. Tipografía y densidad
Interfaz Segoe UI a 10.5 pt; encabezados de sección semibold; texto auxiliar 9–9.5 pt; título de documento 16 pt. Contenido HTML usa Segoe UI Variable cuando está instalada, con Segoe UI como respaldo. Lectura predeterminada 17 px y altura 1.75. Código Consolas. Se limita la anchura textual a aproximadamente 76ch y se permite más ancho para tablas y diagramas.

Base: [Tipografía Windows](https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography). Decisión: usar una escala pequeña y diferenciación por peso, evitar mayúsculas en títulos visibles, abreviar rutas sin perder el tooltip completo. Los títulos extensos no desplazan los controles.

## 7. Paleta y contraste
| Uso | Claro | Oscuro |
|---|---|---|
| Fondo del marco | #F5F7FA | #161B22 |
| Superficie lateral | #F8FAFC | #1C232D |
| Lienzo | #FFFFFF | #11161D |
| Texto | #243044 | #E4EBF5 |
| Texto secundario | #586579 | #A8B6C8 |
| Acento/enlaces | #2563EB | #8BB5FF |
| Selección | #E8F0FF | #293D5C |

El acento se reserva a selección, icono de marca, enlaces y controles activos; no se colorea toda la barra. Los límites de panel son sutiles y no constituyen la única señal de interacción. Los estados incluyen texto además de color. Se comprobarán ratios de texto con luminancia sRGB y los controles esenciales se distinguirán con foco y forma.

Base: [Contraste mínimo](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum), [WCAG 2.2](https://www.w3.org/TR/WCAG22/). El objetivo de 4.5:1 en texto y 3:1 en señales de control es una comprobación de diseño, no una certificación completa de accesibilidad.

## 8. Espaciado y adaptación
Escala: 4, 8, 12, 16, 24, 32, 48 px. Botones de 36–40 px, barras de 48–56 px, filas de archivo de 48 px. Padding de biblioteca 12 px y lienzo 32–48 px. Separadores de 1 px son una excepción óptica. Biblioteca inicialmente 300 px, redimensionable; índice 210 px y oculto por defecto. A partir de 900 px se compactan acciones y el índice se puede ocultar; el documento nunca exige un ancho fijo que tape la ruta.

Base: [Tamaño mínimo de objetivo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). Decisión: superar 24 px para acciones frecuentes de escritorio y probar ancho mínimo, 100%, 150% y 200% DPI con las dimensiones físicas escaladas. No se promete soporte móvil.

## 9. Estados y accesibilidad
Cero documentos: mensaje específico con invitación a abrir otra carpeta. Cero coincidencias: mensaje de filtro distinto. Carga: estado textual y cursor de espera sin bloquear menús. Error: ruta actual conservada y detalle recuperable en estado. Archivo borrado externamente: aviso de documento ausente sin borrar su contenido ya cargado. Diagramas inválidos: caja de error y código original legible, sin perder el resto del documento. Imágenes faltantes: pie explicativo con su texto alternativo.

Base: [Teclado](https://learn.microsoft.com/en-us/windows/apps/design/input/keyboard-interactions), [Accesibilidad Windows](https://learn.microsoft.com/en-us/windows/apps/design/accessibility/accessibility-overview). Decisión: controles nativos con AccessibleName, atajos visibles, orden de tabulación y foco. La auditoría automatizada cubre dimensiones y contraste; Narrator y alto contraste del sistema se señalan como revisión manual pendiente.

## 10. Gráficos, matemáticas y renderizado seguro
Mermaid empaquetado interpreta flowchart, sequenceDiagram, classDiagram, erDiagram, stateDiagram, pie, gantt, timeline, mindmap y xychart-beta. Un contenedor desplazable conserva diagramas anchos; se ofrecen ampliar y descargar SVG. Se renderiza cada bloque por separado para aislar errores. HTML del Markdown queda escapado. Solo scripts propios y dependencias locales tienen permisos CSP; connect-src permanece cerrado.

Base: [Configuración Mermaid](https://mermaid.js.org/config/schema-docs/config.html), [XY Chart](https://mermaid.js.org/syntax/xyChart.html). Decisión: securityLevel strict, límites de longitud/aristas, htmlLabels false; bloquear directivas que intenten relajar seguridad. El modo oscuro cambia el tema de diagramas.

KaTeX interpreta las expresiones emitidas por Markdig Mathematics con trust false, macros limitadas y fallback legible si hay error. Highlight.js resalta bloques reconocidos y deja intacto código sin lenguaje. Base: [Opciones KaTeX](https://katex.org/docs/options.html), [API highlight.js](https://highlightjs.readthedocs.io/en/latest/api.html). Ningún bloque se evalúa como JavaScript del usuario.

PNG, JPEG, GIF, WebP y SVG se muestran como imágenes. Las locales tienen un host de recursos separado de las dependencias; se permite resolver rutas relativas dentro de una raíz adecuada y se auditan espacios y Unicode. Las remotas quedan desactivadas inicialmente y pueden activarse en Vista. La app explicará esta decisión con un mensaje sobre la imagen, no con un icono roto. Graphviz, PlantUML y gráficos ejecutables ajenos a Mermaid no se anuncian como soportados; su código se sigue mostrando.

## 11. Auditoría y entrega
Se prepara un corpus real con diagramas de diez familias, gráficos XY/pie, fórmulas, tablas anchas, tareas, Unicode, enlaces y archivos con espacios; además, Mermaid inválido e intentos de inyección. Se verifica el DOM y dimensiones SVG, carga real de imágenes, ausencia de scripts ajenos, error aislado, tema, índice, zoom, actualización y acceso rápido. Se capturan previews y shell de la aplicación para revisión visual propia.

El repositorio tendrá proyecto compilable, recursos locales y lockfiles, script de publicación, corpus de prueba, licencias, README e investigación/auditoría. El portable incluye .NET y depende del WebView2 Runtime del equipo. Crear un repo remoto requiere una sesión autorizada disponible; no se introduce ni solicita un token dentro de los archivos.
