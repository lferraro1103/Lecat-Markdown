import {t} from './i18n.js';

// macOS only: show the file panel the way Finder does (localized names, hidden items, tags and native icons)
// using metadata read by the main process, without ever launching Finder.
const LABELS=['','gray','green','purple','blue','yellow','red','orange'];
const markdown=/\.(md|markdown)$/i;

export function createFinderPanel({api}){
 const icons=new Map(),info=new Map();
 const enabled=()=>document.documentElement.dataset.platform==='darwin';
 // Re-reads metadata on every call so tag changes show up; resolves true when anything arrived to re-render.
 async function enrich(items){
  if(!enabled())return false;
  const paths=items.map(item=>item.path);
  if(!paths.length)return false;
  const [metadata,images]=await Promise.all([api('finderInfo',paths).catch(()=>({})),api('fileIcons',paths).catch(()=>({}))]);
  let changed=false;
  for(const value of paths){
   if(metadata[value]){info.set(value,metadata[value]);changed=true;}
   if(images[value]){icons.set(value,images[value]);changed=true;}
  }
  return changed;
 }
 // Finder hides dotfiles, flagged items and packages (apps); Markdown packages stay visible.
 function visible(entry){
  if(!enabled())return true;
  if(entry.name.startsWith('.'))return false;
  const meta=info.get(entry.path);
  return !meta||!(meta.hidden||(meta.package&&!markdown.test(entry.name)));
 }
 function displayName(entry){return enabled()&&info.get(entry.path)?.name||entry.name;}
 function decorate(button,entry){
  if(!enabled())return;
  const image=icons.get(entry.path);
  if(image){
   const img=document.createElement('img');img.className='finder-icon';img.src=image;img.alt='';img.draggable=false;
   const current=button.querySelector(':scope>i,:scope>svg');if(current)current.replaceWith(img);else button.prepend(img);
  }
  const meta=info.get(entry.path);
  if(meta?.tags?.length){
   const tags=document.createElement('span');tags.className='finder-tags';tags.setAttribute('aria-label',t('Etiquetas')+': '+meta.tags.join(', '));
   const dot=document.createElement('i');dot.className='finder-tag';dot.dataset.label=LABELS[meta.label]||'gray';tags.append(dot);
   button.append(tags);button.title=entry.path+'\n'+meta.tags.join(', ');
  }
 }
 return {enabled,enrich,visible,displayName,decorate};
}
