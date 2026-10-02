const {build}=require('./package.json');
const {identity: _adHocIdentity,...mac}=build.mac;

// Import CSC_LINK into the CI keychain and select a Developer ID certificate.
// Never silently fall back to an unsigned or ad-hoc distributable.
module.exports={
 ...build,
 forceCodeSigning:true,
 mac:{
  ...mac,
  type:'distribution',
  hardenedRuntime:true,
  entitlements:'build/entitlements.developer-id.plist',
  entitlementsInherit:'build/entitlements.developer-id.plist',
  notarize:false,
 },
};
