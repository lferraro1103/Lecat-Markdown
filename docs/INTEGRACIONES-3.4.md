# Integraciones de escritorio 3.4

Disponible desde 3.4.0 para Windows y macOS.

## Correcciones de interfaz

| Captura | Problema | Corrección |
| --- | --- | --- |
| 1 | Menú Insertar sobre el documento y con contenido centrado de forma desigual | La barra ya tenía espacio propio en la corrección anterior. Ahora el menú usa una capa emergente anclada al botón, límites de ventana y opciones alineadas a la izquierda. |
| 2 | Selector Body/Heading con presentación distinta a los demás menús | Se reemplaza la presentación del select nativo por el mismo menú de opciones de Lista/Insertar, con selección indicada, navegación por teclado y cierre con Escape. El editor conserva su estado canónico. |
| 3 | Resaltado doble del título dentro de la pestaña seleccionada | Un único fondo de selección para toda la pestaña. El título no agrega otro fondo al pasar el mouse y el foco de teclado se dibuja en el contorno de la pestaña. |
| 4 | Herramientas descentradas y superpuestas al contenido; controles de tabla visibles fuera de contexto | Grupos centrados en una fila propia, cuya altura se adapta a la ventana. Los controles de tabla respetan `hidden`; Lectura oculta la fila de formato. Se conserva la restauración del modo de vista de la corrección anterior. |
| 5 | Menú Lista separado del botón y con distribución inconsistente | Misma posición y estilo que los otros menús; se cierra al elegir, hacer clic fuera, desplazarse o cambiar de modo. |

En Mac vuelve el campo editable **Filtrar archivos y carpetas**, que filtra los
nombres de la carpeta actual. **Seleccionar archivos…** abre deliberadamente el
selector nativo, y **Abrir en Finder** permanece como acción independiente.
El filtro no se presenta como un diálogo de búsqueda.

## Funciones incorporadas

| Función | Uso y alcance |
| --- | --- |
| Quick Look | Extensión nativa `LecatQuickLook.appex` incluida en la app de Mac, con Markdown, fórmulas y Mermaid sin red. Previsualiza archivos físicos Markdown desde los hosts de Quick Look; no agrega un indexador de contenido a Spotlight ni habilita vistas previas de elementos virtuales de Core Spotlight. |
| CLI | `lecat README.md` abre uno o varios archivos, con rutas relativas y espacios. El lanzador está en `Contents/Resources/bin/lecat`; Configuración permite instalarlo en `~/.local/bin`. En Windows hay `lecat.cmd`. Es necesario agregar esa carpeta a PATH si no la administra Homebrew. No se reemplazan comandos `mdp` de otras aplicaciones. |
| URL scheme | `lecat://file/Users/nombre/Documents/archivo.md` en Mac; `lecat://file/C:/Users/nombre/Documents/archivo.md` en Windows. Codificar espacios como `%20`. Se atiende tanto el inicio como una instancia abierta. |
| Exportaciones | Archivo → Exportar ofrece PDF, HTML autónomo, EPUB 3 y PNG. Usa el contenido actual, incluidas modificaciones sin guardar, diagramas, fórmulas, fuentes e imágenes locales autorizadas. |
| Impresión | Archivo → Imprimir permite ajustar fuente en puntos y escala; Continuar abre el diálogo nativo del sistema. Sus opciones se guardan separadas del zoom de lectura. Cancelar no se anuncia como una impresión exitosa. |
| Homebrew | Cask propio `lecat-markdown`, con DMG y SHA256 diferentes para Intel y Apple Silicon. La publicación estable pública actualiza el cask automáticamente. No se anuncia inclusión en el catálogo oficial Homebrew. |
| Compartir | En Mac, Compartir ofrece Copiar Markdown, servicios nativos para el texto y Compartir archivo. La última opción crea una copia `.md` del contenido actual para servicios como AirDrop. macOS decide cuáles servicios están disponibles. En Windows el botón copia Markdown. |
| Crear desde sidebar | Acciones para archivo Markdown, carpeta y archivo desde texto del portapapeles en la carpeta actual. No sobrescriben nombres existentes. No importan automáticamente archivos copiados del sistema. |
| Filtro y Recientes | Filtro de nombres en ambas plataformas; vista Recientes persistente, con limpieza del historial y retiro de archivos inexistentes. La restauración de pestañas sigue independiente. |
| Inspector | Vista → Inspector muestra ruta, palabras, caracteres, tamaño del contenido actual, tamaño guardado, codificación, EOL, creación, modificación y estado de guardado. |
| Pellizco | El gesto del trackpad modifica el zoom del documento (80–150 %), conservando el tamaño de los controles. También se admite Ctrl+rueda. |
| Siempre encima | Opción en Vista y Configuración, persistente entre aperturas, independiente de maximizar o pantalla completa. |
| Enlaces de otras aplicaciones | Confirma con Cancelar, Permitir y Siempre permitir. Cancelar es la opción inicial. El permiso persistente se asocia al esquema y la aplicación registrada; si cambia la aplicación, se vuelve a preguntar. Configuración permite revocar todos los permisos. HTTP(S) sigue abriéndose directamente. |

Los enlaces `javascript:`, `data:`, `file:` y otros esquemas internos o
ejecutables no pasan a estar permitidos por esta función. Las imágenes no
pueden invocar aplicaciones. Los enlaces activados desde Quick Look pasan
por Lecat y por la misma política de confirmación.

## Homebrew y publicación

Después de sincronizar los archivos públicos del proyecto:

```sh
brew tap lferraro1103/lecat-markdown https://github.com/lferraro1103/Lecat-Markdown
brew install --cask lferraro1103/lecat-markdown/lecat-markdown
```

El cask del repositorio apunta a la última versión estable ya publicada,
3.4.0. Al publicar 3.4.0, el flujo genera los SHA256 de sus DMG,
actualiza el archivo del cask y agrega el enlace del comando `lecat`.
La publicación estable actualiza el cask con sus propios paquetes y hashes.
El cask estable requiere macOS 13 o posterior. macOS 12 mantiene su canal de
descarga/actualización separado.

## Límites comprobables

- PNG rechaza documentos de más de 20.000 píxeles CSS de alto o 30 millones
  de píxeles de salida, en vez de recortar contenido silenciosamente.
- Las imágenes de Quick Look se limitan a archivos del directorio del documento
  y sus subdirectorios, hasta 2 MB por imagen y 20 MB en total, con hasta cien
  referencias. No se descargan imágenes de internet.
- La extensión Quick Look usa el tema del sistema; no comparte ni modifica
  el perfil de Lecat. No se incorpora telemetría del proyecto de referencia.
- La copia temporal usada para compartir como archivo permanece en la carpeta
  temporal del sistema para que el servicio pueda leerla después de cerrar el menú.
- Compilación y registro de extensión no equivalen a una prueba manual en Mail,
  Spotlight, un trackpad físico o una impresora. Esas comprobaciones requieren
  el entorno correspondiente y no se anuncian como realizadas.

## Referencias

- [Revisión de la base 3.3.0](REVISION-INTEGRACIONES-ESCRITORIO.md).
- [Referencia solicitada para macOS](REFERENCIAS-MACOS.md).
- [Electron ShareMenu](https://www.electronjs.org/docs/latest/api/share-menu).
- [Electron webContents e impresión](https://www.electronjs.org/docs/latest/api/web-contents).
- [Electron Deep Links](https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app).
- [Apple Quick Look](https://developer.apple.com/documentation/quicklook).
- [Homebrew Cask Cookbook](https://docs.brew.sh/Cask-Cookbook).
