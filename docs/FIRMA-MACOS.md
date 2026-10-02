# Preparar la firma Developer ID en GitHub Actions

Objetivo: distribuir una aplicación con firma reconocida por macOS y permitir
su autorización manual desde Privacidad y seguridad, sin comandos en Terminal
para los usuarios. La aplicación no puede forzar ni elegir el aviso de Gatekeeper.

La firma ad-hoc de macos.2 no identifica al autor ante Apple. El nuevo modo
`developer-id` requiere un certificado **Developer ID Application** de una cuenta
del Apple Developer Program, exportado como `.p12` junto con su clave privada.

## Configuración del repositorio

En **Settings → Secrets and variables → Actions → New repository secret**, agregá:

| Secret | Contenido |
|---|---|
| `MACOS_CERTIFICATE_P12` | Certificado y clave privada `.p12` codificados en Base64 |
| `MACOS_CERTIFICATE_PASSWORD` | Contraseña usada al exportar el `.p12` |

No publiques el certificado ni su contraseña en el repositorio, issues o chats.

La compilación se activa con una etiqueta `v3.2.0-macos-signed.1` desde `develop`.
El workflow exige ambos secrets y una firma Developer ID válida: falla si no
puede firmar y no publica paquetes ad-hoc bajo esa etiqueta.

`electron-builder.developer-id.cjs` conserva la configuración de empaquetado,
habilita Hardened Runtime y los permisos JIT que requiere Electron. La validación
comprueba la autoridad Developer ID y el TeamIdentifier del ZIP, valida también
el DMG y ejecuta la auditoría en la aplicación copiada.

No se solicita notarización en este modo: el usuario autoriza la primera apertura
en la interfaz de macOS. Notarizar permite evitar el aviso de aplicación no verificada,
y requiere credenciales adicionales de Apple.

Antes de anunciar la apertura solo con interfaz, confirmar el flujo en un Mac
que haya descargado la release mediante navegador y conserve su cuarentena.

Referencias: [Apple](https://support.apple.com/102445),
[firma de aplicaciones Electron](https://www.electronjs.org/docs/latest/tutorial/code-signing).
