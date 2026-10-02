import {parse} from 'yaml';

export const frontMatter=source=>/^\uFEFF?---[\t ]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[\t ]*(?:\r?\n|$)/.exec(source);

export function frontMatterPlugin(md){
 md.block.ruler.before('hr','front_matter',(state,startLine,_endLine,silent)=>{
  if(startLine!==0||state.level!==0||state.blkIndent!==0)return false;
  const match=frontMatter(state.src);
  if(!match)return false;
  if(silent)return true;
  const token=state.push('front_matter','',0);
  token.content=match[1];
  state.line=match[0].split('\n').length-(match[0].endsWith('\n')?1:0);
  token.map=[0,state.line];
  return true;
 });
 md.renderer.rules.front_matter=(tokens,index)=>{
  const raw=tokens[index].content,escape=md.utils.escapeHtml;
  try{
   if(raw.length>65536)throw Error('Metadata exceeds display limit');
   const metadata=parse(raw,{schema:'failsafe',maxAliasCount:0,stringKeys:true,logLevel:'error'});
   if(!metadata||typeof metadata!=='object'||Array.isArray(metadata))throw Error('Metadata must be a mapping');
   const title=typeof metadata.title==='string'?metadata.title:'';
   const subtitle=typeof metadata.subtitle==='string'?metadata.subtitle:'';
   if(title||subtitle)return '<header class="front-matter">'+(title?'<h1>'+escape(title)+'</h1>':'')+(subtitle?'<p class="front-matter-subtitle">'+escape(subtitle)+'</p>':'')+'</header>\n';
   return '<details class="front-matter"><summary>Metadatos del documento</summary><pre>'+escape(raw)+'</pre></details>\n';
  }catch{return '<pre class="front-matter-source">'+escape(raw)+'</pre>\n';}
 };
}
