# Lecat Markdown 3.2.0 — macOS alternativa

Versión alternativa compilada desde la rama `develop` con GitHub Actions.

La revisión `v3.2.0-macos.2` corrige la falta de firma del paquete anterior.
DMG, ZIP y la copia instalada se comprueban con `codesign --verify --deep --strict`
antes de publicarse. Reemplazá la aplicación anterior con esta descarga.

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

Los paquetes tienen firma ad-hoc de integridad, sin certificado Developer ID ni
notarización de Apple. macOS puede
bloquear la primera apertura. Tras intentar abrirla, utilizá **Configuración del
Sistema → Privacidad y seguridad → Abrir de todos modos**, si aparece.

Si esa opción no aparece y macOS ofrece mover la aplicación a la papelera,
instalá primero la revisión `v3.2.0-macos.2` en **Aplicaciones**. Para esta copia
descargada del repositorio oficial, abrí **Terminal** y ejecutá:

```sh
codesign --verify --deep --strict --verbose=2 "/Applications/Lecat - Markdown.app"
```

Si la comprobación termina sin errores, quitá la cuarentena únicamente de esta
aplicación y abrila:

```sh
xattr -dr com.apple.quarantine "/Applications/Lecat - Markdown.app"
open "/Applications/Lecat - Markdown.app"
```

Esto permite ejecutar esta aplicación; no desactiva Gatekeeper para otras apps.
Una firma ad-hoc comprueba que el paquete no cambió, pero no identifica al autor
ante Apple. Para distribución sin esta aprobación manual se requiere certificado
Developer ID y notarización. [Guía de seguridad de Apple](https://support.apple.com/102445).
Requiere una versión de macOS compatible con Electron 44.

Ambas arquitecturas deben superar los tests y la auditoría de la aplicación
empaquetada antes de publicarse. Los archivos SHA256 permiten comprobar las descargas.
Esta prerelease no sustituye la release estable de Windows.
