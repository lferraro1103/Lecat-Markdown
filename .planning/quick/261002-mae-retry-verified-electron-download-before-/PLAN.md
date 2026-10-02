# CI Electron download recovery

GSD quick --validate, inline per Codex adapter.

Plan: run the official locked Electron installer explicitly before audits/builds, retry transient failures at most three times with bounded backoff, retain bundled SHA256 validation, and fail CI after exhaustion. Apply to Windows and desktop/macOS release workflows. Verify retry behavior, permanent failure, exceptions and successful installation; then push and observe Windows CI.

Plan review: passed. No mirrors, version changes, security bypasses or app runtime edits. The application release remains 3.2.2.
