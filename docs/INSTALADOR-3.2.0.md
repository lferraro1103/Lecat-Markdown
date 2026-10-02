# Instalador Lecat 3.2.0

Asistente NSIS para Windows x64, español/inglés, licencia RTF con acentos verificados, instalación por usuario o todos los usuarios, carpeta elegible, accesos directos y desinstalador. El desinstalador conserva datos de la aplicación (deleteAppDataOnUninstall=false).

Licencia de uso gratuita para el ejecutable, sin convertir el código privado en una licencia pública; derechos de terceros conservados. Licencias accesibles también en resources.

Validación: integridad del payload extraído del propio instalador; aplicación extraída ejecutada con --audit: 80 comprobaciones de integración aprobadas. Las 12 pruebas unitarias de 3.2.0 estaban aprobadas. Pantalla española inspeccionada con el icono de gato y caracteres correctos. SHA256 de instalador y portable generados.

No se realizó una instalación/desinstalación real sobre el perfil del usuario porque la instancia abierta tenía cambios sin guardar. Se comprobó el asistente hasta la licencia y se canceló; no se certifican esas operaciones de registro en esta sesión. El instalador no tiene certificado comercial de firma (Authenticode NotSigned).

Reproducir: npm run installer. NSIS incluye todo Chromium, sin descargas durante la instalación.
