const fs=require('node:fs/promises'),path=require('node:path');
exports.run=async({execute,check,win,out,temp,openDoc})=>{
 const settle=()=>execute('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
 const capture=async name=>fs.writeFile(path.join(out,name+'.png'),(await win.webContents.capturePage()).toPNG());
 const file=path.join(temp,'Documento con un nombre muy largo para comprobar pestañas y alineación.md');
 await fs.writeFile(file,'# Un título que debe quedar visible\n\nTexto de prueba.\n\n## Sección\n\n'+('Contenido que se puede desplazar.\n\n'.repeat(30)));
 const doc=await openDoc(file);await execute(`window.__claroTest.accept(${JSON.stringify(doc)});document.querySelector('#toast').hidden=true;`);
 const platform=await execute('document.documentElement.dataset.platform');
 for(const width of [820,1024,1440]){
  win.setSize(width,820);await settle();
  for(const theme of ['light','dark'])for(const mode of ['read','edit','split']){
   const label=`interface ${platform} ${width} ${theme} ${mode}`;
   await execute(`window.__claroTest.setTheme(${JSON.stringify(theme)});window.__claroTest.setMode(${JSON.stringify(mode)});`);await settle();
   check(label+' tabs contain centered action buttons',await execute(`Array.from(document.querySelectorAll('#tabs .tab')).every(tab=>{const t=tab.getBoundingClientRect();return Array.from(tab.querySelectorAll('.tab-details,.close-tab')).every(button=>{const b=button.getBoundingClientRect(),svg=button.querySelector('svg')?.getBoundingClientRect();return b.top>=t.top+2&&b.bottom<=t.bottom-2&&Math.abs((b.top+b.bottom-t.top-t.bottom)/2)<1&&(!svg||Math.abs((svg.top+svg.bottom-b.top-b.bottom)/2)<1);});})`));
   // Rendering may replace the tab button after a mode change; target the current node again if needed.
   for(let attempt=0;attempt<3;attempt++){
    const hover=await execute(`(()=>{const r=document.querySelector('#tabs .tab.active>button:first-child').getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};})()`);
    win.webContents.sendInputEvent({type:'mouseMove',...hover});await settle();
    if(await execute(`document.querySelector('#tabs .tab.active>button:first-child').matches(':hover')`))break;
   }
   check(label+' title hover stays inset from tab borders',await execute(`(()=>{const button=document.querySelector('#tabs .tab.active>button:first-child'),b=button.getBoundingClientRect(),tab=button.parentElement,t=tab.getBoundingClientRect();return button.matches(':hover')&&b.top>=t.top+3&&b.bottom<=t.bottom-3&&Math.abs((b.top+b.bottom-t.top-t.bottom)/2)<1&&getComputedStyle(tab).overflow==='hidden';})()`));
   if(width===1440&&mode==='edit')await capture('interface-'+platform+'-title-hover-'+theme);
   win.webContents.sendInputEvent({type:'mouseMove',x:1,y:1});
   check(label+' no inherited full-path tooltip over controls',await execute(`!document.querySelector('#tabs .tab[title]')&&!document.querySelector('#tabs .tab-details[title]')`));
   check(label+' active tab is visible',await execute(`(()=>{const t=document.querySelector('#tabs').getBoundingClientRect(),b=document.querySelector('#tabs .tab.active').getBoundingClientRect();return b.left>=t.left-1&&b.right<=t.right+1;})()`));
   check(label+' one visible control per toolbar command',await execute(`(()=>{const seen=new Set();return Array.from(document.querySelectorAll('.appbar [data-command],.document-controls [data-command]')).filter(b=>b.getClientRects().length&&getComputedStyle(b).visibility!=='hidden').every(b=>{if(seen.has(b.dataset.command))return false;seen.add(b.dataset.command);return true;});})()`));
   check(label+' exactly one visible format toggle',await execute(`Array.from(document.querySelectorAll('.format-toggle')).filter(b=>b.getClientRects().length).length===1`));
   check(label+' shell fits viewport',await execute(`document.documentElement.scrollWidth<=innerWidth&&document.querySelector('.appbar').scrollWidth<=innerWidth`));
   if(width===1440&&mode==='edit')await capture('interface-'+platform+'-'+theme);
  }
 }
 await execute(`document.querySelector('.tab.active .tab-details').click()`);await settle();
 check('document information opens within the viewport',await execute(`(()=>{const p=document.querySelector('#document-info'),r=p.getBoundingClientRect();return p.matches(':popover-open')&&r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&document.querySelector('.tab.active .tab-details').getAttribute('aria-expanded')==='true';})()`));
 await capture('interface-'+platform+'-document-info');
 await execute(`document.querySelector('#document-info').hidePopover()`);await settle();
 check('document information disclosure resets when dismissed',await execute(`document.querySelector('.tab.active .tab-details').getAttribute('aria-expanded')==='false'`));
 win.setSize(1024,820);await execute(`window.__claroTest.setMode('edit');window.__claroTest.run('preferences')`);await settle();
 check('preferences close button is centered in header',await execute(`(()=>{const h=document.querySelector('#preferences-dialog .modal-tools').getBoundingClientRect(),b=document.querySelector('#preferences-close').getBoundingClientRect();return Math.abs((h.top+h.bottom-b.top-b.bottom)/2)<1;})()`));
 await capture('interface-'+platform+'-preferences');await execute(`document.querySelector('#preferences-close').click()`);
 const secondFile=path.join(temp,'Segundo documento.md');await fs.writeFile(secondFile,'# Segundo título visible\n\n'+('Texto del segundo panel.\n\n'.repeat(30)));const other=await openDoc(secondFile);
 await execute(`window.__claroTest.accept(${JSON.stringify(other)});window.__claroTest.documentGroups.openPair(${JSON.stringify(doc.id)},${JSON.stringify(other.id)},'right');`);await settle();
 for(const width of [820,1440]){win.setSize(width,900);
 for(const side of ['primary','secondary']){
  await execute(`window.__claroTest.documentGroups.${side==='primary'?'focusPrimary':'focusSecondary'}()`);
  for(const mode of ['edit','read','split']){
   await execute(`window.__claroTest.setMode(${JSON.stringify(mode)})`);
   for(const position of ['top-center','top-left','top-right','left','right']){
    await execute(`window.__claroTest.floatingFormat.setState({visible:true,position:${JSON.stringify(position)}})`);await settle();
    check(`format bar ${width} ${side} ${mode} ${position} never overlaps document viewport`,await execute(`(()=>{const bar=document.querySelector('#formatbar'),b=bar.getBoundingClientRect(),root=bar.parentElement;return Array.from(root.children).filter(e=>e.matches('[data-pane-part$="-pane"]')&&e.getClientRects().length).every(e=>{const r=e.getBoundingClientRect();return b.right<=r.left||b.left>=r.right||b.bottom<=r.top||b.top>=r.bottom;});})()`));
    check(`format bar ${width} ${side} ${mode} ${position} fits its panel`,await execute(`(()=>{const b=document.querySelector('#formatbar').getBoundingClientRect(),r=document.querySelector('#formatbar').parentElement.getBoundingClientRect();return b.left>=r.left&&b.right<=r.right&&b.top>=r.top&&b.bottom<=r.bottom;})()`));
    if(mode==='edit'&&position==='top-center'){await execute(`document.querySelector('#formatbar').parentElement.querySelector('[data-pane-part=visual-scroll]').scrollTop=0`);await settle();await capture('interface-'+platform+'-'+width+'-split-'+side);}
   }
  }
 }}
 await execute(`window.__claroTest.floatingFormat.setState({visible:false,position:'top-center'})`);await settle();
 check('hiding format bar releases reserved space in both document panels',await execute(`Array.from(document.querySelectorAll('[data-document-pane]')).every(root=>['paddingTop','paddingLeft','paddingRight'].every(key=>parseFloat(getComputedStyle(root)[key])===0))`));
 await execute(`window.__claroTest.documentGroups.closeSplit(false);window.__claroTest.setMode('edit')`);await settle();
};
