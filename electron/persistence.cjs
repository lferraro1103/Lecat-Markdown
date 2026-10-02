const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');const {MAX}=require('./core.cjs');
async function writeJson(file,value){const data=JSON.stringify(value),temporary=file+'.'+crypto.randomUUID()+'.tmp';await fs.mkdir(path.dirname(file),{recursive:true});try{await fs.writeFile(temporary,data,{flag:'wx',mode:0o600});const h=await fs.open(temporary,'r+');try{await h.sync();}finally{await h.close();}await fs.rename(temporary,file);}finally{await fs.unlink(temporary).catch(()=>{});}}
function validDraft(d){return d&&typeof d.content==='string'&&Buffer.byteLength(d.content)<=MAX&&typeof d.name==='string'&&(d.path===null||typeof d.path==='string'&&path.isAbsolute(d.path))&&['utf8','utf16le'].includes(d.encoding)&&['LF','CRLF'].includes(d.eol);}
async function readRecovery(file){let bytes;try{bytes=await fs.readFile(file,'utf8');}catch(e){if(e.code==='ENOENT')return {documents:[],warnings:[]};throw e;}let parsed,validJson=true;try{parsed=JSON.parse(bytes);if(!Array.isArray(parsed))throw Error('Formato no válido.');}catch{parsed=[];validJson=false;}
 const documents=parsed.filter(validDraft);if(validJson&&documents.length===parsed.length)return {documents,warnings:[]};
 const backup=file+'.invalid-'+Date.now()+'-'+crypto.randomUUID()+'.json';await fs.copyFile(file,backup,require('node:fs').constants.COPYFILE_EXCL);return {documents,warnings:['Se encontró un archivo de recuperación incompleto. Se conservó una copia en '+backup]};
}
module.exports={writeJson,readRecovery};
