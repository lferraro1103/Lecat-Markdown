const fs=require('node:fs/promises'),path=require('node:path');
const MAX_PDF=100*1024*1024;
async function validate(file){if(typeof file!=='string'||!path.isAbsolute(file)||!/\.pdf$/i.test(file))throw Error('Elegí un archivo PDF.');const stat=await fs.stat(file);if(!stat.isFile()||stat.size>MAX_PDF)throw Error('PDF no válido o mayor que 100 MB.');const handle=await fs.open(file,'r');try{const header=Buffer.alloc(Math.min(1024,stat.size));await handle.read(header,0,header.length,0);if(!header.includes(Buffer.from('%PDF-')))throw Error('El archivo no contiene un PDF válido.');}finally{await handle.close();}return stat;}
async function describe(file){const stat=await validate(file);return {kind:'pdf',path:path.resolve(file),name:path.basename(file),size:stat.size,dirty:false,pdfState:{page:1,zoom:null}};}
async function read(file){await validate(file);const bytes=await fs.readFile(file);if(bytes.length>MAX_PDF)throw Error('PDF mayor que 100 MB.');return new Uint8Array(bytes);}
function state(value={}){value=value&&typeof value==='object'?value:{};return {page:Number.isInteger(value.page)&&value.page>=1&&value.page<=100000?value.page:1,zoom:value.zoom===null?null:Number.isFinite(value.zoom)&&value.zoom>=.25&&value.zoom<=4?value.zoom:null};}
module.exports={MAX_PDF,describe,read,state};
