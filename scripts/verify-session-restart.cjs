const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
if(process.versions.electron){
 const {app,BrowserWindow,net}=require('electron'),profile=process.argv[2],round=process.argv[3];
 app.setPath('appData',profile);BrowserWindow.prototype.show=function(){};
 const fetch=net.fetch.bind(net);net.fetch=(url,...args)=>/^https?:/.test(String(url))?Promise.reject(Error('Offline smoke test')):fetch(url,...args);
 const sessionFile=path.join(profile,'ClaroMD','session.json'),a=path.join(profile,'A.md'),b=path.join(profile,'B.md');
 const wait=async check=>{const end=Date.now()+25000;while(Date.now()<end){if(await check())return;await new Promise(r=>setTimeout(r,100));}throw Error('Session restart timeout');};
 app.on('browser-window-created',(_event,win)=>win.webContents.once('did-finish-load',async()=>{try{
  const execute=source=>win.webContents.executeJavaScript(source);
  await wait(()=>execute('window.__claroInitialized===true'));
  const names=await execute('Array.from(document.querySelectorAll(".tab")).map(t=>t.getAttribute("aria-label"))');
  const title=await execute('document.querySelector("#doc-title").textContent');
  if(round==='first')assert.equal(title,'Bienvenido.md');
  if(round==='open'){
   assert.equal(title,'Sin título.md');assert(!names.includes('Bienvenido.md'));
   for(const file of [a,b]){const result=await execute(`window.claro.open(${JSON.stringify(file)})`);assert.equal(result.ok,true);win.webContents.send('command',{openDoc:result.value});await wait(()=>execute(`Array.from(document.querySelectorAll('.tab')).some(t=>t.getAttribute("aria-label")===${JSON.stringify(path.basename(file))})`));}
   await execute(`Array.from(document.querySelectorAll('.tab')).find(t=>t.getAttribute("aria-label")===${JSON.stringify(path.basename(a))}).querySelector('button').click()`);
   await wait(()=>fs.existsSync(sessionFile)&&JSON.parse(fs.readFileSync(sessionFile,'utf8')).activePath===a);
  }
  if(round==='restore'){
   assert.deepEqual(names,[path.basename(a),path.basename(b)]);assert.equal(title,'A.md');
   await execute(`Array.from(document.querySelectorAll('.tab')).find(t=>t.getAttribute("aria-label")===${JSON.stringify(path.basename(b))}).querySelector('.close-tab').click()`);
   await wait(()=>!JSON.parse(fs.readFileSync(sessionFile,'utf8')).paths.includes(b));
  }
  if(round==='closed'){assert.deepEqual(names,[path.basename(a)]);assert.equal(title,'A.md');}
  if(round==='explicit'){assert.deepEqual(names,[path.basename(a),path.basename(b)]);assert.equal(title,'B.md');}
  fs.writeFileSync(path.join(profile,round+'.json'),JSON.stringify({passed:true,names,title}));
  if(process.platform==='darwin')app.quit();else win.close();
 }catch(error){fs.writeFileSync(path.join(profile,round+'.json'),JSON.stringify({passed:false,error:error.stack}));app.exit(1);}}));
 require('../electron/main.cjs');
}else{
 const os=require('node:os'),{execFileSync}=require('node:child_process'),electron=require('electron');
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'lecat-session-restart-'));
 try{
  fs.writeFileSync(path.join(profile,'A.md'),'# A\n\nPrimera pestaña.');fs.writeFileSync(path.join(profile,'B.md'),'# B\n\nSegunda pestaña.');
  for(const round of ['first','open','restore','closed','explicit']){
   const args=[__filename,profile,round];if(round==='explicit')args.push(path.join(profile,'B.md'));
   execFileSync(electron,args,{timeout:45000,windowsHide:true,stdio:'pipe'});
   const result=JSON.parse(fs.readFileSync(path.join(profile,round+'.json'),'utf8'));assert.equal(result.passed,true,result.error);
   console.log('PASS real application restart: '+round);
  }
 }finally{fs.rmSync(profile,{recursive:true,force:true});}
}
