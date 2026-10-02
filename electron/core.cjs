const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const MAX=20*1024*1024;
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
function decode(buffer){
 let encoding='utf8',bom=false,content;
 if(buffer[0]===255&&buffer[1]===254){encoding='utf16le';bom=true;content=buffer.subarray(2).toString(encoding);}
 else if(buffer[0]===254&&buffer[1]===255)throw Error('UTF-16 BE no compatible. Convertí el archivo a UTF-8.');
 else {bom=buffer.subarray(0,3).equals(Buffer.from([239,187,191]));content=new TextDecoder('utf-8',{fatal:true}).decode(bom?buffer.subarray(3):buffer);}
 return {content,encoding,bom,eol:content.includes('\r\n')?'CRLF':'LF',hash:digest(buffer)};
}
function encode(content,doc){const body=Buffer.from(content,doc.encoding||'utf8');return doc.bom?Buffer.concat([doc.encoding==='utf16le'?Buffer.from([255,254]):Buffer.from([239,187,191]),body]):body;}
async function read(file){if(!/\.(md|markdown)$/i.test(file))throw Error('Elegí un archivo Markdown (.md o .markdown).');const stat=await fs.stat(file);if(!stat.isFile()||stat.size>MAX)throw Error('Archivo no válido o mayor que 20 MB.');return {...decode(await fs.readFile(file)),path:path.resolve(file),name:path.basename(file)};}
async function atomicSave(doc,content,{allowOverwrite=false}={}){
 if(typeof content!=='string'||Buffer.byteLength(content,'utf8')>MAX)throw Error('Documento mayor que 20 MB.');
 let current;try{current=await fs.readFile(doc.path);}catch(e){if(e.code!=='ENOENT')throw e;}
 if(!allowOverwrite&&((current&&digest(current)!==doc.hash)||(!current&&doc.hash)))throw Error('El archivo cambió fuera de Claro MD. Guardá una copia con Guardar como para conservar ambas versiones.');
 const buffer=encode(content,doc),temp=doc.path+'.claro-'+crypto.randomUUID()+'.tmp';
 try{await fs.writeFile(temp,buffer,{flag:'wx'});const h=await fs.open(temp,'r+');try{await h.sync();}finally{await h.close();}await fs.rename(temp,doc.path);}finally{await fs.unlink(temp).catch(()=>{});}
 return {...doc,content,hash:digest(buffer)};
}
async function list(folder){const entries=await fs.readdir(folder,{withFileTypes:true});return entries.filter(e=>e.isDirectory()||e.isFile()&&/\.(md|markdown)$/i.test(e.name)).map(e=>({name:e.name,path:path.join(folder,e.name),directory:e.isDirectory()})).sort((a,b)=>Number(b.directory)-Number(a.directory)||a.name.localeCompare(b.name));}
module.exports={MAX,decode,encode,digest,read,atomicSave,list};
