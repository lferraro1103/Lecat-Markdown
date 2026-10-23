const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const VERSION='2.10.0',SHA256='c2bf58aa8387266ac179357b1415d6f2635f044da8be41042af32425dae6da0c';
async function prepare(){
 if(process.platform!=='darwin')throw Error('Sparkle requires macOS');
 const root=path.resolve('.cache/sparkle-'+VERSION),archive=path.join(root,'Sparkle.tar.xz');await fs.mkdir(root,{recursive:true});
 let bytes;try{bytes=await fs.readFile(archive);}catch{}
 if(!bytes||crypto.createHash('sha256').update(bytes).digest('hex')!==SHA256){const r=await fetch('https://github.com/sparkle-project/Sparkle/releases/download/'+VERSION+'/Sparkle-'+VERSION+'.tar.xz',{signal:AbortSignal.timeout(120000)});if(!r.ok)throw Error('Sparkle download HTTP '+r.status);bytes=Buffer.from(await r.arrayBuffer());if(crypto.createHash('sha256').update(bytes).digest('hex')!==SHA256)throw Error('Sparkle checksum mismatch');await fs.writeFile(archive,bytes);}
 execFileSync('tar',['-xf',archive,'-C',root]);
 const helper=path.join(root,'LecatUpdater');
 execFileSync('clang',['-fobjc-arc','-Werror=protocol','-mmacosx-version-min=12.0','-arch',process.arch==='arm64'?'arm64':'x86_64','-F',root,'-framework','Cocoa','-framework','Sparkle','-Wl,-rpath,@executable_path/../../..','native/mac-updater.m','-o',helper],{stdio:'inherit'});
 return {root,helper};
}
exports.prepare=prepare;
if(require.main===module)prepare().then(r=>console.log('Sparkle helper prepared: '+r.helper)).catch(e=>{console.error(e);process.exitCode=1;});
