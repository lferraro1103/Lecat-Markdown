# Lecat — Markdown

[English](README.md) · **Español**

Editor y lector Markdown sin conexión para Windows y macOS. Escribí directamente sobre el documento renderizado, explorá carpetas locales y trabajá con diagramas, fórmulas, tablas e imágenes en una sola aplicación de escritorio.

[Descargar la última versión](https://github.com/lferraro1103/Lecat-Markdown/releases/latest) · [Notas de versiones](https://github.com/lferraro1103/Lecat-Markdown/releases)

## Funciones

- **Edición visual:** modificá títulos, párrafos, listas y tablas renderizadas, con formato, deshacer/rehacer y buscar/reemplazar.
- **Tres modos:** edición visual, lectura y código Markdown con vista previa.
- **Explorador local:** navegá carpetas y discos, filtrá archivos y usá las ubicaciones de acceso rápido de Windows.
- **Markdown enriquecido:** diagramas Mermaid, fórmulas LaTeX con KaTeX, código resaltado, tareas, tablas e imágenes locales.
- **Herramientas de documentos:** pestañas, Guardar como, índice, enfoque, zoom, exportación de diagramas SVG y exportación PDF.
- **Recuperación local:** recuperá borradores y detectá cambios externos antes de sobrescribir un archivo.
- **Apariencia:** temas claro, oscuro y del sistema, aplicados antes de mostrar la ventana.

Electron y Chromium están incluidos. Leer, editar y renderizar documentos locales no requiere internet, una cuenta, WebView2 ni .NET. Abrir enlaces web y descargar actualizaciones requiere conexión.

## Descarga e instalación

La versión estable actual es **3.2.2**.

| Plataforma | Descarga | Instalación |
| --- | --- | --- |
| Windows 10/11, x64 | `Setup-x64.exe` | Ejecutá el instalador para elegir la carpeta y crear accesos directos. |
| Windows 10/11, x64 | `Windows-x64.zip` | Extraé el ZIP completo y abrí `Lecat - Markdown.exe`. Conservá todos los archivos juntos. |
| macOS 13 o posterior, Apple Silicon | `macOS-arm64.dmg` o `.zip` | Mové la aplicación a Aplicaciones antes de abrirla. |
| macOS 13 o posterior, Intel | `macOS-x64.dmg` o `.zip` | Mové la aplicación a Aplicaciones antes de abrirla. |

Para **macOS 12 Monterey**, usá la [release alternativa 3.2.1-macos12.1](https://github.com/lferraro1103/Lecat-Markdown/releases/tag/v3.2.1-macos12.1). Usa otra versión de Electron y se mantiene en `developer-macos12`.

Los paquetes de macOS tienen firma ad-hoc de integridad, sin firma Developer ID ni notarización. Consultá las [instrucciones para macOS](docs/RELEASE-MACOS.md) y la [documentación de firma](docs/FIRMA-MACOS.md). Las descargas incluyen sumas SHA256.

## Cómo editar

Abrí un archivo Markdown o creá un documento. **Edición visual** es el modo predeterminado: hacé clic en un título, párrafo, lista o celda y escribí directamente. Cambiá a **Lectura** para visualizarlo, o a **Código** para trabajar con el Markdown y su vista previa.

Los diagramas y las fórmulas se muestran renderizados. Usá **Editar diagrama**, o hacé clic en una fórmula, para modificar su contenido en un diálogo específico. Los bloques no modificados conservan su Markdown original; los bloques editados se serializan nuevamente a Markdown.

El guardado es explícito. El archivo original cambia solamente cuando guardás. Si otra aplicación lo modifica, Lecat informa el conflicto y permite guardar una copia separada.

## Atajos

Usá `Ctrl` en Windows y `⌘` en macOS.

| Acción | Atajo |
| --- | --- |
| Nuevo documento / abrir archivo / abrir carpeta | Ctrl+N / Ctrl+O / Ctrl+Shift+O |
| Guardar / Guardar como | Ctrl+S / Ctrl+Shift+S |
| Cerrar pestaña | Ctrl+W |
| Lectura / edición visual / código y vista previa | Ctrl+1 / Ctrl+2 / Ctrl+3 |
| Buscar y reemplazar | Ctrl+F |
| Negrita / cursiva | Ctrl+B / Ctrl+I |
| Enfoque / cambiar tema | Ctrl+Shift+F / Ctrl+Shift+T |
| Exportar PDF | Ctrl+Alt+P |
| Acercar / alejar / restablecer zoom | Ctrl+Plus / Ctrl+Minus / Ctrl+0 |

Elegí **Vista → Usar tema del sistema** para restaurar la selección automática después de elegir claro u oscuro manualmente.

## Datos y formatos

Las preferencias y los borradores se guardan localmente en `%APPDATA%/ClaroMD` en Windows y `~/Library/Application Support/ClaroMD` en macOS. El nombre histórico de la carpeta se conserva por compatibilidad. No hay sincronización en la nube ni telemetría.

Lecat admite UTF-8, UTF-8 con BOM y UTF-16 LE, conservando finales de línea CRLF. El límite es de 20 MB por documento. UTF-16 BE y bytes UTF-8 inválidos se rechazan para prevenir corrupción de datos.

Las imágenes remotas no se descargan automáticamente. Los enlaces web se abren solamente al hacer clic. Los scripts del Markdown no se ejecutan. Los errores de Mermaid se aíslan por bloque; PlantUML y Graphviz se muestran como código.

## Desarrollo

Requisitos: Node.js **22.12 o posterior**, npm y una plataforma de escritorio compatible.

```sh
npm ci
node scripts/prepare-electron.cjs
npm test
npm start
```

```sh
npm run audit         # Auditoría de integración en Electron real
npm run dist          # Distribución portable para Windows
npm run installer     # Instalador para Windows
npm run dist:mac -- --arm64  # Paquetes para Mac Apple Silicon
npm run dist:mac -- --x64    # Paquetes para Mac Intel
```

El punto de entrada de la aplicación es `electron/`. `src/` contiene la implementación histórica WinForms/WebView2.

Las capturas y los resultados de auditoría se generan en `docs/previews/electron` y se excluyen de Git porque pueden contener rutas locales. Las dependencias están fijadas en `package-lock.json`.

Más documentación: [investigación de implementación](docs/INVESTIGACION-ELECTRON.md), [diseño de interfaz](docs/UI-SPEC-ELECTRON.md) y [auditoría y límites](docs/AUDITORIA-ELECTRON.md).

## Licencias

Los términos de la aplicación distribuida están en [LICENCIA.txt](build/LICENCIA.txt). El acceso público al repositorio no concede por sí mismo una licencia sobre el código del proyecto.

Las bibliotecas externas conservan sus licencias. La compilación genera los avisos del bundle en `electron/ui/THIRD-PARTY-LICENSES.txt`; los paquetes distribuidos también incluyen los avisos de Electron y Chromium.
