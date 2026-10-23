const fs=require('node:fs/promises'),path=require('node:path'),store=require('./session.cjs');
exports.run=async({execute,check,temp,openDoc,sessionFile,persistSession,approveWindowClose,dialog})=>{
 const a=path.join(temp,'Session A.md'),b=path.join(temp,'Session B.md');await fs.writeFile(a,'# Session A');await fs.writeFile(b,'# Session B');
 const first=await openDoc(a),second=await openDoc(b);
 await execute(`window.__claroTest.accept(${JSON.stringify(first)});window.__claroTest.accept(${JSON.stringify(second)});window.__claroTest.activate(${JSON.stringify(first.id)});window.__claroTest.flushSession()`);
 let saved=(await store.readSession(sessionFile())).session;
 check('session IPC persists file tabs in order and last selected tab',saved.paths.indexOf(a)<saved.paths.indexOf(b)&&saved.activePath===a);
 await fs.writeFile(a,'# Changed externally before next launch');
 const warnings=[];const restored=await store.restoreSession(saved,[],async file=>({path:file,id:file,content:await fs.readFile(file,'utf8')}),warnings);
 check('session restart uses latest file contents and restores selected tab',restored.activeId===a&&restored.documents.find(d=>d.path===a).content==='# Changed externally before next launch');
 await execute(`window.__claroTest.activate(${JSON.stringify(second.id)});window.__claroTest.run('close')`);
 saved=(await store.readSession(sessionFile())).session;
 check('closed tab is removed from persisted session',!saved.paths.includes(b)&&saved.paths.includes(a));
 const original=dialog.showMessageBox;try{dialog.showMessageBox=async()=>({response:1});await persistSession();const before=(await store.readSession(sessionFile())).session;
 check('normal application close preserves open file session',await approveWindowClose()&&JSON.stringify((await store.readSession(sessionFile())).session)===JSON.stringify(before));
 }finally{dialog.showMessageBox=original;}
 const originalRename=fs.rename;try{dialog.showMessageBox=async()=>({response:1});fs.rename=async(from,to)=>{if(to===sessionFile())throw Error('Session disk failure');return originalRename(from,to);};let failed=false;try{await approveWindowClose();}catch{failed=true;}check('session persistence failure prevents application close',failed);}
 finally{fs.rename=originalRename;dialog.showMessageBox=original;}
};
