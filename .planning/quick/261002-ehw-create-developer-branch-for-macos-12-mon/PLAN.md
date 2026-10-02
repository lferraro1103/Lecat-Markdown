---
status: in-progress
branch: developer
---

# macOS 12 Monterey en developer

1. Crear developer desde origin/main, manteniendo main y develop en su revisión actual.
2. Fijar Electron 43.7.7 (última serie compatible con macOS 12), lockfile y mínimo 12.0 del paquete.
3. Identificar esta variante como 3.2.1-macos12.1 y documentar compatibilidad y límites.
4. Compilar ARM64 e Intel con el workflow macOS existente al publicar developer.
5. Registrar resultado y publicar la rama en GitHub. No agregar pruebas nuevas.

Fuente: https://www.electronjs.org/blog/electron-44-0
Electron 44 exige macOS 13; Electron 43 conserva macOS 12.
Los runners actuales no permiten comprobar ejecución en Monterey real.
