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

El ZIP portable permite buscar versiones y abrir la descarga pública. Para
actualizar desde el programa en Windows se usa la edición instalada NSIS. macOS
ad-hoc conserva la búsqueda y descarga manual: Squirrel.Mac exige una identidad de
firma estable para aplicar actualizaciones. El perfil Developer ID existente
(`dist:mac:signed`) activa la instalación nativa, conservando la verificación de
firma. No se cambia la firma de las distribuciones actuales.

## Publicar una actualización

El origen fijo es:
`https://github.com/lferraro1103/Lecat-Markdown/releases/latest/download/`.
Publicar código o cambiar una versión en Git no produce una actualización por sí
solo. Hay que incrementar `package.json` y el lock, generar los paquetes y
publicar una **Release estable**, marcada Latest, con sus artefactos:

- Windows: `Lecat-Markdown-VERSION-Setup-x64.exe`, su `.blockmap` y `latest.yml`.
- macOS: ZIP y DMG de ambas arquitecturas, blockmaps y `latest-mac.yml` fusionado.
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
No se configuraron secretos ni se publicó una release durante esta implementación.

Windows sigue usando paquetes sin certificado Authenticode: la comprobación de
editor firmado se desactiva explícitamente en el build actual. Se mantiene HTTPS
y la verificación SHA512 de electron-updater. Al incorporar un certificado,
reactivar `win.verifyUpdateCodeSignature` y configurar `publisherName`.

Referencia oficial: [electron-builder 26: Auto Update](https://www.electron.build/v26/docs/features/auto-update/).
