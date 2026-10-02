# Lecat - Markdown 3.2.1-macos12.1 — macOS 12 Monterey

Alternativa desde la rama `developer-macos12`, basada en 3.2.1 con Electron
43.7.7 y mínimo de macOS 12.0. Electron 44 requiere macOS 13.

- Intel: archivos `macOS-x64.dmg` o `macOS-x64.zip`.
- Apple Silicon: archivos `macOS-arm64.dmg` o `macOS-arm64.zip`.
- Abrí el DMG y arrastrá la app a Aplicaciones. Para ZIP, extraelo desde Finder
  y mové la app a Aplicaciones antes de abrirla.
- Tema del sistema en la primera apertura; preferencias manuales conservadas.
- Carpeta personal como inicio, discos sin backups/recovery ni duplicados.
- Título y subtítulo YAML renderizados en el documento.

Firma ad-hoc sin Developer ID ni notarización. En Monterey, tras intentar abrir
la app, revisá Preferencias del Sistema → Seguridad y privacidad → General y
usá Abrir igualmente si macOS ofrece esa opción.

Compilación y comprobaciones de firma e integridad en runners macOS 15 para
Intel y Apple Silicon. La apertura y autorización en Monterey real siguen
pendientes; no se confirma resuelto el aviso de aplicación dañada del usuario.

Fuente de compatibilidad: https://www.electronjs.org/blog/electron-44-0
