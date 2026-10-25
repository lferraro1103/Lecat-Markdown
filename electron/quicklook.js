import {createMarkdown} from './markdown-renderer.js';
import DOMPurify from 'dompurify';
import mermaid from 'mermaid';
import hljs from 'highlight.js';
import 'katex/dist/katex.min.css';
const md=createMarkdown();
window.lecatImageURLs=source=>{const urls=new Set();function walk(tokens){for(const token of tokens){if(token.type==='image')urls.add(token.attrGet('src'));if(token.children)walk(token.children);}}walk(md.parse(source,{}));return [...urls].slice(0,100);};
window.lecatPreview=async({source,images={}})=>{
 try{const article=document.querySelector('article');article.innerHTML=DOMPurify.sanitize(md.render(source),{FORBID_TAGS:['script','iframe','object','embed','style'],FORBID_ATTR:['srcset']});
  for(const img of article.querySelectorAll('img')){const source=img.getAttribute('src');if(images[source])img.src=images[source];else img.removeAttribute('src');}
  mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:matchMedia('(prefers-color-scheme:dark)').matches?'dark':'default',htmlLabels:false,maxTextSize:50000,maxEdges:500,suppressErrorRendering:true,flowchart:{htmlLabels:false,useMaxWidth:true},secure:['secure','securityLevel','startOnLoad','maxTextSize','maxEdges','htmlLabels']});
  for(const code of article.querySelectorAll('pre>code')){if(!code.classList.contains('language-mermaid')){try{hljs.highlightElement(code);}catch{}continue;}const source=code.textContent;if(source.length>50000||/%%\{\s*(init|config)/i.test(source)||/^\s*---\s*\n/.test(source))continue;try{const result=await mermaid.render('ql-'+Date.now()+'-'+Math.random().toString(36).slice(2),source),div=document.createElement('div');div.innerHTML=DOMPurify.sanitize(result.svg,{USE_PROFILES:{svg:true,svgFilters:true},ADD_TAGS:['style']});code.parentElement.replaceWith(div);}catch{}}
  await document.fonts.ready;window.webkit?.messageHandlers.complete.postMessage({ready:true});
 }catch(error){document.querySelector('article').textContent=source;window.webkit?.messageHandlers.complete.postMessage({ready:true});}
};
document.addEventListener('click',event=>{const a=event.target.closest('a');if(!a)return;const href=a.getAttribute('href');event.preventDefault();if(href?.startsWith('#')){document.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView();return;}if(href)window.webkit?.messageHandlers.link.postMessage(href);});
