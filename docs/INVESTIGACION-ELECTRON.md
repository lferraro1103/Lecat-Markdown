# Claro MD 3 · investigación GSD de edición, apariencia y arquitectura

Fecha: 2026-10-02. Pedido: migrar a Electron, editar y leer Markdown, conservar explorador de Windows, investigar nuevamente, verificar y actualizar el repositorio. Ejecución autónoma con GSD quick --research --validate; investigación, contrato, revisión y verificación realizados inline según el adaptador Codex. El producto sigue siendo Claro MD, con identidad propia.

## Referencias primarias y conclusiones

Se revisó [MarkText y su lista oficial de funciones](https://github.com/marktext/marktext/blob/develop/README.md): interfaz de escritura despejada, previsualización visual, modos de fuente/enfoque, fórmulas y exportación. Sirve como referencia de experiencia; no se reutiliza su código, motor Muya, logotipo ni marcas. Su editor WYSIWYG completo es una arquitectura diferente de una vista dividida. La implementación elegida aquí ofrece edición Markdown con formato, lectura y previsualización simultánea; no promete compatibilidad íntegra con todas las funciones de MarkText.

La [guía de seguridad de Electron](https://www.electronjs.org/docs/latest/tutorial/security) recomienda mantener actualizado el runtime, separar contextos, validar emisores IPC y limitar navegación y permisos. Se aplican contextIsolation, sandbox, nodeIntegration desactivado, preload con métodos concretos, comprobación del frame principal, bloqueo de ventanas y navegación, y permisos denegados. El runtime Chromium incluido elimina WebView2 como requisito. El portable contiene la carpeta completa del motor, no sólo el exe.

[CodeMirror 6](https://codemirror.net/docs/guide/) proporciona estado transaccional, extensiones, selecciones e historial. Su [referencia](https://codemirror.net/docs/ref/) sustenta Compartments para temas, update listeners y panel de búsqueda/reemplazo. Frente a un textarea, mejora navegación por teclado, selección, deshacer, resaltado y búsquedas. Frente a un contenteditable casero, conserva Markdown explícito sin conversiones ambiguas entre HTML y texto. Decisión: CodeMirror y vista previa renderizada independiente.

[markdown-it](https://github.com/markdown-it/markdown-it) convierte CommonMark y extensiones de forma configurable. HTML del usuario desactivado, enlaces peligrosos filtrados y salida saneada con [DOMPurify](https://github.com/cure53/DOMPurify). Las fórmulas se representan mediante [KaTeX](https://katex.org/docs/options.html) con trust false; los gráficos mediante [Mermaid](https://mermaid.js.org/config/schema-docs/config.html) strict, límites y rechazo de configuración embebida. Las dependencias se empaquetan en disco; no hay CDN.

[Lucide](https://lucide.dev/guide/) aporta símbolos de trazo coherente para menús visuales, formatos, discos y navegación. Iconos a 17 px, trazo 1.7 y botones de al menos 30–32 px; el icono original de Claro MD se conserva. La [guía de iconos Windows](https://learn.microsoft.com/en-us/windows/apps/design/style/icons) y [comandos](https://learn.microsoft.com/en-us/windows/apps/design/controls/command-bar) orienta a iconos familiares, nombres claros y agrupación por función. Se distingue la marca del conjunto de acciones.

## Arquitectura de información y apariencia

Tres zonas persistentes: biblioteca a la izquierda, documento central y estado inferior. Acceso rápido se muestra primero, con Escritorio/Descargas/Documentos/Imágenes/Música/Vídeos usando Electron app.getPath; los elementos adicionales de Quick Access se consultan al Shell de Windows. Línea divisoria y encabezado Este equipo antes de las unidades. Las carpetas se exploran por doble función lista/directorio y ruta editable; no se enumeran discos completos recursivamente.

La franja superior contiene identidad, Nuevo/Abrir/Guardar y tema. Las pestañas presentan nombre y punto de modificación; el encabezado muestra ruta completa mediante tooltip y el estado Guardado/Sin guardar. El selector de Lectura/Edición/Dividida es exclusivo y mantiene su selección accesible. La barra de formato aparece en edición: título, negrita, cursiva, enlace, imagen, lista, tarea, cita, código, tabla y Mermaid. Las utilidades de vista son un grupo separado: buscar, índice, enfoque y zoom. Los menús nativos Archivo/Editar/Vista/Ayuda exponen atajos y funciones menos frecuentes.

El tema claro usa superficies blancas y gris azulado; el oscuro azul carbón, bordes sobrios y acento lavanda. Se preserva la jerarquía con contraste y espaciado, evitando que todas las barras compitan con el contenido. Tipografía Segoe UI para controles/prosa y Consolas para fuente. El cuerpo de lectura limita su ancho a 840 px; código, tablas y gráficos pueden desplazarse por dentro. Encabezados de 32/24/19 px, cuerpo 16 px/1.85, controles 12–13 px, metadatos 10–11 px.

Vista dividida tiene separador arrastrable y ajustable con flechas, mínimo 25% y máximo 75%. Enfoque oculta biblioteca/identidad/pestañas y deja disponible el comando para salir. En 900 px el índice es flotante y la barra distribuye sus acciones en dos líneas. No se intenta convertir esta aplicación de escritorio en una interfaz de teléfono.

## Edición y protección de datos

Guardar siempre es explícito. Los cambios se guardan como borradores de recuperación en el directorio local de la aplicación, sin sobrescribir el documento original. Cerrar pestaña/ventana con cambios ofrece Guardar/Descartar/Cancelar. Guardar como usa diálogo nativo y evita colisiones entre pestañas. Un hash de la versión leída detecta cambios externos antes de reemplazar el archivo. El guardado escribe un temporal en el mismo directorio, sincroniza y renombra; los errores permanecen visibles y el documento continúa abierto.

UTF-8, BOM y UTF-16 LE son reconocidos; CRLF se conserva al guardar. UTF-16 BE y bytes UTF-8 inválidos producen error en lugar de sustituir caracteres. Tamaño máximo 20 MB. La edición visual no modifica el Markdown al abrirlo. Tablas, fórmulas y gráficos no ejecutan programas incluidos en el texto.

## Alcance y verificaciones necesarias

Pruebas de núcleo: guardado y conflictos, codificación/BOM/CRLF, filtrado de explorador y entradas inválidas. Auditoría integrada en Electron real: aislamiento, permisos de Node, carpetas Windows, 10 familias Mermaid, fallos aislados, fórmulas, imágenes, HTML hostil, edición, formato, búsqueda, guardado en disco, temas, pestañas y tamaños. Capturas para claro, oscuro/dividido y compacto. npm audit comprueba dependencias; actualización de Mermaid de 11.12.0 a 11.17.2 resuelve los avisos detectados durante la investigación.

No se afirma edición WYSIWYG de bloques como Muya, importación DOCX, sincronización, colaboración, soporte total Pandoc ni ejecución de PlantUML/Graphviz. Las imágenes remotas se muestran como aviso; esta versión conserva un funcionamiento estrictamente local. El PDF imprime la vista de lectura. Narrator y DPI físicos múltiples necesitan una sesión manual adicional: la auditoría verifica DOM/ventana y capturas, no sustituye esas pruebas.
