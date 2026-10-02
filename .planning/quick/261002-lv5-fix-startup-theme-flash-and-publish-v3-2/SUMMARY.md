---
status: complete
---
# Startup theme flash correction

Cause: BrowserWindow always used a light background; its first show occurred at loadFile completion, before the slow bootstrap (Windows locations/recovery) applied the saved theme.

Fix: nativeTheme resolves the persisted/system preference before creating the window; matching background and validated preload startup argument are applied. A local head script selects root CSS theme synchronously before styles/renderer. Window remains hidden until renderer initialization and two animation frames. System/manual changes update root and body together. macOS activation and second-instance events cannot expose an uninitialized window; initial files remain queued.

Verification: 12 unit tests passed; 84 Electron integration checks passed independently in dark, light and system modes (252 checks total). Startup audits check hidden state, native background, CSS theme before asynchronous bootstrap, and final renderer/native agreement; first visible-frame dark/light captures inspected. Existing diagram, math, WYSIWYG, security and persistence checks pass. npm ci: zero vulnerabilities.

Publishing: 3.2.2 version and stable release notes prepared for existing Windows/macOS tag workflow.

Published: v3.2.2 stable confirmed by GitHub /releases/latest. Desktop workflow 37050126373 completed successfully: Windows x64 installer/portable, macOS ARM64/Intel packages and package audits. Nine assets published with SHA256. Release source commit b1bb7c6. No automatic installation performed.
