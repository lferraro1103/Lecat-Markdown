# Lecat - Markdown 3.2.4

Release estable para Windows y macOS.

## Sesión de documentos

- El documento de bienvenida aparece solo al iniciar por primera vez con un perfil nuevo.
- Al volver a abrir, se restauran los archivos de las pestañas que quedaron abiertas, en su orden y con la última pestaña seleccionada.
- Las pestañas cerradas se eliminan de la sesión. Si no quedaron documentos, se abre una nota vacía.
- La recuperación de borradores se integra con las pestañas anteriores sin duplicar archivos.
- Los archivos se vuelven a leer desde disco; los archivos que se movieron o eliminaron generan un aviso y permiten abrir el resto.

## Actualizaciones

- Ventana **Buscar actualizaciones** en el menú Ayuda y la barra superior.
- Búsqueda de versiones estables en el repositorio público al iniciar y cada cuatro horas.
- Windows instalado: descarga con progreso y reinicio explícito para aplicar la actualización, conservando documentos y preferencias.
- Confirmación de cambios sin guardar antes del reinicio; Cancelar conserva la actualización pendiente.
- ZIP portable y macOS ad-hoc: búsqueda de versiones y acceso a la descarga pública. Actualización nativa disponible con el perfil macOS Developer ID.
- Esta versión requiere una instalación inicial para incorporar el actualizador; futuras versiones de Windows podrán aplicarse dentro del programa.

## Correcciones conservadas

- La aplicación abre directamente con el tema elegido o el del sistema, sin mostrar durante unos segundos una interfaz blanca antes del tema oscuro.
- El fondo de la ventana y el tema del documento se aplican antes del primer dibujo. La ventana aparece cuando la interfaz está preparada.
- Se conservan preferencias, documentos, edición visual y gráficos sin conexión.

## Descargas

- Windows 10/11 x64: instalador Setup-x64.exe o ZIP portable completo.
- macOS 13 o posterior: DMG o ZIP arm64 (Apple Silicon) o x64 (Intel).
- macOS 12: continúa disponible la release alternativa 3.2.1-macos12.1.

Los paquetes de macOS tienen firma ad-hoc, sin Developer ID ni notarización.
Incluye comprobaciones de inicio, auditoría de la aplicación y sumas SHA256.
