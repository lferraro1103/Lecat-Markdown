const {app,BrowserWindow,ipcMain,dialog,Menu,shell,protocol,net,nativeTheme,screen,clipboard,ShareMenu}=require('electron');
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url'),{execFile}=require('node:child_process');
const core=require('./core.cjs'),persistence=require('./persistence.cjs');
const sessionStore=require('./session.cjs');
const {normalizePreferences}=require('./preferences.cjs'),{translate}=require('./locale.cjs'),{selectRelease}=require('./release-channel.cjs');
const L=(source,values)=>translate(source,settings.language||'es',values);
const {windowChrome}=require('./window-chrome.cjs'),{restorePlacement,readWindowState,trackWindowState}=require('./window-state.cjs');
let windowState,desktop;
const {fromURL,filesFromArguments}=require('./launch-arguments.cjs');
const launchErrors=[];function launchArguments(argv,cwd){try{return filesFromArguments(argv,cwd);}catch(error){launchErrors.push(error.message);return [];}}
function showWindow(){if(!win||win.isDestroyed())return;win.show();windowState?.restore();}
let activeDocumentId=null,sessionQueue=Promise.resolve(),previouslyUsed=false;
const {createUpdater,RELEASES,RELEASE_API}=require('./updater.cjs');
let updates,updateStartupTimer,updateInterval;
protocol.registerSchemesAsPrivileged([{scheme:'claro-media',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
const isMac=process.platform==='darwin';let pendingLinks=[],pendingFiles=[],rendererReady=false,quitting=false;
const defaultFolder=()=>app.getPath(isMac?'home':'documents');
const auditing=process.argv.includes('--audit');let win,settings={},closing=false,closeInProgress=false;const docs=new Map(),mediaRoots=new Map(),folders=new Set();let draftTimer,draftQueue=Promise.resolve(),settingsQueue=Promise.resolve();
if(!auditing){const userProfile=path.join(app.getPath('appData'),'ClaroMD');require('node:fs').mkdirSync(userProfile,{recursive:true});app.setPath('userData',userProfile);}
if(auditing){const auditProfile=path.join(require('node:os').tmpdir(),'claro-audit-profile-'+crypto.randomUUID());require('node:fs').mkdirSync(auditProfile);app.setPath('userData',auditProfile);}
if(!auditing&&!app.requestSingleInstanceLock())app.exit(0);
if(process.platform==='win32')app.setAppUserModelId('com.lecat.markdown');
app.on('open-file',(event,file)=>{event.preventDefault();if(!rendererReady){pendingFiles.push(file);return;}openDoc(file).then(d=>{showWindow();win.focus();command({openDoc:d});}).catch(e=>dialog.showMessageBox(win,{type:'error',message:e.message}));});
app.on('open-url',(event,url)=>{event.preventDefault();try{const parsed=new URL(url);if(parsed.protocol==='lecat:'&&parsed.hostname==='link'){const href=parsed.searchParams.get('url');if(!require('./link-policy.cjs').allowedLink(href))throw Error(L('Enlace no permitido.'));if(!rendererReady)pendingLinks.push(href);else desktop.openLink(href).catch(e=>dialog.showErrorBox(L('Abrir'),e.message));return;}const file=fromURL(url);if(!rendererReady)pendingFiles.push(file);else openDoc(file).then(d=>{showWindow();win.focus();command({openDoc:d});}).catch(e=>dialog.showErrorBox(L('Abrir'),e.message));}catch(error){if(rendererReady)dialog.showErrorBox(L('Abrir'),error.message);else launchErrors.push(error.message);}});
app.on('before-quit',event=>{if(!closing&&!auditing&&win)windowState?.capture().catch(()=>{});if(!isMac||closing||auditing||!win)return;event.preventDefault();quitting=true;win.close();});
app.on('activate',()=>{if(win&&!win.isDestroyed()&&rendererReady){showWindow();win.focus();}});
app.on('second-instance',async(_event,argv,workingDirectory)=>{const files=launchArguments(argv,workingDirectory);if(!win||!rendererReady){pendingFiles.push(...files);return;}if(win.isMinimized())win.restore();showWindow();win.focus();for(const file of files)try{command({openDoc:await openDoc(file)});}catch(error){dialog.showErrorBox(L('Abrir'),error.message);}});
const settingsFile=()=>path.join(app.getPath('userData'),'settings.json');const draftFile=()=>path.join(app.getPath('userData'),'drafts.json');
const sessionFile=()=>path.join(app.getPath('userData'),'session.json');
const windowStateFile=()=>path.join(app.getPath('userData'),'window-state.json');
async function persistSession(selection=[...docs.values()],activeId=activeDocumentId){const snapshot=sessionStore.snapshotSession(selection,activeId);sessionQueue=sessionQueue.catch(()=>{}).then(()=>persistence.writeJson(sessionFile(),snapshot));await sessionQueue;return snapshot;}
const saveJobs=new Map();
const mediaCache=new Map();
function releaseMedia(id){const cache=mediaCache.get(id);if(cache)for(const token of cache.values())mediaRoots.delete(token);mediaCache.delete(id);}
function samePath(a,b){const left=path.resolve(a),right=path.resolve(b);return process.platform==='win32'?left.toLowerCase()===right.toLowerCase():left===right;}
function publicDoc(d){return {id:d.id,path:d.path,name:d.name,content:d.content,dirty:d.dirty,encoding:d.encoding,eol:d.eol};}
function addDoc(d){d.id=crypto.randomUUID();d.dirty=!!d.dirty;d.savedContent=d.savedContent??d.content;docs.set(d.id,d);if(d.path)folders.add(path.dirname(d.path));return publicDoc(d);}
async function rememberFile(file){try{await desktop?.remember(file);}catch(error){const message=L('No se pudo guardar el historial. ')+error.message;if(rendererReady)command({desktopWarning:message});else launchErrors.push(message);}}
async function openDoc(file){const existing=[...docs.values()].find(d=>d.path&&samePath(d.path,file));const result=existing?publicDoc(existing):addDoc(await core.read(file));await rememberFile(result.path);return result;}
async function persistSettings(value){if(!value||typeof value!=='object')throw Error('Preferencias no válidas.');const previous=settings,snapshot=normalizePreferences(value,settings);updates?.setChannel(snapshot.allowBeta);settings=snapshot;nativeTheme.themeSource=snapshot.theme;settingsQueue=settingsQueue.catch(()=>{}).then(()=>persistence.writeJson(settingsFile(),snapshot));try{await settingsQueue;}catch(error){if(settings===snapshot){settings=previous;updates?.setChannel(previous.allowBeta===true);nativeTheme.themeSource=previous.theme||'system';}throw error;}setMenu();return snapshot;}
async function loadInitialFile(file,warnings){try{return await openDoc(file);}catch(error){warnings.push('No se pudo abrir '+file+': '+error.message);return null;}}
async function saveDrafts(selection=[...docs.values()]){const snapshot=selection.filter(d=>d.dirty).map(d=>({...d}));draftQueue=draftQueue.catch(()=>{}).then(()=>persistence.writeJson(draftFile(),snapshot));await draftQueue;}
async function closeSessionDocument(id,document){
 const previousIds=[...docs.keys()],previousActive=activeDocumentId;docs.delete(id);
 if(activeDocumentId===id)activeDocumentId=[...docs.keys()].at(-1)||null;
 try{await persistSession();}catch(error){const current=new Map(docs);docs.clear();for(const key of previousIds){const value=key===id?document:current.get(key);if(value)docs.set(key,value);}for(const [key,value] of current)if(!docs.has(key))docs.set(key,value);if(previousActive&&docs.has(previousActive))activeDocumentId=previousActive;await saveDrafts();throw error;}
}
async function updateDrafts(){clearTimeout(draftTimer);draftTimer=setTimeout(()=>saveDrafts().then(()=>persistSession()).catch(()=>{}),350);}
async function saveDoc(id,as=false){const previous=saveJobs.get(id)||Promise.resolve();const job=previous.catch(()=>{}).then(()=>performSaveDoc(id,as));saveJobs.set(id,job);try{return await job;}finally{if(saveJobs.get(id)===job)saveJobs.delete(id);}}
async function performSaveDoc(id,as=false){const doc=docs.get(id);if(!doc)throw Error('Documento no abierto.');let target=doc.path;
 if(as||!target){const result=await dialog.showSaveDialog(win,{title:L('Guardar'),defaultPath:target||path.join(defaultFolder(),doc.name),filters:[{name:'Markdown',extensions:['md','markdown']}]});if(result.canceled)return null;target=result.filePath;if(!/\.(md|markdown)$/i.test(target))target+='.md';}
 let output={...doc,path:target};
 if(target!==doc.path){if([...docs.values()].some(d=>d.id!==id&&d.path&&samePath(d.path,target)))throw Error('Ese archivo ya está abierto en otra pestaña.');output={...output,hash:null,encoding:'utf8',bom:false};}
 const snapshot=doc.content;const saved=await core.atomicSave(output,snapshot,{allowOverwrite:target!==doc.path||!doc.path});const currentContent=doc.content;Object.assign(doc,saved,{content:currentContent,dirty:currentContent!==snapshot,savedContent:snapshot,name:path.basename(target)});folders.add(path.dirname(target));await saveDrafts();await persistSession();await rememberFile(doc.path);return publicDoc(doc);
}
async function confirmClose(id,remove=true){if(saveJobs.has(id))await saveJobs.get(id);const d=docs.get(id);if(!d)return true;if(d.dirty){const choice=await dialog.showMessageBox(win,{type:'warning',title:L('Cambios sin guardar'),message:L('¿Guardar los cambios de {name}?',{name:d.name}),buttons:['Guardar','Descartar','Cancelar'].map(label=>L(label)),defaultId:0,cancelId:2,noLink:true});if(choice.response===2)return false;if(choice.response===0){const saved=await saveDoc(id);if(!saved||d.dirty)return false;}}if(remove){const approved=d.content;await saveDrafts([...docs.values()].filter(other=>other.id!==id));if(d.content!==approved){await saveDrafts();return false;}await closeSessionDocument(id,d);releaseMedia(id);}return true;}
async function approveWindowClose(){const approved=new Map();for(const id of [...docs.keys()]){if(!await confirmClose(id,false)){command({documentStates:[...docs.values()].map(publicDoc)});return false;}approved.set(id,docs.get(id)?.content);}await persistSession();await saveDrafts([]);if(docs.size!==approved.size||[...docs.values()].some(d=>d.content!==approved.get(d.id))){await saveDrafts();command({documentStates:[...docs.values()].map(publicDoc)});return false;}return true;}
function command(cmd){win.webContents.send('command',cmd);}
nativeTheme.on('updated',()=>{if(win&&!win.isDestroyed()&&rendererReady&&nativeTheme.themeSource==='system')command({systemTheme:nativeTheme.shouldUseDarkColors?'dark':'light'});});
function setMenu(){
 const item=(label,accelerator,cmd)=>({label,accelerator:accelerator.replace('Ctrl','CommandOrControl'),click:()=>command(cmd)});
 const labels=items=>items.map(value=>({...value,...(value.label?{label:L(value.label)}:{}),...(value.submenu?{submenu:labels(value.submenu)}:{})}));
 const template=[
 ...(isMac?[{label:'Lecat - Markdown',submenu:[{role:'about',label:'Acerca de Lecat - Markdown'},{label:'Configuración…',click:()=>command('preferences')},{type:'separator'},{role:'services',label:'Servicios'},{type:'separator'},{role:'hide',label:'Ocultar Lecat - Markdown'},{role:'hideOthers',label:'Ocultar otras'},{role:'unhide',label:'Mostrar todo'},{type:'separator'},{role:'quit',label:'Salir'}]}]:[]),
 {label:'Archivo',submenu:[item('Nuevo','Ctrl+N','new'),item('Abrir documento…','Ctrl+O','open'),item('Abrir carpeta…','Ctrl+Shift+O','folder'),{type:'separator'},item('Guardar','Ctrl+S','save'),item('Guardar como…','Ctrl+Shift+S','saveAs'),item('Exportar PDF…','Ctrl+Alt+P','pdf'),item('Exportar…','Ctrl+Alt+E','export'),item('Imprimir…','Ctrl+P','print'),item('Compartir','Ctrl+Shift+L','share'),item('Copiar Markdown','Ctrl+Shift+C','copyMarkdown'),{type:'separator'},item('Cerrar pestaña','Ctrl+W','close'),{label:'Salir',click:()=>{quitting=true;win.close();}}]},
 {label:'Editar',submenu:[item('Deshacer','Ctrl+Z','undo'),item('Rehacer',isMac?'Ctrl+Shift+Z':'Ctrl+Y','redo'),{type:'separator'},{role:'cut',label:'Cortar'},{role:'copy',label:'Copiar'},{role:'paste',label:'Pegar'},{role:'selectAll',label:'Seleccionar todo'},item('Buscar en documento','Ctrl+F','search'),item('Buscar / reemplazar','Ctrl+Alt+F','replace'),item('Negrita','Ctrl+B','bold'),item('Cursiva','Ctrl+I','italic')]},
 {label:'Vista',submenu:[item('Lectura','Ctrl+1','read'),item('Edición','Ctrl+2','edit'),item('Código y vista previa','Ctrl+3','split'),item('Mostrar u ocultar explorador','Ctrl+Shift+E','sidebar'),item('Modo enfoque','Ctrl+Shift+F','focus'),item('Inspector','Ctrl+Alt+I','inspector'),item('Recientes','Ctrl+Shift+R','recents'),{label:'Siempre encima',type:'checkbox',checked:desktop?.snapshot().alwaysOnTop===true,click:menu=>desktop.methods.alwaysOnTop(menu.checked).then(setMenu).catch(e=>dialog.showErrorBox(L('Configuración'),e.message))},item('Cambiar tema','Ctrl+Shift+T','theme'),{label:'Usar tema del sistema',click:()=>command('systemTheme')},{role:'togglefullscreen',label:'Pantalla completa'},item('Acercar','Ctrl+=','zoomIn'),item('Alejar','Ctrl+-','zoomOut'),item('Restablecer zoom','Ctrl+0','zoomReset')]},
 {label:'Configuración',submenu:[item('General…','Ctrl+,','preferences')]},
 {label:'Ayuda',submenu:[{label:'Buscar actualizaciones…',click:()=>command('updates')},{type:'separator'},{label:'Acerca de Lecat - Markdown',click:()=>dialog.showMessageBox(win,{title:'Lecat - Markdown',message:'Lecat - Markdown '+app.getVersion(),detail:L('Editor y lector Markdown. Edición visual, diagramas y fórmulas sin conexión.')})}]}
 ];Menu.setApplicationMenu(Menu.buildFromTemplate(labels(template)));
}
async function places(){const names=[['desktop','Escritorio'],['downloads','Descargas'],['documents','Documentos'],['pictures','Imágenes'],['music','Música'],['videos','Vídeos']];const quick=names.map(([id,name])=>({name,path:app.getPath(id),directory:true}));let drives=[],extra=[];
 if(process.platform==='win32'){
 const script="[Console]::OutputEncoding=[Text.UTF8Encoding]::new(); $q=(New-Object -ComObject Shell.Application).NameSpace('shell:::{679f85cb-0220-4080-b29b-5540cc05aab6}').Items() | Where-Object {$_.IsFolder -and [IO.Directory]::Exists($_.Path)} | ForEach-Object { @{name=$_.Name;path=$_.Path;directory=$true} }; $d=Get-CimInstance Win32_LogicalDisk | ForEach-Object { @{name=($_.DeviceID+' '+$_.VolumeName).Trim();path=($_.DeviceID+'\\');directory=$true} }; @{quick=@($q);drives=@($d)} | ConvertTo-Json -Depth 4 -Compress";
 try{const value=await new Promise((resolve,reject)=>execFile('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true,timeout:6000,encoding:'utf8'},(e,out)=>e?reject(e):resolve(JSON.parse(out))));drives=value.drives;extra=value.quick.filter(q=>!quick.some(k=>k.path.toLowerCase()===q.path.toLowerCase()));}catch{for(const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')try{await fs.access(letter+':\\');drives.push({name:letter+':',path:letter+':\\',directory:true});}catch{}}
 }else if(isMac){drives=await require('./macos-locations.cjs').macDrives();}else {drives=[{name:'Sistema',path:'/',directory:true}];}
 for(const p of [...quick,...extra,...drives])folders.add(p.path);return {quick,extra,drives};
}
function register(name,handler){ipcMain.handle('claro:'+name,async(e,...args)=>{if(e.sender!==win.webContents||e.senderFrame!==win.webContents.mainFrame||e.senderFrame.url!==pathToFileURL(path.join(__dirname,'ui/index.html')).href)throw Error('Origen no autorizado.');try{return {ok:true,value:await handler(...args)};}catch(error){return {ok:false,error:error.message};}});}
app.whenReady().then(async()=>{
 previouslyUsed=await fs.stat(settingsFile()).then(()=>true,()=>false);
 try{settings=JSON.parse(await fs.readFile(settingsFile(),'utf8'));}catch{}
 if(!previouslyUsed)previouslyUsed=await fs.stat(draftFile()).then(()=>true,()=>false);
 settings=normalizePreferences(settings);
 if(auditing&&['system','light','dark'].includes(process.env.CLARO_AUDIT_THEME))settings.theme=process.env.CLARO_AUDIT_THEME;
 nativeTheme.themeSource=settings.theme;
 const startupTheme=nativeTheme.shouldUseDarkColors?'dark':'light';
 const layoutPlatform=auditing&&process.env.CLARO_AUDIT_PLATFORM==='darwin'?'darwin':process.platform;
 const savedWindow=await readWindowState(windowStateFile()),bounds=savedWindow?.bounds;
 const validBounds=bounds&&['x','y','width','height'].every(key=>Number.isFinite(bounds[key]))&&bounds.width>0&&bounds.height>0;
 const placement=restorePlacement(savedWindow,(validBounds?screen.getDisplayMatching(bounds):screen.getPrimaryDisplay()).workArea);
 protocol.handle('claro-media',async request=>{try{const u=new URL(request.url),file=mediaRoots.get(u.hostname);if(!file||decodeURIComponent(u.pathname)!=='/'+path.basename(file))return new Response('',{status:403});if((await fs.stat(file)).size>core.MAX)return new Response('',{status:413});return net.fetch(pathToFileURL(file).href);}catch{return new Response('',{status:404});}});
 win=new BrowserWindow({...placement.bounds,minWidth:820,minHeight:560,show:false,...windowChrome(process.platform,startupTheme),backgroundColor:windowChrome(layoutPlatform,startupTheme).backgroundColor,title:'Lecat - Markdown',icon:path.join(__dirname,isMac?'../branding/Lecat.png':'../branding/Lecat.ico'),autoHideMenuBar:false,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,spellcheck:false,additionalArguments:['--lecat-theme='+startupTheme,'--lecat-platform='+layoutPlatform]}});
 // Apply the outer bounds after native frame creation (including Windows DPI).
 win.setBounds(placement.bounds);
 desktop=require('./desktop.cjs').createDesktop({app,win,dialog,shell,ShareMenu,Menu,clipboard,docs,openDoc,command,L,core,fromURL});await desktop.init();for(const [name,handler] of Object.entries(desktop.methods))register(name,handler);
 if(!auditing&&app.isPackaged)app.setAsDefaultProtocolClient('lecat');
 const exporter=require('./export.cjs').createExporter({app,win,BrowserWindow,dialog,docs,L});register('exportDocument',exporter);
 register('installCLI',async()=>L('Comando instalado en {path}. Agregá esa carpeta a PATH.',{path:await require('./cli.cjs').installCLI(app)}));
 win.on('always-on-top-changed',()=>setMenu());
 windowState=trackWindowState(win,{initial:placement,persist:value=>persistence.writeJson(windowStateFile(),value),onError:error=>{if(rendererReady)command({windowStateError:'No se pudo guardar el estado de la ventana. '+error.message});}});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());win.webContents.session.setPermissionRequestHandler((_wc,_p,cb)=>cb(false));
 const installedWindows=process.platform==='win32'&&require('node:fs').existsSync(path.join(path.dirname(process.execPath),'Uninstall Lecat - Markdown.exe'));
 const signedMac=isMac&&require('../package.json').updaterMacSigned===true;
 const helper=path.join(process.resourcesPath,'..','Frameworks','LecatUpdater.app','Contents','MacOS','LecatUpdater'),sparkleMac=isMac&&require('node:fs').existsSync(helper);
 const supported=app.isPackaged&&(installedWindows||sparkleMac||signedMac)&&!auditing;
 const reason=!app.isPackaged||auditing?'La actualización se instala desde la versión instalada del programa.':isMac&&!sparkleMac&&!signedMac?'Instalá la nueva edición para habilitar las actualizaciones desde la aplicación.':!installedWindows&&!isMac?'Esta edición portable requiere descargar la nueva versión; el instalador de Windows permite actualizar desde la aplicación.':'';
 const backend=sparkleMac?new (require('./mac-updater.cjs').MacUpdater)({currentVersion:app.getVersion(),arch:process.arch,publicKey:require('../build/mac-update-key.json').publicKey,cacheDir:path.join(app.getPath('userData'),'updates'),helper,fetch:(url,options)=>net.fetch(url,options),quit:()=>app.quit()}):require('electron-updater').autoUpdater;
 updates=createUpdater({updater:backend,currentVersion:app.getVersion(),supported,reason,allowBeta:settings.allowBeta,resolveRelease:process.platform==='win32'?allowBeta=>selectRelease((url,options)=>net.fetch(url,options),{currentVersion:app.getVersion(),allowBeta,platform:'win32',arch:process.arch}):null,
  notify:value=>{if(value.status==='error'&&closing){closing=false;quitting=false;windowState?.resume();saveDrafts().catch(()=>{});}if(rendererReady&&!win.isDestroyed())command({updateState:value});},
  fetchRelease:allowBeta=>selectRelease((url,options)=>net.fetch(url,options),{currentVersion:app.getVersion(),allowBeta}),
  prepareInstall:async()=>{if(closeInProgress)return false;closeInProgress=true;try{await windowState.capture();await settingsQueue;if(!await approveWindowClose()){windowState.resume();return false;}clearTimeout(draftTimer);closing=true;quitting=true;return true;}catch(error){windowState.resume();throw error;}finally{closeInProgress=false;}}
 });
 register('updateStatus',()=>updates.snapshot());register('updateCheck',()=>updates.check());
 register('updateDownload',()=>updates.download());register('updateInstall',()=>updates.install());
 register('updateRelease',()=>shell.openExternal(RELEASES));
 win.on('close',e=>{if(closing||auditing)return;e.preventDefault();if(closeInProgress)return;closeInProgress=true;(async()=>{await windowState.capture();if(isMac&&!quitting){win.hide();return;}if(!await approveWindowClose()){windowState.resume();quitting=false;showWindow();return;}docs.clear();mediaRoots.clear();mediaCache.clear();clearTimeout(draftTimer);closing=true;win.close();if(isMac)app.quit();})().catch(error=>{windowState.resume();dialog.showMessageBox(win,{type:'error',message:error.message});}).finally(()=>{closeInProgress=false;});});
 register('bootstrap',async()=>{const locations=await places(),warnings=[...launchErrors];let recovered=[],saved={session:null,existed:false,warnings:[]};if(!auditing){saved=await sessionStore.readSession(sessionFile());const recovery=await persistence.readRecovery(draftFile());recovered=recovery.documents.map(d=>({...addDoc({...d,dirty:true}),recoveryId:d.id}));warnings.push(...saved.warnings,...recovery.warnings);}
 const restored=await sessionStore.restoreSession(saved.session,recovered,openDoc,warnings);recovered=restored.documents;activeDocumentId=restored.activeId;
 const launchFiles=[...launchArguments(process.argv),...pendingFiles.splice(0)];
 for(const file of launchFiles){const opened=await loadInitialFile(file,warnings);if(opened){if(!recovered.some(d=>d.id===opened.id))recovered.push(opened);activeDocumentId=opened.id;}}
 if(!recovered.length){if(!previouslyUsed&&!saved.existed){const example=await core.read(path.join(__dirname,'../examples/Bienvenido.md'));recovered.push(addDoc({...example,path:null,hash:null,assetBase:path.dirname(example.path)}));}else recovered.push(addDoc({name:'Sin título.md',content:'',encoding:'utf8',bom:false,eol:'LF',hash:null,path:null}));}
 const ordered=recovered.map(d=>docs.get(d.id));docs.clear();for(const document of ordered)docs.set(document.id,document);
 activeDocumentId=activeDocumentId||recovered[0].id;await persistSession(recovered,activeDocumentId);previouslyUsed=true;
 return {places:locations,defaultFolder:defaultFolder(),settings,docs:recovered,activeId:activeDocumentId,auditing,warnings,platform:layoutPlatform,theme:nativeTheme.shouldUseDarkColors?'dark':'light'};});
 register('active',async id=>{if(!docs.has(id))throw Error('Documento no abierto.');activeDocumentId=id;await persistSession();return true;});
 register('ready',async()=>{rendererReady=true;for(const href of pendingLinks.splice(0))desktop.openLink(href).catch(e=>dialog.showErrorBox(L('Abrir'),e.message));if(!auditing){showWindow();if(!updateInterval){updateStartupTimer=setTimeout(()=>updates.check(),15000);updateInterval=setInterval(()=>updates.check(),4*60*60*1000);updateStartupTimer.unref();updateInterval.unref();}}for(const file of pendingFiles.splice(0))try{command({openDoc:await openDoc(file)});}catch(e){dialog.showMessageBox(win,{type:'error',message:e.message});}return true;});
 register('list',async folder=>{if(typeof folder!=='string'||!path.isAbsolute(folder))throw Error('Ruta no válida.');const result=await core.list(folder);folders.add(folder);for(const e of result)if(e.directory)folders.add(e.path);return result;});
 register('open',async file=>{if(typeof file!=='string'||!path.isAbsolute(file))throw Error('Ruta no válida.');return openDoc(file);});
 register('new',()=>addDoc({name:'Sin título.md',content:'',encoding:'utf8',bom:false,eol:'LF',hash:null,path:null}));
 register('update',async(id,content)=>{const d=docs.get(id);if(!d||typeof content!=='string'||Buffer.byteLength(content)>core.MAX)throw Error('Documento no válido.');d.content=d.eol==='CRLF'?content.replace(/\r?\n/g,'\r\n'):content;d.dirty=d.content!==d.savedContent;await updateDrafts();return d.dirty;});
 register('save',id=>saveDoc(id));register('saveAs',id=>saveDoc(id,true));register('close',id=>confirmClose(id));
 register('pickFile',async()=>{const r=await dialog.showOpenDialog(win,{properties:['openFile'],filters:[{name:'Markdown',extensions:['md','markdown']}]});return r.canceled?null:openDoc(r.filePaths[0]);});
 register('pickFolder',async()=>{const r=await dialog.showOpenDialog(win,{properties:['openDirectory']});return r.canceled?null:r.filePaths[0];});
 register('settings',persistSettings);register('getSettings',()=>settings);
 register('pickFiles',async folder=>{const r=await dialog.showOpenDialog(win,{title:L('Buscar archivos…'),defaultPath:typeof folder==='string'&&path.isAbsolute(folder)?folder:defaultFolder(),properties:['openFile','multiSelections'],filters:[{name:'Markdown',extensions:['md','markdown']}]});if(r.canceled)return [];const opened=[];for(const file of r.filePaths)opened.push(await openDoc(file));return opened;});
 register('revealFolder',async folder=>{if(!isMac||typeof folder!=='string'||!path.isAbsolute(folder)||!(await fs.stat(folder)).isDirectory())throw Error('Carpeta no válida.');const error=await shell.openPath(folder);if(error)throw Error(error);return true;});
 register('systemTheme',async()=>{nativeTheme.themeSource='system';return nativeTheme.shouldUseDarkColors?'dark':'light';});
 register('link',async(id,href)=>{if(typeof href!=='string'||!require('./link-policy.cjs').allowedLink(href))throw Error(L('Enlace no permitido.'));if(require('./link-policy.cjs').schemeOf(href))return desktop.openLink(href);const d=docs.get(id);if(!d?.path)throw Error(L('Enlace no permitido.'));const [file,...fragment]=href.split('#'),opened=await openDoc(path.resolve(path.dirname(d.path),decodeURIComponent(file)));return {...opened,anchor:fragment.length?decodeURIComponent(fragment.join('#')):null};});
 register('media',async(id,href)=>{const d=docs.get(id),base=d?.path?path.dirname(d.path):d?.assetBase;if(!base||typeof href!=='string'||/^[a-z]+:/i.test(href))throw Error('Imagen no permitida.');const file=await fs.realpath(path.resolve(base,decodeURIComponent(href)));if(!/\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(file)||(await fs.stat(file)).size>core.MAX)throw Error('Imagen no válida.');let cache=mediaCache.get(id);if(!cache){cache=new Map();mediaCache.set(id,cache);}let token=cache.get(file);if(!token){token=crypto.randomUUID();cache.set(file,token);mediaRoots.set(token,file);}return 'claro-media://'+token+'/'+encodeURIComponent(path.basename(file));});
 register('mediaData',async(id,href)=>{const url=new URL(href),file=mediaRoots.get(url.hostname),cache=mediaCache.get(id);if(url.protocol!=='claro-media:'||!file||!cache||cache.get(file)!==url.hostname||decodeURIComponent(url.pathname)!=='/'+path.basename(file))throw Error('Imagen no permitida.');const stat=await fs.stat(file);if(!stat.isFile()||stat.size>core.MAX)throw Error('Imagen no válida.');const bytes=await fs.readFile(file);if(bytes.length>core.MAX)throw Error('Imagen no válida.');const type={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',svg:'image/svg+xml',bmp:'image/bmp',avif:'image/avif'}[path.extname(file).slice(1).toLowerCase()];if(!type)throw Error('Imagen no válida.');return 'data:'+type+';base64,'+bytes.toString('base64');});
 register('exportSvg',async svg=>{if(typeof svg!=='string'||svg.length>2000000||!svg.startsWith('<svg'))throw Error('Gráfico no válido.');const r=await dialog.showSaveDialog(win,{defaultPath:'grafico.svg',filters:[{name:'SVG',extensions:['svg']}]});if(!r.canceled)await fs.writeFile(r.filePath,svg);return !r.canceled;});
 register('exportPdf',async()=>{const r=await dialog.showSaveDialog(win,{defaultPath:'documento.pdf',filters:[{name:'PDF',extensions:['pdf']}]});if(r.canceled)return false;await fs.writeFile(r.filePath,await win.webContents.printToPDF({printBackground:true,preferCSSPageSize:true}));return true;});
 register('window',action=>{if(action==='minimize')win.minimize();else if(action==='maximize')win.isMaximized()?win.unmaximize():win.maximize();else if(action==='close')win.close();});
 register('audit',async()=>{if(!auditing)throw Error('Auditoría desactivada.');return true;});
 if(auditing)win.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_details,cb)=>cb({cancel:true}));
 setMenu();await win.loadFile(path.join(__dirname,'ui/index.html'));if(auditing)await require('./audit.cjs').run({win,docs,openDoc,saveDoc,confirmClose,saveDrafts,draftFile,dialog,core,app,approveWindowClose,persistSettings,settingsFile,loadInitialFile,sessionFile,persistSession,windowState,windowStateFile});
}).catch(e=>{console.error(e);app.exit(1);});
app.on('window-all-closed',()=>{if(!isMac||quitting)app.quit();});
app.on('will-quit',()=>{clearTimeout(updateStartupTimer);clearInterval(updateInterval);windowState?.dispose();});
