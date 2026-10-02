# Claro MD 2

Tu biblioteca, a mano. Explorá las carpetas de Windows y leé Markdown con una interfaz tranquila.

## Empezá por tu disco

**Acceso rápido** reúne Escritorio, Descargas, Documentos, Imágenes, Música y Vídeos.
Debajo de la línea divisoria están las unidades de **Este equipo**.
En **Más accesos de Windows** se muestran otros lugares disponibles en el acceso rápido del sistema.

Usá la barra superior para entrar a una ruta, ir atrás o subir una carpeta.
Los menús tienen todas las acciones y sus atajos.

## Ideas que se ven

~~~mermaid
flowchart LR
    A[Explorá tus carpetas] --> B[Abrí un Markdown]
    B --> C[Leé tus ideas]
    B --> D[Visualizá los gráficos]
~~~

Cada gráfico ofrece **Código**, **Ampliar** y **Guardar SVG**.

### Tu biblioteca

~~~mermaid
pie title Documentos
    "Notas" : 45
    "Proyectos" : 35
    "Manuales" : 20
~~~

### Cambios por mes

~~~mermaid
xychart-beta
    title "Documentos por mes"
    x-axis [Ene, Feb, Mar, Abr]
    y-axis "Archivos" 0 --> 40
    bar [12, 23, 18, 35]
    line [12, 23, 18, 35]
~~~

## Matemáticas y código

La energía es $E=mc^2$.

~~~csharp
var archivos = Directory.GetFiles(carpeta, "*.md");
Console.WriteLine(archivos.Length);
~~~

## Un icono propio

![Icono de Claro MD](../branding/ClaroMD.png)

## A tu manera

| Acción | Atajo |
|---|---|
| Abrir un Markdown | Ctrl+O |
| Ir a una carpeta | Ctrl+L |
| Lectura / código | Ctrl+1 / Ctrl+2 |
| Buscar texto | Ctrl+F |
| Mostrar índice | Ctrl+Mayús+I |
| Cambiar tema | Ctrl+T |
| Ajustar tamaño | Ctrl++ / Ctrl+- |
| Actualizar | F5 |

Los documentos se leen sin modificar los archivos.
Los gráficos funcionan sin conexión; las imágenes remotas se habilitan desde el menú Vista.
