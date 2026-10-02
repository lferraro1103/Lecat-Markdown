---
status: incomplete
date: 2026-10-02
branch: develop
---

# Developer ID signing preparation

Prepared a separate signed-build configuration requiring a real Developer ID
Application certificate, Hardened Runtime and Electron JIT entitlements. Added
signed tag routing, certificate-secret validation and Developer ID authority checks
for the distributed app. New signed-release instructions use only macOS GUI actions.

Static validation passed: configuration has forceCodeSigning=true and no ad-hoc
identity, original ad-hoc mode is preserved, YAML parses, secret absence exits with
failure and release depends on successful builds. Bash and JavaScript syntax pass.

Publication is pending the owner's Apple Developer signing credentials. No new
signed build or release was attempted and no Gatekeeper acceptance is claimed.
Asked whether the owner has a Developer ID Application certificate; no answer yet.

Required Actions secrets:
- MACOS_CERTIFICATE_P12: base64-encoded certificate and private key exported as p12.
- MACOS_CERTIFICATE_PASSWORD: export password.

Once configured, build tag v3.2.0-macos-signed.1 from develop and confirm the GUI
Open Anyway path on a Mac downloading the resulting package through a browser.
The app cannot programmatically force a Gatekeeper approval button.
