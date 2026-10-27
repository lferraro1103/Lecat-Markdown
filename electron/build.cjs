const fs=require('node:fs'),path=require('node:path');
fs.mkdirSync(path.join(__dirname,'ui'),{recursive:true});
const worker=require('esbuild').buildSync({entryPoints:[require.resolve('pdfjs-dist/build/pdf.worker.mjs')],bundle:true,format:'iife',platform:'browser',target:'chrome140',minify:true,write:false}).outputFiles[0].text;
const workerModule=path.join(__dirname,'ui/pdf-worker-source.js');fs.writeFileSync(workerModule,'export default '+JSON.stringify(worker)+';');
for(const folder of ['cmaps','standard_fonts','wasm'])fs.cpSync(path.join(__dirname,'../node_modules/pdfjs-dist',folder),path.join(__dirname,'ui/pdf-resources',folder),{recursive:true});
const pdfCSS=fs.readFileSync(require.resolve('pdfjs-dist/web/pdf_viewer.css'),'utf8');fs.writeFileSync(path.join(__dirname,'ui/pdf-text-layer.css'),pdfCSS.slice(pdfCSS.indexOf('.textLayer {'),pdfCSS.indexOf('.textLayerImages {')));
const result=require('esbuild').buildSync({entryPoints:[path.join(__dirname,'renderer.js')],bundle:true,outfile:path.join(__dirname,'ui/bundle.js'),platform:'browser',target:'chrome140',alias:{'lecat-pdf-worker':workerModule},loader:{'.woff2':'file','.woff':'file','.ttf':'file'},assetNames:'fonts/[name]-[hash]',minify:true,metafile:true});
fs.copyFileSync(path.join(__dirname,'startup-theme.js'),path.join(__dirname,'ui/startup-theme.js'));
fs.copyFileSync(path.join(__dirname,'index.html'),path.join(__dirname,'ui/index.html'));
fs.copyFileSync(path.join(__dirname,'style.css'),path.join(__dirname,'ui/style.css'));
fs.copyFileSync(path.join(__dirname,'chrome.css'),path.join(__dirname,'ui/chrome.css'));
fs.copyFileSync(path.join(__dirname,'preferences.css'),path.join(__dirname,'ui/preferences.css'));
fs.copyFileSync(path.join(__dirname,'desktop.css'),path.join(__dirname,'ui/desktop.css'));
fs.copyFileSync(path.join(__dirname,'floating-format.css'),path.join(__dirname,'ui/floating-format.css'));
fs.copyFileSync(path.join(__dirname,'mac-explorer.css'),path.join(__dirname,'ui/mac-explorer.css'));
fs.copyFileSync(path.join(__dirname,'document-chrome.css'),path.join(__dirname,'ui/document-chrome.css'));
fs.copyFileSync(path.join(__dirname,'document-groups.css'),path.join(__dirname,'ui/document-groups.css'));fs.copyFileSync(path.join(__dirname,'interface.css'),path.join(__dirname,'ui/interface.css'));
const packages=new Set();for(const input of Object.keys(result.metafile.inputs)){let folder=path.dirname(path.resolve(input));while(folder!==path.dirname(folder)){if(fs.existsSync(path.join(folder,'package.json'))){packages.add(folder);break;}folder=path.dirname(folder);}}
let licenses='Lecat - Markdown · third-party bundled resources\n\n';for(const folder of [...packages].sort()){const pkg=JSON.parse(fs.readFileSync(path.join(folder,'package.json'),'utf8'));licenses+=`\n=== ${pkg.name} ${pkg.version} · ${pkg.license||'see notice'} ===\n`;for(const entry of fs.readdirSync(folder))if(/^(license|copying|notice)(\.|$)/i.test(entry)&&fs.statSync(path.join(folder,entry)).isFile())licenses+=fs.readFileSync(path.join(folder,entry),'utf8')+'\n';}fs.writeFileSync(path.join(__dirname,'ui/THIRD-PARTY-LICENSES.txt'),licenses);
