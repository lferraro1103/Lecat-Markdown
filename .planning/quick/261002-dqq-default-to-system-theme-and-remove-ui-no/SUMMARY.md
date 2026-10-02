---
status: complete
date: 2026-10-02
branch: develop
commit: 94ddac3a3e8e141565725771ed06ce6a721e634f
---

# Desktop theme, UI notices and YAML front matter

On first launch, missing theme preference resolves to system. Native theme
updates reach the renderer while following the OS; manual light/dark choices
persist and Vista / Usar tema del sistema restores auto mode. Existing manual
preferences are preserved per the user's first-launch clarification.

Removed the sidebar Todo queda en tu equipo notice and Sin conexión / Electron
footer notice in the shared Windows/macOS interface.

Added a Markdown block rule before horizontal-rule parsing for leading YAML
front matter, including CRLF, closing delimiter whitespace and YAML end markers.
The title/subtitle render as escaped heading/subtitle text in reading, visual
editing and PDF. The visual editor retains raw metadata in its existing lossless
atom and provides Editar metadatos. Pinned YAML 2.9.1 with failsafe schema and
disabled aliases; malformed metadata falls back to escaped source display.

Added desktop.yml to build and publish Windows installer/portable, macOS ARM64
and Intel DMG/ZIP, and three checksum manifests together. Nine public assets
confirmed on alternative prerelease v3.2.1-desktop.1.

Release: https://github.com/lferraro1103/Lecat-Markdown/releases/tag/v3.2.1-desktop.1
Actions: https://github.com/lferraro1103/Lecat-Markdown/actions/runs/37010272493

All three native builds and publication completed successfully. Existing unit
tests, Windows app audit and macOS distributed-package signature/copy audits
passed. No new tests were added; these existing audits do not explicitly cover
the user's YAML fixture or first-launch OS-theme switching on their machines.
Main remains 3e8d8431963908766a416eb58ffd0961f25ee07c.
The previous damaged-app warning remains a separate unresolved diagnosis.
