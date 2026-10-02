# Lecat - Markdown 3.2.1

Release estable compilada desde `main` para Windows y macOS.

- Windows 10/11 x64: instalador `Setup-x64.exe` o ZIP portable completo.
- macOS 13 o posterior: DMG o ZIP, `arm64` para Apple Silicon y `x64` para Intel.
- Para macOS 12 Monterey, usá la [release alternativa 3.2.1-macos12.1](https://github.com/lferraro1103/Lecat-Markdown/releases/tag/v3.2.1-macos12.1)
  desde la rama `developer-macos12`, con Electron 43.7.7.

## Cambios

- Primera apertura con el tema claro u oscuro del sistema. Las elecciones
  manuales se conservan; Vista → Usar tema del sistema restaura el modo automático.
- Se retiraron los carteles «Todo queda en tu equipo» y «Sin conexión · Electron».
- Los bloques YAML iniciales muestran título y subtítulo, conservando los metadatos.
- En macOS, el explorador y el guardado nuevo comienzan en la carpeta personal.
- Time Machine, Recovery y los alias duplicados del disco de arranque se filtran.

## Instalación en Mac

Desde el DMG, arrastrá la app a Aplicaciones. Desde el ZIP, extraelo en Finder
y mové la app a Aplicaciones antes de abrirla.
Los paquetes tienen firma ad-hoc de integridad, sin Developer ID ni notarización.
Si macOS bloquea una app no verificada, revisá Privacidad y seguridad y usá
Abrir de todos modos si el sistema ofrece esa opción. No se confirma resuelto
el aviso de aplicación dañada mostrado previamente en el equipo del usuario.

Compilación de Windows, Intel y Apple Silicon en GitHub Actions con las
comprobaciones existentes de la aplicación y los paquetes. Se incluyen SHA256.
