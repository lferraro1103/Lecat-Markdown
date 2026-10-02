# Lecat Markdown — macOS con firma Developer ID

Paquetes DMG y ZIP para Apple Silicon (arm64) e Intel (x64), firmados con un
certificado Developer ID Application de Apple. La firma del ZIP, del DMG y de
la aplicación copiada se verifica antes de publicar cada archivo.

## Instalar y autorizar desde macOS

1. Abrí el DMG o descomprimí el ZIP y mové **Lecat - Markdown.app** a **Aplicaciones**.
2. Abrí la aplicación. Esta entrega tiene firma Developer ID pero no notarización,
   por lo que macOS puede avisar que Apple no pudo verificarla.
3. Abrí **Configuración del Sistema → Privacidad y seguridad** y elegí
   **Abrir de todos modos**. Confirmá con **Abrir** cuando reaparezca el aviso.

La autorización queda guardada para próximas aperturas. No hace falta usar
Terminal. La disponibilidad de la autorización depende de las políticas del Mac;
equipos administrados pueden limitarla.
[Instrucciones de Apple](https://support.apple.com/102445).

Preferencias y borradores: `~/Library/Application Support/ClaroMD`.
DMG y ZIP contienen la misma aplicación; los manifiestos SHA256 verifican las descargas.
Esta release alternativa conserva la edición de Windows.
