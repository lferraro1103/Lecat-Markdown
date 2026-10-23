const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),yaml=require('yaml');
const {mergeMacMetadata}=require('./merge-update-metadata.cjs');
function fixtures(t,version='3.2.3'){
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'lecat-update-'));t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
 for(const arch of ['arm64','x64'])fs.writeFileSync(path.join(directory,`latest-mac-${arch}.yml`),yaml.stringify({version:arch==='x64'?version:'3.2.3',files:[{url:`Lecat-Markdown-3.2.3-macOS-${arch}.zip`,sha512:`hash-${arch}`,size:123}],path:`Lecat-Markdown-3.2.3-macOS-${arch}.zip`,sha512:`hash-${arch}`}));
 return directory;
}
test('release manifest retains both Mac architectures and paired legacy hash',t=>{
 const directory=fixtures(t),result=mergeMacMetadata(directory);assert.equal(result.files.length,2);
 assert.equal(result.path,'Lecat-Markdown-3.2.3-macOS-x64.zip');assert.equal(result.sha512,'hash-x64');
 assert.deepEqual(yaml.parse(fs.readFileSync(path.join(directory,'latest-mac.yml'),'utf8')),result);
});
test('never publish a manifest with mixed release versions',t=>{assert.throws(()=>mergeMacMetadata(fixtures(t,'3.2.4')),/different versions/);});
test('never publish a manifest missing an architecture/checksum',t=>{
 const directory=fixtures(t);fs.writeFileSync(path.join(directory,'latest-mac-arm64.yml'),yaml.stringify({version:'3.2.3',files:[]}));
 assert.throws(()=>mergeMacMetadata(directory),/Missing verified macOS arm64/);
});
