const base='/wearwell/';
const publicNames={'whats-new':'news','rotation':'calendar','model-studio':'studio'};
const internalNames=Object.fromEntries(Object.entries(publicNames).map(([a,b])=>[b,a]));
export function routeName(value){
 const name=String(value||'').replace(/^#|^\/+|\/+$/g,'');
 return name==='try-on'?'profile':internalNames[name]||name;
}
export function routeURL(value){const name=routeName(value);return base+(publicNames[name]||name);}
export function currentRoute(){return routeName(decodeURIComponent(location.pathname.slice(base.length)));}
const announce=()=>window.dispatchEvent(new Event('wearwell:navigate'));
export function navigate(value,{replace=false}={}){
 const url=routeURL(value);if(location.pathname===url&&!location.hash)return;
 history[replace?'replaceState':'pushState'](null,'',url+location.search);
 queueMicrotask(announce);
}
function migrate(){
 const legacy=location.hash.slice(1);
 if(legacy&&legacy!=='main'){history.replaceState(null,'',routeURL(legacy)+location.search);return;}
 const canonical=routeURL(currentRoute());
 if(location.pathname!==canonical)history.replaceState(null,'',canonical+location.search);
}
migrate();
window.addEventListener('popstate',()=>{migrate();announce();});
window.addEventListener('hashchange',()=>{migrate();announce();});
document.addEventListener('click',event=>{
 const link=event.target.closest('a');if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.download||link.target&&link.target!=='_self')return;
 if(link.classList.contains('skip')){event.preventDefault();document.querySelector('#main')?.focus();document.querySelector('#main')?.scrollIntoView();return;}
 const url=new URL(link.href,location.href);
 if(url.origin!==location.origin||!url.pathname.startsWith(base)||url.hash||(url.search&&url.search!==location.search))return;
 const name=url.pathname.slice(base.length).replace(/\/$/,'');
 if(name.includes('.')||!name)return;
 event.preventDefault();navigate(name);
});
