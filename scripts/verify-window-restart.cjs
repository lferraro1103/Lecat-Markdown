const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
if(process.versions.electron){
 const {app,net,screen}=require('electron'),profile=process.argv[2],expected=process.argv[3],file=path.join(profile,'Documento.md');
 app.setPath('appData',profile);
 const progress=stage=>fs.writeFileSync(path.join(profile,expected+'.json'),JSON.stringify({passed:false,stage,mode:expected}));progress('process-started');
 const fetch=net.fetch.bind(net);net.fetch=(url,...args)=>/^https?:/.test(String(url))?Promise.reject(Error('Offline window test')):fetch(url,...args);
 const wait=async predicate=>{const end=Date.now()+25000;while(Date.now()<end){if(await predicate())return;await new Promise(r=>setTimeout(r,100));}throw Error('Window restart timed out: '+expected);};
 app.on('browser-window-created',(_event,win)=>{progress('window-created');let enteredFullscreen=false;win.on('enter-full-screen',()=>{enteredFullscreen=true;});win.webContents.once('did-finish-load',async()=>{try{
  progress('renderer-loaded');
  await wait(()=>win.webContents.executeJavaScript('window.__claroInitialized===true'));
  progress('renderer-initialized');
  await wait(()=>win.isVisible());
  progress('window-visible');
  await wait(()=>expected==='fullscreen'?enteredFullscreen&&win.isFullScreen():expected==='maximized'?win.isMaximized():!win.isFullScreen());
  const title=await win.webContents.executeJavaScript('document.querySelector("#doc-title").textContent');assert.equal(title,'Documento.md');
  if(expected==='normal'){const b=win.getBounds(),area=screen.getDisplayMatching(b).workArea;assert(Math.abs(b.width-Math.min(900,area.width))<=2&&Math.abs(b.height-Math.min(600,area.height))<=2,JSON.stringify(b));}
  const result={passed:true,mode:expected,title,bounds:win.getNormalBounds()};
  // Quit through the real close path; the parent verifies the persisted state
  // after Electron exits and launches the next process with the same profile.
  fs.writeFileSync(path.join(profile,expected+'.json'),JSON.stringify(result));
  app.quit();
 }catch(error){fs.writeFileSync(path.join(profile,expected+'.json'),JSON.stringify({passed:false,error:error.stack,visible:win.isVisible(),fullscreen:win.isFullScreen(),maximized:win.isMaximized(),bounds:win.getBounds()}));app.exit(1);}});});
 process.argv.push(file);require('../electron/main.cjs');
}else{
 const os=require('node:os'),{execFileSync}=require('node:child_process'),electron=require('electron');
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'lecat-window-restart-')),state=path.join(profile,'ClaroMD','window-state.json');
 try{
  fs.mkdirSync(path.dirname(state));fs.writeFileSync(path.join(profile,'Documento.md'),'# Documento\n');
  for(const mode of ['normal','maximized','fullscreen']){
   fs.writeFileSync(state,JSON.stringify({version:1,bounds:{x:50,y:50,width:900,height:600},mode}));
   for(let restart=0;restart<2;restart++){
    try{execFileSync(electron,[__filename,profile,mode],{timeout:90000,windowsHide:false,stdio:'pipe'});}catch(error){const result=path.join(profile,mode+'.json');if(fs.existsSync(result))throw Error(fs.readFileSync(result,'utf8'));throw error;}
    const result=JSON.parse(fs.readFileSync(path.join(profile,mode+'.json'),'utf8'));assert.equal(result.passed,true,result.error);
    assert.equal(JSON.parse(fs.readFileSync(state,'utf8')).mode,mode);
    console.log('PASS real document launch and quit: '+mode+' (restart '+(restart+1)+')');
   }
  }
 }finally{fs.rmSync(profile,{recursive:true,force:true});}
}
