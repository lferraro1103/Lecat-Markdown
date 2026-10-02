---
status: complete
date: 2026-10-02
branch: develop
commit: ef90ec41692cffc3154c1bf8caffc33346b517da
---

# Published v3.2.0-macos.3

Updated application and root lockfile version to 3.2.0-macos.3, workflow release
title to use the tag, README download link and GUI-only release instructions.
Pushed develop and new tag; existing native Actions pipeline rebuilt both
architectures and published the alternative prerelease.

Run: https://github.com/lferraro1103/Lecat-Markdown/actions/runs/37007113991
Release: https://github.com/lferraro1103/Lecat-Markdown/releases/tag/v3.2.0-macos.3

ARM64 build 110837893007, Intel build 110837892747 and release job 110838934977
all completed successfully. Existing unit tests, distributed ZIP/DMG signature
checks, installed-copy signature verification and application audit passed.
Published four newly compiled application files named
Lecat-Markdown-3.2.0-macos.3-macOS-{arm64,x64}.{dmg,zip}, plus two SHA256 manifests.
Six public release assets were confirmed through the GitHub API.

Ad-hoc signing retained. No Developer ID needed for the build. The user's specific
damaged-app warning remains unverified and no fix for it is claimed by this rebuild.
Main remains 3e8d8431963908766a416eb58ffd0961f25ee07c.
