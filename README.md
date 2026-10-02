# Lecat - Markdown

## Versión alternativa para macOS

La rama `develop` incluye paquetes DMG y ZIP para Apple Silicon (`arm64`) e Intel
(`x64`), compilados y auditados en GitHub Actions. Consultá
[la release alternativa](https://github.com/lferraro1103/Lecat-Markdown/releases/tag/v3.2.0-macos.2)
y [las instrucciones de instalación](docs/RELEASE-MACOS.md).
Los atajos usan ⌘ en macOS; preferencias y borradores se guardan en
`~/Library/Application Support/ClaroMD`. Para compilar en un Mac:
`npm ci` y `npm run dist:mac -- --arm64` (o `--x64`).

Para preparar una distribución con firma Developer ID y autorización desde la
interfaz de macOS, consultá [la configuración de firma](docs/FIRMA-MACOS.md).
Este modo requiere el certificado del desarrollador en los secrets de GitHub Actions.

Editor y lector Markdown para Windows 10/11 x64 con **Electron y Chromium incluidos**. No necesita WebView2, .NET ni Internet para leer, editar y dibujar documentos locales.

## Abrir

El instalador `Lecat-Markdown-3.2.0-Setup-x64.exe` ofrece licencia, carpeta de destino, accesos directos y desinstalador. Alternativamente, descomprimí el portable completo y ejecutá `Lecat - Markdown.exe`. Conservá todos los archivos y carpetas: el exe necesita los recursos de Electron. No hay cuenta ni instalador. El documento de bienvenida demuestra edición, gráficos, fórmulas e imágenes.

## Funciones

- Edición visual por defecto: escribí directamente sobre títulos, párrafos, listas y tablas renderizadas.
- Lectura y código Markdown con vista previa como opciones separadas.
- Tiptap/ProseMirror: selección, formato, pegado enriquecido y tablas con filas/columnas editables.
- Deshacer/rehacer y buscar/reemplazar en el documento visual. CodeMirror disponible en Código.
- Formato: títulos, negrita, cursiva, enlaces, imágenes, listas, tareas, citas, código, tablas y Mermaid.
- Pestañas, Nuevo, Guardar, Guardar como y protección al cerrar con cambios.
- Borradores de recuperación locales y detección de conflictos externos.
- Acceso rápido real de Windows, otros shortcuts del Shell y línea antes de los discos.
- Explorador de carpetas, ruta editable, subir/actualizar y filtro.
- Temas claro/oscuro, icono original, Lucide, índice, enfoque y zoom.
- Mermaid, KaTeX, tablas, código e imágenes locales empaquetados sin CDN.
- Ampliar gráficos e imágenes, exportar SVG y PDF de lectura.

Referencia de experiencia: MarkText. La edición principal ocurre sobre el documento visual. Mermaid y fórmulas se ven renderizados; hacer clic en la fórmula o en Editar diagrama abre su diálogo específico. Los bloques no modificados conservan su Markdown original; al editar un bloque se serializa su nuevo formato Markdown.

## Atajos

| Acción | Atajo |
| --- | --- |
| Nuevo / abrir / carpeta | Ctrl+N / Ctrl+O / Ctrl+Shift+O |
| Guardar / guardar como | Ctrl+S / Ctrl+Shift+S |
| Cerrar pestaña | Ctrl+W |
| Lectura / edición visual / código | Ctrl+1 / Ctrl+2 / Ctrl+3 |
| Buscar y reemplazar | Ctrl+F |
| Negrita / cursiva | Ctrl+B / Ctrl+I |
| Enfoque / tema | Ctrl+Shift+F / Ctrl+Shift+T |
| Exportar PDF | Ctrl+Alt+P |
| Zoom | Ctrl+Plus / Ctrl+Minus / Ctrl+0 |

## Datos y límites

Guardar es explícito. Borradores y preferencias se almacenan en `%APPDATA%/ClaroMD`; no hay sincronización ni telemetría. El original permanece intacto hasta guardar. Los conflictos externos evitan sobrescritura silenciosa y permiten guardar una copia.

UTF-8, BOM y UTF-16 LE; CRLF conservado. Máximo 20 MB por documento. UTF-16 BE y bytes UTF-8 inválidos se rechazan para evitar corrupción. Imágenes remotas muestran aviso y no se descargan. Enlaces web sólo se abren al hacer clic. HTML/scripts del Markdown no se ejecutan. Directivas Mermaid rechazadas y errores aislados por bloque. PlantUML/Graphviz se muestran como código.

## Desarrollo y auditoría

Node.js 22+ y npm; Windows x64 para esta entrega.

```powershell
npm ci
npm run build
npm test
npm run audit
npm run dist
npm run installer
```

`npm start` abre desde el código. `dist/win-unpacked` es el portable. Auditoría en Electron real y capturas en `docs/previews/electron`, excluidas de Git por posibles rutas personales. Los lockfiles fijan dependencias.

- [Investigación GSD](docs/INVESTIGACION-ELECTRON.md)
- [Contrato UI](docs/UI-SPEC-ELECTRON.md)
- [Auditoría y límites](docs/AUDITORIA-ELECTRON.md)

`src` y los documentos de versión 2 conservan la implementación histórica WinForms/WebView2. El punto de entrada actual es `electron/`.

## Licencias

Electron, CodeMirror, markdown-it, DOMPurify, Mermaid, KaTeX, highlight.js y Lucide conservan sus licencias. El build genera las licencias del bundle dentro de `electron/ui`. El código del proyecto no recibe automáticamente una licencia pública por estar en un repositorio privado.
