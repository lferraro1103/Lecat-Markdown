#!/bin/bash
set -euo pipefail

# Inspect the distributed containers, not just electron-builder's working copy.
arch=${1:?Pass arm64 or x64}
signing=${2:-adhoc}
case "$arch" in arm64|x64) ;; *) echo "Unsupported architecture" >&2; exit 1;; esac
case "$signing" in adhoc|developer-id) ;; *) echo "Unsupported signing mode" >&2; exit 1;; esac
version=$(node -p 'require("./package.json").version')
base="dist/Lecat-Markdown-${version}-macOS-${arch}"
scratch=$(mktemp -d "${RUNNER_TEMP:-${TMPDIR:-/tmp}}/lecat-verify.XXXXXX")
mounted=false
cleanup() {
  if $mounted; then hdiutil detach "$scratch/mounted" -quiet || true; fi
  rm -rf "$scratch"
}
trap cleanup EXIT

ditto -x -k "$base.zip" "$scratch/zip"
zip_app="$scratch/zip/Lecat - Markdown.app"
codesign --verify --deep --strict --verbose=2 "$zip_app"
codesign --display --verbose=4 "$zip_app" 2>&1 | tee "$scratch/signature.txt"
if [ "$signing" = developer-id ]; then
  grep -q '^Authority=Developer ID Application:' "$scratch/signature.txt"
  grep -Eq '^TeamIdentifier=[A-Z0-9]+$' "$scratch/signature.txt"
  echo 'PASS ZIP has a valid Developer ID signature'
else
  grep -q 'Signature=adhoc' "$scratch/signature.txt"
  echo 'PASS ZIP has a valid ad-hoc signature'
fi

hdiutil verify "$base.dmg"
mkdir "$scratch/mounted"
hdiutil attach "$base.dmg" -readonly -nobrowse -mountpoint "$scratch/mounted"
mounted=true
dmg_app="$scratch/mounted/Lecat - Markdown.app"
codesign --verify --deep --strict --verbose=2 "$dmg_app"
cmp "$zip_app/Contents/Resources/app.asar" "$dmg_app/Contents/Resources/app.asar"
echo 'PASS DMG signature and application payload match the ZIP'

# Test an installed copy after copying out of the mounted disk image.
ditto "$dmg_app" "$scratch/installed/Lecat - Markdown.app"
installed_app="$scratch/installed/Lecat - Markdown.app"
hdiutil detach "$scratch/mounted" -quiet
mounted=false
codesign --verify --deep --strict --verbose=2 "$installed_app"
echo 'PASS installed copy retains a valid signature'
"$installed_app/Contents/MacOS/Lecat - Markdown" --audit
