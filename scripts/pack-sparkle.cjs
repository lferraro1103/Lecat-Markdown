const path=require('node:path'),fs=require('node:fs/promises'),{execFileSync}=require('node:child_process');
module.exports=async context=>{
 if(context.electronPlatformName!=='darwin')return;
 const {root,helper}=await require('./prepare-sparkle.cjs').prepare(),contents=path.join(context.appOutDir,context.packager.appInfo.productFilename+'.app','Contents');
 await fs.mkdir(path.join(contents,'Frameworks'),{recursive:true});
 execFileSync('ditto',[path.join(root,'Sparkle.framework'),path.join(contents,'Frameworks','Sparkle.framework')]);
 const helperContents=path.join(contents,'Frameworks','LecatUpdater.app','Contents');await fs.mkdir(path.join(helperContents,'MacOS'),{recursive:true});
 await fs.copyFile(helper,path.join(helperContents,'MacOS','LecatUpdater'));await fs.chmod(path.join(helperContents,'MacOS','LecatUpdater'),0o755);
 await fs.writeFile(path.join(helperContents,'Info.plist'),'<?xml version="1.0"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>CFBundleIdentifier</key><string>com.lecat.markdown.updater</string><key>CFBundleExecutable</key><string>LecatUpdater</string><key>CFBundleName</key><string>Actualización de Lecat</string><key>CFBundlePackageType</key><string>APPL</string><key>CFBundleVersion</key><string>1.0</string><key>CFBundleShortVersionString</key><string>1.0</string><key>LSUIElement</key><true/><key>NSAppTransportSecurity</key><dict><key>NSAllowsLocalNetworking</key><true/></dict></dict></plist>');
 // Sparkle's MIT license accompanies the framework and the application.
 await fs.copyFile(path.join(root,'LICENSE'),path.join(contents,'Resources','SPARKLE-LICENSE.txt'));
};
