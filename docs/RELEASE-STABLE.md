# Lecat - Markdown 3.3.0

## Configuración e idiomas

- Nuevo menú Configuración junto a Archivo, Editar, Vista y Ayuda; acceso desde el icono de configuración y Cmd/Ctrl + coma.
- Idioma configurable: Español, English, Português, Français, Deutsch, 中文（简体）, 中文（繁體） y 日本語.
- El idioma se aplica a menús, preferencias y controles de la aplicación, se conserva entre aperturas y no cambia los documentos.

## Actualizaciones beta

- Recibir versiones beta está desactivado inicialmente.
- Al activarlo, se busca la versión compatible más reciente entre estables y preliminares publicadas en GitHub.
- Cada plataforma conserva su arquitectura y canal macOS 12, con verificación de manifiestos y paquetes.
- Desactivar beta no instala una versión anterior: se esperan versiones estables posteriores.

## Exploración y edición

- Mac: búsqueda y selección de archivos con el diálogo nativo y acceso a la carpeta en Finder.
- Windows: botón Atrás para regresar a la carpeta visitada anteriormente, separado de Subir a la carpeta padre.
- Mac: pestañas integradas en la barra superior, sin segunda fila, y marca superior simplificada.
- Windows: se conserva el icono y se retira el título de la marca en la barra.
- Herramientas de edición flotantes y agrupadas: estilo de párrafo, negrita, cursiva, tachado, enlaces, listas e inserción.
- Referencia de navegación: pluk-inc/markdown-preview, documentada en docs/REFERENCIAS-MACOS.md.

## Migración y descargas

Windows instalado conserva el actualizador NSIS. Mac desde 3.2.6 incorpora Sparkle con firmas propias Ed25519.
Mac 3.2.5 o anterior requiere instalar esta edición manualmente una vez; después podrá actualizarse desde Lecat.
Los documentos, preferencias y pestañas abiertas se conservan.

Paquetes: Windows x64; macOS 13+ Intel/Apple Silicon; alternativa 3.3.0-macos12.1 para Monterey.
La distribución Mac mantiene firma ad-hoc y no incluye Developer ID ni notarización.
