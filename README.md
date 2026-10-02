# Lecat - Markdown

Editor y lector Markdown para Windows 10/11 x64 con **Electron y Chromium incluidos**. No necesita WebView2, .NET ni Internet para leer, editar y dibujar documentos locales.

## Abrir

Descomprimí el portable completo y ejecutá `Lecat - Markdown.exe`. Conservá todos los archivos y carpetas: el exe necesita los recursos de Electron. No hay cuenta ni instalador. El documento de bienvenida demuestra edición, gráficos, fórmulas e imágenes.

## Funciones

- Lectura, edición Markdown y vista dividida con previsualización en vivo.
- CodeMirror: deshacer/rehacer, selección, resaltado, números de línea, buscar/reemplazar.
- Formato: títulos, negrita, cursiva, enlaces, imágenes, listas, tareas, citas, código, tablas y Mermaid.
- Pestañas, Nuevo, Guardar, Guardar como y protección al cerrar con cambios.
- Borradores de recuperación locales y detección de conflictos externos.
- Acceso rápido real de Windows, otros shortcuts del Shell y línea antes de los discos.
- Explorador de carpetas, ruta editable, subir/actualizar y filtro.
- Temas claro/oscuro, icono original, Lucide, índice, enfoque y zoom.
- Mermaid, KaTeX, tablas, código e imágenes locales empaquetados sin CDN.
- Ampliar gráficos e imágenes, exportar SVG y PDF de lectura.

Referencia de experiencia: MarkText. Este editor ofrece **Markdown con vista previa**, no reproduce su motor WYSIWYG Muya.

## Atajos

| Acción | Atajo |
| --- | --- |
| Nuevo / abrir / carpeta | Ctrl+N / Ctrl+O / Ctrl+Shift+O |
| Guardar / guardar como | Ctrl+S / Ctrl+Shift+S |
| Cerrar pestaña | Ctrl+W |
| Lectura / edición / dividida | Ctrl+1 / Ctrl+2 / Ctrl+3 |
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
```

`npm start` abre desde el código. `dist/win-unpacked` es el portable. Auditoría en Electron real y capturas en `docs/previews/electron`, excluidas de Git por posibles rutas personales. Los lockfiles fijan dependencias.

- [Investigación GSD](docs/INVESTIGACION-ELECTRON.md)
- [Contrato UI](docs/UI-SPEC-ELECTRON.md)
- [Auditoría y límites](docs/AUDITORIA-ELECTRON.md)

`src` y los documentos de versión 2 conservan la implementación histórica WinForms/WebView2. El punto de entrada actual es `electron/`.

## Licencias

Electron, CodeMirror, markdown-it, DOMPurify, Mermaid, KaTeX, highlight.js y Lucide conservan sus licencias. El build genera las licencias del bundle dentro de `electron/ui`. El código del proyecto no recibe automáticamente una licencia pública por estar en un repositorio privado.
