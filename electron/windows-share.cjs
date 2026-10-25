const fs=require('node:fs/promises'),path=require('node:path'),{spawn}=require('node:child_process');
function createWindowsShare({app,win,core,notify}){
 const helper=app.isPackaged?path.join(process.resourcesPath,'native/LecatShare.exe'):path.resolve('.cache/windows-share/LecatShare.exe');let child=null,opening=false;
 app.on('will-quit',()=>child?.kill());
 return async document=>{
  if(child||opening)throw Error('La ventana de compartir ya está abierta.');opening=true;
  try{await fs.access(helper);}catch{opening=false;throw Error('El componente para compartir de Windows no está disponible en esta compilación.');}
  const root=path.resolve(app.getPath('temp'));let folder;try{folder=await fs.mkdtemp(path.join(root,'lecat-share-win-'));}catch(error){opening=false;throw error;}
  const cleanup=async()=>{if(path.dirname(path.resolve(folder))===root&&path.basename(folder).startsWith('lecat-share-win-'))await fs.rm(folder,{recursive:true,force:true}).catch(()=>{});};
  try{
   const title=path.basename(document.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,'_')||'documento.md',file=path.join(folder,/\.(md|markdown)$/i.test(title)?title:title+'.md'),payload=path.join(folder,'request.json');
   await fs.writeFile(file,core.encode(document.content,document),{flag:'wx'});await fs.writeFile(payload,JSON.stringify({title,text:document.content,file}),{flag:'wx'});
   const handle=win.getNativeWindowHandle(),owner=(handle.length===8?handle.readBigUInt64LE():BigInt(handle.readUInt32LE())).toString(16);
   await new Promise((resolve,reject)=>{let ready=false,settled=false,buffer='';const helperProcess=spawn(helper,[owner,payload],{windowsHide:true,stdio:['ignore','pipe','pipe']});child=helperProcess;
    const timer=setTimeout(()=>{if(!ready){helperProcess.kill();fail(Error('Windows no pudo abrir la ventana de compartir.'));}},20000);
    function fail(error){clearTimeout(timer);if(!settled){settled=true;reject(error);}else notify(error.message);}
    helperProcess.on('error',error=>{child=null;opening=false;fail(error);});helperProcess.stdout.on('data',bytes=>{buffer+=bytes.toString('utf8');if(buffer.length>65536){process.kill();fail(Error('Respuesta no válida de Compartir.'));return;}let at;while((at=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,at);buffer=buffer.slice(at+1);let event;try{event=JSON.parse(line);}catch{continue;}if(event.event==='ready'){ready=true;clearTimeout(timer);if(!settled){settled=true;resolve();}}else if(event.event==='error'){fail(Error(event.message||'No se pudo abrir Compartir de Windows.'));process.kill();}}});
    helperProcess.stderr.on('data',()=>{});helperProcess.on('exit',code=>{clearTimeout(timer);child=null;opening=false;cleanup();if(!ready&&!settled){settled=true;reject(Error('No se pudo abrir Compartir de Windows ('+code+').'));}});
   });
   return {copied:false};
  }catch(error){opening=false;await cleanup();throw error;}
 };
}
exports.createWindowsShare=createWindowsShare;
