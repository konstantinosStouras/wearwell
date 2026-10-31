import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {looks} from '../data.js';
const root=fileURLToPath(new URL('../',import.meta.url));
export const routes=['profile','try-on','home','today','wardrobe','pieces','shopping','consider','purge','calendar','rotation','family','feedback','admin','studio','model-studio','users','news','whats-new','updates-admin','review','summer','fall','winter','spring','gym','lounge',...looks.map(l=>'look/'+l.id)];
const html=readFileSync(resolve(root,'index.html'),'utf8');
for(const route of routes){
 const url='https://www.stouras.com/wearwell/'+route;
 const page=html.replaceAll('"https://www.stouras.com/wearwell/"','"'+url+'"');
 mkdirSync(resolve(root,route),{recursive:true});writeFileSync(resolve(root,route,'index.html'),page);
}
console.log(`Built ${routes.length} direct-entry pages.`);
