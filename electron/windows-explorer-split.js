import {t} from './i18n.js';

export function createWindowsExplorerSplit(sidebar){
 if(document.documentElement.dataset.platform!=='win32')return;
 const places=sidebar.querySelector('#places'),key='lecat.explorer-places-ratio.v1';let ratio=null,dragging=false;
 try{const saved=localStorage.getItem(key),value=Number(saved);if(saved!==null&&Number.isFinite(value)&&value>0&&value<1)ratio=value;}catch{}
 const divider=document.createElement('div');divider.id='explorer-resizer';divider.className='explorer-resizer';divider.tabIndex=0;divider.setAttribute('role','separator');divider.setAttribute('aria-orientation','horizontal');divider.setAttribute('aria-controls','places files');divider.setAttribute('aria-label',t('Ajustar altura del explorador'));divider.dataset.i18nAriaLabel='Ajustar altura del explorador';places.after(divider);
 function bounds(){const height=sidebar.getBoundingClientRect().height,fixed=[...sidebar.children].filter(e=>e!==places&&e!==divider&&e.id!=='files'&&!e.classList.contains('recent-files')).reduce((sum,e)=>{const box=e.getBoundingClientRect(),style=getComputedStyle(e);return sum+box.height+(box.height?parseFloat(style.marginTop)+parseFloat(style.marginBottom):0);},0);return {height,min:80,max:Math.max(80,height-fixed-divider.getBoundingClientRect().height-160)};}
 const persist=()=>{try{if(ratio===null)localStorage.removeItem(key);else localStorage.setItem(key,String(ratio));}catch{}};
 function layout(){const b=bounds();if(!b.height)return;if(ratio!==null)sidebar.style.setProperty('--explorer-places-height',Math.round(Math.max(b.min,Math.min(b.max,ratio*b.height)))+'px');divider.setAttribute('aria-valuemin',String(Math.round(b.min)));divider.setAttribute('aria-valuemax',String(Math.round(b.max)));divider.setAttribute('aria-valuenow',String(Math.round(places.getBoundingClientRect().height)));}
 function setHeight(value){const b=bounds();if(!b.height)return;const height=Math.max(b.min,Math.min(b.max,value));ratio=height/b.height;layout();}
 divider.onpointerdown=event=>{if(event.button!==0)return;event.preventDefault();dragging=true;divider.dataset.resizing='true';divider.setPointerCapture(event.pointerId);};
 divider.onpointermove=event=>{if(dragging)setHeight(event.clientY-places.getBoundingClientRect().top);};
 const stop=()=>{if(!dragging)return;dragging=false;delete divider.dataset.resizing;persist();};divider.onpointerup=stop;divider.onpointercancel=stop;divider.onlostpointercapture=stop;
 divider.onkeydown=event=>{if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();const b=bounds(),current=places.getBoundingClientRect().height;setHeight(event.key==='Home'?b.min:event.key==='End'?b.max:current+(event.key==='ArrowUp'?-16:16));persist();};
 divider.ondblclick=()=>{ratio=null;sidebar.style.removeProperty('--explorer-places-height');persist();layout();};
 const observer=new ResizeObserver(layout);observer.observe(sidebar);observer.observe(places);layout();
}
