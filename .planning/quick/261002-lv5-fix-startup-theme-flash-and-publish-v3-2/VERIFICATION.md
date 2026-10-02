---
status: passed
---
# Verification

Requirement: open directly in selected/system theme without a white flash.

PASS: resolved theme passed from main through sandboxed preload before CSS.
PASS: native window background matches dark/light renderer theme.
PASS: window remains hidden while asynchronous bootstrap enumerates Windows locations.
PASS: initial display follows initialization and two rendering frames.
PASS: manual preference and system theme switching preserve settings and content.
PASS: dark, light and system integration runs: 84 checks each; 12 unit tests.
PASS: first-frame screenshots visually inspected; documents/graphs/editor render normally.
PASS: no remote loading, unsafe IPC or profile changes introduced.

Local Windows verified. macOS package verification is delegated to the existing CI release matrix; no physical macOS session was claimed.
