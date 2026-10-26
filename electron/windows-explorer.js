import {t} from './i18n.js';

export function createWindowsExplorer({filter,tools,create,recents,icons,onError}){
 if(document.documentElement.dataset.platform!=='win32')return;
 const input=filter.querySelector('input');tools.remove();filter.querySelector(':scope>svg,:scope>i')?.remove();filter.classList.add('compact-filter');input.hidden=true;input.placeholder=t('Filtrar');input.dataset.i18nPlaceholder='Filtrar';
 const button=(label,icon)=>{const b=document.createElement('button');b.type='button';b.title=t(label);b.dataset.i18nTitle=label;b.setAttribute('aria-label',t(label));b.dataset.i18nAriaLabel=label;const i=document.createElement('i');i.dataset.lucide=icon;b.append(i);return b;};
 const search=button('Filtrar archivos y carpetas','search');search.id='explorer-filter-toggle';search.setAttribute('aria-controls','filter');search.setAttribute('aria-expanded','false');
 function toggle(show){input.hidden=!show;search.setAttribute('aria-expanded',String(show));if(show)input.focus();else{input.value='';input.dispatchEvent(new Event('input'));search.focus();}}
 search.onclick=()=>toggle(input.hidden);input.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();toggle(false);}});
 const plus=button('Más acciones','plus');plus.id='sidebar-create';plus.setAttribute('aria-haspopup','menu');plus.setAttribute('aria-controls','sidebar-action-menu');plus.setAttribute('aria-expanded','false');
 const menu=document.createElement('div');menu.id='sidebar-action-menu';menu.className='explorer-create-menu';menu.setAttribute('role','menu');menu.setAttribute('popover','auto');
 function open(){if(menu.matches(':popover-open'))return;menu.showPopover();const r=plus.getBoundingClientRect(),height=menu.offsetHeight;menu.style.left=Math.max(8,Math.min(r.left,innerWidth-menu.offsetWidth-8))+'px';menu.style.top=(r.bottom+height+8<=innerHeight?r.bottom+6:Math.max(8,r.top-height-6))+'px';}
 plus.onclick=()=>menu.matches(':popover-open')?menu.hidePopover():open();menu.addEventListener('toggle',()=>plus.setAttribute('aria-expanded',String(menu.matches(':popover-open'))));
 for(const [label,icon,action]of [['Nuevo archivo','file-plus',()=>create('file')],['Nueva carpeta','folder-plus',()=>create('folder')],['Crear desde portapapeles','clipboard-paste',()=>create('clipboard')],['Recientes','history',()=>recents()]]){
  if(label==='Recientes'){const hr=document.createElement('hr');hr.setAttribute('role','separator');menu.append(hr);}
  const b=button(label,icon);b.removeAttribute('title');delete b.dataset.i18nTitle;b.setAttribute('role','menuitem');const text=document.createElement('span');text.textContent=t(label);text.dataset.i18n=label;b.append(text);b.onclick=()=>{menu.hidePopover();Promise.resolve().then(action).catch(onError);};menu.append(b);
 }
 plus.onkeydown=event=>{if(event.key==='ArrowDown'){event.preventDefault();open();menu.querySelector('button')?.focus();}};
 menu.onkeydown=event=>{const buttons=[...menu.querySelectorAll('button')],index=buttons.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}if(event.key==='Escape'){menu.hidePopover();plus.focus();}};
 window.addEventListener('resize',()=>{if(menu.matches(':popover-open'))menu.hidePopover();});
 filter.prepend(search,plus);document.body.append(menu);icons();
}
