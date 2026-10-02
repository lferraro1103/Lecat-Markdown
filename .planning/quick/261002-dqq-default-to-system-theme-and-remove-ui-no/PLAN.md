# System theme and uncluttered desktop UI

GSD quick inline; work on develop, keep main untouched.

1. Default Windows/macOS to native system theme and follow live updates while
   retaining later manual overrides. Add a menu action to restore system mode.
   On first launch use system theme; preserve existing manual preferences.
2. Remove the sidebar local-data notice and footer offline/Electron notice.
3. Recognize leading YAML front matter before Markdown horizontal-rule parsing;
   render title/subtitle safely and preserve the complete raw metadata block in
   the visual editor. Handle CRLF and closing-delimiter trailing spaces.
4. Compile updated Windows installer/portable and macOS ARM64/Intel ZIP/DMG
   through a tag-triggered Actions workflow and publish v3.2.1-desktop.1 as an
   alternative prerelease. Existing build verification gates remain; no new tests.
5. Confirm publication and record CI/release results in SUMMARY and STATE.
