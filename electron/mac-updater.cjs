const {EventEmitter}=require('node:events'),fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),http=require('node:http'),{createReadStream}=require('node:fs'),{spawn}=require('node:child_process');
const REPO='https://github.com/lferraro1103/Lecat-Markdown',API='https://api.github.com/repos/lferraro1103/Lecat-Markdown/releases/latest';
function key(raw){return crypto.createPublicKey({key:Buffer.concat([Buffer.from('302a300506032b6570032100','hex'),Buffer.from(raw,'base64')]),format:'der',type:'spki'});}
function version(value){const match=/^(\d+)\.(\d+)\.(\d+)(?:-macos12\.(\d+))?$/.exec(value);if(!match)throw Error('Versión de actualización inválida.');return match.slice(1).map(n=>Number(n||0));}
function newer(next,current){const a=version(next),b=version(current);for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]>b[i];return false;}
function verifyManifest(envelope,{publicKey,arch,currentVersion}){
 if(typeof envelope.payload!=='string'||envelope.payload.length>100000||typeof envelope.signature!=='string')throw Error('Manifiesto de actualización inválido.');
 const bytes=Buffer.from(envelope.payload,'base64');if(!crypto.verify(null,bytes,key(publicKey),Buffer.from(envelope.signature,'base64')))throw Error('La firma de la actualización no es válida.');
 const m=JSON.parse(bytes.toString('utf8')),legacy=currentVersion.includes('-macos12.');
 version(m.version);
 const expected=REPO+'/releases/download/v'+m.version+'/Lecat-Markdown-'+m.version+'-macOS-'+arch+'.zip';
 if(m.schema!==1||m.arch!==arch||m.url!==expected||legacy!==m.version.includes('-macos12.')||!Number.isSafeInteger(m.size)||m.size<=0||m.size>1024*1024*1024||!/^[a-f0-9]{64}$/.test(m.sha256)||Buffer.from(m.edSignature||'','base64').length!==64)throw Error('El paquete no corresponde a esta edición de Mac.');
 return m;
}
const xml=value=>String(value).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
class MacUpdater extends EventEmitter{
 constructor({currentVersion,arch,publicKey,cacheDir,helper,fetch:fetcher=fetch,quit,spawnHelper=spawn}){super();Object.assign(this,{currentVersion,arch,publicKey,cacheDir,helper,fetcher,quit,spawnHelper});this.fetcher=async(...args)=>{try{return await fetcher(...args);}catch{throw Error('No se pudo conectar con el servidor de actualizaciones. Revisá tu conexión e intentá de nuevo.');}};this.manifest=null;this.packageFile=null;this.child=null;this.macSparkle=true;}
 async checkForUpdates(){
  this.emit('checking-for-update');
  const response=await this.fetcher(API,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('No se pudo consultar la versión pública.');const release=await response.json();
  if(release.draft||release.prerelease||!/^v\d+\.\d+\.\d+$/.test(release.tag_name))throw Error('Release estable inválida.');
  const next=release.tag_name.slice(1)+(this.currentVersion.includes('-macos12.')?'-macos12.1':'');
  if(!newer(next,this.currentVersion)){this.manifest=null;this.emit('update-not-available',{});return {};}
  const result=await this.fetcher(REPO+'/releases/download/v'+next+'/mac-update-'+this.arch+'.json',{signal:AbortSignal.timeout(20000)});
  if(!result.ok)throw Error('La versión compatible con este Mac todavía no está disponible.');
  const text=await result.text();if(text.length>140000)throw Error('Manifiesto demasiado grande.');
  const manifest=verifyManifest(JSON.parse(text),this);if(manifest.version!==next||!newer(manifest.version,this.currentVersion))throw Error('La actualización no es más reciente.');
  this.manifest=manifest;this.packageFile=null;this.emit('update-available',{version:manifest.version,releaseNotes:release.body});return {};
 }
 async downloadUpdate(){
  if(!this.manifest)throw Error('Buscá una actualización antes de descargar.');
  await fs.mkdir(this.cacheDir,{recursive:true});const temp=path.join(this.cacheDir,crypto.randomUUID()+'.part');
  const m=this.manifest;let handle;
  try{
   const response=await this.fetcher(m.url,{signal:AbortSignal.timeout(10*60*1000)});if(!response.ok||!response.body)throw Error('No se pudo descargar el paquete.');
   handle=await fs.open(temp,'wx',0o600);let received=0;const hash=crypto.createHash('sha256');
   for await(const chunk of response.body){received+=chunk.length;if(received>m.size)throw Error('El tamaño de la descarga no coincide.');hash.update(chunk);await handle.writeFile(chunk);this.emit('download-progress',{percent:received/m.size*100});}
   await handle.close();handle=null;
   if(received!==m.size||hash.digest('hex')!==m.sha256||!crypto.verify(null,await fs.readFile(temp),key(this.publicKey),Buffer.from(m.edSignature,'base64')))throw Error('No se pudo verificar la integridad y firma de la descarga.');
   const target=path.join(this.cacheDir,'update-'+m.version+'-'+m.arch+'.zip');await fs.rename(temp,target);this.packageFile=target;this.emit('update-downloaded',{version:m.version});return [target];
  }finally{await handle?.close();await fs.rm(temp,{force:true});}
 }
 async quitAndInstall(){
  if(!this.packageFile||this.child)throw Error('La actualización no está lista.');
  // Re-verify immediately before handing the archive to the native installer.
  const bytes=await fs.readFile(this.packageFile),m=this.manifest;
  if(bytes.length!==m.size||crypto.createHash('sha256').update(bytes).digest('hex')!==m.sha256||!crypto.verify(null,bytes,key(this.publicKey),Buffer.from(m.edSignature,'base64')))throw Error('El paquete descargado cambió; volvé a descargarlo.');
  const token=crypto.randomBytes(32).toString('hex');let origin;
  const server=http.createServer((req,res)=>{
   if(req.method!=='GET'){res.writeHead(405);res.end();return;}
   if(req.url==='/'+token+'/appcast.xml'){
    const feed=`<?xml version="1.0"?><rss version="2.0" xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle"><channel><title>Lecat - Markdown</title><item><title>${xml(m.version)}</title><sparkle:version>${xml(m.version)}</sparkle:version><sparkle:minimumSystemVersion>${m.version.includes('-macos12.')?'12.0':'13.0'}</sparkle:minimumSystemVersion><enclosure url="${origin}/${token}/update.zip" length="${m.size}" type="application/octet-stream" sparkle:edSignature="${xml(m.edSignature)}"/></item></channel></rss>`;
    res.writeHead(200,{'Content-Type':'application/xml','Cache-Control':'no-store'});res.end(feed);
   }else if(req.url==='/'+token+'/update.zip'){res.writeHead(200,{'Content-Type':'application/zip','Content-Length':m.size});const stream=createReadStream(this.packageFile);stream.on('error',()=>res.destroy());stream.pipe(res);}else{res.writeHead(404);res.end();}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});origin='http://127.0.0.1:'+server.address().port;
  return new Promise((resolve,reject)=>{
   let buffer='',ready=false,settled=false;const timeout=setTimeout(()=>fail(Error('El instalador no respondió.')),180000);
   const closeServer=()=>{server.close();server.closeAllConnections();};
   const fail=error=>{clearTimeout(timeout);closeServer();if(!settled){settled=true;this.child?.kill();this.child=null;this.emit('error',error);reject(error);}};
   try{this.child=this.spawnHelper(this.helper,[origin+'/'+token+'/appcast.xml'],{detached:true,stdio:['ignore','pipe','pipe']});}catch(error){fail(error);return;}
   this.diagnostics='';this.child.stderr.on('data',chunk=>{this.diagnostics=(this.diagnostics+chunk.toString()).slice(-16000);});
   this.child.on('error',fail);this.child.on('exit',code=>{if(!ready)fail(Error('El instalador terminó sin aplicar la actualización ('+code+').'));});
   this.child.stdout.on('data',chunk=>{buffer+=chunk.toString();if(buffer.length>65536){fail(Error('Respuesta inválida del instalador.'));return;}let at;while((at=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,at);buffer=buffer.slice(at+1);let event;try{event=JSON.parse(line);}catch{continue;}
    if(event.event==='error'){fail(Error(event.message||'No se pudo instalar la actualización.'));return;}
    if(event.event==='ready'&&!ready){ready=true;settled=true;clearTimeout(timeout);closeServer();this.child.unref();resolve();setImmediate(()=>this.quit());}
   }});
  });
 }
}
module.exports={MacUpdater,verifyManifest,newer,key};
