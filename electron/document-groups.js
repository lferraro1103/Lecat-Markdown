import {EditorView} from '@codemirror/view';
import {createVisual} from './visual.js';
import {createPaneRenderer} from './pane-renderer.js';
import {t,translateUI} from './i18n.js';

const MIME='application/x-lecat-document';
const storageKey='lecat.document-groups.v1';
const part=(root,name)=>root.querySelector('[data-pane-part="'+name+'"]');

// The original pane and its editor remain intact. A second pane owns its own
// CodeMirror state, visual editor, render generation and scroll containers.
export function createDocumentGroups(options){
 const {documents,primaryRoot,primaryId,activatePrimary,makeState,md,api,toast,run,ask,icons,textButton,expand,getTheme,getZoom,onFocus,onChange}=options;
 for(const node of [primaryRoot,...primaryRoot.querySelectorAll('[id]')])node.dataset.panePart=node.id;
 primaryRoot.dataset.documentPane='primary';
 const template=primaryRoot.cloneNode(true);
 let savedLayout=null;try{savedLayout=JSON.parse(localStorage.getItem(storageKey));}catch{}
 const groups=document.createElement('div');groups.id='document-groups';groups.dataset.split='false';primaryRoot.before(groups);
 const first=document.createElement('section');first.className='document-slot';first.dataset.slot='primary';
 const second=document.createElement('section');second.className='document-slot';second.dataset.slot='secondary';second.hidden=true;
 const divider=document.createElement('div');divider.className='document-divider';divider.hidden=true;divider.tabIndex=0;divider.setAttribute('role','separator');divider.setAttribute('aria-orientation','vertical');divider.setAttribute('aria-label',t('Ajustar documentos'));divider.dataset.i18nAriaLabel='Ajustar documentos';divider.setAttribute('aria-valuemin','25');divider.setAttribute('aria-valuemax','75');
 first.append(primaryRoot);groups.append(first,divider,second);
 let secondary=null,focused=false,sourceId=null,ratio=.5,side='right';
 const paneId=()=>focused&&secondary?secondary.id:primaryId();
 const root=()=>focused&&secondary?secondary.root:primaryRoot;
 const split=()=>Boolean(secondary);
 function persist(){try{const left=side==='left'?secondary?.id:primaryId(),right=side==='left'?primaryId():secondary?.id;const a=documents.get(left),b=documents.get(right);if(secondary&&a?.path&&b?.path)localStorage.setItem(storageKey,JSON.stringify({left:a.path,right:b.path,focused:documents.get(paneId())?.path,ratio}));else localStorage.removeItem(storageKey);}catch{}}
 function labels(){
  for(const [slot,id]of [[first,primaryId()],[second,secondary?.id]]){const title=slot.querySelector('.document-slot-name'),d=documents.get(id);if(title){title.textContent=(d?.dirty?'● ':'')+(d?.name||'');title.title=d?.path||d?.name||'';}}
  first.dataset.active=String(!focused);second.dataset.active=String(focused);persist();
 }
 function header(slot,isSecondary){const bar=document.createElement('header');bar.className='document-slot-header';const title=document.createElement('button');title.className='document-slot-name';title.onclick=()=>focus(isSecondary);const close=textButton('','maximize',()=>closeSplit(isSecondary));close.title=t('Volver a un solo panel');close.setAttribute('aria-label',close.title);close.dataset.i18nTitle='Volver a un solo panel';close.dataset.i18nAriaLabel='Volver a un solo panel';bar.append(title,close);slot.prepend(bar);}
 header(first,false);header(second,true);
 function focus(value){value=Boolean(value&&secondary);if(focused===value){labels();return;}focused=value;root().append(document.querySelector('#formatbar'));const inspector=document.querySelector('#inspector');if(inspector)root().append(inspector);for(const menu of document.querySelectorAll('.format-menu[open]'))menu.open=false;onFocus();labels();document.dispatchEvent(new Event('format-toolbar-layout'));}
 for(const [slot,isSecondary]of [[first,false],[second,true]])for(const event of ['pointerdown','focusin'])slot.addEventListener(event,()=>focus(isSecondary),true);
 function layout(){groups.dataset.split=String(split());groups.dataset.secondarySide=side;second.hidden=!split();divider.hidden=!split();groups.style.setProperty('--document-left-width',(ratio*100)+'%');divider.setAttribute('aria-valuenow',String(Math.round(ratio*100)));labels();options.measure();secondary?.view.requestMeasure();}
 function setRatio(value){ratio=Math.max(.25,Math.min(.75,value));layout();}
 divider.onpointerdown=event=>{if(event.button!==0)return;event.preventDefault();divider.setPointerCapture(event.pointerId);const bounds=groups.getBoundingClientRect();divider.onpointermove=e=>setRatio((e.clientX-bounds.left)/bounds.width);};
 const stopResize=()=>{divider.onpointermove=null;persist();};divider.onpointerup=stopResize;divider.onpointercancel=stopResize;divider.onlostpointercapture=stopResize;
 divider.onkeydown=event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();setRatio(event.key==='Home' ? .25 : event.key==='End' ? .75 : ratio+(event.key==='ArrowLeft'?-.05:.05));}};
 function saveSecondary(){if(!secondary)return;const d=documents.get(secondary.id);if(d){d.state=secondary.view.state;d.content=secondary.view.state.doc.toString();}}
 function destroySecondary(){if(!secondary)return;saveSecondary();secondary.renderer.dispose();secondary.visual.destroy();secondary.view.destroy();secondary.root.remove();secondary=null;}
 function closeSplit(keepSecondary=focused){if(!secondary)return;const keep=secondary.id;focus(false);destroySecondary();if(keepSecondary&&documents.has(keep))activatePrimary(keep);layout();onChange();}
 function createSecondary(id){
  const pane=template.cloneNode(true);pane.id='secondary-panes';pane.dataset.documentPane='secondary';pane.style.setProperty('--editor-width','50%');
  for(const node of pane.querySelectorAll('[id]'))node.id='secondary-'+node.id;
  second.append(pane);
  const owner={id,root:pane,mode:options.primaryMode(),visualOrigin:false};secondary=owner;
  const d=documents.get(id);owner.view=new EditorView({state:d.state||makeState(d.content),parent:part(pane,'editor')});
  owner.visual=createVisual({element:part(pane,'visual-editor'),md,getSource:()=>owner.view.state.doc.toString(),getId:()=>owner.id,onChange:source=>{const old=owner.view.state.doc.toString();if(old===source)return;owner.visualOrigin=true;try{owner.view.dispatch({changes:{from:0,to:owner.view.state.doc.length,insert:source}});}finally{owner.visualOrigin=false;}},run:command=>{focus(true);return run(command);},api,ask,toast,getTheme,isActive:()=>focused&&secondary===owner,getScroll:()=>part(pane,'visual-scroll'),getTableTools:()=>part(pane,'table-tools')});
  owner.renderer=createPaneRenderer({root:pane,getView:()=>owner.view,getDocument:()=>documents.get(owner.id),getTheme,api,accept:options.accept,textButton,expand,scrollHeading:id=>scrollHeading(owner,id),toast});
  owner.visual.load(owner.view.state.doc.toString(),true);setMode(owner.mode);setZoom(getZoom());
  part(pane,'table-tools').onpointerdown=e=>e.preventDefault();part(pane,'table-tools').onclick=e=>{const action=e.target.dataset.table;if(action)owner.visual.tableAction(action);};
  part(pane,'visual-search').onclick=e=>{const action=e.target.closest('[data-search]')?.dataset.search;if(!action)return;if(action==='close'){part(pane,'visual-search').hidden=true;owner.visual.focus();return;}owner.visual.search(part(pane,'visual-find').value,action==='previous'?-1:1,['replace','all'].includes(action)?part(pane,'visual-replace').value:null,action==='all');};
  part(pane,'visual-find').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();owner.visual.search(e.target.value,e.shiftKey?-1:1);}if(e.key==='Escape')part(pane,'visual-search').hidden=true;};
  const codeDivider=part(pane,'splitter');codeDivider.onpointerdown=e=>{e.preventDefault();codeDivider.setPointerCapture(e.pointerId);const bounds=pane.getBoundingClientRect();codeDivider.onpointermove=ev=>pane.style.setProperty('--editor-width',Math.max(25,Math.min(75,(ev.clientX-bounds.left)/bounds.width*100))+'%');};
  codeDivider.onpointerup=codeDivider.onpointercancel=()=>{codeDivider.onpointermove=null;owner.view.requestMeasure();};codeDivider.onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const width=parseFloat(getComputedStyle(pane).getPropertyValue('--editor-width'))||50;pane.style.setProperty('--editor-width',Math.max(25,Math.min(75,width+(e.key==='ArrowLeft'?-5:5)))+'%');owner.view.requestMeasure();}};
  owner.renderer.schedule();translateUI();icons();return owner;
 }
 function setMode(value){if(!secondary)return;secondary.mode=value;secondary.root.dataset.mode=value;if(value==='edit')secondary.visual.load(secondary.view.state.doc.toString());secondary.view.requestMeasure();}
 function setZoom(value){if(!secondary)return;for(const name of ['editor','visual-editor','preview'])part(secondary.root,name).style.zoom=value;secondary.view.requestMeasure();}
 function activate(id){if(!secondary||!documents.has(id))return;saveSecondary();secondary.id=id;const d=documents.get(id);secondary.muting=true;try{secondary.view.setState(d.state||makeState(d.content));}finally{secondary.muting=false;}secondary.visual.load(secondary.view.state.doc.toString(),true);secondary.renderer.schedule();labels();}
 function openPair(source,target,position='right'){
  if(!documents.has(source)||!documents.has(target)||source===target)return;
  focus(false);destroySecondary();activatePrimary(target);side=position;createSecondary(source);layout();focus(true);onChange();
 }
 function editorUpdated(update){if(!secondary||update.view!==secondary.view)return false;const d=documents.get(secondary.id);if(!d)return true;d.state=update.state;
  if(update.docChanged&&!secondary.muting){d.content=update.state.doc.toString();d.dirty=true;const content=d.content;api('update',d.id,content).then(dirty=>{if(documents.get(d.id)===d&&d.content===content){d.dirty=dirty;onChange();labels();}}).catch(e=>toast(e.message));if(!secondary.visualOrigin&&secondary.mode==='edit')secondary.visual.load(content);secondary.renderer.schedule();}
  if(focused)options.onSelection();if(update.docChanged){onChange();labels();}return true;
 }
 function scrollHeading(owner,id){const preview=part(owner.root,'preview');if(owner.mode==='edit'){const heads=[...preview.querySelectorAll('h1,h2,h3,h4,h5,h6')],index=heads.findIndex(h=>h.id===id),target=part(owner.root,'visual-editor').querySelectorAll('h1,h2,h3,h4,h5,h6')[index];target?.scrollIntoView({block:'start',behavior:'smooth'});return;}const target=preview.querySelector('#'+CSS.escape(id));target?.scrollIntoView({block:'start',behavior:'smooth'});}
 const menu=document.createElement('div');menu.className='document-tab-menu';menu.setAttribute('popover','auto');document.body.append(menu);
 function contextMenu(event,id){event.preventDefault();menu.replaceChildren();for(const [label,action]of [['Abrir a la izquierda',()=>openBeside(id,'left')],['Abrir a la derecha',()=>openBeside(id,'right')],...(secondary?[['Volver a un solo panel',()=>closeSplit()]]:[])]){const b=textButton(t(label),null,()=>{menu.hidePopover();action();});menu.append(b);}menu.showPopover();menu.style.left=Math.max(8,Math.min(event.clientX,innerWidth-menu.offsetWidth-8))+'px';menu.style.top=Math.max(8,Math.min(event.clientY,innerHeight-menu.offsetHeight-8))+'px';}
 function openBeside(id,position){const other=paneId()!==id?paneId():[primaryId(),secondary?.id,...documents.keys()].find(candidate=>candidate&&candidate!==id);if(other)openPair(id,other,position);else toast('Abrí otro documento para usar dos paneles.');}
 const overlay=document.createElement('div');overlay.className='document-drop-overlay';overlay.hidden=true;const hint=document.createElement('span');overlay.append(hint);groups.append(overlay);
 function showDrop(position){overlay.hidden=false;overlay.dataset.side=position;hint.textContent=t(position==='left'?'Abrir a la izquierda':'Abrir a la derecha');}
 function clearDrop(){overlay.hidden=true;}
 function bindTab(tab,id){tab.dataset.documentId=id;tab.draggable=true;tab.classList.toggle('visible-in-group',id===primaryId()||id===secondary?.id);tab.addEventListener('dragstart',event=>{if(event.target.closest('.close-tab,.tab-details')){event.preventDefault();return;}sourceId=id;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData(MIME,id);});tab.addEventListener('dragend',()=>{sourceId=null;clearDrop();});tab.addEventListener('dragover',event=>{if(!sourceId||sourceId===id)return;event.preventDefault();event.stopPropagation();event.dataTransfer.dropEffect='move';const rect=tab.getBoundingClientRect();showDrop(event.clientX<rect.left+rect.width/2?'left':'right');});tab.addEventListener('drop',event=>{if(!sourceId||sourceId===id)return;event.preventDefault();event.stopPropagation();const rect=tab.getBoundingClientRect(),source=sourceId;sourceId=null;clearDrop();openPair(source,id,event.clientX<rect.left+rect.width/2?'left':'right');});tab.addEventListener('contextmenu',event=>contextMenu(event,id));tab.addEventListener('keydown',event=>{if(event.key==='ContextMenu'||(event.shiftKey&&event.key==='F10')){const rect=tab.getBoundingClientRect();contextMenu({preventDefault:()=>event.preventDefault(),clientX:rect.left,clientY:rect.bottom},id);menu.querySelector('button')?.focus();}});}
 groups.addEventListener('dragover',event=>{if(!sourceId)return;event.preventDefault();event.dataTransfer.dropEffect='move';const rect=groups.getBoundingClientRect();showDrop(event.clientX<rect.left+rect.width/2?'left':'right');});
 groups.addEventListener('drop',event=>{if(!sourceId)return;event.preventDefault();const source=sourceId,target=paneId()!==source?paneId():(secondary?.id!==source?secondary?.id:primaryId()),rect=groups.getBoundingClientRect();sourceId=null;clearDrop();if(target)openPair(source,target,event.clientX<rect.left+rect.width/2?'left':'right');});
 groups.addEventListener('dragleave',event=>{if(!groups.contains(event.relatedTarget))clearDrop();});
 document.querySelector('#tabs').addEventListener('drop',event=>{if(!sourceId||event.target.closest('.tab'))return;event.preventDefault();const id=sourceId;sourceId=null;clearDrop();closeSplit(false);activatePrimary(id);onChange();});
 document.querySelector('#tabs').addEventListener('dragover',event=>{if(sourceId&&!event.target.closest('.tab'))event.preventDefault();});
 document.addEventListener('dragend',()=>{sourceId=null;clearDrop();});document.addEventListener('keydown',event=>{if(event.key==='Escape'){sourceId=null;clearDrop();}});
 layout();
 return {get secondary(){return secondary;},get focusedSecondary(){return focused&&Boolean(secondary);},root,paneId,focusPrimary:()=>focus(false),focusSecondary:()=>focus(true),bindTab,openPair,closeSplit,activate,editorUpdated,setMode,setZoom,labels,
  currentDocument:()=>documents.get(paneId()),
  restore(){try{const saved=savedLayout;savedLayout=null;if(!saved)return;const a=[...documents.values()].find(d=>d.path===saved.left),b=[...documents.values()].find(d=>d.path===saved.right);if(!a||!b||a.id===b.id)return;ratio=Number.isFinite(saved.ratio)?Math.max(.25,Math.min(.75,saved.ratio)):.5;openPair(b.id,a.id,'right');focus(saved.focused===b.path);}catch{}},
  documentClosed(id){if(!secondary)return false;if(id===secondary.id){closeSplit(false);return false;}if(id===primaryId()){closeSplit(true);return true;}return false;},
  refresh(){secondary?.visual.refresh();secondary?.renderer.schedule();labels();},
  revealOutline(){if(secondary)part(secondary.root,'outline').hidden=!part(secondary.root,'outline').hidden;},
  find(){if(!secondary)return;if(secondary.mode==='read')setMode('edit');if(secondary.mode==='edit'){part(secondary.root,'visual-search').hidden=false;part(secondary.root,'visual-find').focus();}else options.openCodeSearch(secondary.view);},
  reconfigure(effects){secondary?.view.dispatch({effects});}
 };
}
