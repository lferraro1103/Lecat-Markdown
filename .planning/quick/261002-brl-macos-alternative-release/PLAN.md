# macOS alternative release

Execute GSD quick inline as allowed by the Codex adapter. User requests autonomous
execution and authorizes publishing. All commits and tags originate on `develop`.

1. Adapt menu, file opening, path identity, macOS window lifecycle and shortcut labels.
2. Configure unsigned macOS DMG/ZIP packaging and architecture-specific Actions builds.
3. Run existing tests and audit each packaged architecture on a native runner.
4. Publish separate prerelease v3.2.0-macos.1 only after both builds pass; include hashes.
5. Record actual build/release evidence in SUMMARY.md and STATE.md.

Apple signing credentials are unavailable: document unsigned distribution accurately.
