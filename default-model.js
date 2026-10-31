export const defaultModelKind=(sizes={},fallback='adult')=>fallback==='child'?'child':sizes.modelDetails?.gender==='Woman'?'woman':sizes.modelDetails?.gender==='Man'?'man':fallback==='woman'?'woman':'man';
export function defaultModelView(sizes={},kind='adult'){
 const selected=defaultModelKind(sizes,kind);
 if(selected==='child')return '';
 const woman=selected==='woman';
 return `<figure class="default-model-preview" data-default-model data-kind="${selected}"><img src="assets/${woman?'default-woman-modern.webp':'summer-2.webp'}" alt="${woman?'Fictional female default model':'Fictional male default model'}" width="800" height="1200"><figcaption><strong>${woman?'Female default model':'Male default model'}</strong><p>This fictional default is a starting point. Save your hair details and measurements, then create your personal model and review the result.</p></figcaption></figure>`;
}
export function refreshDefaultModels(form=document.querySelector('#profile-form')){
 if(!form)return;
 const sizes={modelDetails:{gender:form.elements.detail_gender?.value||''}},kind=form.querySelector('[data-model-details]')?.dataset.child==='true'?'child':form.elements.kind?.value||'adult';
 for(const preview of document.querySelectorAll('[data-default-model]'))preview.outerHTML=defaultModelView(sizes,kind);
}
if(typeof document!=='undefined')document.addEventListener('change',e=>{if(e.target.name==='detail_gender')refreshDefaultModels(e.target.form);});
