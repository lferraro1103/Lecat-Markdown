---
status: complete
date: 2026-10-02
branch: main
commit: 37172a1
---

# Version 3.2.1 promoted to main

User explicitly authorized main promotion, superseding the earlier restriction.
Updated package.json and root package-lock.json versions from 3.2.1-desktop.1
to 3.2.1, README source-version note and GSD product state.

Committed the bump as 37172a1 on develop and pushed it. Main was an ancestor of
develop and fast-forwarded from 3e8d843 to 37172a1 without rewriting history;
origin/main push succeeded. Includes all desktop theme, YAML, macOS directory
and disk-list changes from the previously compiled prerelease.

No local tests were run or new binary release/tag created for this request.
Existing prerelease downloads keep their original version. The earlier damaged
macOS warning remains an independent unresolved diagnosis.
