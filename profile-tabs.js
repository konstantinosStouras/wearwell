const names=['details','photos','model'];
export function profileTabs(){return `<div class="profile-tabs" role="tablist" aria-label="Profile sections">${names.map((name,i)=>`<button type="button" role="tab" id="profile-tab-${name}" data-profile-tab="${name}" aria-controls="profile-panel-${name}" aria-selected="${i===0}" tabindex="${i===0?'0':'-1'}">${['Details','Photos','Model'][i]}</button>`).join('')}</div>`;}
export function selectProfileTab(name,{focus=false}={}){
 if(!names.includes(name))return;
 document.querySelectorAll('[data-profile-tab]').forEach(button=>{const selected=button.dataset.profileTab===name;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;if(selected&&focus)button.focus();});
 document.querySelectorAll('[data-profile-panel],[data-profile-extra]').forEach(panel=>{panel.hidden=(panel.dataset.profilePanel||panel.dataset.profileExtra)!==name;});
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-profile-tab]');if(button)selectProfileTab(button.dataset.profileTab);});
document.addEventListener('keydown',event=>{
 const button=event.target.closest('[data-profile-tab]');if(!button)return;
 let i=names.indexOf(button.dataset.profileTab);
 if(event.key==='ArrowRight')i=(i+1)%names.length;
 else if(event.key==='ArrowLeft')i=(i+names.length-1)%names.length;
 else if(event.key==='Home')i=0;
 else if(event.key==='End')i=names.length-1;
 else return;
 event.preventDefault();selectProfileTab(names[i],{focus:true});
});
// Native validation must be able to focus a required field in an inactive tab.
let revealing=false;
document.addEventListener('invalid',event=>{
 const panel=event.target.closest('#profile-form [data-profile-panel]');if(!panel)return;
 if(revealing){event.preventDefault();return;}
 revealing=true;setTimeout(()=>{revealing=false;},0);selectProfileTab(panel.dataset.profilePanel);
 for(let node=event.target.parentElement;node&&node!==panel;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;
},true);
