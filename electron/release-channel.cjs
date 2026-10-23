const semver=require('semver');
const RELEASES_API='https://api.github.com/repos/lferraro1103/Lecat-Markdown/releases?per_page=100';
function versionInfo(value){
 const text=String(value||'').replace(/^v/,''),match=/^(\d+\.\d+\.\d+)(-(?:alpha|beta|rc)\.\d+)?(?:-macos12\.(\d+))?$/.exec(text);
 if(!match)return null;const canonical=match[1]+(match[2]||'');if(!semver.valid(canonical))return null;
 const revision=Number(match[3]||0);if(!Number.isSafeInteger(revision))return null;
 return {text,canonical,legacy:!!match[3],revision,beta:!!match[2],channel:match[2]?.slice(1).split('.')[0]||'latest'};
}
function compareVersions(a,b){const left=versionInfo(a),right=versionInfo(b);if(!left||!right)return 0;return semver.compare(left.canonical,right.canonical)||left.revision-right.revision;}
function newer(a,b){const left=versionInfo(a),right=versionInfo(b);return !!left&&!!right&&left.legacy===right.legacy&&compareVersions(a,b)>0;}
function eligible(release,{currentVersion,allowBeta=false,platform,arch}){
 const info=versionInfo(release.tag_name),current=versionInfo(currentVersion);
 if(!info||!current||release.draft||info.legacy!==current.legacy||(!allowBeta&&info.beta)||(!info.beta&&!info.legacy&&release.prerelease))return false;
 const names=new Set((release.assets||[]).map(a=>a.name));
 if(platform==='darwin'&&(!names.has('mac-update-'+arch+'.json')||!names.has('Lecat-Markdown-'+info.text+'-macOS-'+arch+'.zip')))return false;
 if(platform==='win32'&&(!names.has(info.channel+'.yml')||!names.has('Lecat-Markdown-'+info.text+'-Setup-x64.exe')||!names.has('Lecat-Markdown-'+info.text+'-Setup-x64.exe.blockmap')))return false;
 return true;
}
async function selectRelease(fetcher,options){
 const response=await fetcher(RELEASES_API,{headers:{Accept:'application/vnd.github+json','User-Agent':'Lecat-Markdown'},signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error('No se pudo consultar el canal de actualizaciones.');const releases=await response.json();if(!Array.isArray(releases))throw Error('Respuesta de actualizaciones inválida.');
 return releases.filter(r=>eligible(r,options)).sort((a,b)=>compareVersions(b.tag_name,a.tag_name))[0]||null;
}
module.exports={versionInfo,compareVersions,newer,eligible,selectRelease,RELEASES_API};
