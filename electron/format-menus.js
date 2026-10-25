import {t} from './i18n.js';

// Keep the canonical select for editor state, but present all format choices
// with one keyboard-accessible menu instead of mixing OS and web popups.
export function initFormatMenus(){
 const select=document.querySelector('#format-style'),group=select.parentElement;
 const picker=document.createElement('details');picker.className='format-menu style-menu';
 const summary=document.createElement('summary');summary.setAttribute('aria-label',t('Estilo del texto'));
 const label=document.createElement('span'),arrow=document.createElement('i');arrow.dataset.lucide='chevron-down';summary.append(label,arrow);
 const menu=document.createElement('div');menu.className='format-popover';
 for(const option of select.options){const button=document.createElement('button');button.type='button';button.dataset.style=option.value;button.setAttribute('role','menuitemradio');button.onclick=()=>{select.value=option.value;select.dispatchEvent(new Event('change'));picker.open=false;};menu.append(button);}
 select.classList.add('style-source');group.replaceWith(picker);picker.append(summary,select,menu);
 function refresh(){label.textContent=select.selectedOptions[0]?.textContent||t('Cuerpo');for(const button of menu.children){button.textContent=select.querySelector('option[value="'+button.dataset.style+'"]').textContent;button.setAttribute('aria-checked',String(button.dataset.style===select.value));}}
 document.addEventListener('formatstate',refresh);new MutationObserver(refresh).observe(select,{subtree:true,childList:true,characterData:true});select.addEventListener('change',refresh);refresh();
 const menus=[...document.querySelectorAll('#formatbar .format-menu')];
 function position(details){const popup=details.querySelector('.format-popover');if(!details.open||!popup.matches(':popover-open'))return;const anchor=details.querySelector('summary').getBoundingClientRect(),padding=10;popup.style.maxHeight=Math.max(70,innerHeight-padding*2)+'px';const box=popup.getBoundingClientRect();let top=anchor.bottom+7;if(top+box.height>innerHeight-padding)top=Math.max(padding,anchor.top-box.height-7);popup.style.left=Math.max(padding,Math.min(innerWidth-box.width-padding,anchor.left+(anchor.width-box.width)/2))+'px';popup.style.top=top+'px';}
 for(const details of menus){const summary=details.querySelector('summary'),popup=details.querySelector('.format-popover');popup.setAttribute('popover','manual');popup.setAttribute('role','menu');summary.setAttribute('aria-haspopup','menu');summary.setAttribute('aria-expanded','false');
  details.addEventListener('toggle',()=>{summary.setAttribute('aria-expanded',String(details.open));if(details.open){for(const other of menus)if(other!==details)other.open=false;popup.showPopover();position(details);}else if(popup.matches(':popover-open'))popup.hidePopover();});
  popup.addEventListener('click',event=>{if(event.target.closest('button'))details.open=false;});
  details.addEventListener('keydown',event=>{const buttons=[...popup.querySelectorAll('button:not(:disabled)')];if(event.key==='Escape'){event.preventDefault();details.open=false;summary.focus();}if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();details.open=true;requestAnimationFrame(()=>{let index=buttons.indexOf(document.activeElement);index=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[index]?.focus();});}});
 }
 document.addEventListener('pointerdown',event=>{for(const details of menus)if(!details.contains(event.target))details.open=false;});
 window.addEventListener('resize',()=>menus.forEach(position));document.querySelector('.document').addEventListener('scroll',()=>menus.forEach(d=>d.open=false),true);
}
