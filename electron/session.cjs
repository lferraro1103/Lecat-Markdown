const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
function samePath(a,b){return process.platform==='win32'?path.resolve(a).toLowerCase()===path.resolve(b).toLowerCase():path.resolve(a)===path.resolve(b);}
function snapshotSession(documents,activeId){
 const saved=documents.filter(d=>typeof d.path==='string'&&path.isAbsolute(d.path));
 const active=documents.find(d=>d.id===activeId);
 return {...(saved.some(d=>d.kind==='pdf')?{pdfViews:saved.filter(d=>d.kind==='pdf').map(d=>({path:d.path,...require('./pdf-service.cjs').state(d.pdfState)}))}:{}),version:1,initialized:true,paths:saved.map(d=>d.path),activePath:active?.path||null,activeDraftId:active?.dirty&&!active.path?active.id:null};
}
function validSession(value){return value?.version===1&&value.initialized===true&&Array.isArray(value.paths)&&value.paths.length<=1000&&value.paths.every(p=>typeof p==='string'&&path.isAbsolute(p))&&(value.activePath===null||typeof value.activePath==='string'&&path.isAbsolute(value.activePath));}
async function readSession(file){
 let bytes;try{bytes=await fs.readFile(file,'utf8');}catch(error){if(error.code==='ENOENT')return {session:null,existed:false,warnings:[]};throw error;}
 try{const session=JSON.parse(bytes);if(!validSession(session))throw Error('Invalid session');return {session,existed:true,warnings:[]};}
 catch{const backup=file+'.invalid-'+Date.now()+'-'+crypto.randomUUID()+'.json';await fs.copyFile(file,backup,require('node:fs').constants.COPYFILE_EXCL);return {session:null,existed:true,warnings:['No se pudo leer la sesión anterior. Se conservó una copia en '+backup]};}
}
async function restoreSession(session,recovered,openFile,warnings){
 const documents=[];
 for(const file of session?.paths||[]){
  if(documents.some(d=>d.path&&samePath(d.path,file)))continue;
  const draft=recovered.find(d=>d.path&&samePath(d.path,file));
  if(draft){documents.push(draft);continue;}
  try{const opened=await openFile(file);if(opened.kind==='pdf')opened.pdfState=require('./pdf-service.cjs').state((Array.isArray(session?.pdfViews)?session.pdfViews:[]).find(v=>v?.path===file));documents.push(opened);}catch(error){warnings.push('No se pudo restaurar '+file+': '+error.message);}
 }
 for(const draft of recovered)if(!documents.some(d=>d.id===draft.id||d.path&&draft.path&&samePath(d.path,draft.path)))documents.push(draft);
 const active=documents.find(d=>d.path&&session?.activePath&&samePath(d.path,session.activePath))||documents.find(d=>session?.activeDraftId&&d.recoveryId===session.activeDraftId);
 return {documents,activeId:active?.id||documents.at(-1)?.id||null};
}
module.exports={snapshotSession,readSession,restoreSession};
