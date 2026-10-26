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

// Finder data is read through JavaScript for Automation (built into macOS), so Finder itself is never launched
// and no compiled helper has to be shipped. Every reader degrades to an empty result when macOS refuses access.
const FAVORITES_SCRIPT=`ObjC.import('Foundation');
function run(){
 const base=$.NSHomeDirectory().js+'/Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.FavoriteItems.';
 const manager=$.NSFileManager.defaultManager;
 for(const extension of ['sfl3','sfl2']){
  const data=$.NSData.dataWithContentsOfFile(base+extension);
  if(!data||data.isNil())continue;
  let root=null;try{root=$.NSKeyedUnarchiver.unarchiveObjectWithData(data);}catch(error){continue;}
  if(!root||root.isNil())continue;
  const items=root.objectForKey('items');
  if(!items||items.isNil())continue;
  const favorites=[];
  for(let index=0;index<items.count;index++){
   const item=items.objectAtIndex(index),bookmark=item.objectForKey('Bookmark');
   if(!bookmark||bookmark.isNil())continue;
   const properties=ObjC.deepUnwrap(item.objectForKey('CustomItemProperties'))||{};
   if(properties['com.apple.LSSharedFileList.ItemIsHidden'])continue;
   let url=null;try{url=$.NSURL.URLByResolvingBookmarkDataOptionsRelativeToURLBookmarkDataIsStaleError(bookmark,768,$(),Ref(),$());}catch(error){continue;}
   if(!url||url.isNil()||!url.isFileURL)continue;
   const path=url.path.js,directory=Ref();
   if(!manager.fileExistsAtPathIsDirectory(path,directory)||!directory[0])continue;
   const name=Ref();url.getResourceValueForKeyError(name,$.NSURLLocalizedNameKey,$());
   favorites.push({name:ObjC.unwrap(name[0])||url.lastPathComponent.js,path});
  }
  return JSON.stringify(favorites);
 }
 return '[]';
}`;
const INFO_SCRIPT=`ObjC.import('Foundation');
function run(paths){
 const keys=$([$.NSURLLocalizedNameKey,$.NSURLTagNamesKey,$.NSURLLabelNumberKey,$.NSURLIsHiddenKey,$.NSURLIsPackageKey]);
 const info={};
 for(const path of paths){
  const values=$.NSURL.fileURLWithPath(path).resourceValuesForKeysError(keys,$());
  if(!values||values.isNil())continue;
  const value=ObjC.deepUnwrap(values)||{};
  info[path]={name:value.NSURLLocalizedNameKey||null,tags:value.NSURLTagNamesKey||[],label:value.NSURLLabelNumberKey||0,hidden:!!value.NSURLIsHiddenKey,package:!!value.NSURLIsPackageKey};
 }
 return JSON.stringify(info);
}`;
const INFO_CHUNK=200;
function automation(script,args=[],exec=run){return exec('/usr/bin/osascript',['-l','JavaScript','-',...args],script).then(out=>JSON.parse(out.trim()||'null'));}
async function finderFavorites({exec=run,stat=fs.stat}={}){
 let favorites;try{favorites=await automation(FAVORITES_SCRIPT,[],exec);}catch{return [];}
 if(!Array.isArray(favorites))return [];
 const seen=new Set(),result=[];
 for(const item of favorites){
  if(!item||typeof item.path!=='string'||!path.isAbsolute(item.path)||seen.has(item.path))continue;
  // Recents and other saved searches live inside Finder.app and are not folders Lecat can list.
  if(item.path.startsWith('/System/Library/CoreServices/Finder.app/'))continue;
  try{if(!(await stat(item.path)).isDirectory())continue;}catch{continue;}
  seen.add(item.path);result.push({name:String(item.name||path.basename(item.path)),path:item.path,directory:true});
 }
 return result;
}
async function finderInfo(paths,{exec=run}={}){
 const valid=[...new Set(paths)].filter(value=>typeof value==='string'&&path.isAbsolute(value));
 const info={};
 for(let index=0;index<valid.length;index+=INFO_CHUNK){
  try{Object.assign(info,await automation(INFO_SCRIPT,valid.slice(index,index+INFO_CHUNK),exec)||{});}catch{}
 }
 return info;
}
async function iCloudDrive(home,stat=fs.stat){
 const folder=path.join(home,'Library','Mobile Documents','com~apple~CloudDocs');
 try{return (await stat(folder)).isDirectory()?{name:'iCloud Drive',path:folder,directory:true}:null;}catch{return null;}
}
// Finder icons are shared by every file with the same extension, but folders and bundles can carry their own.
function createIconReader(getFileIcon,stat=fs.stat){
 const cache=new Map();
 return async paths=>{
  const icons={};
  await Promise.all([...new Set(paths)].filter(value=>typeof value==='string'&&path.isAbsolute(value)).slice(0,500).map(async target=>{
   try{
    const directory=(await stat(target)).isDirectory(),key=directory?target:'ext:'+path.extname(target).toLowerCase();
    if(!cache.has(key))cache.set(key,getFileIcon(target,{size:'normal'}).then(image=>image.isEmpty()?null:image.toDataURL()).catch(()=>null));
    const icon=await cache.get(key);if(icon)icons[target]=icon;else cache.delete(key);
   }catch{}
  }));
  return icons;
 };
}
module.exports={macDrives,finderFavorites,finderInfo,iCloudDrive,createIconReader};
