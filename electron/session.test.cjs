const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {snapshotSession,readSession,restoreSession}=require('./session.cjs'),{writeJson}=require('./persistence.cjs');
const a=path.join(os.tmpdir(),'lecat-a.md'),b=path.join(os.tmpdir(),'lecat-b.md');
test('session preserves open file order and selected tab; excludes welcome/untitled',()=>{
 const result=snapshotSession([{id:'a',path:a},{id:'welcome',path:null},{id:'b',path:b}],'a');
 assert.deepEqual(result,{version:1,initialized:true,paths:[a,b],activePath:a,activeDraftId:null});
 assert.equal(snapshotSession([{id:'new',path:null}],'new').initialized,true);
});
test('session round trip distinguishes first use from an initialized empty session',async t=>{
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'lecat-session-'));t.after(()=>fs.rm(folder,{recursive:true,force:true}));const file=path.join(folder,'session.json');
 assert.equal((await readSession(file)).existed,false);await writeJson(file,snapshotSession([],null));
 const loaded=await readSession(file);assert.equal(loaded.existed,true);assert.equal(loaded.session.initialized,true);assert.deepEqual(loaded.session.paths,[]);
});
test('restoration reads current disk contents and restores active file',async()=>{
 const calls=[],warnings=[];const result=await restoreSession({paths:[a,b],activePath:a},[],async file=>{calls.push(file);return {id:file,path:file,content:'latest on disk'};},warnings);
 assert.deepEqual(calls,[a,b]);assert.equal(result.activeId,a);assert.equal(result.documents[0].content,'latest on disk');assert.deepEqual(warnings,[]);
});
test('crash recovery takes precedence over disk without duplicating tabs',async()=>{
 let reads=0;const drafts=[{id:'dirty',path:a,content:'unsaved edit',dirty:true},{id:'new',path:null,content:'new unsaved note',dirty:true}];
 const result=await restoreSession({paths:[a,a,b],activePath:a},drafts,async file=>{reads++;return {id:'clean',path:file};},[]);
 assert.equal(reads,1);assert.deepEqual(result.documents.map(d=>d.id),['dirty','clean','new']);assert.equal(result.activeId,'dirty');assert.equal(result.documents[0].content,'unsaved edit');
});
test('missing active file reports warning and selects an available tab',async()=>{
 const warnings=[];const result=await restoreSession({paths:[a,b],activePath:a},[],async file=>{if(file===a)throw Error('ENOENT');return {id:'b',path:b};},warnings);
 assert.equal(result.activeId,'b');assert.equal(result.documents.length,1);assert.equal(warnings.length,1);assert.match(warnings[0],/ENOENT/);
});
test('last selected unsaved draft is restored even when it is not the final tab',async()=>{
 const saved=snapshotSession([{id:'first',path:null,dirty:true},{id:'last',path:null,dirty:true}],'first');
 const recovered=[{id:'new-first',recoveryId:'first',path:null,dirty:true},{id:'new-last',recoveryId:'last',path:null,dirty:true}];
 const result=await restoreSession(saved,recovered,async()=>{throw Error('no file expected');},[]);assert.equal(result.activeId,'new-first');
});
test('explicitly closed files are absent from next session',async()=>{
 const saved=snapshotSession([{id:'a',path:a}],'a');const result=await restoreSession(saved,[],async file=>({id:file,path:file}),[]);
 assert.deepEqual(result.documents.map(d=>d.path),[a]);assert(!result.documents.some(d=>d.path===b));
});
test('invalid session is backed up, preserving corrupt original and marking prior use',async t=>{
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'lecat-session-'));t.after(()=>fs.rm(folder,{recursive:true,force:true}));const file=path.join(folder,'session.json'),raw='{"paths":';await fs.writeFile(file,raw);
 const result=await readSession(file);assert.equal(result.existed,true);assert.equal(result.session,null);assert.equal(result.warnings.length,1);
 const backup=(await fs.readdir(folder)).find(f=>f.includes('.invalid-'));assert.equal(await fs.readFile(path.join(folder,backup),'utf8'),raw);
});
test('untrusted relative paths and schema versions are rejected',async t=>{
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'lecat-session-'));t.after(()=>fs.rm(folder,{recursive:true,force:true}));const file=path.join(folder,'session.json');
 for(const value of [{version:1,initialized:true,paths:['relative.md'],activePath:null},{version:42,initialized:true,paths:[a],activePath:a}]){await writeJson(file,value);assert.equal((await readSession(file)).session,null);}
});
