// Text-only drafts survive refresh in this tab; photos and consent are never cached here.
export const draftFields=['kind','age','skinTone'];
const key=(uid,member)=>'wearwell.tryon.draft.'+encodeURIComponent(uid)+'.'+encodeURIComponent(member);
export function writeDraft(storage,uid,member,revision,values){if(!uid)return;storage.setItem(key(uid,member),JSON.stringify({revision:revision||null,values:Object.fromEntries(draftFields.map(k=>[k,String(values[k]??'')]))}));}
export function readDraft(storage,uid,member,revision){if(!uid)return null;try{const value=JSON.parse(storage.getItem(key(uid,member)));if(value?.revision!==(revision||null))return null;return value.values;}catch{return null;}}
export function clearDraft(storage,uid,member){if(uid)storage.removeItem(key(uid,member));}
