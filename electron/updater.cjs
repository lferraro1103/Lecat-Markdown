const {newer:channelNewer,versionInfo}=require('./release-channel.cjs');
const RELEASES='https://github.com/lferraro1103/Lecat-Markdown/releases/latest';
const RELEASE_API='https://api.github.com/repos/lferraro1103/Lecat-Markdown/releases/latest';

function newer(stable,current){
 const parse=v=>/^v?(\d+)\.(\d+)\.(\d+)$/.exec(v);
 const a=parse(stable),b=parse(current);if(!a||!b)return false;
 for(let i=1;i<=3;i++){if(Number(a[i])!==Number(b[i]))return Number(a[i])>Number(b[i]);}return false;
}
function notes(value){return typeof value==='string'?value.slice(0,12000):Array.isArray(value)?value.map(v=>String(v.note||'')).join('\n').slice(0,12000):'';}

// All network and installation work stays in the main process. Dependency
// injection lets us exercise failure and restart paths without replacing an app.
function createUpdater({updater,currentVersion,supported=true,reason='',notify=()=>{},fetchRelease,prepareInstall=async()=>true,allowBeta=false,resolveRelease=null}){
 let state={status:'idle',currentVersion,version:null,progress:0,notes:'',message:reason,supported,releaseUrl:RELEASES,channel:allowBeta?'beta':'stable'};
 let checking=null,downloading=null,installing=false;
 const snapshot=()=>({...state});
 const set=value=>{state={...state,...value};notify(snapshot());return snapshot();};
 const fail=error=>set({status:'error',message:updater.macSparkle&&supported&&error?.message?error.message:error?.code==='ERR_UPDATER_CHANNEL_FILE_NOT_FOUND'?'La release pública todavía no incluye los archivos de actualización. Podés revisar las descargas en Releases.':'No se pudo completar la actualización. Revisá tu conexión o intentá de nuevo más tarde.'});
 updater.autoDownload=false;updater.autoInstallOnAppQuit=false;
 updater.allowPrerelease=allowBeta;updater.allowDowngrade=false;
 updater.on('checking-for-update',()=>set({status:'checking',message:'Buscando una versión nueva…'}));
 updater.on('update-available',info=>set({status:'available',version:info.version,notes:notes(info.releaseNotes),progress:0,message:'Hay una nueva versión disponible.'}));
 updater.on('update-not-available',()=>set({status:'current',version:null,notes:'',message:'Ya tenés la última versión.'}));
 updater.on('download-progress',p=>set({status:'downloading',progress:Math.max(0,Math.min(100,Number(p.percent)||0)),message:'Descargando la actualización…'}));
 updater.on('update-downloaded',info=>set({status:'downloaded',version:info.version,progress:100,message:'La actualización está lista. Reiniciá cuando quieras para aplicarla.'}));
 updater.on('error',fail);
 async function check(){
  if(checking)return checking;
  if(downloading||installing||state.status==='downloaded')return snapshot();
  set({status:'checking',message:'Buscando una versión nueva…'});
  checking=(async()=>{try{
   if(supported){if(resolveRelease){const release=await resolveRelease(allowBeta);if(!release||!channelNewer(release.tag_name,currentVersion))return set({status:'current',version:null,notes:'',message:'Ya tenés la última versión.'});const channel=versionInfo(release.tag_name).channel;updater.setFeedURL({provider:'generic',url:'https://github.com/lferraro1103/Lecat-Markdown/releases/download/'+release.tag_name,channel});updater.channel=channel;updater.allowPrerelease=allowBeta;updater.allowDowngrade=false;}const result=await updater.checkForUpdates();if(!result&&state.status==='checking')throw Error('No update result');}
   else{
    const release=await fetchRelease(allowBeta);
    const info=release&&versionInfo(release.tag_name);const available=!!info&&!release.draft&&(!info.beta||allowBeta)&&(!release.prerelease||info.beta||info.legacy)&&channelNewer(release.tag_name,currentVersion);
    set({status:available?'manual-available':'current',version:available?release.tag_name.replace(/^v/,''):null,notes:available?notes(release.body):'',message:available?'Hay una nueva versión disponible. '+reason:'Ya tenés la última versión. '+reason});
   }
  }catch(error){fail(error);}return snapshot();})().finally(()=>{checking=null;});return checking;
 }
 async function download(){
  if(downloading)return downloading;
  if(!supported||state.status!=='available')throw Error('Primero buscá una actualización disponible.');
  set({status:'downloading',progress:0,message:'Descargando la actualización…'});
  downloading=(async()=>{try{await updater.downloadUpdate();}catch(error){fail(error);}return snapshot();})().finally(()=>{downloading=null;});return downloading;
 }
 async function install(){
  if(installing)return false;
  if(!supported||state.status!=='downloaded')throw Error('La actualización todavía no está lista.');
  installing=true;
  try{if(!await prepareInstall())return false;set({status:'installing',message:'Aplicando la actualización y reiniciando…'});await updater.quitAndInstall(true,true);return state.status==='installing';}
  catch(error){fail(error);return false;}finally{installing=false;}
 }
 function setChannel(enabled){if(enabled===allowBeta)return snapshot();if(checking||downloading||installing)throw Error('Esperá a que termine la operación de actualización para cambiar el canal.');allowBeta=enabled===true;updater.allowPrerelease=allowBeta;updater.allowDowngrade=false;return set({status:'idle',version:null,notes:'',progress:0,channel:allowBeta?'beta':'stable',message:''});}
 return {snapshot,check,download,install,setChannel};
}
module.exports={createUpdater,newer,RELEASES,RELEASE_API};
