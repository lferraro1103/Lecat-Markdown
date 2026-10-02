# Lecat Markdown 3.2.0 — macOS alternativa

Versión alternativa compilada desde la rama `develop` con GitHub Actions.

La revisión `v3.2.0-macos.2` corrige la falta de firma del paquete anterior.
DMG, ZIP y la copia instalada se comprueban con `codesign --verify --deep --strict`
antes de publicarse. Reemplazá la aplicación anterior con esta descarga.

- Apple Silicon (M1/M2/M3/M4 y posteriores): descargá `macOS-arm64.dmg`.
- Intel: descargá `macOS-x64.dmg`.
- Abrí el DMG y arrastrá **Lecat - Markdown** a **Aplicaciones**.
- Los ZIP contienen la misma aplicación para instalación manual.
  Hacé doble clic en el ZIP desde Finder y mové la aplicación extraída a
  **Aplicaciones**, antes de abrirla.
- Atajos con Command (⌘), apertura de Markdown desde Finder, volúmenes montados
  en el explorador y menú de aplicación de macOS.
- Cerrar la ventana conserva los documentos; el Dock la vuelve a mostrar.
  Salir (⌘Q) solicita guardar cambios y permite cancelar.
- Preferencias y recuperación: `~/Library/Application Support/ClaroMD`.
- Electron, edición visual, Mermaid y KaTeX incluidos para trabajar sin conexión.

Los paquetes tienen firma ad-hoc de integridad, sin certificado Developer ID ni
notarización de Apple. macOS puede
bloquear la primera apertura. Tras intentar abrirla, utilizá **Configuración del
Sistema → Privacidad y seguridad → Abrir de todos modos**, si aparece.

El botón **Mover a la papelera** puede acompañar el aviso de aplicación no
verificada: por sí solo no indica que se haya detectado malware. Elegí **Listo**
y revisá **Privacidad y seguridad**, abajo en **Seguridad**.
Pulsá **Abrir de todos modos** y confirmá **Abrir** en el aviso siguiente.

Se observó ese botón con el ZIP publicado de `macos.2` en macOS 15 Intel,
macOS 15 Apple Silicon y macOS 26 Apple Silicon, sin Developer ID, manteniendo
Gatekeeper habilitado y la cuarentena. [Capturas y límites de la prueba](../.planning/spikes/001-gatekeeper-without-developer-id/README.md).
La autorización completa en tu Mac aún debe comprobarse.

No necesitás una cuenta Apple Developer para conceder una excepción manual de
desarrollador no identificado. El sistema decide si ofrece **Abrir de todos modos**;
la aplicación no puede forzarlo. Si el aviso afirma que se detectó software dañino,
o no aparece la excepción, informá la versión de macOS y el texto exacto del aviso.
No se propone quitar la cuarentena ni desactivar Gatekeeper.

Una firma ad-hoc comprueba que el paquete no cambió, pero no identifica al autor
ante Apple. Developer ID y notarización son una vía opcional de distribución
verificada. [Guía de seguridad de Apple](https://support.apple.com/102445).
Requiere una versión de macOS compatible con Electron 44.

Ambas arquitecturas deben superar los tests y la auditoría de la aplicación
empaquetada antes de publicarse. Los archivos SHA256 permiten comprobar las descargas.
Esta prerelease no sustituye la release estable de Windows.
