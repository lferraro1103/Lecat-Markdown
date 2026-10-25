import {t} from './i18n.js';
import {SearchQuery,setSearchQuery,findNext,findPrevious} from '@codemirror/search';

export function createDocumentSearch({getMode,getView,getVisual,getDocumentId,getRoot=()=>document}){
 let queryBefore='',documentBefore=null,index=-1;
 const highlight='lecat-document-search';
 function clear(){CSS.highlights?.delete(highlight);queryBefore='';documentBefore=null;index=-1;}
 function search(query,direction=1){
  CSS.highlights?.delete(highlight);
  if(!query){clear();getView()?.dispatch({effects:setSearchQuery.of(new SearchQuery())});return '';}
  const mode=getMode(),documentId=getDocumentId();
  if(mode==='edit'){const count=getVisual().search(query,direction);return count?t('{count} coincidencias',{count}):t('Sin coincidencias');}
  if(mode==='split'){
   const view=getView();view.dispatch({effects:setSearchQuery.of(new SearchQuery({search:query,caseSensitive:false}))});
   const found=(direction<0?findPrevious:findNext)(view);return t(found?'Coincidencia encontrada':'Sin coincidencias');
  }
  const root=getRoot().querySelector('[data-pane-part=preview]'),nodes=[],walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:node=>{
   const parent=node.parentElement;
   if(!parent||parent.closest('style,script,.katex-mathml')||parent.closest('.diagram-code')&&!parent.closest('.show-code'))return NodeFilter.FILTER_REJECT;
   return node.nodeValue?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
  }});
  let node,text='';while((node=walker.nextNode())){nodes.push({node,from:text.length,to:text.length+node.nodeValue.length});text+=node.nodeValue;}
  const lower=text.toLocaleLowerCase(),needle=query.toLocaleLowerCase(),matches=[];
  for(let from=0;matches.length<10000;){const at=lower.indexOf(needle,from);if(at<0)break;matches.push(at);from=at+needle.length;}
  if(!matches.length){index=-1;return t('Sin coincidencias');}
  if(queryBefore!==query||documentBefore!==documentId)index=direction<0?0:-1;
  index=(index+direction+matches.length)%matches.length;queryBefore=query;documentBefore=documentId;
  const from=matches[index],to=from+query.length,start=nodes.find(n=>n.from<=from&&n.to>from),end=nodes.find(n=>n.from<to&&n.to>=to);
  if(start&&end){const range=new Range();range.setStart(start.node,from-start.from);range.setEnd(end.node,to-end.from);CSS.highlights?.set(highlight,new Highlight(range));const panel=getRoot().querySelector('[data-pane-part="preview-scroll"]');panel.scrollTo({top:panel.scrollTop+range.getBoundingClientRect().top-panel.getBoundingClientRect().top-70,behavior:'smooth'});}
  return (index+1)+' / '+matches.length+(matches.length===10000?'+':'');
 }
 return {search,clear};
}
