const test=require('node:test');
const assert=require('node:assert/strict');
const {prepareElectron}=require('./prepare-electron.cjs');
const silent={log:()=>{},wait:async()=>{}};

test('successful preparation does not retry',async()=>{
  let calls=0;await prepareElectron({...silent,run:()=>{calls++;return 0;}});assert.equal(calls,1);
});
test('transient failures retry with backoff and recover',async()=>{
  let calls=0;const delays=[];
  await prepareElectron({...silent,wait:async delay=>delays.push(delay),run:()=>++calls<3?1:0});
  assert.equal(calls,3);assert.deepEqual(delays,[2000,4000]);
});
test('persistent failure remains a failed build',async()=>{
  let calls=0;await assert.rejects(prepareElectron({...silent,run:()=>{calls++;return 1;}}),/failed after 3 attempts/);assert.equal(calls,3);
});
test('installer exception can recover without suppressing a final failure',async()=>{
  let calls=0;await prepareElectron({...silent,run:()=>{if(++calls===1)throw Error('fetch failed');return 0;}});assert.equal(calls,2);
  await assert.rejects(prepareElectron({...silent,run:()=>{throw Error('fetch failed');}}),/failed after 3 attempts/);
});
