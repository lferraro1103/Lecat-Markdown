---
status: human_needed
---

# Verification

Verified in native macOS Actions jobs 110825101342 (ARM64) and 110825101571 (Intel).

| Requirement | Evidence | Result |
|---|---|---|
| Explicit bundle signature | builder logs identityName=-; extracted app reports Signature=adhoc | Passed |
| Distributed ZIP signature | codesign deep/strict succeeds | Passed |
| DMG signature and payload | codesign succeeds; app.asar matches ZIP | Passed |
| Copied installation launches | codesign succeeds; 80 Electron audit checks pass from copied app | Passed |
| Publish corrected packages | workflow 37003112459 successful; six release assets present | Passed |
| Preserve main | changes stay on develop | Passed |
| Open on user's Mac | user must replace old copy and follow app-specific first-open instructions | Human needed |

Gatekeeper behavior after browser quarantine was not reproduced in the headless
CI job. The packages are not Developer ID signed or notarized. The scoped xattr
instructions are documented as a manual user action, not advertised as Apple approval.
