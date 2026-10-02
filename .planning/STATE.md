# Estado

Producto: Lecat - Markdown 3.2.1.
Estado: completo.
Última tarea: 20261002-visual-editor.
Verificación: 92 comprobaciones aprobadas en versión empaquetada.

Instalador NSIS 3.2.0 listo: licencia verificada, payload auditado y hashes. Release v3.2.0 preparada.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 261002-brl | macOS alternativa publicada desde develop; ARM64 e Intel verificados | 2026-10-02 | 6824ae4 | [macos-alternative-release](./quick/261002-brl-macos-alternative-release/) |
| 261002-c77 | Firma ad-hoc y verificación de DMG/ZIP/copia instalada; macOS.2 publicada | 2026-10-02 | 3ce4538 | [fix-macos-package-signatures-and-launch](./quick/261002-c77-fix-macos-package-signatures-and-launch/) |
| 261002-d6q | Nueva compilación y release v3.2.0-macos.3, ZIP/DMG ARM64 e Intel | 2026-10-02 | ef90ec4 | [publish-rebuilt-macos-packages-as-v3-2-0](./quick/261002-d6q-publish-rebuilt-macos-packages-as-v3-2-0/) |
| 261002-dhe | Home por defecto en macOS; discos sin Time Machine, Recovery ni symlinks duplicados; macos.4 publicada | 2026-10-02 | 9a7a177 | [use-user-home-as-default-directory-on-ma](./quick/261002-dhe-use-user-home-as-default-directory-on-ma/) |
| 261002-dqq | Tema del sistema en primera apertura, avisos eliminados y títulos YAML; release Windows/macOS desktop.1 publicada | 2026-10-02 | 94ddac3 | [default-to-system-theme-and-remove-ui-no](./quick/261002-dqq-default-to-system-theme-and-remove-ui-no/) |

Última actividad: release alternativa v3.2.0-macos.1 publicada. GitHub Actions
37001654216 exitoso; 12 tests y 80 comprobaciones de aplicación empaquetada por arquitectura.
DMG, ZIP y SHA256 disponibles. Main y release estable de Windows conservados.

Actualización: v3.2.0-macos.2 corrige la falta de firma. Actions 37003112459
aprobado en Intel y ARM64 (95 comprobaciones por arquitectura). Pendiente confirmar
apertura en el Mac del usuario; requiere aprobación manual al no estar notarizada.

### Tarea en curso

El modo Developer ID quedó como opcional; el usuario requiere autorización sin
ese certificado. Spike 001 (GSD inline): Actions 37005730897 reprodujo el aviso de
app no verificada y capturó **Open Anyway** en Privacidad y seguridad en macOS
15.7.9 ARM64/Intel y 26.6.2 ARM64 usando el ZIP publicado macos.2. Gatekeeper
habilitado, sin quitar cuarentena ni conceder la excepción automáticamente.
Documentación y release actualizadas con pasos exclusivamente de interfaz.
Pendiente la apertura real en el Mac del usuario; el experimento usa cuarentena
de API pública, no descarga de navegador. Main conservado.

Última publicación: v3.2.0-macos.3, compilada de ef90ec4 en develop.
Actions 37007113991: ambas compilaciones y publicación exitosas. Seis assets
disponibles con nombres nuevos; README apunta a .3. El aviso «está dañada» de la
captura del usuario sigue sin diagnóstico confirmado; no se anuncia como corregido.

Última actividad: v3.2.0-macos.4 publicada desde 9a7a177 en develop. Actions
37008717187 completado con éxito en ambas arquitecturas. Inicio en Home y guardado
nuevo en Home; filtrado de backups/recovery y deduplicación de discos implementados.
Seis assets públicos confirmados. Pendiente observar los volúmenes del Mac del
usuario; sin corrección confirmada para su aviso anterior de aplicación dañada.

Última publicación: v3.2.1-desktop.1 desde develop, commit 94ddac3. Actions
37010272493 completado con éxito en Windows x64 y macOS ARM64/Intel; nueve
assets públicos confirmados. Primera apertura con tema del sistema y preferencias
manuales posteriores conservadas, carteles retirados y encabezados YAML renderizados.
Main sin cambios. No se agregaron tests para las nuevas rutas de tema/metadata;
la comprobación específica en los equipos del usuario sigue pendiente.
