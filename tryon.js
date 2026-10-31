import {currentRoute,navigate} from './navigation.js?v=20261031-paths-v1';
import {sharedMeasurements,sameSettings,photoSignature} from './shared-profile.js?v=20261031-paths-v1';
import {loadCloudProfile,getPhotos,savePhoto,saveCloudProfile} from './account-data.js?v=20261031-paths-v1';
import {draftFields,writeDraft,readDraft,clearDraft} from './tryon-draft.js?v=20261031-paths-v1';
import {clothingScope,readClothes,garmentImages} from './clothing-store.js?v=20261031-paths-v1';
import {getAccountUser} from './auth.js?v=20261031-paths-v1';
import {activeMemberId,contextVersion} from './family-context.js?v=20261031-paths-v1';
import {currentMember} from './family.js?v=20261031-paths-v1';
import {modelCall} from './model-studio.js?v=20261031-paths-v1';
import {looks} from './data.js?v=20261031-paths-v1';
import {tryOnPage,tryOnView} from './tryon-view.js?v=20261031-paths-v1';
export {tryOnPage};
let sharedProfile=null,sharedPhotos=[];let ownedClothes=[];let state=null,busy=false,epoch=0,upload=null,units='cm';
const host=()=>document.querySelector('#tryon-content');
const status=message=>{const el=document.querySelector('#tryon-status');if(el)el.textContent=message;};
const call=(action,data={})=>modelCall(action,{...data,member:activeMemberId()});
export async function loadTryOn(){
 const el=host(),uid=getAccountUser()?.uid,scope=contextVersion(),v=++epoch;if(!el)return;
 if(!uid){status('Sign in to create your private personal model.');el.innerHTML='<button data-open-signin>Sign in / Register</button>';return;}
 status('Loading your fitting room…');
 try{const [result,cloud,photos]=await Promise.all([call('tryOnState'),loadCloudProfile(uid,activeMemberId()),getPhotos(uid,activeMemberId())]);let clothes;try{clothes=await readClothes(clothingScope());}catch{clothes=null;}result.ownedItems=clothes?.items||[];result.ownedLoadError=!clothes;if(v!==epoch||uid!==getAccountUser()?.uid||scope!==contextVersion()||!el.isConnected)return;sharedProfile=cloud?{...cloud,sizes:JSON.parse(cloud.sizes||'{}')}:{name:getAccountUser()?.displayName||'Your',sizes:{}};sharedPhotos=photos;result.sharedProfile=sharedProfile.sizes;state=result;ownedClothes=result.ownedItems;units='cm';upload=null;el.innerHTML=tryOnView(state,looks,currentMember()?.name||getAccountUser()?.displayName||'Me');status('');restoreDraft();seedSharedFields();if(currentMember()?.relationship==='child'&&!state.profile){const kind=el.querySelector('[name=kind]');kind.value='child';childFields(kind.form);} }
 catch(e){if(v===epoch&&el.isConnected){status(e.code?.startsWith('functions/')?e.message:'Could not load your fitting room. Please retry.');el.innerHTML='<button data-tryon-refresh>Retry</button>';}}
}
async function run(message,work){if(busy)return;busy=true;const el=host(),v=epoch,uid=getAccountUser()?.uid,scope=contextVersion();const controls=[...el.querySelectorAll('button,input,select,textarea')].map(n=>[n,n.disabled]);controls.forEach(([n])=>n.disabled=true);status(message);try{await work();if(v===epoch&&uid===getAccountUser()?.uid&&scope===contextVersion()&&el.isConnected)await loadTryOn();}catch(e){if(v===epoch&&uid===getAccountUser()?.uid&&scope===contextVersion()&&el.isConnected)status(e.code?.startsWith('functions/')?e.message:e.message||'The request was interrupted. Refresh before trying again.');}finally{busy=false;controls.forEach(([n,disabled])=>{if(n.isConnected)n.disabled=disabled;});}}
function childFields(form){const child=form.elements.kind.value==='child';form.querySelectorAll('[data-child-field]').forEach(el=>{el.hidden=!child;const input=el.querySelector('input');input.required=child&&input.name==='guardian';});}
document.addEventListener('change',e=>{const form=e.target.closest('#tryon-profile-form');if(form&&e.target.name==='kind')childFields(form);if(e.target.matches('[data-tryon-generate] [name=lookId]')){const image=document.querySelector('#tryon-catalog-image');if(looks.some(l=>l.id===e.target.value))image.src='assets/'+e.target.value+'.webp';}});
document.addEventListener('submit',e=>{const form=e.target;if(form.id==='tryon-clear-form'){e.preventDefault();const confirmed=new FormData(form).get('confirm')==='on';run('Removing fitting room data…',async()=>{await call('tryOnClear',{confirm:confirmed});try{clearDraft(sessionStorage,getAccountUser()?.uid,activeMemberId());}catch{}} );}else if(form.id==='tryon-profile-form'){e.preventDefault();const d=new FormData(form),payload={revision:state?.profile?.revision||null,kind:d.get('kind'),age:d.get('age'),skinTone:d.get('skinTone'),appearance:(sharedProfile?.sizes.bodyNotes||'').slice(0,500),unit:'cm',permission:d.get('permission')==='on',guardian:d.get('guardian')==='on',measurements:sharedMeasurements(sharedProfile?.sizes),headshots:sharedPhotos.filter(p=>p.kind==='headshot').map(p=>p.data)};const uid=getAccountUser()?.uid,member=activeMemberId();run('Saving your details…',async()=>{await saveSharedSettings(payload,d,uid,member);try{clearDraft(sessionStorage,uid,member);}catch{};}).then(()=>{if(uid===getAccountUser()?.uid&&member===activeMemberId()&&state?.profile&&sharedReady())status('Details saved to your account. They will be here after a refresh.');});}else if(form.hasAttribute('data-tryon-generate')){e.preventDefault();const d=new FormData(form);if(!sharedReady()){status('Save your profile and model settings before creating a preview.');return;}run('Creating your private preview… This may take several minutes.',async()=>{await ensureCurrentSharedProfile();return call('tryOnGenerate',{target:form.dataset.tryonGenerate,pose:d.get('pose'),lookId:d.get('lookId'),...(form.dataset.tryonGenerate==='garment'?{garment:(()=>{const g=ownedClothes.find(x=>x.id===d.get('garmentId'));if(!g)throw Error('Choose a garment from your wardrobe.');return {id:g.id,name:g.name,notes:g.notes||'',images:garmentImages(g)};})()}:{}),revision:state.profile.revision,modelId:state.model?.id||null,consent:d.get('consent')==='on',provider:state.provider.id});});}});
document.addEventListener('click',e=>{const button=e.target.closest('button');if(!button||busy)return;if(button.dataset.selectHeadshot||button.dataset.selectModel)run('Selecting your approved alternative…',()=>call(button.dataset.selectHeadshot?'tryOnSelectHeadshot':'tryOnSelectModel',{id:button.dataset.selectHeadshot||button.dataset.selectModel}));if(button.hasAttribute('data-tryon-refresh'))loadTryOn();if(button.dataset.tryonDecision)run('Saving your choice…',()=>call('tryOnDecision',{decision:button.dataset.tryonDecision,target:button.dataset.target,id:button.dataset.id}));if(button.dataset.tryonOwnedRemove)run('Removing this saved preview…',()=>call('tryOnOwnedRemove',{garmentId:button.dataset.tryonOwnedRemove}));if(button.dataset.tryonRemove)run('Removing this saved outfit…',()=>call('tryOnRemove',{lookId:button.dataset.tryonRemove}));if(button.dataset.tryonView||button.dataset.tryonOwnedView){const v=epoch,scope=contextVersion();busy=true;status('Loading saved outfit…');call(button.dataset.tryonOwnedView?'tryOnOwnedView':'tryOnView',button.dataset.tryonOwnedView?{garmentId:button.dataset.tryonOwnedView}:{lookId:button.dataset.tryonView}).then(result=>{if(v!==epoch||scope!==contextVersion()||!host())return;const image=document.createElement('img');image.src=result.image;image.alt='Your saved outfit preview';image.className='tryon-portrait';document.querySelector('#tryon-full-image').replaceChildren(image);status('');}).catch(()=>{if(v===epoch)status('Could not load this outfit. Refresh and try again.');}).finally(()=>{busy=false;});}});
for(const event of ['wardrobe:account','wardrobe:member'])document.addEventListener(event,()=>{epoch++;state=null;sharedProfile=null;sharedPhotos=[];currentPhotoSignature='';ownedClothes=[];upload=null;host()?.replaceChildren();status('');});
window.addEventListener('wearwell:navigate',()=>{if(!['profile','try-on'].includes(currentRoute())){epoch++;state=null;upload=null;}});

