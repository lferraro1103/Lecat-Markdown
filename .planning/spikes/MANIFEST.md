# Spike Manifest

## Ideas

### macos-gui-approval

Investigate opening Lecat Markdown through native macOS approval without Developer ID
or user-entered Terminal commands. Use GSD spike --quick inline.

Requirements:
- Keep main untouched; research on develop.
- Do not disable Gatekeeper, clear quarantine or automatically override malware warnings.
- Distinguish integrity signatures, Gatekeeper trust and XProtect detections.
- User reports a warning that the app will damage the computer and offers deletion.
- Do not claim the existing CI functional audit tested browser-download trust.

## Spikes

| # | Idea | Name | Type | Validates | Verdict | Tags |
|---|------|------|------|-----------|---------|------|
| 001 | macos-gui-approval | gatekeeper-without-developer-id | comparison | Native Open Anyway observed on macOS 15 ARM/Intel and 26 ARM; real-browser user launch remains unverified | PARTIAL | macos, gatekeeper, quarantine |
