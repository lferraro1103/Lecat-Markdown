const fs=require('node:fs/promises'),path=require('node:path');
exports.run=async({execute,check,win,out,temp,openDoc})=>{
 const file=path.join(temp,'Notas de proyecto.md');await fs.writeFile(file,'# Diseño y documentación\n\nUn espacio de trabajo enfocado en el documento.\n\n## Decisiones del proyecto\n\n- Mantener una interfaz compacta.\n- Conservar los archivos y las preferencias.\n- Usar los controles nativos del sistema.\n\n## Próximos pasos\n\nRevisar el diseño y preparar la siguiente versión.\n\n## Documentación\n\nLa documentación acompaña las decisiones del proyecto.\n');
 const document=await openDoc(file);await execute(`window.__claroTest.accept(${JSON.stringify(document)});window.__claroTest.setMode('read');`);await execute('window.__claroTest.render()');
 check('professional shell removes instructional pane and format labels',await execute(`!document.querySelector('.pane-label')&&!document.querySelector('.format-hint')`));
 const platform=await execute('document.documentElement.dataset.platform');
 for(const target of ['win32','darwin']){
  await execute(`document.documentElement.dataset.platform=${JSON.stringify(target)};document.documentElement.dataset.sidebar='open';window.__claroTest.setTheme('dark');`);
  const size=target==='darwin'?52:42;
  check(target+' compact toolbar height',await execute(`document.querySelector('.appbar').getBoundingClientRect().height===${size}`));
  await execute(`window.__claroTest.run('sidebar')`);check(target+' sidebar toggle expands reading space',await execute(`getComputedStyle(document.querySelector('#sidebar')).display==='none'&&document.querySelector('[data-command=sidebar]').getAttribute('aria-expanded')==='false'`));await execute(`window.__claroTest.run('sidebar')`);
  if(target==='darwin'){
   check('macOS titlebar reserves native traffic lights and excludes interactive controls from drag',await execute(`getComputedStyle(document.querySelector('.appbar')).webkitAppRegion==='drag'&&getComputedStyle(document.querySelector('#toolbar-find')).webkitAppRegion==='no-drag'&&parseInt(getComputedStyle(document.querySelector('.appbar')).paddingLeft)>=80`));
   check('macOS removes duplicate document header and control rows',await execute(`getComputedStyle(document.querySelector('.document-header')).display==='none'&&getComputedStyle(document.querySelector('.document-controls')).display==='none'`));
   const before=await execute('window.__claroTest.view().state.doc.toString()');
   await execute(`document.querySelector('#toolbar-find').value='documentación';window.__claroTest.toolbarSearch();`);
   check('toolbar search finds visible text without changing reading mode or document',await execute(`document.body.dataset.mode==='read'&&document.querySelector('#toolbar-find-status').textContent==='1 / 3'&&window.__claroTest.view().state.doc.toString()===${JSON.stringify(before)}`));
   await execute('window.__claroTest.toolbarSearch()');check('toolbar search moves to next result',await execute(`document.querySelector('#toolbar-find-status').textContent==='2 / 3'`));
   await execute(`document.querySelector('#toolbar-find-clear').click()`);check('clearing toolbar search removes highlights',await execute(`!CSS.highlights.has('lecat-document-search')`));
   await execute(`window.__claroTest.run('search')`);check('macOS find shortcut focuses toolbar field',await execute(`document.activeElement===document.querySelector('#toolbar-find')`));
   if(process.platform!=='darwin')await execute(`{const controls=document.createElement('div');controls.id='native-controls-preview';controls.setAttribute('aria-hidden','true');controls.style.cssText='position:absolute;top:19px;left:14px;display:flex;gap:8px;pointer-events:none';for(const color of ['#ff5f57','#febc2e','#28c840']){const dot=document.createElement('span');dot.style.cssText='width:12px;height:12px;border-radius:50%;background:'+color;controls.append(dot);}document.body.append(controls);}`);
  }
  win.setSize(1320,860);
  for(const theme of ['dark','light']){await execute(`window.__claroTest.setTheme(${JSON.stringify(theme)});`);await new Promise(r=>setTimeout(r,650));await fs.writeFile(path.join(out,'toolbar-'+target+'-'+theme+'.png'),(await win.webContents.capturePage()).toPNG());}
  win.setSize(900,650);await new Promise(r=>setTimeout(r,200));
  check(target+' toolbar fits compact window without horizontal overflow',await execute(`document.documentElement.scrollWidth<=innerWidth&&document.querySelector('.appbar').scrollWidth<=innerWidth`));
  if(target==='darwin')await execute(`document.querySelector('#native-controls-preview')?.remove()`);
 }
 await execute(`document.documentElement.dataset.platform=${JSON.stringify(platform)};document.documentElement.dataset.sidebar='open';`);
};
