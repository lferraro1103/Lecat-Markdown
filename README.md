# Lecat — Markdown

**English** · [Español](README.es.md)

An offline Markdown editor and reader for Windows and macOS. Write directly in the rendered document, browse local folders, and work with diagrams, equations, tables, and images in one desktop app.

[Download the latest release](https://github.com/lferraro1103/Lecat-Markdown/releases/latest) · [Release notes](https://github.com/lferraro1103/Lecat-Markdown/releases)

## Features

- **Visual editing:** edit rendered headings, paragraphs, lists, and tables with formatting tools, undo/redo, and find/replace.
- **Three document modes:** visual editing, reading, and Markdown source with a preview.
- **Local file explorer:** browse folders and drives, filter entries, and use Windows quick-access locations.
- **Rich Markdown:** Mermaid diagrams, LaTeX math with KaTeX, syntax-highlighted code, task lists, tables, and local images.
- **Document tools:** tabs, Save As, an outline, focus mode, zoom, SVG diagram export, and PDF export.
- **Session restore:** reopen the files you left open and return to the last selected tab; welcome appears only on first use.
- **Settings:** eight interface languages and an optional beta update channel.
- **Navigation:** native macOS file selection, Windows folder history, integrated Mac tabs and floating formatting tools.
- **Updates:** check for public releases, download, and restart to update the installed Windows app.
- **Local recovery:** recover unsaved drafts and detect external changes before overwriting a file.
- **Appearance:** light, dark, and system themes, applied before the window appears.

Electron and Chromium are included. Reading, editing, and rendering local documents work without an internet connection, an account, WebView2, or .NET. Opening web links and downloading updates require internet access.

## Download and installation

The current stable version is **3.3.0**.

| Platform | Download | Installation |
| --- | --- | --- |
| Windows 10/11, x64 | `Setup-x64.exe` | Run the installer to choose the destination and create shortcuts. |
| Windows 10/11, x64 | `Windows-x64.zip` | Extract the complete ZIP and open `Lecat - Markdown.exe`. Keep all bundled files together. |
| macOS 13 or later, Apple Silicon | `macOS-arm64.dmg` or `.zip` | Move the app to Applications before opening it. |
| macOS 13 or later, Intel | `macOS-x64.dmg` or `.zip` | Move the app to Applications before opening it. |

For **macOS 12 Monterey**, use the separate [3.3.0-macos12.1 release](https://github.com/lferraro1103/Lecat-Markdown/releases/tag/v3.3.0-macos12.1). It uses a different Electron version and is maintained on `developer-macos12`.

macOS packages have ad-hoc integrity signatures; they are not Developer ID signed or notarized. See the [macOS installation notes](docs/RELEASE-MACOS.md) and [signing documentation](docs/FIRMA-MACOS.md) for details. Release assets include SHA256 checksums.

## Editing workflow

Open a Markdown file or create a new document. **Visual editing** is the default: click a heading, paragraph, list, or table cell and type directly in the document. Switch to **Reading** to view it, or **Code** to work with Markdown source and its preview.

Diagrams and equations are rendered in the document. Use **Edit diagram**, or click an equation, to change the corresponding source in a focused dialog. Unmodified blocks retain their original Markdown; edited blocks are serialized back to Markdown.

Saving is explicit. The original file changes only when you save. If another application changes it, Lecat reports the conflict and lets you save a separate copy.

## Keyboard shortcuts

Use `Ctrl` on Windows and `⌘` on macOS.

| Action | Shortcut |
| --- | --- |
| New document / open file / open folder | Ctrl+N / Ctrl+O / Ctrl+Shift+O |
| Save / Save As | Ctrl+S / Ctrl+Shift+S |
| Close tab | Ctrl+W |
| Reading / visual editing / source and preview | Ctrl+1 / Ctrl+2 / Ctrl+3 |
| Find and replace | Ctrl+F |
| Bold / italic | Ctrl+B / Ctrl+I |
| Focus mode / toggle theme | Ctrl+Shift+F / Ctrl+Shift+T |
| Export PDF | Ctrl+Alt+P |
| Zoom in / zoom out / reset | Ctrl+Plus / Ctrl+Minus / Ctrl+0 |

Choose **Vista → Usar tema del sistema** (View → Use system theme) to restore automatic theme selection after choosing light or dark manually.

## Data and supported formats

Preferences and recovery drafts are stored locally in `%APPDATA%/ClaroMD` on Windows and `~/Library/Application Support/ClaroMD` on macOS. The legacy folder name is retained for compatibility. There is no cloud synchronization or telemetry.

Lecat supports UTF-8, UTF-8 BOM, and UTF-16 LE, preserving CRLF line endings. Documents are limited to 20 MB. UTF-16 BE and invalid UTF-8 are rejected to prevent data corruption.

Remote images are not downloaded automatically. Web links open only when clicked. Markdown scripts do not execute. Mermaid errors are isolated to their blocks; PlantUML and Graphviz blocks are displayed as source code.

## Development

Requirements: Node.js **22.12 or later**, npm, and a supported desktop platform.

```sh
npm ci
node scripts/prepare-electron.cjs
npm test
npm start
```

```sh
npm run audit         # Real Electron integration audit
npm run dist          # Windows portable distribution
npm run installer     # Windows installer
npm run dist:mac -- --arm64  # macOS Apple Silicon packages
npm run dist:mac -- --x64    # macOS Intel packages
```

The application entry point is `electron/`. The `src/` directory contains the historical WinForms/WebView2 implementation.

Audit screenshots and results are generated in `docs/previews/electron` and excluded from Git because they may contain local paths. Dependencies are pinned in `package-lock.json`.


## Licensing

The distributed application's terms are in [LICENCIA.txt](build/LICENCIA.txt). Public repository access does not itself grant a license to the project source code.

Third-party libraries retain their respective licenses. The build generates bundled notices in `electron/ui/THIRD-PARTY-LICENSES.txt`; distributed packages also include Electron and Chromium notices.
