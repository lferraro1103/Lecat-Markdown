---
mode: quick
status: planned
---
# Fix startup theme flash and publish 3.2.2

Inline GSD quick --validate execution, per Codex skill adapter; no subagents requested.

1. Apply persisted/system theme before first renderer paint: validated native theme passed through sandboxed preload, synchronous head script before CSS, matching native background. Keep window hidden until renderer initialization and a painted frame. Preserve theme switching, settings and document handling.
2. Verify startup dark/light/system, slow asynchronous initialization, visual editor, diagrams, persistence and security through Electron integration audits and unit tests. Record screenshots and results.
3. Bump to 3.2.2, update release notes, commit atomically, push main and tag; existing desktop workflow builds Windows/macOS and publishes stable release. Verify workflow and published assets.

Plan review: PASS. Files and build pipeline exist; first-frame checks cover both native and renderer backgrounds. No profile deletion or automatic installation. Startup IPC remains restricted to existing API.
