# Fix macOS package signatures and launch

GSD quick --validate, inline per adapter. Branch develop; main stays untouched.

1. Replace signing suppression with explicit ad-hoc signing. Existing CI audited
   the working bundle but did not validate the signature of a downloaded container.
   Files: package.json. Verify: builder signs and codesign verifies native bundles.
2. Verify ZIP extraction, mounted DMG and copied app using codesign deep/strict;
   audit the installed copy on Intel and Apple Silicon before release publication.
   Files: scripts/verify-macos.sh, .github/workflows/macos.yml.
3. Publish v3.2.0-macos.2; update download links and document the scoped manual
   quarantine removal for this project when Open Anyway is unavailable.
   Files: docs/RELEASE-MACOS.md, README.md and GSD state/summary/verification.

Repository has no Actions secrets. Developer ID signing/notarization cannot be
completed with available credentials. Ad-hoc integrity does not confer Apple trust:
describe this limitation and do not claim Gatekeeper approval.

## Plan check (inline)

Coverage: fixes unsigned package integrity and gives the user a specific first-open
path. Validation targets the actual distributed containers and the copied app.
Scope and references pass. Human confirmation is still needed on the user's Mac.
