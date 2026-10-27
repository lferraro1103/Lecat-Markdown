const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
if(process.versions.electron){
 const {app,BrowserWindow,net}=require('electron'),profile=process.argv[2],round=process.argv[3],file=path.join(profile,'Documento.pdf');app.setPath('appData',profile);BrowserWindow.prototype.show=function(){};
 const fetch=net.fetch.bind(net);net.fetch=(url,...args)=>/^https?:/.test(String(url))?Promise.reject(Error('Offline verification')):fetch(url,...args);
 const wait=async check=>{const end=Date.now()+25000;while(Date.now()<end){if(await check())return;await new Promise(r=>setTimeout(r,100));}throw Error('PDF restart timeout');};
 app.on('browser-window-created',(_event,win)=>win.webContents.once('did-finish-load',async()=>{try{const execute=source=>win.webContents.executeJavaScript(source);await wait(()=>execute('window.__claroInitialized===true'));
  if(round==='open'){const response=await execute(`window.claro.open(${JSON.stringify(file)})`);assert.equal(response.ok,true);win.webContents.send('command',{openDoc:response.value});await wait(()=>execute('document.querySelectorAll("#panes .pdf-page").length===3'));const state=await execute(`window.claro.pdfState(${JSON.stringify(response.value.id)},{page:2,zoom:1.25})`);assert.equal(state.ok,true);await execute('window.claro.settings({showPdfFiles:true})');}
  else{await wait(()=>execute('document.querySelectorAll("#panes .pdf-page").length===3'));assert.equal(await execute('document.body.dataset.documentKind'),'pdf');await wait(()=>execute('document.querySelector("#stats").textContent.includes("2 de 3")'));assert.equal(await execute('document.querySelector("#zoom").textContent'),'125%');const settings=await execute('window.claro.getSettings()');assert.equal(settings.value.showPdfFiles,true);}
  fs.writeFileSync(path.join(profile,round+'.json'),JSON.stringify({passed:true}));app.exit(0);
 }catch(error){fs.writeFileSync(path.join(profile,round+'.json'),JSON.stringify({passed:false,error:error.stack}));app.exit(1);}}));require('../electron/main.cjs');
}else{
 const os=require('node:os'),{execFileSync}=require('node:child_process'),profile=fs.mkdtempSync(path.join(os.tmpdir(),'lecat-pdf-restart-'));
 try{fs.writeFileSync(path.join(profile,'Documento.pdf'),require('../electron/pdf-fixture.cjs')());for(const round of ['open','restore']){execFileSync(require('electron'),[__filename,profile,round],{timeout:45000,windowsHide:true,stdio:'pipe'});const result=JSON.parse(fs.readFileSync(path.join(profile,round+'.json'),'utf8'));assert.equal(result.passed,true,result.error);console.log('PASS PDF real restart: '+round);}}finally{fs.rmSync(profile,{recursive:true,force:true});}
}
