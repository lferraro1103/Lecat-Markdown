# Auditoría de gráficos

Markdown técnico, diagramas y matemáticas en un solo documento.

## Diagrama de flujo

~~~mermaid
flowchart LR
    A[Carpetas] --> B[Markdown]
    B --> C[Lectura]
    B --> D[Gráficos]
~~~

## Gráfico de barras

~~~mermaid
xychart-beta
    title "Documentos por mes"
    x-axis [Ene, Feb, Mar, Abr]
    y-axis "Archivos" 0 --> 40
    bar [12, 23, 18, 35]
    line [12, 23, 18, 35]
~~~

## Distribución

~~~mermaid
pie title Biblioteca
    "Notas" : 45
    "Proyectos" : 35
    "Manuales" : 20
~~~

## Secuencia

~~~mermaid
sequenceDiagram
    participant U as Usuario
    participant L as Lector
    U->>L: Abrir documento
    L-->>U: Mostrar Markdown y gráficos
~~~

## Clases

~~~mermaid
classDiagram
    class Documento {
        +String nombre
        +abrir()
    }
    class Lector {
        +renderizar()
    }
    Lector --> Documento
~~~

## Entidades

~~~mermaid
erDiagram
    CARPETA ||--o{ DOCUMENTO : contiene
    DOCUMENTO {
        string nombre
        string contenido
    }
~~~

## Estados

~~~mermaid
stateDiagram-v2
    [*] --> Listo
    Listo --> Leyendo: Abrir
    Leyendo --> Listo: Cerrar
~~~

## Planificación

~~~mermaid
gantt
    title Implementación
    dateFormat YYYY-MM-DD
    section Diseño
    Investigar :a1, 2026-10-02, 2d
    Diseñar :after a1, 2d
~~~

## Mapa mental

~~~mermaid
mindmap
    root((Claro MD))
        Explorar
            Carpetas
            Discos
        Leer
            Notas
            Gráficos
~~~

## Línea de tiempo

~~~mermaid
timeline
    title Evolución
    2026 : Lector
         : Diagramas
    2027 : Nuevas ideas
~~~

## Fórmulas

La energía es $E = mc^2$.

$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$

## Código

~~~csharp
var documentos = Directory.GetFiles(ruta, "*.md");
foreach (var documento in documentos)
    Console.WriteLine(documento);
~~~

## Imágenes locales

![Gráfico SVG](pixel.svg)

![Icono PNG con espacios y acento](imagen%20%C3%A1%20con%20espacios.png)

## Tabla y tareas

| Función | Lectura | Estado |
|---|---|---|
| Markdown | Encabezados, listas, enlaces y tablas | Listo |
| Gráficos | Mermaid y SVG | Listo |
| Matemáticas | Fórmulas inline y bloque | Listo |

- [x] Navegar por discos
- [x] Leer gráficos
- [ ] Explorar más documentos

## Error recuperable

~~~mermaid
this is not a supported diagram type!!!
~~~

El párrafo después de un diagrama inválido debe seguir siendo legible.

## Seguridad

<script>window.__injected = true</script>

[Enlace inseguro](javascript:alert(1))

## Final

**Unicode:** ñ, á, 漢字, Ελληνικά.

