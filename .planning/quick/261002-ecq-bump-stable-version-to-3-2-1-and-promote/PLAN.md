# Bump to 3.2.1 and promote develop to main

GSD quick inline. The user's explicit request to upload to main supersedes the
earlier restriction against modifying main.

1. Remove the desktop prerelease suffix from application and root lockfile
   versions, update source-version documentation and GSD product state.
2. Commit on develop, push it, fast-forward main to include all authorized desktop
   changes and push main without rewriting history.
3. Confirm remote branches and record completion. No new binary release or tag is
   requested in this step; existing downloaded assets retain their original version.
