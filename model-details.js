const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const choices={gender:['Man','Woman','Non-binary','Prefer not to say'],hairLength:['Shaved / bald','Short','Medium','Long'],hairTexture:['Straight','Wavy','Curly','Coily'],hairColour:['Black','Brown','Blonde','Red','Grey','White','Other'],braSystem:['EU','UK','US','FR','IT']};
const labels={gender:'Gender (optional)',hairLength:'Hair length',hairTexture:'Hair texture',hairColour:'Hair colour',braSystem:'Bra sizing system',braBand:'Bra band size',braCup:'Cup size',underbust:'Underbust (cm)'};
function field(key,value){return `<label class="field">${labels[key]}${choices[key]?`<select name="detail_${key}"><option value="">Not specified</option>${choices[key].map(v=>`<option value="${v}"${value===v?' selected':''}>${v}</option>`).join('')}</select>`:`<input name="detail_${key}" maxlength="20" value="${esc(value)}" ${key==='underbust'?'type="number" min="30" max="250" step="0.1"':'type="text"'}>`}</label>`;}
export function modelDetailsFields(sizes={}, {child=false}={}){
 const d=sizes.modelDetails||{};
 return `<section class="section" data-model-details data-child="${child}"><h2>About your model</h2><p class="form-note">Choose how your model should look. All details are optional; we do not infer gender or missing measurements from photos.</p>${field('gender',d.gender)}<div class="form-grid">${['hairLength','hairTexture','hairColour'].map(k=>field(k,d[k])).join('')}</div><p class="form-note">Leave hair details blank to follow your reference photos. Add them when hair is hidden or you want a different hairstyle.</p><fieldset data-bra-details ${child||d.gender!=='Woman'?'hidden disabled':''}><legend>Optional bra sizing & bust proportions</legend><p class="form-note">Use the band, cup and sizing system on your bra label. Cup letters depend on the sizing system; we do not convert them. Bust, waist and hips can be entered in body measurements below. These details guide a fully clothed model, not an exact fit.</p><div class="form-grid">${['braSystem','braBand','braCup','underbust'].map(k=>field(k,d[k])).join('')}</div></fieldset></section>`;
}
export function readModelDetails(data){
 const result={};for(const key of Object.keys(labels)){const value=String(data.get('detail_'+key)||'').trim().slice(0,20);if(value&&(!choices[key]||choices[key].includes(value)))result[key]=value;}
 if(result.underbust&&(!Number.isFinite(Number(result.underbust))||Number(result.underbust)<30||Number(result.underbust)>250))throw Error('Please check your underbust measurement.');
 if(result.gender!=='Woman')for(const key of ['braSystem','braBand','braCup','underbust'])delete result[key];
 return result;
}
export function detailKind(sizes={},fallback='adult'){if(fallback==='child')return 'child';return ({Man:'man',Woman:'woman','Non-binary':'adult','Prefer not to say':'adult'})[sizes.modelDetails?.gender]||fallback;}
export function detailLines(sizes={}){return Object.entries(sizes.modelDetails||{}).filter(([k,v])=>labels[k]&&v&&(sizes.modelDetails.gender==='Woman'||!['braSystem','braBand','braCup','underbust'].includes(k))).map(([k,v])=>`${labels[k]}: ${v}`);}
export function modelAppearance(sizes={}){return [...detailLines(sizes),sizes.bodyNotes||''].filter(Boolean).join('; ').slice(0,500);}
export function refreshModelDetails(form){const host=form?.querySelector('[data-model-details]');if(!host)return;const bra=host.querySelector('[data-bra-details]');const show=host.dataset.child!=='true'&&form.elements.detail_gender.value==='Woman';bra.hidden=!show;bra.disabled=!show;}
if(typeof document!=='undefined')document.addEventListener('change',e=>{if(e.target.name==='detail_gender')refreshModelDetails(e.target.form);});
