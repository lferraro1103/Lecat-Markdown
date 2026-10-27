import {t} from './i18n.js';

export function createFileTree({api,finder,container,icons,activePath,onOpen,onError}){
 let root='',selected='',revision=0,query='';
 const cache=new Map(),expanded=new Set(),pending=new Map(),loads=new Map();
 const enabled=()=>finder.enabled();
 const name=path=>path.replace(/[\\/]+$/,'').split(/[\\/]/).at(-1)||path;
 const icon=value=>{const i=document.createElement('i');i.dataset.lucide=value;return i;};
 function render(value=query){
  query=value.toLocaleLowerCase().trim();if(!enabled()||!root)return;
  const focus=container.contains(document.activeElement)?document.activeElement.dataset.path:null;
  container.replaceChildren();container.setAttribute('role','tree');
  let nodeIndex=0;
  const matches=entry=>finder.visible(entry)&&(finder.displayName(entry).toLocaleLowerCase().includes(query)||(entry.directory&&(cache.get(entry.path)||[]).some(matches)));
  function append(entry,parent,level,isRoot=false){
   if(!isRoot&&(!finder.visible(entry)||(query&&!matches(entry))))return;
   const row=document.createElement('button');row.type='button';row.className='file tree-row'+(entry.directory?' tree-folder':'')+(entry.path===activePath()?' active':'');
   row.dataset.path=entry.path;row.dataset.parent=isRoot?'':entry.path.replace(/[\\/][^\\/]+$/,'');row.dataset.directory=String(entry.directory);row.classList.toggle('tree-target',entry.directory&&entry.path===selected);
   row.setAttribute('role','treeitem');row.setAttribute('aria-level',String(level));row.setAttribute('aria-selected',String(entry.path===activePath()));row.tabIndex=-1;
   row.style.setProperty('--tree-depth',level-1);
   const caret=document.createElement('span');caret.className='tree-caret';if(entry.directory)caret.append(icon('chevron-right'));
   const label=document.createElement('span');label.className='tree-name';label.textContent=finder.displayName(entry);row.setAttribute('aria-label',label.textContent);
   row.append(caret,icon(entry.directory?'folder':'file-text'),label);finder.decorate(row,entry);parent.append(row);
   const open=expanded.has(entry.path)||(query&&entry.directory&&(cache.get(entry.path)||[]).some(matches));
   if(entry.directory){row.setAttribute('aria-expanded',String(Boolean(open)));row.onclick=()=>{selected=entry.path;toggle(entry.path).catch(onError);};}
   else row.onclick=()=>onOpen(entry.path).catch(onError);
   row.onfocus=()=>{for(const other of container.querySelectorAll('[role=treeitem]'))other.tabIndex=other===row?0:-1;};
   if(entry.directory&&open){const group=document.createElement('div');group.id='explorer-tree-group-'+(++nodeIndex);group.setAttribute('role','group');row.setAttribute('aria-owns',group.id);parent.append(group);for(const child of cache.get(entry.path)||[])append(child,group,level+1);}
  }
  append({path:root,name:name(root),directory:true},container,1,true);icons();
  const rows=[...container.querySelectorAll('[role=treeitem]')],target=rows.find(row=>row.dataset.path===focus)||rows.find(row=>row.classList.contains('active'))||rows[0];
  if(target){target.tabIndex=0;if(focus)target.focus({preventScroll:true});}
 }
 async function read(folder,{fresh=false}={}){
  if(!fresh&&pending.has(folder))return pending.get(folder);
  const ticket=revision,load=(loads.get(folder)||0)+1;loads.set(folder,load);
  const current=()=>ticket===revision&&loads.get(folder)===load;
  const job=api('list',folder).then(async items=>{if(!current())return;cache.set(folder,items);render();await finder.enrich(items);if(current())render();}).finally(()=>{if(pending.get(folder)===job)pending.delete(folder);});pending.set(folder,job);return job;
 }
 async function toggle(folder,force){
  const open=force??!expanded.has(folder);if(open)expanded.add(folder);else expanded.delete(folder);render();if(open&&!cache.has(folder))await read(folder);
 }
 container.addEventListener('keydown',event=>{
  if(!enabled())return;const row=event.target.closest('[role=treeitem]');if(!row)return;
  const rows=[...container.querySelectorAll('[role=treeitem]')],index=rows.indexOf(row);let target;
  if(event.key==='ArrowDown')target=rows[Math.min(rows.length-1,index+1)];
  else if(event.key==='ArrowUp')target=rows[Math.max(0,index-1)];
  else if(event.key==='Home')target=rows[0];else if(event.key==='End')target=rows.at(-1);
  else if(event.key==='ArrowRight'&&row.dataset.directory==='true'){event.preventDefault();if(row.getAttribute('aria-expanded')==='true')target=rows[index+1];else toggle(row.dataset.path,true).catch(onError);}
  else if(event.key==='ArrowLeft'){event.preventDefault();if(row.getAttribute('aria-expanded')==='true')toggle(row.dataset.path,false).catch(onError);else target=rows.find(item=>item.dataset.path===row.dataset.parent);}
  else return;
  event.preventDefault();target?.focus();
 });
 const contains=target=>{if(!root)return false;const clean=value=>value.replaceAll('\\','/').replace(/\/+$/,'');return clean(target).startsWith(clean(root)+'/');};
 return {enabled,render,contains,get folder(){return selected||root;},async setRoot(folder,items){
  if(root!==folder){revision++;root=folder;selected=folder;cache.clear();pending.clear();loads.clear();expanded.clear();expanded.add(folder);}
  loads.set(folder,(loads.get(folder)||0)+1);pending.delete(folder);cache.set(folder,items);render();const ticket=revision;await finder.enrich([{path:folder,name:name(folder),directory:true},...items]);if(ticket===revision)render();
 },async reloadAll(){revision++;cache.clear();pending.clear();loads.clear();render();await Promise.all([...expanded].map(folder=>read(folder,{fresh:true})));},async reload(folder=root){await read(folder,{fresh:true});},selectionChanged(){if(enabled())for(const row of container.querySelectorAll('[role=treeitem]')){const active=row.dataset.path===activePath();row.classList.toggle('active',active);row.setAttribute('aria-selected',String(active));}}};
}
