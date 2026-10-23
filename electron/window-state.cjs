const fs=require('node:fs/promises');
const MODES=['normal','maximized','fullscreen'];
function restorePlacement(saved,area){
 const source=saved?.bounds,valid=source&&['x','y','width','height'].every(key=>Number.isFinite(source[key]));
 const width=Math.min(area.width,Math.max(820,valid?source.width:1320)),height=Math.min(area.height,Math.max(560,valid?source.height:860));
 const x=valid?Math.min(Math.max(area.x,source.x),area.x+area.width-width):area.x+Math.round((area.width-width)/2);
 const y=valid?Math.min(Math.max(area.y,source.y),area.y+area.height-height):area.y+Math.round((area.height-height)/2);
 return {bounds:{x:Math.round(x),y:Math.round(y),width:Math.round(width),height:Math.round(height)},mode:MODES.includes(saved?.mode)?saved.mode:'normal'};
}
async function readWindowState(file){try{return JSON.parse(await fs.readFile(file,'utf8'));}catch{return null;}}
function trackWindowState(win,{initial,persist,onError=()=>{}}){
 let desired=initial.mode,normalBounds={...initial.bounds},frozen=false,frozenSnapshot=null,restoring=desired!=='normal',restored=false,timer,queue=Promise.resolve();
 function snapshot(){const mode=win.isFullScreen()?'fullscreen':win.isMaximized()?'maximized':'normal';if(mode==='normal'&&!win.isMinimized()&&!restoring){const bounds=win.getBounds();for(const key of ['x','y','width','height'])if(Math.abs(bounds[key]-normalBounds[key])>2)normalBounds[key]=bounds[key];}return {version:1,bounds:{...normalBounds},mode};}
 function save(value){desired=value.mode;queue=queue.catch(()=>{}).then(()=>persist(value));return queue;}
 function schedule(){if(frozen||restoring||win.isDestroyed()||win.isMinimized())return;clearTimeout(timer);timer=setTimeout(()=>save(snapshot()).catch(onError),180);}
 const events=['resize','move','maximize','unmaximize','enter-full-screen','leave-full-screen'];
 for(const event of events)win.on(event,()=>{if(frozen)return;if(restoring&&event==='leave-full-screen'&&desired==='fullscreen'){win.setFullScreen(true);return;}if(restoring&&((desired==='fullscreen'&&win.isFullScreen())||(desired==='maximized'&&win.isMaximized()))){restoring=false;}if(!restoring&&!win.isMinimized()){const value=snapshot();desired=value.mode;}schedule();});
 return {
  restore(){if(restored&&!frozen)return;restored=true;frozen=false;frozenSnapshot=null;restoring=desired!=='normal';if(desired==='fullscreen'&&!win.isFullScreen())win.setFullScreen(true);else if(desired==='maximized'&&!win.isMaximized())win.maximize();else{restoring=false;schedule();}},
  async capture(){if(frozen){await queue;return frozenSnapshot;}clearTimeout(timer);frozen=true;const value=snapshot();if(restoring||win.isMinimized())value.mode=desired;frozenSnapshot=value;await save(value);return value;},
  resume(){frozen=false;frozenSnapshot=null;restoring=false;schedule();},
  flush:()=>queue,
  dispose(){clearTimeout(timer);frozen=true;},
 };
}
module.exports={restorePlacement,readWindowState,trackWindowState};
