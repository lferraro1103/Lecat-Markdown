const fs=require('node:fs/promises');
exports.run=async({win,app,temp,windowState,windowStateFile,execute,check,wait})=>{
 const file=require('node:path').join(temp,'Reabrir en pantalla completa.md');await fs.writeFile(file,'# Estado de ventana\n');
 const transition=full=>new Promise((resolve,reject)=>{if(win.isFullScreen()===full){resolve();return;}const name=full?'enter-full-screen':'leave-full-screen';const done=()=>{clearTimeout(timer);resolve();};const timer=setTimeout(()=>{win.removeListener(name,done);reject(Error('Native fullscreen transition timed out'));},12000);win.once(name,done);win.setFullScreen(full);});
 try{
  await transition(true);await windowState.capture();
  check('native fullscreen state captured before window closes',JSON.parse(await fs.readFile(windowStateFile(),'utf8')).mode==='fullscreen');
  await transition(false);
  check('native fullscreen exit during teardown cannot replace saved mode',JSON.parse(await fs.readFile(windowStateFile(),'utf8')).mode==='fullscreen');
  // Exercise the actual macOS file-open handler (also registered on Windows),
  // which must show the existing window and reapply its frozen native state.
  let restored;const nativeRestore=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('File-open fullscreen transition timed out')),12000);restored=()=>{clearTimeout(timer);resolve();};win.once('enter-full-screen',restored);});
  app.emit('open-file',{preventDefault(){}},file);
  await wait(`window.__claroTest.doc()?.path===${JSON.stringify(file)}`);
  await nativeRestore;
  check('opening a document restores fullscreen instead of a small window',win.isFullScreen());
  await transition(false);windowState.resume();
  win.maximize();const maximum=Date.now()+5000;while(!win.isMaximized()&&Date.now()<maximum)await new Promise(r=>setTimeout(r,100));await windowState.capture();
  check('native maximized state captured independently from normal bounds',JSON.parse(await fs.readFile(windowStateFile(),'utf8')).mode==='maximized');
 }finally{windowState.resume();if(win.isFullScreen())await transition(false);if(win.isMaximized())win.unmaximize();}
};
