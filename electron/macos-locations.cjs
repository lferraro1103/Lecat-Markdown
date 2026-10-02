const fs=require('node:fs/promises');
const path=require('node:path');
const {execFile}=require('node:child_process');

function run(command,args,input){
 return new Promise((resolve,reject)=>{
  const child=execFile(command,args,{encoding:'utf8',timeout:4000,maxBuffer:2*1024*1024},(error,stdout)=>error?reject(error):resolve(stdout));
  if(input!==undefined){child.stdin.on('error',()=>{});child.stdin.end(input);}
 });
}
async function diskInfo(args){
 const plist=await run('/usr/sbin/diskutil',args);
 return JSON.parse(await run('/usr/bin/plutil',['-convert','json','-o','-','-'],plist));
}
function hiddenName(name){return /time[\s_-]*machine|^recovery(?:[\s_-]|$)|^backups(?:\s+of\s|\.backupdb$)/i.test(name);}
async function macDrives(){
 const [rootInfo,inventory,names]=await Promise.all([
  diskInfo(['info','-plist','/']).catch(()=>({})),
  diskInfo(['apfs','list','-plist']).catch(()=>({})),
  fs.readdir('/Volumes').catch(()=>[])
 ]);
 const roles=new Map();
 for(const container of inventory.Containers||[])for(const volume of container.Volumes||[]){
  roles.set(volume.DeviceIdentifier,volume.Roles||[]);
  if(volume.APFSVolumeUUID)roles.set(volume.APFSVolumeUUID,volume.Roles||[]);
 }
 const root=await fs.realpath('/');
 const rootStat=await fs.stat(root);
 const seenPaths=new Set([root]),seenNodes=new Set([`${rootStat.dev}:${rootStat.ino}`]);
 const drives=[{name:rootInfo.VolumeName||'Macintosh HD',path:'/',directory:true}];
 const volumes=await Promise.all(names.map(async name=>{
  if(name.startsWith('.')||hiddenName(name))return null;
  const volume=path.join('/Volumes',name);
  try{
   const real=await fs.realpath(volume),stat=await fs.stat(volume);
   if(!stat.isDirectory()||real===root)return null;
   const info=await diskInfo(['info','-plist',volume]).catch(()=>({}));
   const volumeRoles=roles.get(info.DeviceIdentifier)||roles.get(info.VolumeUUID)||[];
   if(volumeRoles.some(role=>['backup','recovery'].includes(String(role).toLowerCase()))||hiddenName(info.VolumeName||name))return null;
   const legacyBackup=await fs.stat(path.join(volume,'Backups.backupdb')).then(s=>s.isDirectory()).catch(()=>false);
   if(legacyBackup)return null;
   return {real,node:`${stat.dev}:${stat.ino}`,entry:{name:info.VolumeName||name,path:volume,directory:true}};
  }catch{return null;}
 }));
 for(const volume of volumes){
  if(!volume||seenPaths.has(volume.real)||seenNodes.has(volume.node))continue;
  seenPaths.add(volume.real);seenNodes.add(volume.node);drives.push(volume.entry);
 }
 return drives;
}
module.exports={macDrives};
