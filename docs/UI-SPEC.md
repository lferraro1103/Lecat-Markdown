---
phase: 2
status: approved
created: 2026-10-02
---
# Claro MD — UI design contract
Stack: native WinForms .NET 8 plus offline WebView2 preview. No third-party design registry.
Identity: original vector document/Markdown icon, multi-resolution ICO embedded in executable.
## Tokens
Spacing 4/8/12/16/24/32/48; 1px divider exception. Tool buttons 36–40px; file rows 48px.
Font Segoe UI 10.5pt, secondary 9pt, document title 16pt; preview 17px/1.75, monospace Consolas.
Light shell #F5F7FA, panel #F8FAFC, canvas #FFFFFF, text #243044, muted #586579, accent #2563EB.
Dark shell #161B22, panel #1C232D, canvas #11161D, text #E4EBF5, muted #A8B6C8, accent #8BB5FF.
Accent only brand, active state, links and selection.
## Surfaces
Native menu: Archivo, Navegación, Vista, Ayuda, keyboard mnemonics.
Navigation bar: back/forward/up, flexible editable address, refresh, folder/open commands.
Sidebar: Acceso rápido (actual known folders + available Shell shortcuts), separator, Este equipo drives; lazy tree.
Files: filter, count, document icon, filename/size, selected state, empty/error messages.
Document: title/path; Lectura/Código exclusive modes; Índice, search, zoom, theme.
Reading: comfortable measure, horizontal overflow for tables/code/diagrams; error fallback for diagrams/images.
## Copy
Primary: Abrir Markdown. Empty: No hay documentos Markdown / Abrí otra carpeta para encontrar tus archivos.
Filtered empty: Sin coincidencias / Probá con otro nombre.
Preview welcome: Tu biblioteca, a mano.
Error: No se pudo abrir la carpeta. Revisá la ruta o los permisos.
## UI Considerations
- Navigation has empty/loading/error/overflow/long-text coverage; disabled history commands reflect availability.
- File collection has zero/one/many, filtering, oversized title ellipsis and scroll; busy does not erase current document.
- Preview media has loaded/error/remote-blocked fallback, isolated diagram failure, zoom and scrolling.
- Controls have native keyboard focus, accessible names and 36px targets; small-window actions overflow.
- Document title and path truncate with tooltip; reading body wraps.
## Checker sign-off (inline)
Copywriting PASS; visuals PASS; colors PASS pending measured contrast; typography PASS;
spacing PASS; registry safety N/A; inventory provenance N/A (no design-system package).
Acceptance requires concrete integration tests and screenshot review before final delivery.
