# Actualizaciones desde Releases públicas

Desde **3.2.3**, el instalador de Windows habilita actualizaciones dentro del
programa. La primera vez se instala esta versión sobre la anterior; mantiene el
perfil `ClaroMD`, las preferencias y los borradores. Las versiones anteriores no
tienen un actualizador y no pueden incorporar esta función por sí solas.

## Uso

Abrir **Ayuda → Buscar actualizaciones…**, o el botón de descarga de la barra
superior. La ventana muestra versión instalada, nueva versión, novedades y
progreso. **Descargar actualización** descarga y verifica el instalador;
**Reiniciar y actualizar** aplica la actualización sin recorrer otra vez el
asistente. Antes del reinicio se pide guardar o descartar los cambios pendientes;
Cancelar permite seguir trabajando. Cerrar normalmente no aplica una actualización.

La búsqueda también se ejecuta 15 segundos después del inicio y cada cuatro
horas; solo resalta el botón cuando hay una actualización. No descarga ni
reinicia automáticamente. Los fallos de conexión permiten reintentar y no
interrumpen la edición sin conexión.

El ZIP portable de Windows permite buscar versiones y abrir la descarga pública.
Para actualizar dentro de Windows se usa la edición instalada NSIS.

Desde **3.2.6**, Mac usa Sparkle 2.10 con firmas Ed25519 propias. La primera
instalación de esta edición es manual para quienes venían de 3.2.5 o anterior.
Después se puede descargar y reiniciar desde Lecat. Mantener la app en una carpeta
escribible (normalmente Aplicaciones); macOS puede pedir autorización si hace falta.
No se necesita una cuenta Apple Developer para este mecanismo. Se mantienen los
avisos de Gatekeeper propios de la distribución ad-hoc inicial.

Electron verifica un manifiesto firmado y el tamaño, SHA256 y firma Ed25519 del
ZIP. La descarga queda en el perfil y no se instala al cerrar normalmente. Solo
tras confirmar Reiniciar y actualizar, y aprobar el guardado, se inicia el helper
nativo. Un servidor temporal en 127.0.0.1 con ruta aleatoria entrega a Sparkle el
paquete verificado; Sparkle valida la firma antes de extraer/reemplazar la app.
Los documentos, preferencias y sesión permanecen en el perfil existente.

La clave pública está en build/mac-update-key.json y SUPublicEDKey. La privada
está exclusivamente en el secreto cifrado LECAT_UPDATE_PRIVATE_KEY de Actions;
no se publica en fuentes ni artefactos. Nunca generar otra clave para una release
existente: perderla requiere una migración manual de las instalaciones anteriores.

## Publicar una actualización

El origen fijo es:
`https://github.com/lferraro1103/Lecat-Markdown/releases/latest/download/`.
Publicar código o cambiar una versión en Git no produce una actualización por sí
solo. Hay que incrementar `package.json` y el lock, generar los paquetes y
publicar una **Release estable**, marcada Latest, con sus artefactos:

- Windows: `Lecat-Markdown-VERSION-Setup-x64.exe`, su `.blockmap` y `latest.yml`.
- macOS: ZIP y DMG de ambas arquitecturas, blockmaps, latest-mac.yml fusionado y mac-update-arm64.json / mac-update-x64.json firmados.
- Conservar las sumas SHA256 y los assets de versiones anteriores.

El workflow `desktop.yml` conserva los manifiestos y blockmaps. Cada runner Mac
sube un manifiesto propio; `merge-update-metadata.cjs` comprueba la versión y
fusiona los archivos antes de publicar, evitando que Intel sobrescriba ARM64.

Para publicar desde el repositorio privado, sincronizar primero la fuente
pública esencial y el tag correspondiente. Configurar en el repositorio privado
el secreto **PUBLIC_RELEASE_TOKEN** con permiso `contents:write` únicamente sobre
el repositorio público. El workflow publica los binarios sin exportar fuente
privada; falla explícitamente si falta el secreto o el tag público. Al ejecutar
el workflow directamente en el repositorio público usa su `GITHUB_TOKEN`.
La firma de actualizaciones de Mac usa LECAT_UPDATE_PRIVATE_KEY en el repositorio que publica los binarios.

Windows sigue usando paquetes sin certificado Authenticode: la comprobación de
editor firmado se desactiva explícitamente en el build actual. Se mantiene HTTPS
y la verificación SHA512 de electron-updater. Al incorporar un certificado,
reactivar `win.verifyUpdateCodeSignature` y configurar `publisherName`.

Referencia oficial: [electron-builder 26: Auto Update](https://www.electron.build/v26/docs/features/auto-update/).
