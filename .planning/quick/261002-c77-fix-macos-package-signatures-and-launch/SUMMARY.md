---
status: complete
date: 2026-10-02
branch: develop
commit: 3ce4538
tag: v3.2.0-macos.2
---

# macOS package signing correction

The previous release configured mac.identity=null, skipping app signing. Its
CI audit ran directly from the packaging directory, which did not establish
signature validity of downloaded containers or Gatekeeper acceptance.

Changed identity to explicit ad-hoc signing. Added strict/deep codesign checks
on the extracted ZIP, mounted DMG and installed copy, compared app.asar payloads,
and ran the existing Electron audit from the copied app. No global macOS security
setting is changed. Documented a per-app quarantine removal after signature
verification because the user has no Open Anyway button.

Native Actions verification succeeded on ARM64 and Intel: 12 unit tests, 80
functional audit checks and 3 package/signature checks for each architecture.

- Run: https://github.com/lferraro1103/Lecat-Markdown/actions/runs/37003112459
- Release: https://github.com/lferraro1103/Lecat-Markdown/releases/tag/v3.2.0-macos.2
- Six assets uploaded: two DMGs, two ZIPs and two SHA256 manifests.
- Previous release marked replaced and linked to the corrected release.
- Main remains 3e8d843; all changes committed to develop.

No Developer ID credentials or notarization secrets are configured. Ad-hoc signing
provides package integrity, not Apple certification or automatic Gatekeeper trust.
Confirmation on the user's Mac remains a human check after reinstalling and following
the targeted instructions. No claim of Gatekeeper approval is made.
