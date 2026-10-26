import {t} from './i18n.js';

// Keep document details available without reserving a second title row.
export function createDocumentChrome(){
 const header=document.querySelector('.document-header');
 const popup=document.createElement('section');
 popup.id='document-info';popup.setAttribute('popover','auto');
 popup.setAttribute('role','dialog');popup.setAttribute('aria-labelledby','doc-title');
 popup.append(header.firstElementChild);document.body.append(popup);
 const status=document.querySelector('#save-state');
 status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const mac=document.querySelector('.toolbar-title #tabs');
 (mac?document.querySelector('.format-toggle-header'):document.querySelector('.view-actions [data-command=search]')).before(status);
 let activeId=null;
 const isOpen=()=>popup.matches(':popover-open');
 const anchor=()=>document.querySelector('#tabs .tab.active .tab-details');
 function expanded(){anchor()?.setAttribute('aria-expanded',String(isOpen()));}
 function position(){
  const button=anchor();if(!button||!button.getClientRects().length){if(isOpen())popup.hidePopover();return;}
  const rect=button.closest('.tab').getBoundingClientRect(),margin=12;
  popup.style.left=Math.max(margin,Math.min(rect.left,innerWidth-popup.offsetWidth-margin))+'px';
  popup.style.top=Math.max(margin,Math.min(rect.bottom+6,innerHeight-popup.offsetHeight-margin))+'px';
 }
 popup.addEventListener('toggle',expanded);
 window.addEventListener('resize',()=>{if(isOpen())position();});
 document.querySelector('#tabs').addEventListener('scroll',()=>{if(isOpen())position();});
 // Tabs overflow horizontally without a visible scrollbar, so map the wheel to that axis.
 document.querySelector('#tabs').addEventListener('wheel',event=>{const tabs=event.currentTarget;if(!event.deltaY||Math.abs(event.deltaX)>Math.abs(event.deltaY)||tabs.scrollWidth<=tabs.clientWidth)return;event.preventDefault();tabs.scrollLeft+=event.deltaY;},{passive:false});
 new ResizeObserver(()=>{if(isOpen())position();}).observe(document.querySelector('#tabs'));
 return {
  addDisclosure(tab,id){
   const button=document.createElement('button');button.type='button';button.className='tab-details';
   button.title=t('Información del documento');button.setAttribute('aria-label',button.title);
   button.setAttribute('aria-controls',popup.id);button.setAttribute('aria-expanded',String(isOpen()&&id===activeId));
   const icon=document.createElement('i');icon.dataset.lucide='chevron-down';button.append(icon);
   button.onclick=()=>{if(isOpen())popup.hidePopover();else{popup.showPopover();position();}};
   tab.append(button);
  },
  update(id){if(id!==activeId&&isOpen())popup.hidePopover();activeId=id;expanded();if(isOpen())position();}
 };
}
