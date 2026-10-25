# Compilaciones Linux

Linux x64 se compila en GitHub Actions sobre Ubuntu 24.04. Se generan:

- `Lecat-Markdown-VERSION-Linux-x86_64.AppImage`.
- `Lecat-Markdown-VERSION-Linux-amd64.deb`.
- `SHA256-Linux-x64.txt`.

Los workflows de integración conservan los paquetes como artefactos. El workflow
de release los adjunta automáticamente cuando se publica una nueva versión.
Agregar este soporte no modifica releases existentes.

## Uso

Para AppImage, otorgar permiso de ejecución (`chmod +x archivo.AppImage`) y abrir
el archivo. Según la distribución puede ser necesario instalar el soporte FUSE.
Para Debian/Ubuntu, instalar el `.deb` con `sudo apt install ./archivo.deb`.

La configuración de paquetes sigue las opciones de
[electron-builder 26 para Linux](https://www.electron.build/v26/docs/linux/).

## Alcance

La actualización de Linux se realiza descargando e instalando el paquete nuevo.
No se habilita la instalación automática desde la aplicación en esta entrega.
Las integraciones específicas de Finder/Quick Look y Compartir de Windows/macOS
conservan su alcance original. La compilación no equivale a una comprobación de
la interfaz en cada distribución o entorno gráfico. ARM64 Linux no está incluido.
