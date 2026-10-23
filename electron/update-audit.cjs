const fs=require('node:fs/promises'),path=require('node:path');
exports.run=async({execute,check,win,out})=>{
 const initial=await execute('window.__claroTest.api("updateStatus")');
 check('updater IPC returns actual application version and public releases',initial.currentVersion===require('../package.json').version&&initial.releaseUrl==='https://github.com/lferraro1103/Lecat-Markdown/releases/latest');
 await execute('window.__claroTest.run("updates")');
 check('update command opens dialog and offline IPC allows retry',await execute(`document.querySelector('#update-dialog').open&&!document.querySelector('#update-check').disabled&&document.querySelector('#update-message').textContent.includes('conexión')`));
 await execute(`document.querySelector('#update-dialog').close();`);
 const show=async value=>execute(`window.__claroTest.updateDialog.render(${JSON.stringify({...initial,supported:true,...value})});if(!document.querySelector('#update-dialog').open)document.querySelector('#update-dialog').showModal();`);
 await show({status:'available',version:'3.2.4',message:'Hay una nueva versión disponible.',notes:'<img src=x onerror="window.__updateInjected=true">\nMejoras y correcciones.'});
 check('update dialog renders release notes as inert text',await execute(`!window.__updateInjected&&!document.querySelector('#update-notes img')&&document.querySelector('#update-notes').textContent.includes('<img')`));
 check('available update offers download and no premature restart',await execute(`!document.querySelector('#update-download').hidden&&document.querySelector('#update-install').hidden`));
 await show({status:'available',version:'3.2.4',message:'Hay una nueva versión disponible.',notes:'Mejoras del editor y correcciones de estabilidad.\nSe conservan tus documentos y preferencias.'});
 check('update dialog fits its contents without empty full-height panel',await execute(`document.querySelector('#update-dialog').getBoundingClientRect().height<600`));
 for(const theme of ['dark','light']){await execute(`window.__claroTest.setTheme(${JSON.stringify(theme)});`);await new Promise(r=>setTimeout(r,700));await fs.writeFile(path.join(out,'updates-'+theme+'.png'),(await win.webContents.capturePage()).toPNG());}
 await show({status:'downloading',progress:37,message:'Descargando la actualización…'});
 check('download progress is visible and duplicate search disabled',await execute(`document.querySelector('#update-progress').value===37&&!document.querySelector('#update-progress').hidden&&document.querySelector('#update-check').disabled`));
 await show({status:'downloaded',progress:100,message:'La actualización está lista.'});
 check('downloaded update offers explicit restart',await execute(`!document.querySelector('#update-install').hidden&&document.querySelector('#update-download').hidden&&document.querySelector('#update-check').disabled`));
 await show({status:'error',message:'Sin conexión.'});
 check('network errors permit retry and opening public releases',await execute(`!document.querySelector('#update-check').disabled&&!document.querySelector('#update-release').hidden`));
 await show({status:'manual-available',supported:false,message:'Descargá la edición instalada.'});
 check('portable and ad-hoc updates offer releases without unsupported install',await execute(`!document.querySelector('#update-release').hidden&&document.querySelector('#update-download').hidden&&document.querySelector('#update-install').hidden`));
 await execute(`document.querySelector('#update-dialog').close();window.__claroTest.updateDialog.render(${JSON.stringify(initial)});`);
};
