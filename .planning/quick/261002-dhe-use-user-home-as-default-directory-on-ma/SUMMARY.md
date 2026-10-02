---
status: complete
date: 2026-10-02
branch: develop
commit: 9a7a177e2c9da287ac5cbcb5e8f4487b9e058f95
---

# macOS home and disk list

macOS bootstrap now supplies the user's home as the default folder; the renderer
uses it when there is no existing document path. Saving new documents uses the
same default. Existing files retain their own containing folder.

Added and packaged macos-locations.cjs. Reads diskutil metadata with bounded
timeouts, filters APFS Backup/Recovery roles, Time Machine/Recovery names and
legacy Backups.backupdb directories. Deduplicates symlinks and root aliases by
realpath and device/inode. Displays the startup volume's actual name once.
Metadata lookup failures fall back to names and directory markers; arbitrary
renamed backup volumes require APFS role metadata to identify them reliably.

Published v3.2.0-macos.4 with six public assets: ARM64/Intel DMG and ZIP plus two
SHA256 manifests. Actions run 37008717187 completed successfully, including both
native builds, existing tests, strict container/copy signature checks and app audit.
No additional tests were added or run locally. CI does not contain the user's
Time Machine/Recovery mount layout, so that exact layout still needs user feedback.

Release: https://github.com/lferraro1103/Lecat-Markdown/releases/tag/v3.2.0-macos.4
Run: https://github.com/lferraro1103/Lecat-Markdown/actions/runs/37008717187

Main remains 3e8d8431963908766a416eb58ffd0961f25ee07c. Ad-hoc signing is retained;
the earlier damaged-app warning is a separate unresolved diagnosis.
