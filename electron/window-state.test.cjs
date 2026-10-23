const {test}=require('node:test'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
const {restorePlacement,trackWindowState}=require('./window-state.cjs');
const area={x:0,y:0,width:1440,height:900},bounds={x:100,y:80,width:1100,height:720};
class Window extends EventEmitter{
 constructor(){super();this.normal={...bounds};this.full=false;this.max=false;this.min=false;}
 getBounds(){return {...this.normal};}getNormalBounds(){return {...this.normal};}isFullScreen(){return this.full;}isMaximized(){return this.max;}isMinimized(){return this.min;}isDestroyed(){return false;}
 setFullScreen(value){this.full=value;this.emit(value?'enter-full-screen':'leave-full-screen');}maximize(){this.max=true;this.emit('maximize');}
}
test('normal window size and position survive restart',()=>{assert.deepEqual(restorePlacement({bounds,mode:'normal'},area),{bounds,mode:'normal'});});
test('removed monitor and changed resolution cannot restore off-screen bounds',()=>{const result=restorePlacement({bounds:{x:-4000,y:5000,width:2000,height:1500},mode:'fullscreen'},area);assert.deepEqual(result.bounds,area);assert.equal(result.mode,'fullscreen');});
test('invalid dimensions use a centered default and unknown mode falls back to normal',()=>{const result=restorePlacement({bounds:{width:'invalid'},mode:'other'},area);assert.equal(result.mode,'normal');assert(result.bounds.width<=area.width&&result.bounds.x>=area.x);});
for(const mode of ['fullscreen','maximized'])test('restart restores '+mode+' before later document activation',async t=>{
 const win=new Window(),saved=[],tracker=trackWindowState(win,{initial:{bounds,mode},persist:async value=>saved.push(value)});t.after(()=>tracker.dispose());tracker.restore();assert.equal(mode==='fullscreen'?win.isFullScreen():win.isMaximized(),true);tracker.restore();await tracker.capture();assert.equal(saved.at(-1).mode,mode);assert.deepEqual(saved.at(-1).bounds,bounds);
});
test('quit/fullscreen teardown cannot overwrite the captured fullscreen state',async t=>{
 const win=new Window(),saved=[],tracker=trackWindowState(win,{initial:{bounds,mode:'fullscreen'},persist:async value=>saved.push(value)});t.after(()=>tracker.dispose());tracker.restore();await tracker.capture();win.setFullScreen(false);assert.equal((await tracker.capture()).mode,'fullscreen');assert.equal(saved.length,1);assert.equal(saved[0].mode,'fullscreen');
});
test('macOS hidden window restores fullscreen on next file-open or activation',async t=>{
 const win=new Window(),tracker=trackWindowState(win,{initial:{bounds,mode:'fullscreen'},persist:async()=>{}});t.after(()=>tracker.dispose());tracker.restore();await tracker.capture();win.setFullScreen(false);tracker.restore();assert.equal(win.isFullScreen(),true);
});
test('minimized window retains previous maximized mode',async t=>{
 const win=new Window(),tracker=trackWindowState(win,{initial:{bounds,mode:'maximized'},persist:async()=>{}});t.after(()=>tracker.dispose());tracker.restore();win.max=false;win.min=true;assert.equal((await tracker.capture()).mode,'maximized');
});
test('failed state write can be resumed after canceling close',async t=>{
 const win=new Window();let fail=true;const tracker=trackWindowState(win,{initial:{bounds,mode:'normal'},persist:async()=>{if(fail)throw Error('disk full');}});t.after(()=>tracker.dispose());await assert.rejects(tracker.capture(),/disk full/);tracker.resume();fail=false;assert.equal((await tracker.capture()).mode,'normal');
});
test('native DPI rounding does not accumulate across restarts',async t=>{
 const win=new Window(),tracker=trackWindowState(win,{initial:{bounds,mode:'normal'},persist:async()=>{}});t.after(()=>tracker.dispose());win.normal.width+=1;win.normal.height+=2;tracker.restore();assert.deepEqual((await tracker.capture()).bounds,bounds);
});
test('resize followed immediately by maximize and minimize keeps normal bounds and mode',async t=>{
 const win=new Window(),tracker=trackWindowState(win,{initial:{bounds,mode:'normal'},persist:async()=>{}});t.after(()=>tracker.dispose());tracker.restore();win.normal.width=1200;win.emit('resize');win.maximize();win.max=false;win.min=true;const saved=await tracker.capture();assert.equal(saved.mode,'maximized');assert.equal(saved.bounds.width,1200);
});
