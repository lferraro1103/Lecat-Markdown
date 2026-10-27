const fsp=require('node:fs/promises'),path=require('node:path'),childProcess=require('node:child_process');
const READY_TIMEOUT=20000,REPLACE_TIMEOUT=3000;
function createWindowsShare({app,win,core,notify,spawn=childProcess.spawn,fs=fsp,readyTimeout=READY_TIMEOUT}){
 const helper=app.isPackaged?path.join(process.resourcesPath,'native/LecatShare.exe'):path.resolve('.cache/windows-share/LecatShare.exe');let child=null,opening=false;
 app.on('will-quit',()=>child?.kill());
 // The helper can outlive the visible sheet (for example after cancelling inside the chosen app),
 // so a new request replaces it instead of refusing until the 10-minute helper timeout.
 async function replaceCurrent(){
  const previous=child;if(!previous)return;
  await new Promise(resolve=>{const timer=setTimeout(resolve,REPLACE_TIMEOUT);previous.once('exit',()=>{clearTimeout(timer);resolve();});previous.kill();});
  if(child===previous)child=null;
 }
 return async document=>{
  if(opening)throw Error('Compartir se está abriendo.');opening=true;
  let folder=null;const root=path.resolve(app.getPath('temp'));
  const cleanup=async()=>{if(folder&&path.dirname(path.resolve(folder))===root&&path.basename(folder).startsWith('lecat-share-win-'))await fs.rm(folder,{recursive:true,force:true}).catch(()=>{});};
  try{
   try{await fs.access(helper);}catch{throw Error('El componente para compartir de Windows no está disponible en esta compilación.');}
   await replaceCurrent();
   folder=await fs.mkdtemp(path.join(root,'lecat-share-win-'));
   const title=path.basename(document.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,'_')||'documento.md',payload=path.join(folder,'request.json');
   // PDFs are read-only and already on disk: share the original instead of copying large files first.
   let file;
   if(document.kind==='pdf'){if(!document.path||!path.isAbsolute(document.path))throw Error('El PDF no tiene una ubicación válida.');await fs.access(document.path);file=path.resolve(document.path);}
   else{file=path.join(folder,/\.(md|markdown)$/i.test(title)?title:title+'.md');await fs.writeFile(file,core.encode(document.content,document),{flag:'wx'});}
   await fs.writeFile(payload,JSON.stringify({title,text:document.content||'',file}),{flag:'wx'});
   const handle=win.getNativeWindowHandle(),owner=(handle.length===8?handle.readBigUInt64LE():BigInt(handle.readUInt32LE())).toString(16);
   await new Promise((resolve,reject)=>{let ready=false,settled=false,buffer='';const helperProcess=spawn(helper,[owner,payload],{windowsHide:true,stdio:['ignore','pipe','pipe']});child=helperProcess;
    const timer=setTimeout(()=>{if(!ready){helperProcess.kill();fail(Error('Windows no pudo abrir la ventana de compartir.'));}},readyTimeout);
    function fail(error){clearTimeout(timer);if(!settled){settled=true;reject(error);}else notify(error.message);}
    helperProcess.on('error',error=>{if(child===helperProcess)child=null;fail(error);});
    helperProcess.stdout.on('data',bytes=>{buffer+=bytes.toString('utf8');if(buffer.length>65536){helperProcess.kill();fail(Error('Respuesta no válida de Compartir.'));return;}let at;while((at=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,at);buffer=buffer.slice(at+1);let event;try{event=JSON.parse(line);}catch{continue;}if(event.event==='ready'){ready=true;clearTimeout(timer);if(!settled){settled=true;resolve();}}else if(event.event==='error'){fail(Error(event.message||'No se pudo abrir Compartir de Windows.'));helperProcess.kill();}}});
    helperProcess.stderr.on('data',()=>{});
    helperProcess.on('exit',code=>{clearTimeout(timer);if(child===helperProcess)child=null;cleanup();if(!ready&&!settled){settled=true;reject(Error('No se pudo abrir Compartir de Windows ('+code+').'));}});
   });
   return {copied:false};
  }catch(error){await cleanup();throw error;}
  finally{opening=false;}
 };
}
exports.createWindowsShare=createWindowsShare;
