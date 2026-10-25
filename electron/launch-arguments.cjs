const path=require('node:path'),{fileURLToPath}=require('node:url');
function fromURL(value){const url=new URL(value);if(url.protocol!=='lecat:'||url.hostname!=='file'||url.search||url.hash)throw Error('Enlace de Lecat no válido.');const file=fileURLToPath('file://'+url.pathname);if(!path.isAbsolute(file)||! /\.(md|markdown)$/i.test(file))throw Error('Elegí un archivo Markdown.');return file;}
function filesFromArguments(argv,cwd=process.cwd()){const files=[];for(const value of argv){if(typeof value!=='string')continue;let file;if(/^lecat:/i.test(value))file=fromURL(value);else if(!value.startsWith('-')&&/\.(md|markdown)$/i.test(value))file=path.resolve(cwd,value);if(file&&!files.includes(file))files.push(file);}return files;}
module.exports={fromURL,filesFromArguments};
