const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const {setTimeout:sleep}=require('node:timers/promises');

function install(){
  // Use Electron's own installer and bundled checksums, with the locked version.
  const installer=require.resolve('electron/install.js');
  const result=spawnSync(process.execPath,[installer],{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)return result.status??1;
  const root=path.dirname(installer);
  const executable=fs.readFileSync(path.join(root,'path.txt'),'utf8').trim();
  const version=fs.readFileSync(path.join(root,'dist/version'),'utf8').trim().replace(/^v/,'');
  if(version!==require(path.join(root,'package.json')).version||!fs.existsSync(path.join(root,'dist',executable)))throw Error('Electron binary validation failed');
  return 0;
}

async function prepareElectron({run=install,wait=sleep,log=console.log}={}){
  for(let attempt=1;attempt<=3;attempt++){
    try{
      log(`Preparing Electron (${attempt}/3)`);
      if(await run()===0)return;
    }catch(error){log(error.message);}
    if(attempt<3)await wait(2000*attempt);
  }
  throw Error('Electron preparation failed after 3 attempts; audit/build not started');
}

module.exports={prepareElectron};
if(require.main===module)prepareElectron().catch(error=>{console.error(error.message);process.exitCode=1;});
