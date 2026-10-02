(async function(){
  "use strict";
  const dark=document.body.dataset.dark==="true";
  const remote=document.body.dataset.remote==="true";
  const state={type:"render",generation:Number(document.body.dataset.generation),diagrams:0,math:0,errors:0,headings:[]};
  const send=message=>window.chrome?.webview?.postMessage(message);
  const article=document.querySelector("article");
  window.__claroReady=false;
  const dialog=document.querySelector("#graphic-dialog");
  document.querySelector("#dialog-close").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
  const expand=element=>{const area=document.querySelector("#graphic-content");area.replaceChildren(element.cloneNode(true));dialog.showModal();};
  document.addEventListener("click",e=>{
    const link=e.target.closest("a");
    if(!link)return;e.preventDefault();
    const href=link.getAttribute("href");
    if(href?.startsWith("#")){document.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView({behavior:"smooth"});return;}
    send({type:"link",url:link.href});
  });
  for(const table of article.querySelectorAll("table")){
    const wrapper=document.createElement("div");wrapper.className="table-scroll";table.replaceWith(wrapper);wrapper.append(table);
  }
  for(const h of article.querySelectorAll("h1,h2,h3,h4,h5,h6")){
    if(!h.id)h.id="heading-"+state.headings.length;
    state.headings.push({id:h.id,text:h.textContent,level:Number(h.tagName.slice(1))});
  }
  // Each diagram is isolated, so one parse failure cannot abort the rest.
  mermaid.initialize({startOnLoad:false,securityLevel:"strict",theme:dark?"dark":"default",
    htmlLabels:false,fontFamily:"Segoe UI",maxTextSize:50000,maxEdges:500,
    suppressErrorRendering:true,secure:["secure","securityLevel","startOnLoad","maxTextSize","maxEdges","htmlLabels","suppressErrorRendering"],
    flowchart:{htmlLabels:false,useMaxWidth:false},sequence:{useMaxWidth:false},
    themeVariables:{darkMode:dark,fontFamily:"Segoe UI"}});
  const blocks=[...article.querySelectorAll("pre.mermaid,pre>code.language-mermaid")].filter(e=>e.tagName==="PRE"||!e.parentElement.classList.contains("mermaid"));
  for(let i=0;i<blocks.length;i++){
    const block=blocks[i],pre=block.tagName==="PRE"?block:block.parentElement;
    const text=block.textContent;
    const card=document.createElement("section");card.className="diagram-card";card.setAttribute("aria-label","Diagrama Mermaid");
    const toolbar=document.createElement("div");toolbar.className="graphic-tools";
    const label=document.createElement("span");label.textContent="Diagrama · Mermaid";toolbar.append(label);
    const content=document.createElement("div");content.className="diagram-content";
    const code=document.createElement("pre");code.className="diagram-code";code.textContent=text;
    const action=(name,fn)=>{const b=document.createElement("button");b.textContent=name;b.addEventListener("click",fn);toolbar.append(b);return b;};
    action("Código",()=>card.classList.toggle("show-code"));
    const enlarge=action("Ampliar",()=>{const svg=content.querySelector("svg");if(svg)expand(svg);});
    const save=action("Guardar SVG",()=>{const svg=content.querySelector("svg");if(svg)send({type:"save-svg",svg:new XMLSerializer().serializeToString(svg)});});
    card.append(toolbar,content,code);pre.replaceWith(card);
    try{
      if(text.length>50000)throw new Error("El diagrama supera el límite de 50.000 caracteres.");
      // User directives may not change rendering security or inject config.
      if(/%%\{\s*(init|config)/i.test(text)||/^\s*---\s*\n/.test(text))throw new Error("La configuración embebida del diagrama no está habilitada.");
      const rendered=await mermaid.render("claro-diagram-"+i,text);
      content.innerHTML=rendered.svg;state.diagrams++;
      const svg=content.querySelector("svg");
      if(svg){const box=svg.viewBox.baseVal;svg.style.width=Math.max(180,box.width)+"px";svg.style.maxWidth="none";svg.style.height="auto";}
    }catch(error){
      state.errors++;enlarge.disabled=true;save.disabled=true;
      const fallback=document.createElement("div");fallback.className="render-error";
      fallback.textContent="No se pudo dibujar este diagrama. Podés ver su código. "+String(error.message||error).split("\n")[0];
      content.replaceChildren(fallback);card.dataset.error="true";
    }
  }
  for(const element of article.querySelectorAll(".math")){
    const display=element.classList.contains("math-display")||element.tagName==="DIV";
    const tex=element.textContent.replace(/^\s*(\\\[|\\\(|\$\$?)/,"").replace(/(\\\]|\\\)|\$\$?)\s*$/,"").trim();
    try{katex.render(tex,element,{displayMode:display,throwOnError:true,trust:false,strict:"warn",maxExpand:1000,maxSize:20});state.math++;}
    catch(error){element.classList.add("render-error");element.setAttribute("title","No se pudo representar esta fórmula");state.mathErrors=state.mathErrors||[];state.mathErrors.push({tex,error:String(error)});state.errors++;}
  }
  for(const code of article.querySelectorAll("pre>code:not(.language-mermaid)")){
    try{hljs.highlightElement(code);}catch{}
  }
  const imagePromises=[];
  for(const image of article.querySelectorAll("img")){
    const failed=message=>{image.hidden=true;const note=document.createElement("span");note.className="media-error";note.textContent=message+" · "+(image.alt||"Imagen");image.after(note);};
    if(!remote&&/^https?:/.test(image.src)&&!new URL(image.src).hostname.endsWith(".claro.local")){
      image.removeAttribute("src");failed("Imagen remota desactivada. Habilitala en Vista");continue;
    }
    image.addEventListener("click",()=>expand(image));
    imagePromises.push(new Promise(resolve=>{
      if(image.complete){if(image.naturalWidth===0)failed("No se pudo cargar la imagen");resolve();return;}
      image.addEventListener("load",resolve,{once:true});
      image.addEventListener("error",()=>{failed("No se pudo cargar la imagen");resolve();},{once:true});
      setTimeout(resolve,5000);
    }));
  }
  await Promise.all(imagePromises);
  await document.fonts.ready;
  window.__claroState=state;window.__claroReady=true;send(state);
})().catch(error=>{
  window.__claroFailure=String(error);
  const note=document.createElement("div");note.className="render-error";note.textContent="Algunos elementos no se pudieron representar. El Markdown sigue disponible.";
  document.querySelector("article").prepend(note);
  window.__claroReady=true;
});
