const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
exports.run=async({execute,check,temp,core,openDoc,docs,saveDoc,confirmClose,dialog})=>{
 const aPath=path.join(temp,'Race A.md'),bPath=path.join(temp,'Race B.md');await fs.writeFile(aPath,'# A original');await fs.writeFile(bPath,'# B original');const a=await openDoc(aPath),b=await openDoc(bPath);
 await execute(`window.__claroTest.accept(${JSON.stringify(b)});window.__claroTest.accept(${JSON.stringify(a)});window.__claroTest.view().dispatch({changes:{from:0,to:window.__claroTest.view().state.doc.length,insert:'# A editado'}});window.__saveRace=window.__claroTest.run('save');window.__claroTest.activate(${JSON.stringify(b.id)});`);await execute('window.__saveRace');
 check('F-01 saving while switching tabs writes intended file',(await fs.readFile(aPath,'utf8'))==='# A editado'&&(await fs.readFile(bPath,'utf8'))==='# B original');check('F-01 save response cannot replace active tab identity',await execute(`window.__claroTest.doc().id===${JSON.stringify(b.id)} && window.__claroTest.view().state.doc.toString()==='# B original'`));
};
