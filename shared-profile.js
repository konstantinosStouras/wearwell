// The profile is the single editable source for measurements and appearance notes.
export const fittingMeasurements=['height','chest','waist','hips','inseam'];
export function sharedMeasurements(sizes={}) {
 return Object.fromEntries(fittingMeasurements.filter(k=>sizes.measurements?.[k]!=null).map(k=>[k,sizes.measurements[k]]));
}
export function sameSettings(profile,payload) {
 if(!profile)return false;
 return ['kind','skinTone','appearance'].every(k=>(profile[k]||'')===(payload[k]||''))&&
  (profile.age==null?'':String(profile.age))===String(payload.age??'')&&
  fittingMeasurements.every(k=>(profile.measurements?.[k]??'')===(payload.measurements?.[k]??''));
}
export async function photoSignature(photos) {
 const data=photos.filter(p=>p.kind==='headshot').map(p=>[p.id,p.data]).sort((a,b)=>a[0].localeCompare(b[0]));
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(data)));
 return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
