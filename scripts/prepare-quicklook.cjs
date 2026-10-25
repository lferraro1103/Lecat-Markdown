const fs=require('node:fs/promises'),path=require('node:path'),{execFileSync}=require('node:child_process');
async function prepare(arch=process.arch){
 if(process.platform!=='darwin')throw Error('Quick Look requires macOS');
 const root=path.resolve('.cache/quicklook-'+arch),project=path.join(root,'LecatQuickLook.xcodeproj');await fs.mkdir(project,{recursive:true});
 const quote=value=>JSON.stringify(value),native=path.resolve('native/quicklook');
 const version=require('../package.json').version.split('-')[0];
 const info=(await fs.readFile(path.join(native,'Info.plist'),'utf8')).replace('<key>CFBundleVersion</key><string>1</string>','<key>CFBundleVersion</key><string>'+version+'</string>').replace('<key>CFBundleShortVersionString</key><string>1.0</string>','<key>CFBundleShortVersionString</key><string>'+version+'</string>');
 const generatedInfo=path.join(root,'Info.plist');await fs.writeFile(generatedInfo,info);
 // A minimal native extension target lets Xcode supply the correct entry point
 // and SDK link flags. No project or source from another product is copied.
 const pbx=`// !$*UTF8*$!
{ archiveVersion = 1; classes = {}; objectVersion = 56; objects = {
A001 = {isa = PBXProject; buildConfigurationList = A010; compatibilityVersion = "Xcode 14.0"; mainGroup = A002; projectDirPath = ""; projectRoot = ""; targets = (A003); };
A002 = {isa = PBXGroup; children = (A004,A007); sourceTree = "<group>"; };
A003 = {isa = PBXNativeTarget; buildConfigurationList = A011; buildPhases = (A005,A006); buildRules = (); dependencies = (); name = LecatQuickLook; productName = LecatQuickLook; productReference = A004; productType = "com.apple.product-type.app-extension"; };
A004 = {isa = PBXFileReference; explicitFileType = "wrapper.app-extension"; includeInIndex = 0; path = LecatQuickLook.appex; sourceTree = BUILT_PRODUCTS_DIR; };
A005 = {isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = (A008); runOnlyForDeploymentPostprocessing = 0; };
A006 = {isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };
A007 = {isa = PBXFileReference; lastKnownFileType = sourcecode.c.objc; path = ${quote(path.join(native,'PreviewController.m'))}; sourceTree = "<absolute>"; };
A008 = {isa = PBXBuildFile; fileRef = A007; };
A010 = {isa = XCConfigurationList; buildConfigurations = (A012); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };
A011 = {isa = XCConfigurationList; buildConfigurations = (A013); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };
A012 = {isa = XCBuildConfiguration; name = Release; buildSettings = {SDKROOT = macosx; ALWAYS_SEARCH_USER_PATHS = NO; CLANG_ENABLE_OBJC_ARC = YES; MACOSX_DEPLOYMENT_TARGET = 12.0; }; };
A013 = {isa = XCBuildConfiguration; name = Release; buildSettings = {PRODUCT_NAME = LecatQuickLook; PRODUCT_BUNDLE_IDENTIFIER = com.lecat.markdown.quicklook; INFOPLIST_FILE = ${quote(generatedInfo)}; CODE_SIGNING_ALLOWED = NO; SKIP_INSTALL = YES; APPLICATION_EXTENSION_API_ONLY = YES; CLANG_ENABLE_OBJC_ARC = YES; OTHER_LDFLAGS = ("-framework",Cocoa,"-framework",Quartz,"-framework",WebKit); }; };
}; rootObject = A001; }`;
 await fs.writeFile(path.join(project,'project.pbxproj'),pbx.replace(/\bA[0-9]{3}\b/g,id=>id.padStart(24,'0')));
 execFileSync('xcodebuild',['-project',project,'-target','LecatQuickLook','-configuration','Release','-sdk','macosx','ARCHS='+(arch==='arm64'?'arm64':'x86_64'),'CONFIGURATION_BUILD_DIR='+root,'CODE_SIGNING_ALLOWED=NO','MACOSX_DEPLOYMENT_TARGET=12.0','build'],{stdio:'inherit'});
 const bundle=path.join(root,'LecatQuickLook.appex'),web=path.join(bundle,'Contents/Resources/web');await fs.mkdir(web,{recursive:true});
 require('esbuild').buildSync({entryPoints:['electron/quicklook.js'],bundle:true,outfile:path.join(web,'preview.js'),platform:'browser',target:'safari15',loader:{'.woff2':'file','.woff':'file','.ttf':'file'},assetNames:'fonts/[name]-[hash]',minify:true});
 await fs.writeFile(path.join(web,'index.html'),`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src data:; font-src 'self'; base-uri 'none'; form-action 'none'"><link rel="stylesheet" href="preview.css"><style>:root{color-scheme:light dark}body{font:16px/1.75 system-ui;margin:0;padding:24px 38px}article{max-width:840px;margin:auto;overflow-wrap:anywhere}h1,h2,h3{line-height:1.3}pre,blockquote{padding:14px;background:#f2f3f5;border-radius:8px}pre{overflow:auto}img,svg{max-width:100%;height:auto}table{border-collapse:collapse}td,th{border:1px solid #8886;padding:8px}.katex-display{overflow:auto}a{color:#2451ba}@media(prefers-color-scheme:dark){pre,blockquote{background:#292d35}a{color:#9bbcff}}</style></head><body><article></article><script src="preview.js"></script></body></html>`);
 await fs.copyFile('electron/ui/THIRD-PARTY-LICENSES.txt',path.join(bundle,'Contents/Resources/THIRD-PARTY-LICENSES.txt'));
 execFileSync('codesign',['--force','--sign','-','--timestamp=none','--entitlements',path.join(native,'entitlements.plist'),bundle],{stdio:'inherit'});
 return bundle;
}
exports.prepare=prepare;
if(require.main===module)prepare(process.argv[2]||process.arch).then(p=>console.log(p)).catch(e=>{console.error(e);process.exitCode=1;});
