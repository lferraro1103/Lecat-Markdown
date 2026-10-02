# Publish v3.2.0-macos.3

GSD quick, inline execution. User explicitly requests a different release version.
Use develop, keep main unchanged, retain ad-hoc signing without Developer ID.

1. Set app/lockfile version to 3.2.0-macos.3 so newly built ZIP/DMG filenames
   distinguish this release from .2. Update README, release notes and workflow title.
2. Commit and push develop, create the new tag, and let native ARM64/Intel Actions
   build and publish six assets after the existing pipeline verification gates.
3. Check successful run and published assets; record commit/run/release in SUMMARY
   and STATE. Do not claim the user's damaged-app warning is fixed by a rebuild.
