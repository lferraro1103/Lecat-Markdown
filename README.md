# Claro MD

Lector nativo de Markdown para Windows 10/11 x64. Explorador de discos, acceso rápido de Windows,
interfaz clara/oscura, iconos originales y gráficos sin conexión.

## Descargar y abrir
Descomprimí el portable completo y ejecutá ClaroMD.exe. Conservá la carpeta Assets al lado del ejecutable.
Incluye .NET; la vista previa requiere [Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/).
Si WebView2 no está disponible, permite leer el código Markdown.

## Funciones
- Acceso rápido: Escritorio, Descargas, Documentos, Imágenes, Música y Vídeos con sus rutas reales.
- Otros accesos de Windows cuando Shell los expone; debajo de una línea, las unidades de Este equipo.
- Árbol de carpetas diferido, filtro .md/.markdown, navegación, ruta editable y menús contextuales.
- Menús Archivo, Navegación, Vista y Ayuda con atajos, tooltips e iconos.
- Lectura/código, índice de encabezados, búsqueda, zoom 50–250%, temas y recarga automática.
- Mermaid: flujo, secuencia, clases, entidades, estados, sectores, Gantt, mindmap, timeline y XY.
- Vista ampliada, código por gráfico y exportación SVG.
- KaTeX inline/bloque, código resaltado, tablas e imágenes locales incluyendo espacios/Unicode.
- Icono original SVG/PNG/ICO de nueve resoluciones, incrustado en el ejecutable y ventana.

## Uso
Elegí una carpeta y después un documento del listado. Arrastrar un archivo/carpeta también funciona.
Abrí examples/Bienvenido.md para probar gráficos, matemáticas e imágenes.
Ctrl+O abre documentos; Ctrl+L permite escribir una ruta. El menú Ayuda muestra los demás atajos.

También admite: ClaroMD.exe "C:\ruta\documento.md"

## Compilar
Requisitos: Windows x64 y SDK .NET 8.
Desde PowerShell en la raíz:

    ./scripts/publish.ps1

Los recursos de renderizado ya están incluidos; no hace falta npm para compilar ni Internet para leer gráficos.
src/Assets/package-lock.json registra las dependencias JavaScript. src/packages.lock.json fija NuGet.

## Auditar

    ./scripts/audit.ps1

La auditoría usa una ventana real WinForms/WebView2 y revisa renderizado, gráficos, seguridad,
imágenes, navegación, modos, búsqueda, tema, icono y contraste.
[Investigación visual](docs/INVESTIGACION-VISUAL.md) · [Contrato UI](docs/UI-SPEC.md)
[Auditoría visual](docs/UI-REVIEW.md) · [Auditoría de lectura](docs/AUDITORIA-LECTURA.md)

Las capturas locales de interfaz no se suben al repositorio porque pueden mostrar nombres de carpetas personales.

## Límites
Solo lectura, archivos hasta 20 MB. No evalúa HTML ni scripts incluidos en el Markdown.
Las imágenes remotas se activan opcionalmente desde Vista.
Las directivas de configuración Mermaid se rechazan. PlantUML/Graphviz y scripts arbitrarios se muestran como código.
WebView2 es un runtime externo; las carpetas siguen los permisos de tu cuenta.
Las preferencias se guardan en %LOCALAPPDATA%/ClaroMD/settings.json.

## Dependencias y licencias
Markdig 1.3.2 (BSD-2-Clause), Mermaid 11.12.0 (MIT), KaTeX 0.16.22 (MIT),
highlight.js 11.11.1 (BSD-3-Clause) y Microsoft.Web.WebView2 1.0.4191.47.
Licencias de recursos en src/Assets/vendor; licenses/Markdig.txt para Markdig.
Las dependencias de Microsoft conservan sus términos de distribución. El código del proyecto no recibe una licencia pública automáticamente.

