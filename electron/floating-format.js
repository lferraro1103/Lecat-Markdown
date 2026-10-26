import {t} from './i18n.js';

export function createFloatingFormat({api,toast}){
 const bar=document.querySelector('#formatbar'),panes=document.querySelector('#panes'),buttons=[];
 let state={visible:false,position:'top-center'},revision=0,saveQueue=Promise.resolve();
 let layoutRoot=null,layoutFrame=null;
 function measure(){
  layoutFrame=null;const root=bar.parentElement;
  if(layoutRoot&&layoutRoot!==root)for(const side of ['top','left','right'])layoutRoot.style.removeProperty('--format-reserve-'+side);
  layoutRoot=root;const box=bar.getBoundingClientRect(),reserve={top:0,left:0,right:0};
  if(!bar.hidden&&box.height){if(state.position==='left'||state.position==='right')reserve[state.position]=Math.ceil(box.width)+(state.position==='right'?44:24);else reserve.top=Math.ceil(box.height)+24;}
  for(const side of ['top','left','right'])root.style.setProperty('--format-reserve-'+side,reserve[side]+'px');
 }
 function scheduleMeasure(){if(layoutFrame===null)layoutFrame=requestAnimationFrame(measure);}
 bar.dataset.floating='true';bar.hidden=true;panes.append(bar);
 const closeMenus=()=>{for(const menu of bar.querySelectorAll('.format-menu[open]')){menu.open=false;const popup=menu.querySelector('.format-popover');if(popup?.matches(':popover-open'))popup.hidePopover();}};
 function render(){bar.hidden=!state.visible;bar.dataset.position=state.position;for(const button of buttons){button.setAttribute('aria-expanded',String(state.visible));button.setAttribute('aria-pressed',String(state.visible));button.classList.toggle('active',state.visible);}scheduleMeasure();document.dispatchEvent(new Event('format-toolbar-layout'));}
 async function persist(patch){const previous={...state},ticket=++revision;state={...state,...patch};closeMenus();render();const snapshot={...state};const job=saveQueue.catch(()=>{}).then(()=>api('formatToolbar',snapshot));saveQueue=job;try{const saved=await job;if(ticket===revision){state=saved;render();}}catch(error){if(ticket===revision){state=previous;render();}toast(error.message);}}
 async function showMenu(){closeMenus();try{await saveQueue.catch(()=>{});await api('formatToolbarMenu');}catch(error){toast(error.message);}}
 function toggleButton(className){const button=document.createElement('button');button.type='button';button.className='format-toggle '+className;button.title=t('Herramientas de formato');button.dataset.i18nTitle='Herramientas de formato';button.setAttribute('aria-label',t('Herramientas de formato'));button.dataset.i18nAriaLabel='Herramientas de formato';button.setAttribute('aria-controls','formatbar');const icon=document.createElement('i');icon.dataset.lucide='sliders-horizontal';button.append(icon);button.onclick=()=>persist({visible:!state.visible});button.oncontextmenu=event=>{event.preventDefault();showMenu();};button.onkeydown=event=>{if(event.key==='ContextMenu'||(event.shiftKey&&event.key==='F10')){event.preventDefault();showMenu();}};buttons.push(button);return button;}
 document.querySelector('#toolbar-search').before(toggleButton('format-toggle-header'));
 document.querySelector('.view-actions [data-command=search]').after(toggleButton('format-toggle-document'));
 bar.addEventListener('contextmenu',event=>{event.preventDefault();showMenu();});
 bar.addEventListener('keydown',event=>{if(event.key==='Escape'&&!bar.querySelector('.format-menu[open]')){event.preventDefault();persist({visible:false});buttons.find(b=>b.getClientRects().length)?.focus();}});
 window.claro.onCommand(command=>{if(command?.formatToolbar){revision++;state=command.formatToolbar;closeMenus();render();}});
 new ResizeObserver(closeMenus).observe(panes);
 new ResizeObserver(scheduleMeasure).observe(bar);
 document.addEventListener('format-toolbar-layout',scheduleMeasure);
 render();const ticket=revision;api('desktopState').then(value=>{if(ticket===revision){state=value.formatToolbar;render();}}).catch(error=>toast(error.message));
 return {closeMenus,setState:persist};
}
