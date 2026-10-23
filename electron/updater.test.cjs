const {test}=require('node:test'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
const {createUpdater,newer,RELEASES}=require('./updater.cjs');
function fixture(options={}){
 const updater=new EventEmitter(),events=[];let installs=0,checks=0,downloads=0;
 updater.checkForUpdates=async()=>{checks++;updater.emit('update-available',{version:'3.2.4',releaseNotes:'Novedades'});return {};};
 updater.downloadUpdate=async()=>{downloads++;updater.emit('download-progress',{percent:45});updater.emit('update-downloaded',{version:'3.2.4'});};
 updater.quitAndInstall=()=>{installs++;};
 const service=createUpdater({updater,currentVersion:'3.2.3',notify:value=>events.push(value),...options});
 return {updater,service,events,counts:()=>({installs,checks,downloads})};
}
test('stable versions are compared numerically and reject prereleases/downgrades',()=>{
 assert.equal(newer('v3.10.0','3.9.9'),true);assert.equal(newer('v3.2.3','3.2.3'),false);
 assert.equal(newer('3.2.2','3.2.3'),false);assert.equal(newer('3.3.0-beta.1','3.2.3'),false);
});
test('check, explicit download and explicit installation; never update on close',async()=>{
 const f=fixture();assert.equal(f.updater.autoDownload,false);assert.equal(f.updater.autoInstallOnAppQuit,false);
 assert.equal(f.updater.allowPrerelease,false);assert.equal(f.updater.allowDowngrade,false);
 await f.service.check();assert.equal(f.service.snapshot().status,'available');assert.equal(f.counts().downloads,0);
 await f.service.download();assert.equal(f.service.snapshot().status,'downloaded');assert.equal(f.counts().installs,0);
 assert.equal(f.events.some(s=>s.progress===45),true);await f.service.check();assert.equal(f.counts().checks,1);
 assert.equal(await f.service.install(),true);assert.equal(f.counts().installs,1);assert.equal(f.service.snapshot().status,'installing');
});
test('cancel unsaved document prompt keeps downloaded update and never installs',async()=>{
 const f=fixture({prepareInstall:async()=>false});await f.service.check();await f.service.download();
 assert.equal(await f.service.install(),false);assert.equal(f.counts().installs,0);assert.equal(f.service.snapshot().status,'downloaded');
});
test('unsaved document persistence failure prevents installation',async()=>{
 const f=fixture({prepareInstall:async()=>{throw Error('disk full');}});await f.service.check();await f.service.download();
 assert.equal(await f.service.install(),false);assert.equal(f.counts().installs,0);assert.equal(f.service.snapshot().status,'error');
});
test('network failure reports an error and the next search recovers',async()=>{
 const f=fixture(),original=f.updater.checkForUpdates;f.updater.checkForUpdates=async()=>{throw Error('offline');};
 assert.equal((await f.service.check()).status,'error');f.updater.checkForUpdates=original;
 assert.equal((await f.service.check()).status,'available');
});
test('hash/download rejection cannot become an installable update',async()=>{
 const f=fixture();await f.service.check();f.updater.downloadUpdate=async()=>{throw Error('SHA512 mismatch');};
 assert.equal((await f.service.download()).status,'error');await assert.rejects(f.service.install());assert.equal(f.counts().installs,0);
});
test('missing update metadata offers an actionable release message',async()=>{
 const f=fixture();f.updater.checkForUpdates=async()=>{throw Object.assign(Error('404'),{code:'ERR_UPDATER_CHANNEL_FILE_NOT_FOUND'});};
 const state=await f.service.check();assert.equal(state.status,'error');assert.match(state.message,/release pública/);
});
test('installer launch failure returns to error without claiming success state',async()=>{
 const f=fixture();await f.service.check();await f.service.download();f.updater.quitAndInstall=()=>{f.updater.emit('error',Error('spawn failed'));};
 assert.equal(await f.service.install(),false);assert.equal(f.service.snapshot().status,'error');
});
test('duplicate checks and downloads are coalesced',async()=>{
 const f=fixture();let releaseCheck,releaseDownload,calls=0;
 f.updater.checkForUpdates=()=>{calls++;return new Promise(resolve=>{releaseCheck=()=>{f.updater.emit('update-available',{version:'3.2.4'});resolve({});};});};
 const a=f.service.check(),b=f.service.check();assert.equal(calls,1);releaseCheck();await Promise.all([a,b]);
 f.updater.downloadUpdate=()=>{calls++;return new Promise(resolve=>{releaseDownload=()=>{f.updater.emit('update-downloaded',{version:'3.2.4'});resolve();};});};
 const c=f.service.download(),d=f.service.download();await f.service.check();assert.equal(calls,2);releaseDownload();await Promise.all([c,d]);
});
test('repeated install cannot bypass an outstanding save confirmation',async()=>{
 let approve;const f=fixture({prepareInstall:()=>new Promise(resolve=>{approve=resolve;})});await f.service.check();await f.service.download();
 const first=f.service.install();assert.equal(await f.service.install(),false);approve(true);await first;assert.equal(f.counts().installs,1);
});
test('no newer version clears stale release notes',async()=>{
 const f=fixture();await f.service.check();f.updater.checkForUpdates=async()=>{f.updater.emit('update-not-available',{});return {};};
 assert.equal((await f.service.check()).status,'current');assert.equal(f.service.snapshot().notes,'');
});
test('portable/ad-hoc builds can search public releases but cannot install',async()=>{
 const f=fixture({supported:false,reason:'Descargá la versión instalada.',fetchRelease:async()=>({tag_name:'v3.2.4',body:'Release notes'})});
 const state=await f.service.check();assert.equal(state.status,'manual-available');assert.equal(state.releaseUrl,RELEASES);
 assert.equal(f.counts().checks,0);await assert.rejects(f.service.download());await assert.rejects(f.service.install());
});
test('manual search ignores prereleases and drafts',async()=>{
 for(const release of [{tag_name:'v4.0.0',prerelease:true},{tag_name:'v4.0.0',draft:true},{tag_name:'v3.2.3'}]){
  const f=fixture({supported:false,fetchRelease:async()=>release});assert.equal((await f.service.check()).status,'current');
 }
});