function restoreDraft(){const form=host()?.querySelector('#tryon-profile-form');if(!form)return;let values;try{values=readDraft(sessionStorage,getAccountUser()?.uid,activeMemberId(),state?.profile?.revision);}catch{}if(!values)return;for(const key of draftFields){if(form.elements[key]&&values[key]!=null)form.elements[key].value=values[key];}units='cm';childFields(form);const note=form.querySelector('#tryon-draft-status');if(note)note.textContent='Unsaved entries restored from this tab. Save details to keep them in your account.';}
function saveDraft(event){const form=event.target.closest('#tryon-profile-form');if(!form||!draftFields.includes(event.target.name)||busy)return;const d=new FormData(form);try{writeDraft(sessionStorage,getAccountUser()?.uid,activeMemberId(),state?.profile?.revision,Object.fromEntries(draftFields.map(k=>[k,d.get(k)])));form.querySelector('#tryon-draft-status').textContent='Draft saved in this tab. Save details to keep it in your account.';}catch{form.querySelector('#tryon-draft-status').textContent='Draft storage is unavailable. Save details before refreshing.';}}
document.addEventListener('input',saveDraft);document.addEventListener('change',saveDraft);

function profileDirty(){return ['dirty','saving','error'].includes(document.querySelector('.profile-save')?.dataset.feedback);}
function seedSharedFields(){
 updateSharedSummary();const form=document.querySelector('#profile-form');if(!form||sharedProfile?.sizes.unifiedProfile)return;
 let imported=false;
 for(const [k,value] of Object.entries(state.profile?.measurements||{})){const input=form.elements['measure_'+k];if(input&&!input.value&&value!=null){input.value=value;imported=true;}}
 if(!form.elements.bodyNotes.value&&state.profile?.appearance){form.elements.bodyNotes.value=state.profile.appearance;imported=true;}
 if(imported){form.querySelector('.measurement-details').open=true;form.elements.bodyNotes.dispatchEvent(new Event('input',{bubbles:true}));status('Earlier fitting-room details are shown in your profile. Review them and save your profile once.');}
 updateSharedSummary();
}
let currentPhotoSignature='';
async function updateSharedSummary(){
 const v=epoch,photos=sharedPhotos;const signature=await photoSignature(photos);if(v!==epoch)return;currentPhotoSignature=signature;
 const summary=document.querySelector('#shared-reference-summary');if(summary)summary.textContent='Measurements and headshots come from your saved profile above.';
}
function sharedReady(){
 const form=host()?.querySelector('#tryon-profile-form');const d=form?new FormData(form):null;
 if(d&&!sameSettings(state?.profile,{kind:d.get('kind'),age:d.get('age'),skinTone:d.get('skinTone'),appearance:state?.profile?.appearance,measurements:state?.profile?.measurements}))return false;
 return !profileDirty()&&!!state?.profile&&!!sharedProfile?.sizes.fittingPhotosUnified&&
  sharedProfile.sizes.fittingPhotoSignature===currentPhotoSignature&&
  sameSettings(state.profile,{...state.profile,appearance:(sharedProfile.sizes.bodyNotes||'').slice(0,500),measurements:sharedMeasurements(sharedProfile.sizes)});
}
async function saveSharedSettings(payload,data,uid,member){
 if(profileDirty())throw Error('Save your profile above first so the model uses your latest details.');
 const scope=contextVersion(),v=epoch;
 const assertCurrent=()=>{if(uid!==getAccountUser()?.uid||member!==activeMemberId()||scope!==contextVersion()||v!==epoch)throw Error('Your profile changed. Please retry.');};
 let cloud=await loadCloudProfile(uid,member);assertCurrent();
 if(!cloud)throw Error('Save your profile above first so the model uses your latest details.');
 const sizes=JSON.parse(cloud.sizes||'{}');let photos=await getPhotos(uid,member);assertCurrent();
 const legacy=!sizes.fittingPhotosUnified&&data.get('keepLegacyHeadshots')==='on'?(state.profile?.headshots||(state.profile?.headshot?[state.profile.headshot]:[])):[];
 for(const [i,image] of legacy.entries()){
  const name='Earlier fitting-room headshot '+(i+1);
  if(photos.some(p=>p.data===image||p.name===name))continue;
  if(photos.length>=9||photos.filter(p=>p.kind==='headshot').length>=6)throw Error('There is not enough room to keep all earlier headshots. Remove an unused photo above, then retry.');
  const id=Array.from({length:9},(_,n)=>String(n+1)).find(id=>!photos.some(p=>p.id===id));
  assertCurrent();await savePhoto(uid,id,{name,data:image,kind:'headshot'},member);assertCurrent();photos.push({id,name,data:image,kind:'headshot'});
 }
 const signature=await photoSignature(photos);assertCurrent();
 Object.assign(payload,{measurements:sharedMeasurements(sizes),appearance:(sizes.bodyNotes||'').slice(0,500),headshots:photos.filter(p=>p.kind==='headshot').map(p=>p.data)});
 if(!sameSettings(state.profile,payload)||sizes.fittingPhotoSignature!==signature){await call('tryOnSave',payload);assertCurrent();}
 // Preserve the user's full notes and all size fields; the fitting room holds a private generation snapshot.
 const latest=await loadCloudProfile(uid,member);assertCurrent();
 const latestSizes=JSON.parse(latest.sizes||'{}');
 if(JSON.stringify(sharedMeasurements(latestSizes))!==JSON.stringify(sharedMeasurements(sizes))||latestSizes.bodyNotes!==sizes.bodyNotes)throw Error('Your profile changed in another tab. Refresh and save model settings again.');
 await saveCloudProfile(uid,{name:latest.name,sizes:{...latestSizes,fittingPhotosUnified:true,fittingPhotoSignature:signature}},member);assertCurrent();
 document.dispatchEvent(new CustomEvent('wardrobe:shared-photos-saved'));
}
for(const name of ['wardrobe:shared-profile-saved','wardrobe:photos'])document.addEventListener(name,async()=>{
 const uid=getAccountUser()?.uid,member=activeMemberId(),v=epoch,scope=contextVersion();if(!uid||!host()||!state)return;currentPhotoSignature='';
 try{const [cloud,photos]=await Promise.all([loadCloudProfile(uid,member),getPhotos(uid,member)]);if(v!==epoch||scope!==contextVersion()||uid!==getAccountUser()?.uid)return;sharedProfile=cloud?{...cloud,sizes:JSON.parse(cloud.sizes||'{}')}:{sizes:{}};sharedPhotos=photos;await updateSharedSummary();}catch{currentPhotoSignature='';status('Your saved profile could not load. Please retry before editing.');}
});

async function ensureCurrentSharedProfile(){
 const uid=getAccountUser()?.uid,member=activeMemberId(),v=epoch,scope=contextVersion();
 const [cloud,photos]=await Promise.all([loadCloudProfile(uid,member),getPhotos(uid,member)]);
 const sizes=JSON.parse(cloud?.sizes||'{}'),signature=await photoSignature(photos);
 if(v!==epoch||scope!==contextVersion()||uid!==getAccountUser()?.uid)throw Error('Your profile changed. Please retry.');
 if(!sizes.fittingPhotosUnified||sizes.fittingPhotoSignature!==signature||!sameSettings(state.profile,{...state.profile,appearance:(sizes.bodyNotes||'').slice(0,500),measurements:sharedMeasurements(sizes)}))throw Error('Save your profile and model settings before creating a preview.');
}
