# Default macOS folder is the user's home

GSD quick inline. Work on develop, preserving main.

1. Resolve the macOS default folder with Electron's user-home path. Return it in
   bootstrap and use it for startup browsing and saving new documents. Existing
   document paths continue to select their containing directory.
2. Filter Time Machine and Recovery volumes by APFS roles, names and legacy
   backup-directory markers; deduplicate root/symlinks by realpath and inode.
   Show the actual startup volume name instead of a second generic Sistema entry.
3. Publish rebuilt native ARM64/Intel packages under v3.2.0-macos.4 using the
   existing Actions pipeline. Update release links and notes.
4. Record publication, CI results and remaining damaged-app diagnosis in STATE
   and SUMMARY. No additional tests are added or run locally.
