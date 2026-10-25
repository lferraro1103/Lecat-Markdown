// Run after a stable public release, with the workflow's contents:write token.
const fs=require('node:fs/promises');
async function publish(){
 const repo=process.env.GITHUB_REPOSITORY;if(repo!=='lferraro1103/Lecat-Markdown')throw Error('Cask publication requires the public repository');
 const token=process.env.GH_TOKEN;if(!token)throw Error('Missing workflow token');const endpoint='https://api.github.com/repos/'+repo+'/contents/Casks/lecat-markdown.rb',headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Lecat-homebrew'};
 const response=await fetch(endpoint+'?ref=main',{headers});if(!response.ok&&response.status!==404)throw Error('Read cask HTTP '+response.status);const previous=response.ok?await response.json():null,content=(await fs.readFile('Casks/lecat-markdown.rb')).toString('base64');if(previous?.content?.replace(/\s/g,'')===content)return;
 const result=await fetch(endpoint,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message:'build: update Homebrew cask for '+process.env.GITHUB_REF_NAME+' [skip ci]',branch:'main',content,...(previous?{sha:previous.sha}:{})})});if(!result.ok)throw Error('Publish cask HTTP '+result.status);console.log('Stable Homebrew cask updated');
}
publish().catch(error=>{console.error(error.message);process.exitCode=1;});
