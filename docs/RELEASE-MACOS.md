# Lecat Markdown 3.2.0 — macOS alternativa

Versión alternativa compilada desde la rama `develop` con GitHub Actions.

- Apple Silicon (M1/M2/M3/M4 y posteriores): descargá `macOS-arm64.dmg`.
- Intel: descargá `macOS-x64.dmg`.
- Abrí el DMG y arrastrá **Lecat - Markdown** a **Aplicaciones**.
- Los ZIP contienen la misma aplicación para instalación manual.
- Atajos con Command (⌘), apertura de Markdown desde Finder, volúmenes montados
  en el explorador y menú de aplicación de macOS.
- Cerrar la ventana conserva los documentos; el Dock la vuelve a mostrar.
  Salir (⌘Q) solicita guardar cambios y permite cancelar.
- Preferencias y recuperación: `~/Library/Application Support/ClaroMD`.
- Electron, edición visual, Mermaid y KaTeX incluidos para trabajar sin conexión.

Los paquetes no tienen firma Developer ID ni notarización de Apple. macOS puede
bloquear la primera apertura. Tras intentar abrirla, utilizá **Configuración del
Sistema → Privacidad y seguridad → Abrir de todos modos**, si aparece.
No desactives Gatekeeper. Requiere una versión de macOS compatible con Electron 44.

Ambas arquitecturas deben superar los tests y la auditoría de la aplicación
empaquetada antes de publicarse. Los archivos SHA256 permiten comprobar las descargas.
Esta prerelease no sustituye la release estable de Windows.
