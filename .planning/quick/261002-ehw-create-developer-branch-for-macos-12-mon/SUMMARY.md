---
status: complete
branch: developer
commit: eb89b86
---

# developer para macOS 12

- Rama exacta developer creada desde origin/main 937c407 y publicada en GitHub.
- Variante 3.2.1-macos12.1 con Electron 43.7.7 fijado en package y lockfile.
- Mínimo del paquete macOS 12.0. Bundle chrome140 conservado: Electron 43 usa Chromium 150.
- Workflow macOS compila en cada push a developer; DMG, ZIP y SHA256 para ARM64 e Intel.
- Actions 37013087285 produjo los artefactos macOS-arm64 y macOS-x64.
- Los pasos existentes de CI comprueban firma ad-hoc, DMG/ZIP y copia instalada.
- Sin pruebas nuevas ni ejecución de pruebas locales. La apertura real en macOS 12 sigue pendiente:
  CI usa macOS 15. No se afirma resuelto el aviso de aplicación dañada del usuario.
- main y develop permanecen en 937c407; no se publicó nueva release en esta tarea de rama.

Fuente oficial: https://www.electronjs.org/blog/electron-44-0
Electron 44 exige macOS 13, mientras que la serie 43 conserva Monterey.

Compilación: https://github.com/lferraro1103/Lecat-Markdown/actions/runs/37013087285
