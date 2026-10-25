const fs=require('node:fs/promises'),path=require('node:path');
const quote=value=>"'"+value.replaceAll("'","'\\''")+"'";
async function installCLI(app){
 if(!app.isPackaged)throw Error('El comando se instala desde la aplicación instalada.');
 const folder=path.join(app.getPath('home'),'.local','bin'),target=path.join(folder,process.platform==='win32'?'lecat.cmd':'lecat');await fs.mkdir(folder,{recursive:true});
 const data=process.platform==='win32'?'@echo off\r\nrem Lecat Markdown launcher\r\n"'+process.execPath.replaceAll('%','%%')+'" %*\r\n':process.platform==='linux'?'#!/bin/sh\n# Lecat Markdown launcher\nexec '+quote(process.env.APPIMAGE||process.execPath)+' \"$@\"\n':'#!/bin/sh\n# Lecat Markdown launcher\nexec /usr/bin/open -a '+quote(path.resolve(process.resourcesPath,'../..'))+' -- "$@"\n';
 let old;try{old=await fs.readFile(target,'utf8');}catch(error){if(error.code!=='ENOENT')throw error;}
 if(old&&!old.includes('Lecat Markdown launcher'))throw Error('Ya existe otro comando en '+target);
 const temp=target+'.lecat-'+require('node:crypto').randomUUID();try{await fs.writeFile(temp,data,{flag:'wx',mode:0o755});if(old===undefined){await fs.link(temp,target);}else await fs.rename(temp,target);}finally{await fs.unlink(temp).catch(()=>{});}
 return target;
}
exports.installCLI=installCLI;
