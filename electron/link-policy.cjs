const BLOCKED=new Set(['javascript','vbscript','data','file','blob','about','chrome','devtools','claro-media','lecat-resource']);
function schemeOf(value){return /^([a-z][a-z0-9+.-]*):/i.exec(String(value))?.[1].toLowerCase()||null;}
function allowedLink(value){if(typeof value!=='string'||value.length>8192||/[\x00-\x20\x7f]/.test(value))return false;const scheme=schemeOf(value);return scheme?!BLOCKED.has(scheme):!value.startsWith('//');}
module.exports={BLOCKED,schemeOf,allowedLink};
