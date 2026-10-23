export function createUpdateDialog({api,syncDocuments}){
 const $=id=>document.getElementById(id),dialog=$('update-dialog');let state=null,requesting=false;
 function render(value){
  state=value;const busy=['checking','downloading','installing'].includes(value.status);
  $('update-current').textContent=value.currentVersion;
  $('update-version').textContent=value.version?'Nueva versión: '+value.version:'';
  $('update-message').textContent=value.message||'Buscá nuevas versiones de Lecat - Markdown.';
  $('update-notes').textContent=value.notes||'';$('update-notes-section').hidden=!value.notes;
  $('update-progress').hidden=value.status!=='downloading';$('update-progress').value=value.progress;
  $('update-percent').textContent=value.status==='downloading'?Math.floor(value.progress)+'%':'';
  $('update-check').disabled=busy||value.status==='downloaded'||requesting;
  $('update-download').hidden=value.status!=='available';$('update-download').disabled=requesting;
  $('update-install').hidden=value.status!=='downloaded';$('update-install').disabled=requesting;
  $('update-release').hidden=value.supported&&value.status!=='error';
  const button=document.querySelector('[data-command="updates"]');
  button.classList.toggle('update-available',['available','downloaded','manual-available'].includes(value.status));
  button.title=['available','downloaded','manual-available'].includes(value.status)?'Actualización disponible':'Buscar actualizaciones';
 }
 async function action(name){
  if(requesting)return;requesting=true;if(state)render(state);
  try{if(name==='updateInstall')await syncDocuments();const value=await api(name);if(name!=='updateInstall')render(value);}
  catch(error){if(state)state={...state,message:error.message};else $('update-message').textContent=error.message;}
  finally{requesting=false;if(state)render(state);}
 }
 $('update-check').onclick=()=>action('updateCheck');
 $('update-download').onclick=()=>action('updateDownload');
 $('update-install').onclick=()=>action('updateInstall');
 $('update-release').onclick=()=>api('updateRelease').catch(e=>{$('update-message').textContent=e.message;});
 $('update-close').onclick=()=>dialog.close();
 return {render,async open(){if(!dialog.open)dialog.showModal();render(await api('updateStatus'));if(['idle','error','current'].includes(state.status))await action('updateCheck');}};
}
