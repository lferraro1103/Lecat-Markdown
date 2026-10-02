#!/bin/bash
set -euo pipefail
arch=${1:?architecture}
case "$arch" in arm64|x64) ;; *) exit 2;; esac
spike=.planning/spikes/001-gatekeeper-without-developer-id
out=work/gatekeeper-probe
mkdir -p "$out"
sw_vers > "$out/system.txt"
uname -m >> "$out/system.txt"
spctl --status > "$out/gatekeeper-status.txt" 2>&1 || true
swiftc "$spike/launch.swift" -o "$out/launch"

base=https://github.com/lferraro1103/Lecat-Markdown/releases/download/v3.2.0-macos.2
asset="Lecat-Markdown-3.2.0-macOS-${arch}.zip"
curl --fail --location --retry 2 "$base/$asset" -o "$out/$asset"
curl --fail --location "$base/SHA256-macOS-${arch}.txt" -o "$out/hashes.txt"
expected=$(awk -v file="$asset" '$2 == file {print $1}' "$out/hashes.txt")
actual=$(shasum -a 256 "$out/$asset" | awk '{print $1}')
test -n "$expected" && test "$actual" = "$expected"
echo 'PASS release download matches published checksum'
ditto -x -k "$out/$asset" "$out/release"
app="$out/release/Lecat - Markdown.app"
codesign --verify --deep --strict --verbose=2 "$app" > "$out/integrity.txt" 2>&1
codesign --display --verbose=4 "$app" > "$out/signature.txt" 2>&1
codesign --display --entitlements - "$app" > "$out/entitlements.txt" 2>&1 || true
ditto "$app" "$out/control/Lecat - Markdown.app"
control="$out/control/Lecat - Markdown.app"
printf '\nSignature negative control\n' >> "$control/Contents/Resources/app.asar"
if codesign --verify --deep --strict "$control" > "$out/control-integrity.txt" 2>&1; then
  echo 'Negative control unexpectedly has a valid signature' >&2
  exit 1
fi

for variant in release control; do
  target="$out/$variant/Lecat - Markdown.app"
  # Assessment failure is an observation, not permission to change security settings.
  set +e
  spctl --assess --type execute --verbose=4 "$target" > "$out/$variant-assessment.txt" 2>&1
  echo "exit=$?" >> "$out/$variant-assessment.txt"
  syspolicy_check distribution "$target" > "$out/$variant-policy.txt" 2>&1
  echo "exit=$?" >> "$out/$variant-policy.txt"
  "$out/launch" "$(pwd)/$target" > "$out/$variant-launch.jsonl" 2>&1
  echo "exit=$?" >> "$out/$variant-launch.jsonl"
  xattr -l "$target" > "$out/$variant-attributes.txt" 2>&1
  screencapture -x "$out/$variant-screen.png" > "$out/$variant-screenshot-status.txt" 2>&1
  if [ "$variant" = release ]; then
    # Dismiss only the observed "Done" warning button; do not approve execution.
    osascript -e 'tell application "System Events" to tell process "CoreServicesUIAgent" to click button "Done" of window 1' > "$out/warning-dismissal.txt" 2>&1
    open 'x-apple.systempreferences:com.apple.settings.PrivacySecurity.extension?Security'
    sleep 5
    osascript -e 'tell application "System Settings" to activate' > "$out/settings-activation.txt" 2>&1
    sleep 2
    screencapture -x "$out/privacy-security-screen.png" > "$out/settings-screenshot-status.txt" 2>&1
    osascript -e 'tell application "System Events" to tell process "System Settings" to get entire contents of window 1' > "$out/settings-accessibility.txt" 2>&1
    osascript -e 'tell application "System Events" to tell process "System Settings" to get {name, description, value, enabled} of every button of entire contents of window 1' > "$out/settings-buttons.txt" 2>&1
  fi
  /usr/bin/log show --last 2m --style compact --predicate 'process == "syspolicyd" OR process CONTAINS "XProtect"' > "$out/$variant-security.log" 2>&1
  set -e
  cat "$out/$variant-assessment.txt" "$out/$variant-launch.jsonl"
done
# Artifacts contain only diagnostic data, not application downloads or private keys.
find "$out" -name '*.zip' -delete
rm -rf "$out/release" "$out/control"
