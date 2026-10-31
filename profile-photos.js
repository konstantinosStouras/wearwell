import {activeMemberId,isFamily,contextVersion} from './family-context.js?v=20261031-save-v1';
import {getAccountUser} from './auth.js?v=20261031-save-v1';
import {getPhotos,savePhoto,removePhoto} from './account-data.js?v=20261031-save-v1';
import {studioSection,loadStudio,modelText as t} from './model-studio.js?v=20261031-save-v1';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let loading=false,generation=0,photos=[],ready=false;const pending=new Map(),removed=new Map();
export const validPhoto=data=>typeof data==='string'&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(data);
export function photosSection(){return `<section class="section"><h2>${t('Photos')}</h2><p>${t(isFamily()?'Add a headshot, a dressed full-body photo, or both. Photos belong only to the selected family profile.':'Upload clear, recent photographs of yourself. Your headshots are the source of your facial identity, not inspiration for a different AI face.')}</p><p class="form-note">${t("These tips work for every gender, body type and hair length. Show your usual appearance; no professional photoshoot is needed.")}</p><label class="remember"><input id="photo-consent" type="checkbox"> ${t(isFamily()?'I have permission to upload these photos as a parent, legal guardian or with this adult’s consent.':'I agree to private review of my photos and measurements by the administrator and their AI assistant.')}</label><div class="photo-guide-grid"><div class="photo-guide"><span class="eyebrow">01</span><h3>${t('Headshots')}</h3><p>${t("Add 1–6 recent headshots. Start with a front view; slight left and right angles are useful extras.")}</p><details><summary>${t('Photo tips')}</summary><ul class="photo-tips"><li>${t("Face a window for soft daylight, with a plain background and only you in the photo. Avoid backlighting, blur and beauty filters.")}</li><li>${t("Keep the camera at eye level. Include your whole head, hair and shoulders, with a relaxed expression or gentle smile.")}</li><li>${t("Keep your usual hairstyle: long, short, curly, straight, shaved or no hair are all welcome. Move any hair covering your eyes or cheeks aside for at least one photo.")}</li><li>${t("Everyday makeup, facial hair and your usual head covering are fine. If you wear glasses, keep your eyes visible and avoid glare; take off sunglasses.")}</li><li>${t(isFamily()?'A clear headshot is used as this person’s profile picture.':'Choose your favourite uploaded headshot below. Pick a clear photo that genuinely looks like you.')}</li></ul></details><label class="button">${t('Add headshots')}<input type="file" data-profile-photos="headshot" accept="image/png,image/jpeg" multiple></label></div><div class="photo-guide"><span class="eyebrow">02</span><h3>${t('Dressed full-body photos')}</h3><p>${t("Add 1–3 recent, fully dressed photos. Include a front view from head to feet; a side view is helpful too.")}</p><details><summary>${t('Photo tips')}</summary><ul class="photo-tips"><li>${t("Wear comfortable everyday clothes that follow your natural outline without squeezing, such as a simple top with trousers or leggings. Avoid bulky layers, loose coats and bags hiding your shape.")}</li><li>${t("Use a natural upright posture, relaxed shoulders and arms slightly away from your sides. Keep your feet visible; avoid posed twists or sucking in your stomach.")}</li><li>${t("If long hair covers your shoulders or torso, move it behind your shoulders for at least one body photo. Keep your usual hairstyle in your headshots.")}</li><li>${t("Ask someone to help or use a timer. Place the camera level around mid-torso height, a few steps away, using the standard 1× lens. Avoid tilted angles, ultra-wide lenses and mirror selfies.")}</li><li>${t("Use even light and a simple background. Keep the photo unfiltered: body-shaping edits make proportions harder to judge.")}</li></ul></details><label class="button">${t('Add full-body photos')}<input type="file" data-profile-photos="body" accept="image/png,image/jpeg" multiple></label></div></div><p class="form-note">${t(isFamily()?'PNG or JPG, up to 10 MB each. Photos are resized and metadata removed. Only your account can access them. AI generation is optional in Virtual try-on and requires your separate provider consent.':'PNG or JPG, up to 10 MB each. Photos are resized and metadata removed. They stay private to you and the administrator. Uploading does not automatically generate images.')}</p><p id="photo-status" role="status" aria-live="polite"></p><div id="profile-photo-list" class="reference-photos"></div></section>`;}
function status(text){const el=document.querySelector('#photo-status');if(el)el.textContent=t(text);}
function renderPhotos(host){host.innerHTML=photos.filter(p=>validPhoto(p.data)).map(p=>`<figure><a href="${p.data}" download="wearwell-reference-${esc(p.id)}.jpg"><img src="${p.data}" alt="${t('Private reference photo')}"></a><figcaption data-i18n-skip>${esc(p.name)}</figcaption><label class="field">${t('Photo type')}<select data-photo-kind="${esc(p.id)}"><option value="unclassified" ${!p.kind||p.kind==='unclassified'?'selected':''}>${t('Choose photo type')}</option><option value="headshot" ${p.kind==='headshot'?'selected':''}>${t('Headshot')}</option><option value="body" ${p.kind==='body'?'selected':''}>${t('Dressed full body')}</option></select></label><button type="button" data-delete-photo="${esc(p.id)}">${t('Remove photo')}</button></figure>`).join('');}
export async function refreshPhotos(){const uid=getAccountUser()?.uid,member=activeMemberId(),scope=contextVersion(),host=document.querySelector('#profile-photo-list'),v=++generation;if(!uid||!host)return;ready=false;pending.clear();removed.clear();const consent=document.querySelector('#photo-consent');if(consent)consent.required=false;status('Loading photos…');try{const result=await getPhotos(uid,member);if(scope!==contextVersion()||v!==generation||getAccountUser()?.uid!==uid||!host.isConnected)return;photos=result;ready=true;renderPhotos(host);status(photos.length?'Photos loaded. Changes are saved with your profile.':'No reference photos yet.');document.dispatchEvent(new CustomEvent('wardrobe:photos'));}catch{if(v===generation)status('Photos could not load. Please try again.');}}
async function prepare(file){if(!['image/png','image/jpeg'].includes(file.type)||file.size>10*1024*1024)throw Error('Choose PNG or JPG images, no larger than 10 MB each.');const image=await createImageBitmap(file);try{const canvas=document.createElement('canvas');let scale=Math.min(1,2000/Math.max(image.width,image.height));for(let i=0;i<8;i++){canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/jpeg',.9);if(data.length<=650000)return {name:file.name.slice(0,120),data};scale*=.8;}throw Error('This image is too large. Please choose a smaller photo.');}finally{image.close();}}

const dirty=()=>{const consent=document.querySelector('#photo-consent');if(consent)consent.required=pending.size>0;status('Photo changes are pending. Select Save to keep them.');document.dispatchEvent(new CustomEvent('wardrobe:profile-dirty'));};
const samePhoto=(a,b)=>a?.data===b?.data&&a?.kind===b?.kind&&a?.name===b?.name;
document.addEventListener('change',async e=>{
 const input=e.target,kind=input.dataset.profilePhotos,id=input.dataset.photoKind;if((!kind&&!id)||loading||!ready)return;
 const uid=getAccountUser()?.uid,scope=contextVersion(),v=generation;if(!uid)return;
 loading=true;input.disabled=true;status('Preparing photos…');
 try{
  if(kind){
   const files=[...input.files];if(photos.length+files.length>9)throw Error('You can save up to 9 reference photos. Remove a photo to add another.');
   if(photos.filter(p=>p.kind===kind).length+files.length>(kind==='headshot'?6:3))throw Error('Use up to six headshots and three body photos.');
   const prepared=await Promise.all(files.map(prepare));if(uid!==getAccountUser()?.uid||scope!==contextVersion()||v!==generation)return;
   for(const photo of prepared){const id=Array.from({length:9},(_,i)=>String(i+1)).find(id=>!photos.some(p=>p.id===id));const original=removed.get(id)||null;removed.delete(id);const next={id,...photo,kind};photos.push(next);pending.set(id,{original,next});}
  }else{
   const current=photos.find(p=>p.id===id);if(!current)throw Error('Refresh photos and try again.');
   if(input.value!=='unclassified'&&photos.filter(p=>p.id!==id&&p.kind===input.value).length>=(input.value==='headshot'?6:3))throw Error('Use up to six headshots and three body photos.');
   const original=pending.has(id)?pending.get(id).original:{...current};current.kind=input.value;pending.set(id,{original,next:{...current}});
  }
  renderPhotos(document.querySelector('#profile-photo-list'));dirty();
 }catch(error){if(v===generation){status(error.message);renderPhotos(document.querySelector('#profile-photo-list'));}}
 finally{loading=false;input.disabled=false;if(kind)input.value='';}
});
document.addEventListener('click',e=>{
 const button=e.target.closest('[data-delete-photo]');if(!button||loading||!ready)return;
 const id=button.dataset.deletePhoto,p=photos.find(p=>p.id===id);if(!p)return;
 const original=pending.has(id)?pending.get(id).original:p;pending.delete(id);if(original)removed.set(id,original);
 photos=photos.filter(p=>p.id!==id);renderPhotos(document.querySelector('#profile-photo-list'));dirty();
});
export function validatePhotoDraft(){
 if(loading)throw Error('Wait for your photos to finish preparing, then select Save.');
 if(!ready)throw Error('Your photos have not loaded. Refresh the page before saving.');
 if(pending.size&&!document.querySelector('#photo-consent')?.checked)throw Error('Please agree to private review before uploading.');
}
export async function savePhotoDraft(uid,member){
 validatePhotoDraft();const scope=contextVersion(),v=generation;
 const guard=()=>{if(uid!==getAccountUser()?.uid||member!==activeMemberId()||scope!==contextVersion()||v!==generation)throw Error('Your profile changed. Please retry.');};
 const latest=await getPhotos(uid,member);guard();
 // Check the whole pending set before writing. Retries tolerate a previously completed write.
 for(const [id,{original,next}] of pending){const actual=latest.find(p=>p.id===id);if(!samePhoto(actual,next)&&!(original?samePhoto(actual,original):!actual))throw Error('Photos changed in another tab. Refresh before replacing them.');}
 for(const [id,original] of removed){const actual=latest.find(p=>p.id===id);if(actual&&!samePhoto(actual,original))throw Error('Photos changed in another tab. Refresh before removing them.');}
 for(const [id,{next}] of [...pending]){guard();await savePhoto(uid,id,{name:next.name,data:next.data,kind:next.kind},member);guard();pending.delete(id);}
 for(const [id] of [...removed]){guard();await removePhoto(uid,id,member);guard();removed.delete(id);}
}
export async function finishPhotoSave(){await refreshPhotos();}
for(const event of ['wardrobe:account','wardrobe:member'])document.addEventListener(event,()=>{generation++;ready=false;photos=[];pending.clear();removed.clear();document.querySelector('#profile-photo-list')?.replaceChildren();});
