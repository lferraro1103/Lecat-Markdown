import {translate,LANGUAGES} from './locale.cjs';
let language='es';
export {LANGUAGES};
export const t=(source,values)=>translate(source,language,values);
export const getLanguage=()=>language;
export function setLanguage(value){language=LANGUAGES.some(([id])=>id===value)?value:'es';document.documentElement.lang=language;translateUI();}
export function translateUI(){
 for(const element of document.querySelectorAll('[data-i18n]'))element.textContent=t(element.dataset.i18n);
 for(const attribute of ['title','aria-label','placeholder'])for(const element of document.querySelectorAll('[data-i18n-'+attribute+']')){
  let value=t(element.getAttribute('data-i18n-'+attribute));if(attribute==='title'&&document.documentElement.dataset.platform==='darwin')value=value.replaceAll('Ctrl+','⌘');element.setAttribute(attribute,value);
 }
}
