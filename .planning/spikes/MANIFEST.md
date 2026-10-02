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
| 001 | macos-gui-approval | gatekeeper-without-developer-id | comparison | Given quarantined release and an invalid-signature control, when LaunchServices assesses them, then distinguish integrity from trust and evaluate CI reliability | PENDING | macos, gatekeeper, quarantine |
