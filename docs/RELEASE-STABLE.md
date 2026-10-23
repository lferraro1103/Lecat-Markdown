# Lecat - Markdown 3.2.6

## Actualización desde la aplicación en Mac

- La edición de Mac incorpora Sparkle y firmas propias Ed25519 para verificar e instalar actualizaciones sin Apple Developer.
- Buscar actualizaciones muestra Descargar actualización y luego Reiniciar y actualizar.
- La descarga se verifica antes de habilitar la instalación; Sparkle vuelve a verificar el paquete antes de reemplazar la aplicación.
- Cerrar Lecat normalmente no instala una actualización descargada.
- Antes de reiniciar se confirman los cambios sin guardar y se conserva el estado de ventana, la sesión y las preferencias.
- Se selecciona el paquete del procesador y del canal correspondiente: Intel, Apple Silicon y alternativa macOS 12.

## Migración desde versiones anteriores

Mac 3.2.5 y anteriores necesitan instalar esta edición manualmente una vez para incorporar el nuevo mecanismo. Mové Lecat a Aplicaciones antes de usarlo. Las siguientes versiones podrán aplicarse desde la aplicación.

Windows conserva su actualizador NSIS y puede actualizar desde el programa.

## Descargas

- Windows 10/11 x64: instalador o ZIP portable.
- macOS 13 o posterior: DMG o ZIP Intel / Apple Silicon.
- macOS 12: alternativa 3.2.6-macos12.1 para ambos procesadores.

Los paquetes Mac conservan firma ad-hoc, sin Developer ID ni notarización. Las actualizaciones utilizan firmas criptográficas propias y se distribuyen con sus manifiestos verificados.
