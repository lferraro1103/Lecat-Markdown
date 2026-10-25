import MarkdownIt from 'markdown-it';
import tasks from 'markdown-it-task-lists';
import katex from 'katex';
import {frontMatterPlugin} from './frontmatter.js';
export function createMarkdown(){
const md=new MarkdownIt({html:false,linkify:true,typographer:false}).use(tasks,{enabled:false}).use(frontMatterPlugin);
md.inline.ruler.before('escape','math',function(state,silent){if(state.src[state.pos]!=='$'||state.src[state.pos+1]==='$')return false;const end=state.src.indexOf('$',state.pos+1);if(end<0||state.src.slice(state.pos+1,end).includes('\n'))return false;if(!silent){const token=state.push('math_inline','math',0);token.content=state.src.slice(state.pos+1,end);}state.pos=end+1;return true;});
md.block.ruler.before('fence','math_block',function(state,start,end,silent){const first=state.src.slice(state.bMarks[start]+state.tShift[start],state.eMarks[start]);if(!first.startsWith('$$'))return false;let content=first.slice(2),next=start+1;if(content.endsWith('$$'))content=content.slice(0,-2);else{let found=false;for(;next<end;next++){const line=state.src.slice(state.bMarks[next],state.eMarks[next]);if(line.trim().endsWith('$$')){content+='\n'+line.slice(0,line.lastIndexOf('$$'));next++;found=true;break;}content+='\n'+line;}if(!found)return false;}if(!silent){const token=state.push('math_block','math',0);token.content=content;token.map=[start,next];}state.line=next;return true;});
const math=(tokens,index,display)=>{try{return katex.renderToString(tokens[index].content.trim(),{displayMode:display,throwOnError:true,trust:false,maxExpand:1000,maxSize:20});}catch{return '<span class="render-error">Fórmula no válida: '+md.utils.escapeHtml(tokens[index].content)+'</span>';}};
md.renderer.rules.math_inline=(t,i)=>math(t,i,false);md.renderer.rules.math_block=(t,i)=>math(t,i,true);
return md;
}
