import {t} from './i18n.js';

export function createMacExplorer({sidebar,filter,create,openFiles,openFolder,recents,icons,onError,getFolder}){
 if(document.documentElement.dataset.platform!=='darwin')return;
 const button=(label,icon,action)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',t(label));b.dataset.i18nAriaLabel=label;const i=document.createElement('i');i.dataset.lucide=icon;b.append(i);b.onclick=()=>Promise.resolve().then(action).catch(onError);return b;};
 const switcher=document.createElement('div');switcher.className='explorer-switch';switcher.setAttribute('role','group');switcher.setAttribute('aria-label',t('EXPLORADOR'));
 const choose=view=>{sidebar.dataset.explorerView=view;for(const b of switcher.children)b.setAttribute('aria-pressed',String(b.dataset.view===view));recents(false);};
 for(const [view,label,icon]of [['locations','Carpetas y discos','list-tree'],['tree','Vista de carpeta','folder']]){const b=button(label,icon,()=>choose(view));b.dataset.view=view;switcher.append(b);}
 sidebar.querySelector('.side-header').replaceChildren(switcher);
 const footer=document.createElement('div');footer.className='mac-explorer-footer';
 const menu=document.createElement('div');menu.id='explorer-create-menu';menu.className='explorer-create-menu';menu.setAttribute('popover','auto');menu.setAttribute('role','menu');
 const context=document.createElement('div');context.className='explorer-menu-context';menu.append(context);
 const plus=button('Crear o abrir','plus',()=>{if(menu.matches(':popover-open'))menu.hidePopover();else{context.textContent=getFolder()?.replace(/[\\/]+$/,'').split(/[\\/]/).at(-1)||'';menu.showPopover();const b=plus.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(b.left,innerWidth-menu.offsetWidth-8))+'px';menu.style.top=Math.max(8,b.top-menu.offsetHeight-8)+'px';}});plus.id='explorer-create';plus.setAttribute('aria-haspopup','menu');plus.setAttribute('aria-controls',menu.id);plus.setAttribute('aria-expanded','false');
 menu.addEventListener('toggle',()=>plus.setAttribute('aria-expanded',String(menu.matches(':popover-open'))));
 const add=(label,icon,action)=>{const b=button(label,icon,()=>{menu.hidePopover();return action();});b.setAttribute('role','menuitem');const text=document.createElement('span');text.textContent=t(label);text.dataset.i18n=label;b.append(text);menu.append(b);};
 const separator=()=>{const hr=document.createElement('hr');hr.setAttribute('role','separator');menu.append(hr);};
 add('Nuevo archivo','file-plus',()=>create('file'));add('Crear desde portapapeles','clipboard-paste',()=>create('clipboard'));separator();add('Nueva carpeta','folder-plus',()=>create('folder'));separator();add('Abrir archivos…','files',openFiles);add('Abrir carpeta…','folder-open',openFolder);
 menu.addEventListener('keydown',event=>{const buttons=[...menu.querySelectorAll('button')],index=buttons.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}if(event.key==='Escape'){menu.hidePopover();plus.focus();}});
 plus.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();if(!menu.matches(':popover-open'))plus.click();requestAnimationFrame(()=>menu.querySelector('button')?.focus());}});
 const history=button('Recientes','history',()=>{sidebar.dataset.explorerView='tree';for(const b of switcher.children)b.setAttribute('aria-pressed',String(b.dataset.view==='tree'));return recents();});history.className='explorer-history';
 const input=filter.querySelector('input');input.dataset.i18nPlaceholder='Filtrar';input.placeholder=t('Filtrar');filter.append(history);footer.append(plus,filter);sidebar.append(footer);document.body.append(menu);choose('tree');icons();
 document.addEventListener('explorer-folder',()=>choose('tree'));
 filter.addEventListener('input',()=>{if(sidebar.dataset.explorerView==='locations')choose('tree');});
 window.addEventListener('resize',()=>{if(menu.matches(':popover-open'))menu.hidePopover();});
 return {choose};
}
