const {contextBridge,ipcRenderer}=require('electron');
const methods=['bootstrap','list','open','new','save','saveAs','update','close','pickFile','pickFolder','settings','link','media','exportSvg','exportPdf','window','audit'];
contextBridge.exposeInMainWorld('claro',Object.fromEntries(methods.map(name=>[name,(...args)=>ipcRenderer.invoke('claro:'+name,...args)]).concat([['onCommand',fn=>{const handler=(_e,command)=>fn(command);ipcRenderer.on('command',handler);return ()=>ipcRenderer.removeListener('command',handler);}]])));
