const {test}=require('node:test'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events'),fsp=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{createWindowsShare}=require('./windows-share.cjs');
// Fake LecatShare.exe: tests decide when it reports ready/error and when it exits.
function setup(){
 const spawned=[];let temp;
 const spawn=(command,args)=>{const child=new EventEmitter();child.args=args;child.stdout=new EventEmitter();child.stderr=new EventEmitter();child.killed=false;child.kill=()=>{child.killed=true;setImmediate(()=>child.emit('exit',null));};child.send=event=>child.stdout.emit('data',Buffer.from(JSON.stringify(event)+'\n'));spawned.push(child);return child;};
 const fs={...fsp,access:async target=>target.endsWith('LecatShare.exe')?undefined:fsp.access(target)};
 const app={isPackaged:false,getPath:()=>temp,on(){}},win={getNativeWindowHandle:()=>Buffer.alloc(8)};
 const core={encode:value=>Buffer.from(value,'utf8')};
 return {spawned,async init(){temp=await fsp.mkdtemp(path.join(os.tmpdir(),'lecat-share-test-'));return temp;},share:(options={})=>createWindowsShare({app,win,core,notify(){},spawn,fs,...options}),get temp(){return temp;}};
}
const until=async condition=>{const end=Date.now()+3000;while(!condition()&&Date.now()<end)await new Promise(r=>setTimeout(r,5));assert.ok(condition());};
const payload=async child=>JSON.parse(await fsp.readFile(child.args[1],'utf8'));
test('a new share replaces a helper left open after the sheet was dismissed',async()=>{const s=setup();await s.init();const share=s.share();
 const first=share({name:'Uno.md',content:'# Uno'});await until(()=>s.spawned.length===1);s.spawned[0].send({event:'ready'});await first;
 const second=share({name:'Dos.md',content:'# Dos'});await until(()=>s.spawned.length===2);assert.equal(s.spawned[0].killed,true);s.spawned[1].send({event:'ready'});await second;
 assert.equal((await payload(s.spawned[1])).title,'Dos.md');});
test('a second click while Share is still opening is reported instead of stacking helpers',async()=>{const s=setup();await s.init();const share=s.share();
 const first=share({name:'Uno.md',content:'x'});await until(()=>s.spawned.length===1);
 await assert.rejects(share({name:'Dos.md',content:'y'}),/se está abriendo/);assert.equal(s.spawned.length,1);s.spawned[0].send({event:'ready'});await first;});
test('PDFs are shared from their original file without a temporary copy',async()=>{const s=setup();const temp=await s.init();const pdf=path.join(temp,'Grande.pdf');await fsp.writeFile(pdf,'%PDF-1.7');const share=s.share();
 const pending=share({kind:'pdf',name:'Grande.pdf',path:pdf});await until(()=>s.spawned.length===1);const request=await payload(s.spawned[0]);
 assert.equal(request.file,path.resolve(pdf));assert.equal(request.text,'');assert.deepEqual(await fsp.readdir(path.dirname(s.spawned[0].args[1])),['request.json']);s.spawned[0].send({event:'ready'});await pending;});
test('helper errors kill the helper, not Lecat, and free Share for the next request',async()=>{const s=setup();await s.init();const share=s.share();
 const failing=share({name:'Uno.md',content:'x'});await until(()=>s.spawned.length===1);s.spawned[0].send({event:'error',message:'Sin destinos'});await assert.rejects(failing,/Sin destinos/);assert.equal(s.spawned[0].killed,true);
 const next=share({name:'Dos.md',content:'y'});await until(()=>s.spawned.length===2);s.spawned[1].send({event:'ready'});await next;});
test('the temporary share folder is removed when the helper exits',async()=>{const s=setup();await s.init();const share=s.share();
 const pending=share({name:'Uno.md',content:'x'});await until(()=>s.spawned.length===1);const folder=path.dirname(s.spawned[0].args[1]);s.spawned[0].send({event:'ready'});await pending;
 assert.ok((await fsp.readdir(folder)).includes('Uno.md'));s.spawned[0].emit('exit',0);await until(()=>!require('node:fs').existsSync(folder));});
test('a helper that never reports ready times out and frees Share',async()=>{const s=setup();await s.init();const share=s.share({readyTimeout:20});
 await assert.rejects(share({name:'Uno.md',content:'x'}),/no pudo abrir/);assert.equal(s.spawned[0].killed,true);
 const next=share({name:'Dos.md',content:'y'});await until(()=>s.spawned.length===2);s.spawned[1].send({event:'ready'});await next;});
