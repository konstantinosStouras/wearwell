import {getAccountUser} from './auth.js?v=20261030-unified-v1';
import {activeMemberId,contextVersion} from './family-context.js?v=20261030-unified-v1';

export const clothingLimit=60;
export function clothingScope(){const uid=getAccountUser()?.uid;return uid?{uid,member:activeMemberId(),epoch:contextVersion()}:null;}
export function sameClothingScope(scope){const now=clothingScope();return !!scope&&!!now&&scope.uid===now.uid&&scope.member===now.member&&scope.epoch===now.epoch;}
function requireScope(scope){if(!sameClothingScope(scope))throw Error('account-changed');}
let pending;
function database(){
 if(!pending)pending=new Promise((resolve,reject)=>{
  const request=indexedDB.open('wearwell-private-clothes',1);
  request.onupgradeneeded=()=>{const store=request.result.createObjectStore('clothes',{keyPath:['uid','member','id']});store.createIndex('scope',['uid','member']);store.createIndex('owner','uid');const racks=request.result.createObjectStore('racks',{keyPath:['uid','member']});racks.createIndex('owner','uid');};
  request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('storage-blocked'));
  request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();pending=null};resolve(db)};
 }).catch(error=>{pending=null;throw error});
 return pending;
}
export async function readClothes(scope){
 requireScope(scope);const db=await database();requireScope(scope);
 const result=await new Promise((resolve,reject)=>{const tx=db.transaction(['clothes','racks'],'readonly');const query=tx.objectStore('clothes').index('scope').getAll([scope.uid,scope.member]);const rack=tx.objectStore('racks').get([scope.uid,scope.member]);tx.oncomplete=()=>resolve({items:query.result,initialized:!!rack.result?.initialized});tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});
 requireScope(scope);result.items.sort((a,b)=>a.createdAt-b.createdAt);return result;
}
export async function saveClothes(scope,items){
 requireScope(scope);const db=await database();requireScope(scope);
 await new Promise((resolve,reject)=>{
  const tx=db.transaction(['clothes','racks'],'readwrite'),store=tx.objectStore('clothes');let reason;
  const count=store.index('scope').count([scope.uid,scope.member]);
  count.onsuccess=()=>{if(!sameClothingScope(scope)||count.result+items.length>clothingLimit){reason=Error('limit-or-account');tx.abort();return}for(const item of items)store.add({...item,uid:scope.uid,member:scope.member});tx.objectStore('racks').put({uid:scope.uid,member:scope.member,initialized:true})};
  tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(reason||tx.error);
 });requireScope(scope);
}
export async function removeClothing(scope,id){
 requireScope(scope);const db=await database();requireScope(scope);
 await new Promise((resolve,reject)=>{const tx=db.transaction('clothes','readwrite');tx.objectStore('clothes').delete([scope.uid,scope.member,id]);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});requireScope(scope);
}
export async function clearAccountClothes(uid){
 if(getAccountUser()?.uid!==uid)throw Error('account-changed');const db=await database();
 if(getAccountUser()?.uid!==uid)throw Error('account-changed');
 await new Promise((resolve,reject)=>{const tx=db.transaction(['clothes','racks'],'readwrite');for(const name of ['clothes','racks']){const cursor=tx.objectStore(name).index('owner').openCursor(IDBKeyRange.only(uid));cursor.onsuccess=()=>{const item=cursor.result;if(item){item.delete();item.continue()}}}tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});
}
export async function prepareClothing(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw Error('file-type');
 const bitmap=await createImageBitmap(file);
 try{
  if(bitmap.width*bitmap.height>50000000)throw Error('file-size');
  const canvas=document.createElement('canvas');let scale=Math.min(1,1000/Math.max(bitmap.width,bitmap.height));
  for(let i=0;i<7;i++){
   canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
   canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
   const image=canvas.toDataURL('image/webp',.85);
   if(image.length<=600000)return {id:crypto.randomUUID(),name:file.name.replace(/\.[^.]+$/,'').slice(0,80)||'Clothing photo',image,createdAt:Date.now()};
   scale*=.75;
  }throw Error('file-size');
 }finally{bitmap.close()}
}
export const validClothingImage=image=>typeof image==='string'&&image.length<=600000&&/^data:image\/(webp|png);base64,[A-Za-z0-9+/=]+$/.test(image);

// A garment owns multiple reference views; legacy single-photo records remain readable.
export const garmentPhotoLimit=6;
export function garmentImages(item){return (Array.isArray(item.images)?item.images:[item.image]).filter(validClothingImage);}
export async function saveGarment(scope,item){
 requireScope(scope);const images=garmentImages(item);if(!images.length||images.length>garmentPhotoLimit)throw Error('photo-limit');
 const db=await database();requireScope(scope);
 await new Promise((resolve,reject)=>{const tx=db.transaction(['clothes','racks'],'readwrite'),store=tx.objectStore('clothes');let reason;
 const old=store.get([scope.uid,scope.member,item.id]);old.onsuccess=()=>{const count=store.index('scope').count([scope.uid,scope.member]);count.onsuccess=()=>{
  if(!sameClothingScope(scope)||(!old.result&&count.result>=clothingLimit)){reason=Error('limit-or-account');tx.abort();return}
  if(old.result&&old.result.revision!==(item.previousRevision||undefined)){reason=Error('garment-changed');tx.abort();return}
  const record={id:item.id,name:String(item.name||'Clothing').slice(0,80),notes:String(item.notes||'').slice(0,1200),image:images[0],images,createdAt:old.result?.createdAt||Date.now(),revision:crypto.randomUUID(),uid:scope.uid,member:scope.member};
  store.put(record);tx.objectStore('racks').put({uid:scope.uid,member:scope.member,initialized:true});
 }};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(reason||tx.error);});requireScope(scope);
}
