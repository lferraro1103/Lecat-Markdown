const LANGUAGES=['es','en','pt','fr','de','zh-Hans','zh-Hant','ja'];
function normalizePreferences(value={},previous={}){
 const pick=(key,values,fallback)=>values.includes(value[key])?value[key]:values.includes(previous[key])?previous[key]:fallback;
 return {theme:pick('theme',['system','light','dark'],'system'),mode:pick('mode',['read','edit','split'],'edit'),zoom:Math.min(1.5,Math.max(.8,Number(value.zoom??previous.zoom)||1)),language:pick('language',LANGUAGES,'es'),allowBeta:typeof value.allowBeta==='boolean'?value.allowBeta:previous.allowBeta===true};
}
module.exports={LANGUAGES,normalizePreferences};
