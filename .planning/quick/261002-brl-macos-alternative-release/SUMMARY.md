---
status: complete
date: 2026-10-02
branch: develop
commit: 6824ae4
tag: v3.2.0-macos.1
---

# macOS alternative release

Implemented through GSD quick inline, following the adapter's spawn restriction.
Created a scoped roadmap because the existing planning setup lacked ROADMAP.md.

Native Command menu shortcuts and labels, Finder open-file events queued until
renderer readiness, Dock activation, hide on window close and guarded application
quit. Filesystem identity is case sensitive outside Windows; root navigation and
mounted macOS volumes are supported. Markdown file associations and PNG app icon.

GitHub Actions uses macos-15 ARM64 and macos-15-intel x64. Both package DMG and ZIP,
test the packaged application, produce SHA256 manifests and gate publication.
The release is a prerelease and explicitly does not replace the latest stable release.

## Verification

- Local npm test: 12 passed; renderer build and JavaScript syntax checks passed.
- Native macOS ARM64: 12 tests and 80 packaged audit checks passed.
- Native macOS Intel: 12 tests and 80 packaged audit checks passed.
- Windows Actions builds on develop and tag also passed.
- Local Windows audit download stalled; stopped the two task-owned downloader/CLI
  processes after successful native CI audits. No local audit success is claimed.
- Workflow: https://github.com/lferraro1103/ClaroMD/actions/runs/37001654216
- Release: https://github.com/lferraro1103/ClaroMD/releases/tag/v3.2.0-macos.1
- Confirmed six uploaded assets: two DMGs, two ZIPs and two SHA256 manifests.
- Remote main remains 3e8d8431963908766a416eb58ffd0961f25ee07c.

## Limitations

No Apple Developer ID certificate or notarization; installation instructions explain
the macOS first-open approval. Automated audit verifies editor, rendering, persistence
and security behavior, but does not simulate a user clicking through Gatekeeper.
