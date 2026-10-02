# Lecat Markdown 3.2.1-desktop.1 — Windows y macOS

Release alternativa compilada desde `develop` mediante GitHub Actions.

## Cambios

- En la primera apertura se usa el tema del sistema: claro u oscuro, con actualización automática
  cuando cambia el sistema. Se aplica a la interfaz, al editor y a los gráficos.
- El botón de tema permite elegir claro/oscuro manualmente. **Vista → Usar tema
  del sistema** restaura el modo automático. Las elecciones manuales guardadas
  se conservan al volver a abrir el programa.
- Eliminados «Todo queda en tu equipo» y «Sin conexión · Electron» de la interfaz.
- Los metadatos YAML al inicio del archivo muestran `title` y `subtitle` como
  título y subtítulo en lectura, edición visual y PDF. El bloque original se
  conserva al guardar y puede editarse con **Editar metadatos** o desde Código.
- macOS conserva Home como directorio inicial, la exclusión de Time Machine y
  Recovery y la deduplicación de Macintosh HD.

## Descargas

- **Windows x64:** instalador `Setup-x64.exe`, o ZIP portable `Windows-x64.zip`.
  Extraé el ZIP completo y abrí `Lecat - Markdown.exe` en la carpeta extraída.
- **Mac Apple Silicon:** DMG o ZIP `macOS-arm64`.
- **Mac Intel:** DMG o ZIP `macOS-x64`.
- Manifiestos SHA256 incluidos para las tres variantes.

En macOS, mové la app a **Aplicaciones** antes de abrirla. Los paquetes conservan
firma ad-hoc, sin Developer ID ni notarización. Para el aviso de app no verificada,
elegí **Listo** y luego **Configuración → Privacidad y seguridad → Seguridad →
Abrir de todos modos**, si macOS ofrece la excepción. [Guía de Apple](https://support.apple.com/102445).
El aviso específico «está dañada» reportado anteriormente sigue sin diagnóstico
confirmado y no se anuncia como corregido en esta release.

Los paquetes macOS se verifican después de extraer/copiar la aplicación. Windows
se compila después de la auditoría existente. La apertura con descarga de navegador
y las configuraciones particulares del usuario requieren comprobación en su equipo.
