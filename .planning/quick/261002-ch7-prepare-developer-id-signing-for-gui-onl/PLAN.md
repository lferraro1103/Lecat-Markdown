# Prepare Developer ID signing for GUI-only macOS authorization

GSD quick inline. Work remains on develop. The user requests GUI authorization
without a Terminal command; Gatekeeper policy is external to application code.

1. Add a separate Developer ID configuration with forceCodeSigning and Electron
   entitlements; retain existing ad-hoc build mode for already-published artifacts.
2. Add certificate-secret inputs and signed-tag workflow routing. Verify Developer ID
   authority in distributed containers and block publication when certificates are absent.
3. Document the user-facing GUI path and the repository owner's secret setup.
   Compile and publish only once actual signing credentials are configured.

Do not fabricate a trusted Apple certificate or advertise an ad-hoc package as
GUI-approved. Actual downloaded-app behavior still requires a manual macOS check.
