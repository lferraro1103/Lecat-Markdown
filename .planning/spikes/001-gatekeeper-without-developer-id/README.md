---
spike: 001
idea: macos-gui-approval
name: gatekeeper-without-developer-id
type: comparison
validates: Given a downloaded ad-hoc app and an invalid-signature control, distinguish integrity, Gatekeeper trust and malware detection without security overrides
verdict: PENDING
related: []
tags: [macos, gatekeeper, quarantine]
---

# Gatekeeper without Developer ID

## What This Validates

User wants GUI-only approval without paid Developer ID. They report a warning
that the application will damage the computer, with an option to delete it.
Do not assume this means only an unidentified developer.

## Research

- [Apple support](https://support.apple.com/102445) documents GUI approval for
  unidentified developers and distinguishes it from malware/revocation warnings.
- [macOS Sequoia change](https://developer.apple.com/news/?id=saqachfa): approval
  moved to Privacy & Security; Control-click is not the current override path.
- [Apple DTS diagnosis](https://developer.apple.com/forums/thread/706379): use
  distribution assessment and inspect trust failures; local development success
  does not establish download approval.
- [electron-builder signing guidance](https://github.com/electron-userland/electron-builder/blob/master/website/docs/features/code-signing/code-signing-mac.md)
  discusses ad-hoc signing and GUI approval, but assertions vary between releases.
- [Independent Electron experiment](https://github.com/brahm/corerules/blob/main/.scratch/v1-spec/issues/12-verify-adhoc-signed-macos-build.md)
  reports that copied ad-hoc binaries run on another Mac, while quarantine still
  blocks downloaded apps. This motivates testing; it is not proof for Lecat.

| Approach | Pros | Limits |
|---|---|---|
| Native Privacy & Security approval | No paid certificate or Terminal for user | Exact warning, OS and device policy matter |
| Ad-hoc signature | No paid certificate; verifies integrity and satisfies ARM execution checks | Does not itself make Gatekeeper trust the download |
| Self-signed certificate | No Developer ID | No established benefit for current Gatekeeper; must not ask user to trust a new root |
| Removing quarantine / helper app | Can avoid the download check | Does not satisfy the requested native approval path; excluded |

Chosen experiment: inspect existing macos.2 through native macOS assessment and
LaunchServices with simulated public-API quarantine, plus a damaged-signature
control. No new release, no certificate required and no quarantine removal.

## How to Run

Research workflow runs on develop for this spike's paths. Uses macOS 15 ARM64,
macOS 26 ARM64 and macOS 15 Intel. Outputs OS version, signature, security policy
diagnostics, LaunchServices results, security logs and screenshots when available.

## Observability

Launch events are JSON lines. Assessment exit codes and policy diagnostics are
stored separately. Published ZIP bytes must match the SHA256 manifest. If an
invalid-signature control launches, CI is not representative of browser Gatekeeper
enforcement and cannot validate the user's approval experience.

## Investigation Trail

Previous answer incorrectly treated Developer ID as universally required for
manual approval. Apple explicitly documents unidentified-developer exceptions.
The actual harmful-software warning needs separate diagnosis; terminal-based
quarantine removal is not an acceptable proposed fix for this spike.

## Results

Pending native experiment. Simulated quarantine is not a real Safari download;
even a successful launch does not establish a GUI authorization button.
