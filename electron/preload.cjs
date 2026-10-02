const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('lecatStartupTheme',process.argv.includes('--lecat-theme=dark')?'dark':'light');
const methods=['ready','bootstrap','list','open','new','save','saveAs','update','close','pickFile','pickFolder','settings','systemTheme','link','media','exportSvg','exportPdf','window','audit'];
contextBridge.exposeInMainWorld('claro',Object.fromEntries(methods.map(name=>[name,(...args)=>ipcRenderer.invoke('claro:'+name,...args)]).concat([['onCommand',fn=>{const handler=(_e,command)=>fn(command);ipcRenderer.on('command',handler);return ()=>ipcRenderer.removeListener('command',handler);}]])));
