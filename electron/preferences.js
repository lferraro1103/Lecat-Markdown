import {t,LANGUAGES} from './i18n.js';
export function createPreferencesDialog({api,onApply,onUpdates}){
 const dialog=document.getElementById('preferences-dialog'),language=document.getElementById('preference-language'),theme=document.getElementById('preference-theme'),beta=document.getElementById('preference-beta'),status=document.getElementById('preference-status');let state=null,saving=false;
 for(const [id,name]of LANGUAGES){const option=document.createElement('option');option.value=id;option.textContent=name;language.append(option);}
 function render(){if(!state)return;language.value=state.language;theme.value=state.theme||'system';beta.checked=state.allowBeta;language.disabled=theme.disabled=beta.disabled=saving;}
 async function save(patch){if(saving)return;saving=true;status.textContent='';render();try{state=await api('settings',patch);await onApply(state);status.textContent=t('Preferencias guardadas.');}catch(error){status.textContent=error.message;}finally{saving=false;render();}}
 language.onchange=()=>save({language:language.value});theme.onchange=()=>save({theme:theme.value});beta.onchange=()=>save({allowBeta:beta.checked});
 document.getElementById('preferences-close').onclick=()=>dialog.close();
 document.getElementById('preferences-updates').onclick=()=>{dialog.close();onUpdates();};
 return {async open(){state=await api('getSettings');status.textContent='';render();if(!dialog.open)dialog.showModal();language.focus();}};
}
