const fs=require('node:fs'),path=require('node:path'),yaml=require('yaml');

function mergeMacMetadata(directory,channel='latest'){
 if(!['latest','beta','alpha','rc'].includes(channel))throw Error('Unsupported update channel');
 const inputs=['arm64','x64'].map(arch=>yaml.parse(fs.readFileSync(path.join(directory,`${channel}-mac-${arch}.yml`),'utf8')));
 if(!inputs[0].version||inputs.some(value=>value.version!==inputs[0].version))throw Error('macOS update manifests have different versions.');
 const files=inputs.flatMap(value=>value.files||[]);
 for(const arch of ['arm64','x64'])if(!files.some(file=>file.url.includes(`-${arch}.zip`)&&file.sha512))throw Error(`Missing verified macOS ${arch} ZIP in update manifests.`);
 const merged={...inputs[1],files};
 // Legacy path/sha512 stay paired (x64); modern MacUpdater selects from files[].
 fs.writeFileSync(path.join(directory,`${channel}-mac.yml`),yaml.stringify(merged));
 return merged;
}
if(require.main===module)mergeMacMetadata(path.resolve(process.argv[2]||'release-assets'),process.argv[3]||'latest');
module.exports={mergeMacMetadata};
