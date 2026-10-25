const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
async function generate(version,folder){
 if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Homebrew stable cask requires a stable version');
 const hashes={};for(const arch of ['arm64','x64']){const name=`Lecat-Markdown-${version}-macOS-${arch}.dmg`;if(folder)hashes[arch]=crypto.createHash('sha256').update(await fs.readFile(path.join(folder,name))).digest('hex');else{const response=await fetch('https://api.github.com/repos/lferraro1103/Lecat-Markdown/releases/tags/v'+version,{headers:{Accept:'application/vnd.github+json'}});if(!response.ok)throw Error('Release HTTP '+response.status);const release=await response.json(),asset=release.assets.find(a=>a.name===name);if(!asset?.digest?.match(/^sha256:[a-f0-9]{64}$/))throw Error('Missing verified release digest');hashes[arch]=asset.digest.slice(7);}}
 const cli=require('semver').gte(version,'3.4.0');
 const text=`cask "lecat-markdown" do
  arch arm: "arm64", intel: "x64"

  version "${version}"
  sha256 arm: "${hashes.arm64}",
         intel: "${hashes.x64}"

  url "https://github.com/lferraro1103/Lecat-Markdown/releases/download/v#{version}/Lecat-Markdown-#{version}-macOS-#{arch}.dmg"
  name "Lecat Markdown"
  desc "Markdown editor and reader with offline diagrams and equations"
  homepage "https://github.com/lferraro1103/Lecat-Markdown"

  depends_on macos: ">= :ventura"

  app "Lecat - Markdown.app"
${cli?'  binary "#{appdir}/Lecat - Markdown.app/Contents/Resources/bin/lecat"\n':''}
  # User documents and the application profile are preserved on uninstall.
end
`;
 await fs.mkdir('Casks',{recursive:true});await fs.writeFile('Casks/lecat-markdown.rb',text);console.log('Homebrew cask prepared for '+version);
}
exports.generate=generate;if(require.main===module)generate(process.argv[2],process.argv[3]).catch(e=>{console.error(e);process.exitCode=1;});
