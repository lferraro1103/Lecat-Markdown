const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const directory=process.argv[2]||'release-assets';
const privateKey=crypto.createPrivateKey({key:Buffer.from(process.env.LECAT_UPDATE_PRIVATE_KEY||'','base64'),type:'pkcs8',format:'der'}),publicRaw=crypto.createPublicKey(privateKey).export({type:'spki',format:'der'}).subarray(-32).toString('base64');
if(publicRaw!==require('../build/mac-update-key.json').publicKey)throw Error('Signing key does not match the application public key');
const version=require('../package.json').version;
for(const arch of ['arm64','x64']){
 const name='Lecat-Markdown-'+version+'-macOS-'+arch+'.zip',bytes=fs.readFileSync(path.join(directory,name));
 const manifest={schema:1,version,arch,size:bytes.length,url:'https://github.com/lferraro1103/Lecat-Markdown/releases/download/v'+version+'/'+name,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),edSignature:crypto.sign(null,bytes,privateKey).toString('base64')};
 const payload=Buffer.from(JSON.stringify(manifest));fs.writeFileSync(path.join(directory,'mac-update-'+arch+'.json'),JSON.stringify({payload:payload.toString('base64'),signature:crypto.sign(null,payload,privateKey).toString('base64')})+'\n');console.log('Signed Mac update '+version+' '+arch);
}
