---
spike: 001
idea: macos-gui-approval
name: gatekeeper-without-developer-id
type: comparison
validates: Given a downloaded ad-hoc app and an invalid-signature control, distinguish integrity, Gatekeeper trust and malware detection without security overrides
verdict: PARTIAL
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

**Native approval button observed.** Research run
[37005730897](https://github.com/lferraro1103/Lecat-Markdown/actions/runs/37005730897)
completed successfully on all three runners, using the already-published macos.2
ZIP without rebuilding or changing its signature. Checksums matched and strict
deep signature verification passed on each runner. The negative control failed
integrity verification as intended.

| System | Architecture | Initial warning | After Done, Privacy & Security |
|---|---|---|---|
| macOS 15.7.9 | ARM64 | Apple could not verify the app is free of malware; Move to Trash / Done | Open Anyway for Lecat - Markdown |
| macOS 15.7.9 | Intel | Same unverified-app warning | Open Anyway for Lecat - Markdown |
| macOS 26.6.2 | ARM64 | Same unverified-app warning | Open Anyway for Lecat - Markdown |

Screenshots in [evidence](evidence/) show the actual native button. The first
attempt left the warning open; dismissing **Done** caused the exception row to
appear. No approval button was clicked, no quarantine was removed and Gatekeeper
remained enabled. `spctl` rejection is expected for an unnotarized ad-hoc app and
did not prevent macOS from offering a manual exception.

`syspolicy_check` also reported a missing notary ticket and an Internal Xprotect
Error. That internal error is not evidence of a named malware detection; the
observed native UI identified the app as unverified and offered an exception.
It does not establish that a user's genuinely different harmful-software warning
is a false positive. Raw diagnostics remain in the Actions artifacts.

**Limits / verdict PARTIAL:** the presence of the native approval button is
validated in these CI environments. Quarantine was applied through Apple's public
API, rather than a Safari/Chrome download. The complete manual authorization and
launch on the user's Mac remains unverified, including their exact warning text.
No new binary release is needed to obtain this observed button: use macos.2.

## User path

Download macos.2 for the correct architecture. Extract the ZIP in Finder (or mount
the DMG), move the app to Applications, try opening it, choose **Done** on the
unverified-app warning, then **System Settings → Privacy & Security → Security →
Open Anyway**. Confirm the native prompt if offered. No paid certificate or user
Terminal commands are involved. Apple's support page documents this exception.
