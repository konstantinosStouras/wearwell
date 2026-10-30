import {clothingScope,sameClothingScope,readClothes,saveClothes,removeClothing,prepareClothing,validClothingImage,clothingLimit} from './clothing-store.js?v=20261030-rack-v2';
import {getLanguage} from './i18n.js?v=20261030-rack-v2';
const words={
 en:{samples:'The streetwear edit — demo clothes',personal:'Your clothes — only your uploaded photos',add:'Add your clothes',signin:'Sign in to add your clothes',hint:'One garment per photo, fully visible on a plain background. Transparent PNGs work well. JPG, PNG or WebP · 10 MB per image · up to 60 clothes.',storage:'Saved privately for this account and selected profile in this browser only. Not synced to other devices. Clearing browser data removes these photos.',replace:'Your uploaded clothes replace the demo collection. Remove all your photos to see the default wardrobe again. Styles below remain separate.',loading:'Loading your saved clothes…',failed:'Your clothes could not load. Retry to restore your personal rack.',retry:'Retry',empty:'Your personal rack is empty. Add photos of clothes you own.',saving:'Preparing and saving your photos…',saved:'Saved. Your rack now shows only your clothes.',limit:'You can save up to 60 clothes. Remove a photo before adding more.',file:'Choose JPG, PNG or WebP images up to 10 MB each.',error:'Could not save these photos. Your existing clothes are unchanged. Try fewer images or free some browser storage.',remove:'Remove this photo',confirm:'Confirm removal',cancel:'Cancel',removed:'Photo removed.',restored:'Last photo removed. The default wardrobe is back.',removeError:'Could not remove this photo. Please retry.'},
 el:{samples:'Η συλλογή streetwear — δοκιμαστικά ρούχα',personal:'Τα ρούχα σας — μόνο οι δικές σας φωτογραφίες',add:'Προσθέστε τα ρούχα σας',signin:'Συνδεθείτε για να προσθέσετε ρούχα',hint:'Ένα ρούχο ανά φωτογραφία, ολόκληρο, σε απλό φόντο. Μπορείτε να χρησιμοποιήσετε PNG με διαφάνεια. JPG, PNG ή WebP · 10 MB ανά εικόνα · έως 60 ρούχα.',storage:'Αποθηκεύονται ιδιωτικά για αυτόν τον λογαριασμό και το επιλεγμένο προφίλ μόνο σε αυτόν τον περιηγητή. Δεν συγχρονίζονται με άλλες συσκευές. Η εκκαθάριση δεδομένων του περιηγητή διαγράφει τις φωτογραφίες.',replace:'Τα ρούχα που ανεβάζετε αντικαθιστούν τη δοκιμαστική συλλογή. Αφαιρέστε όλες τις φωτογραφίες σας για να δείτε ξανά την προεπιλεγμένη γκαρνταρόμπα. Τα Στυλ παρακάτω παραμένουν ξεχωριστά.',loading:'Φόρτωση των αποθηκευμένων ρούχων…',failed:'Δεν φορτώθηκαν τα ρούχα σας. Δοκιμάστε ξανά για να εμφανιστεί η προσωπική σας κρεμάστρα.',retry:'Δοκιμάστε ξανά',empty:'Η προσωπική σας κρεμάστρα είναι άδεια. Προσθέστε φωτογραφίες των ρούχων σας.',saving:'Προετοιμασία και αποθήκευση φωτογραφιών…',saved:'Αποθηκεύτηκαν. Η κρεμάστρα δείχνει μόνο τα δικά σας ρούχα.',limit:'Μπορείτε να αποθηκεύσετε έως 60 ρούχα. Αφαιρέστε μια φωτογραφία πριν προσθέσετε άλλη.',file:'Επιλέξτε JPG, PNG ή WebP έως 10 MB ανά εικόνα.',error:'Δεν αποθηκεύτηκαν οι φωτογραφίες. Τα υπάρχοντα ρούχα δεν άλλαξαν. Επιλέξτε λιγότερες εικόνες ή ελευθερώστε χώρο στον περιηγητή.',remove:'Αφαίρεση φωτογραφίας',confirm:'Επιβεβαίωση αφαίρεσης',cancel:'Ακύρωση',removed:'Η φωτογραφία αφαιρέθηκε.',restored:'Η τελευταία φωτογραφία αφαιρέθηκε. Εμφανίζεται ξανά η προεπιλεγμένη γκαρνταρόμπα.',removeError:'Δεν αφαιρέθηκε η φωτογραφία. Δοκιμάστε ξανά.'}
};
export function installRackUploads(root,examples,setItems,getSelected){
 const panel=document.createElement('section');panel.className='rack-upload-panel';
 panel.innerHTML='<div class="rack-toolbar"><p class="rack-mode"></p><button class="upload-button"></button><input class="upload-input" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden></div><p class="rack-storage"></p><details><summary></summary><p class="upload-help"></p><p class="upload-replace"></p></details><p class="upload-status" role="status" aria-live="polite"></p><button class="upload-retry" hidden></button>';
 root.prepend(panel);
 const actions=document.createElement('div');actions.className='photo-actions';actions.innerHTML='<button class="remove-photo" hidden></button><button class="cancel-remove" hidden></button>';
 root.querySelector('.piece-info').append(actions);
 const q=s=>root.querySelector(s),controller=new AbortController(),on=(node,event,fn)=>node.addEventListener(event,fn,{signal:controller.signal});
 let own=[],personal=false,busy=false,loading=false,failed=false,status='',epoch=0,disposed=false,confirmation=null;
 const t=key=>words[getLanguage()==='el'?'el':'en'][key];
 function draw(){
  q('.rack-mode').textContent=t(personal?'personal':'samples');q('.upload-button').textContent=t(clothingScope()?'add':'signin');q('.upload-button').disabled=busy||loading||failed;
  q('.rack-storage').textContent=t('storage');q('summary').textContent=t('add');q('.upload-help').textContent=t('hint');q('.upload-replace').textContent=t('replace');q('.upload-replace').hidden=personal;
  q('.upload-status').textContent=t(status)||'';q('.upload-retry').hidden=!failed;q('.upload-retry').textContent=t('retry');
  q('.studio').hidden=loading||failed||(personal&&!own.length);q('.details').hidden=loading||failed||(personal&&!own.length);q('#dots').hidden=loading||failed||(personal&&!own.length);
  q('.remove-photo').hidden=!personal||!own.length;q('.remove-photo').disabled=busy;q('.remove-photo').textContent=t(confirmation?'confirm':'remove');q('.cancel-remove').hidden=!confirmation;q('.cancel-remove').textContent=t('cancel');
 }
 async function load(){
  const scope=clothingScope(),v=++epoch;confirmation=null;own=[];personal=false;busy=false;loading=!!scope;failed=false;status=scope?'loading':'';
  setItems(scope?[]:examples);draw();if(!scope)return;
  try{const result=await readClothes(scope);if(disposed||v!==epoch||!sameClothingScope(scope))return;own=result.items.filter(p=>validClothingImage(p.image));personal=own.length>0;loading=false;status=personal&&!own.length?'empty':'';setItems(personal?own:examples);draw()}
  catch{if(disposed||v!==epoch||!sameClothingScope(scope))return;loading=false;failed=true;personal=true;status='failed';draw()}
 }
 on(q('.upload-button'),'click',()=>{if(!clothingScope()){document.dispatchEvent(new CustomEvent('wardrobe:open-auth',{detail:{view:'signin'}}));return}q('.upload-input').click()});
 on(q('.upload-input'),'change',async()=>{
  const files=[...q('.upload-input').files],scope=clothingScope(),v=epoch;q('.upload-input').value='';if(!scope||!files.length||busy)return;
  if(own.length+files.length>clothingLimit){status='limit';draw();return}busy=true;status='saving';draw();
  try{
   const prepared=[];for(const file of files){prepared.push(await prepareClothing(file));if(disposed||v!==epoch||!sameClothingScope(scope))return}
   await saveClothes(scope,prepared);if(disposed||v!==epoch||!sameClothingScope(scope))return;
   const result=await readClothes(scope);if(disposed||v!==epoch||!sameClothingScope(scope))return;
   own=result.items.filter(p=>validClothingImage(p.image));personal=true;confirmation=null;status='saved';setItems(own);
  }catch(error){if(!disposed&&v===epoch&&sameClothingScope(scope))status=error.message?.startsWith('file-')?'file':error.message==='limit-or-account'?'limit':'error'}
  finally{if(!disposed&&v===epoch){busy=false;draw()}}
 });
 on(q('.remove-photo'),'click',async()=>{
  const item=getSelected(),scope=clothingScope(),v=epoch;if(!item?.image||!scope||busy)return;
  if(confirmation!==item.id){confirmation=item.id;draw();return}busy=true;draw();
  try{await removeClothing(scope,item.id);if(disposed||v!==epoch||!sameClothingScope(scope))return;own=own.filter(p=>p.id!==item.id);personal=own.length>0;setItems(personal?own:examples);status=personal?'removed':'restored'}
  catch{if(!disposed&&v===epoch)status='removeError'}finally{if(!disposed&&v===epoch){busy=false;confirmation=null;draw()}}
 });
 on(q('.cancel-remove'),'click',()=>{confirmation=null;draw()});on(q('.upload-retry'),'click',load);
 on(root,'rack:selection',()=>{confirmation=null;draw()});on(document,'wardrobe:language',draw);
 for(const event of ['wardrobe:account','wardrobe:member'])on(document,event,load);
 load();return()=>{disposed=true;epoch++;own=[];controller.abort();};
}
