# Lecat - Markdown 3.2.5

## Interfaz

- Barra superior más compacta en Windows.
- Barra integrada en macOS con controles nativos, título del documento, modos de vista y búsqueda.
- Explorador plegable y menos encabezados duplicados.
- Eliminadas las ayudas redundantes sobre el documento para una interfaz más limpia.

## Estado de ventana

- Conserva tamaño, posición y estado normal, maximizado o pantalla completa.
- Restaura el estado al iniciar y al abrir un documento desde el sistema.
- Evita que la salida de pantalla completa al cerrar reemplace el estado guardado.
- Conserva el estado al reiniciar para aplicar una actualización.
- Ajusta la posición cuando cambian los monitores y evita cambios de tamaño por escala de Windows.

## Documentos y actualizaciones

- Se conservan las pestañas abiertas, el último documento activo y los borradores.
- La bienvenida se muestra solo en la primera apertura de un perfil nuevo.
- Windows instalado: buscar, descargar y reiniciar desde la aplicación para actualizar desde 3.2.4.
- Se mantienen documentos y preferencias, con confirmación de cambios sin guardar antes de reiniciar.
- ZIP portable y macOS con firma ad-hoc: búsqueda de versiones y descarga pública; instalación manual.

## Descargas

- Windows 10/11 x64: instalador Setup-x64.exe o ZIP portable completo.
- macOS 13 o posterior: DMG o ZIP arm64 (Apple Silicon) o x64 (Intel).
- macOS 12: release alternativa 3.2.5-macos12.1 para ambas arquitecturas.

Los paquetes de macOS tienen firma ad-hoc, sin Developer ID ni notarización.
Se incluyen sumas SHA256 y archivos de actualización. La restauración de ventana,
la sesión de documentos y la interfaz se comprobaron en Windows y macOS 15 Intel/ARM64.
