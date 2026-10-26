const fs=require('node:fs/promises'),path=require('node:path');
exports.run=async({execute,check,wait,win,out,temp,dialog})=>{
 const settle=()=>execute('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
 const shot=async name=>fs.writeFile(path.join(out,name+'.png'),(await win.webContents.capturePage()).toPNG());
 check('explorer header has no duplicate open-folder button',await execute(`!document.querySelector('.side-header [data-command=folder]')`));
 check('theme button is removed from main toolbar on both platforms',await execute(`!document.querySelector('.appbar [data-command=theme]')`));
 await execute(`window.__claroTest.run('preferences')`);await wait(`document.querySelector('#preferences-dialog').open`);
 for(const theme of ['dark','light','system']){
  await execute(`document.querySelector('#preference-theme').value=${JSON.stringify(theme)};document.querySelector('#preference-theme').dispatchEvent(new Event('change'))`);
  await wait(`!document.querySelector('#preference-theme').disabled&&document.querySelector('#preference-status').textContent!==''`);
  check('settings persist '+theme+' theme',await execute(`window.__claroTest.api('getSettings').then(value=>value.theme===${JSON.stringify(theme)})`));
  const expected=theme==='system'?(require('electron').nativeTheme.shouldUseDarkColors?'dark':'light'):theme;
  check('settings apply '+theme+' theme immediately',await execute(`document.documentElement.dataset.theme===${JSON.stringify(expected)}`));
 }
 const platform=await execute('document.documentElement.dataset.platform');win.setSize(1280,850);await settle();await shot('preferences-theme-'+platform);
 await execute(`document.querySelector('#preferences-close').click();window.__claroTest.run('preferences')`);await wait(`document.querySelector('#preferences-dialog').open`);
 check('theme selection survives reopening settings',await execute(`document.querySelector('#preference-theme').value==='system'`));await execute(`document.querySelector('#preferences-close').click()`);
 if(await execute(`document.documentElement.dataset.platform!=='darwin'`))return;
 check('macOS save status is next to encoding in footer and absent from toolbar',await execute(`document.querySelector('footer>#save-state')!==null&&!document.querySelector('.appbar #save-state')`));
 await execute(`document.querySelector('#inspector').hidden=true;window.__claroTest.floatingFormat.setState({visible:false,position:'top-center'})`);
 const folder=path.join(temp,'581004 - 2026-2C - Fundamentos de telecomunicaciones'),branch=path.join(folder,'Clase 24-09 (transcripción)'),transcript=path.join(branch,'transcripcion_completa.md');
 for(const child of ['01 Presentaciones','02 Apuntes','Clase 24-09 (transcripción)','General','old'])await fs.mkdir(path.join(folder,child),{recursive:true});
 const content='# Resumen del parcial\n\n## Fundamentos de telecomunicaciones\n\nNotas de clase, ejercicios y material de estudio organizados en una sola carpeta.\n\n### Temas principales\n\n- Señales y sistemas de comunicación.\n- Ancho de banda y capacidad del canal.\n- Modulación y transmisión de datos.\n\n## Material de consulta\n\nExplorá las carpetas de la izquierda para abrir las presentaciones, los apuntes y las transcripciones.\n';
 const names=['Apunte Modulación.md','Guía extra de ejercicios.md','QUE ENTRA EN EL PARCIAL.md','RESUELTO Ejercicios 1er Parcial.md','Resumen Parcial - Fundamentos.md'];
 for(const name of names)await fs.writeFile(path.join(folder,name),content);await fs.writeFile(transcript,'# Transcripción de clase\n\nContenido de la clase.');
 const load=()=>execute(`window.__claroTest.loadFolder(${JSON.stringify(folder)})`);
 await load();await settle();
 check('macOS new and open actions are absent from right toolbar',await execute(`['new','open'].every(command=>!document.querySelector('.app-actions [data-command='+command+']').getClientRects().length)`));
 check('macOS folder tree replaces separate sidebar action rows',await execute(`document.querySelector('#files').getAttribute('role')==='tree'&&!document.querySelector('.sidebar-tools').getClientRects().length&&!document.querySelector('.finder-actions').getClientRects().length`));
 const row=target=>`Array.from(document.querySelectorAll('#files [role=treeitem]')).find(e=>e.dataset.path===${JSON.stringify(target)})`;
 await execute(`${row(branch)}.click()`);await wait(`${row(transcript)}!==undefined`);
 check('expanding a folder preserves root and siblings',await execute(`document.querySelector('#path').value===${JSON.stringify(folder)}&&${row(path.join(folder,names[0]))}!==undefined&&${row(branch)}.getAttribute('aria-expanded')==='true'`));
 await execute(`document.querySelector('#filter').value='transcripcion';document.querySelector('#filter').dispatchEvent(new Event('input'))`);await settle();
 check('tree filter keeps ancestors of matching nested files',await execute(`${row(transcript)}!==undefined&&${row(branch)}!==undefined&&${row(path.join(folder,names[0]))}===undefined`));
 await execute(`document.querySelector('#filter').value='';document.querySelector('#filter').dispatchEvent(new Event('input'))`);await settle();
 await execute(`${row(transcript)}.focus()`);win.webContents.sendInputEvent({type:'keyDown',keyCode:'LEFT'});win.webContents.sendInputEvent({type:'keyUp',keyCode:'LEFT'});await settle();
 check('tree keyboard navigation returns to parent folder',await execute(`document.activeElement.dataset.path===${JSON.stringify(branch)}`));
 const openMenu=async()=>{await execute(`document.querySelector('#explorer-create').click()`);await wait(`document.querySelector('#explorer-create-menu').matches(':popover-open')`);};
 const item=label=>`Array.from(document.querySelectorAll('#explorer-create-menu [role=menuitem]')).find(e=>e.textContent===${JSON.stringify(label)})`;
 await openMenu();
 check('bottom create menu stays within viewport and above its button',await execute(`(()=>{const m=document.querySelector('#explorer-create-menu').getBoundingClientRect(),b=document.querySelector('#explorer-create').getBoundingClientRect();return m.left>=0&&m.top>=0&&m.right<=innerWidth&&m.bottom<b.top;})()`));
 await execute(`${item('Nuevo archivo')}.click()`);await wait(`document.querySelector('#edit-dialog').open`);
 await execute(`document.querySelector('#edit-value').value='Nueva nota.md';document.querySelector('#edit-dialog button[value=apply]').click()`);
 const created=path.join(branch,'Nueva nota.md');await wait(`window.__claroTest.doc().path===${JSON.stringify(created)}&&${row(created)}!==undefined`);
 check('create menu writes inside selected folder without replacing tree root',(await fs.readFile(created,'utf8'))===''&&await execute(`document.querySelector('#path').value===${JSON.stringify(folder)}`));
 await openMenu();await execute(`${item('Nueva carpeta')}.click()`);await wait(`document.querySelector('#edit-dialog').open`);await execute(`document.querySelector('#edit-value').value='Material nuevo';document.querySelector('#edit-dialog button[value=apply]').click()`);await wait(`${row(path.join(branch,'Material nuevo'))}!==undefined`);
 check('create menu can add a nested folder',(await fs.stat(path.join(branch,'Material nuevo'))).isDirectory());
 try{
  await execute(`window.__savedEnrich=window.__claroTest.finderPanel.enrich;window.__treeEnrichEntered=false;window.__claroTest.finderPanel.enrich=items=>{if(!window.__treeEnrichEntered){window.__treeEnrichEntered=true;return new Promise(resolve=>window.__releaseTreeEnrich=()=>resolve(false));}return window.__savedEnrich(items);};window.__firstTreeRefresh=window.__claroTest.fileTree.reload(${JSON.stringify(branch)});void 0`);
  await wait(`window.__treeEnrichEntered`);const added=path.join(branch,'Material actualizado');await fs.mkdir(added);
  await execute(`window.__secondTreeRefresh=window.__claroTest.fileTree.reload(${JSON.stringify(branch)});void 0`);await wait(`${row(added)}!==undefined`);
  check('tree refresh reads new entries while previous metadata is still pending',true);
  await execute(`window.__releaseTreeEnrich();Promise.all([window.__firstTreeRefresh,window.__secondTreeRefresh]).then(()=>true)`);
  check('late metadata cannot remove newly created folders',await execute(`${row(added)}!==undefined`));
 }finally{await execute(`window.__releaseTreeEnrich?.();if(window.__savedEnrich)window.__claroTest.finderPanel.enrich=window.__savedEnrich;true`);}
 const original=dialog.showOpenDialog;try{let requested;
  dialog.showOpenDialog=async(_win,options)=>{requested=options;return {canceled:false,filePaths:[path.join(folder,names.at(-1))]};};
  await openMenu();await execute(`${item('Abrir archivos…')}.click()`);await wait(`window.__claroTest.doc().path===${JSON.stringify(path.join(folder,names.at(-1)))}`);
  check('open-files menu uses selected folder and opens the document',requested.defaultPath===branch&&requested.properties.includes('multiSelections'));
 }finally{dialog.showOpenDialog=original;}
 await execute(`document.querySelector('.explorer-switch [data-view=locations]').click()`);await settle();
 check('locations switch still provides Finder shortcuts',await execute(`document.querySelector('#places').getClientRects().length>0&&!document.querySelector('#files').getClientRects().length`));
 await execute(`document.querySelector('.explorer-history').click()`);await wait(`!document.querySelector('.recent-files').hidden`);
 check('recent files replace locations instead of sharing the sidebar',await execute(`!document.querySelector('#places').getClientRects().length&&!document.querySelector('#files').getClientRects().length&&document.querySelector('.recent-files').getClientRects().length>0`));
 await execute(`document.querySelector('.explorer-history').click()`);await wait(`document.querySelector('.recent-files').hidden`);
 await execute(`document.querySelector('.explorer-switch [data-view=tree]').click();window.__claroTest.setMode('read')`);await execute('window.__claroTest.render()');await settle();
 const originalMessage=dialog.showMessageBox;try{dialog.showMessageBox=async()=>({response:1});await execute(`(async()=>{for(const d of [...window.__claroTest.documents.values()])if(d.path!==${JSON.stringify(created)}&&d.path!==${JSON.stringify(path.join(folder,names.at(-1)))})await window.__claroTest.closeDoc(d.id);})()`);}finally{dialog.showMessageBox=originalMessage;}
 win.setSize(1280,850);
 for(const theme of ['dark','light']){await execute(`window.__claroTest.setTheme(${JSON.stringify(theme)});document.querySelector('#toast').hidden=true;document.querySelector('#preview-scroll').scrollTop=0`);await execute('window.__claroTest.render()');await settle();
  check('macOS '+theme+' filter stays at bottom without overlap',await execute(`(()=>{const f=document.querySelector('.mac-explorer-footer').getBoundingClientRect(),s=document.querySelector('#sidebar').getBoundingClientRect(),tree=document.querySelector('#files').getBoundingClientRect();return f.bottom<=s.bottom&&s.bottom-f.bottom<2&&tree.bottom<=f.top;})()`));
  await shot('mac-explorer-'+theme);await openMenu();await shot('mac-explorer-'+theme+'-menu');await execute(`document.querySelector('#explorer-create-menu').hidePopover()`);
 }
};
