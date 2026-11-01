import {translateText} from './i18n.js?v=20261101-gender-age-v1';
const colours={Black:'#171414',Brown:'#6b4632',Blonde:'#cda96c',Red:'#9d4930',Grey:'#8e8b87',White:'#eee8de',Blue:'#567fa5',Green:'#647e54',Hazel:'#8b7847',Amber:'#b47d36','Salt and pepper':'linear-gradient(135deg,#383536 0 50%,#c6c3bd 50%)'};
const titles={gender:'Gender',age:'Age',hair:'Hair',skin:'Skin',beard:'Beard',eye:'Eyes'};
const skin={'very-light':['Very light','#f2d6c4'],light:['Light','#dfb493'],medium:['Medium','#c4936e'],tan:['Tan','#a8724d'],brown:['Brown','#805335'],deep:['Deep','#4a3025']};
export function colourPreview(){return '<section class="colour-preview" aria-label="Appearance preview"><h3>Appearance preview</h3><div class="colour-preview-grid" data-colour-preview aria-live="polite" aria-atomic="true"></div><div data-colour-editor hidden></div><p class="form-note">Updates as you edit. Named colours are approximate; custom shades use your palette selection.</p></section>';}
export function refreshColourPreview(){
 const form=document.querySelector('#profile-form'),host=form?.querySelector('[data-colour-preview]');if(!host)return;
 const val=name=>form.elements[name]?.value||'',checked=name=>!!form.elements[name]?.checked;
 const nodes=Object.keys(titles).map(key=>{
  const title=titles[key],cap=key[0].toUpperCase()+key.slice(1),shade=val('detail_'+key+'Shade');
  let label='From your photos',colour='';
  if(checked('use'+cap+'Shade')&&/^#[0-9a-f]{6}$/i.test(shade)){label='Custom shade';colour=shade;}
  else if(key==='skin'){const choice=skin[val('skinTone')];if(choice)[label,colour]=choice;}
  else {const choice=val('detail_'+key+'Colour');if(choice){label=choice;colour=colours[choice]||'';}}
  if(key==='beard'&&val('detail_beardStyle')==='Clean-shaven'){label='Clean-shaven';colour='';}
  if(key==='hair'&&val('detail_hairLength')==='Shaved / bald'){label='Shaved / bald';colour='';}
  if(key==='gender')label=val('detail_gender')||'Not specified';
  if(key==='age')label=val('age')||'Not specified';
  const item=document.createElement('button');item.type='button';item.setAttribute('aria-expanded',String(form.querySelector('[data-colour-editor]')?.dataset.editing===key));item.className='colour-preview-item';item.dataset.colourPreviewItem=key;
  const swatch=document.createElement('span');swatch.className='colour-preview-swatch';swatch.setAttribute('aria-hidden','true');if(colour)swatch.style.background=colour;if(key==='gender'||key==='age')swatch.hidden=true;
  const text=document.createElement('span'),name=document.createElement('strong'),value=document.createElement('small');name.textContent=translateText(title);value.textContent=translateText(label);text.append(name,value);const style=key==='hair'?[val('detail_hairLength'),val('detail_hairTexture')].filter(Boolean):key==='beard'?[val('detail_beardStyle')].filter(Boolean):[];if(style.length){const description=document.createElement('small');description.dataset.appearanceSummary=key;description.textContent=style.map(translateText).join(' · ');text.append(description);}item.append(swatch,text);return item;
 });host.replaceChildren(...nodes);syncEditor(form);queueMicrotask(()=>syncEditor(form));
}
for(const event of ['input','change'])document.addEventListener(event,e=>{if(e.target.closest('#profile-form')&&/^(detail_(hair|skin|beard|eye)|use(Hair|Skin|Beard|Eye)Shade|skinTone|detail_gender|age$|kind$)/.test(e.target.name))refreshColourPreview();});
document.addEventListener('wardrobe:language',refreshColourPreview);

const keys=Object.keys(titles);
function syncEditor(form){const editor=form.querySelector('[data-colour-editor]');if(!editor||editor.hidden)return;for(const control of editor.querySelectorAll('[data-colour-source]')){const source=form.elements[control.dataset.colourSource];if(!source)continue;if(control.type==='checkbox')control.checked=source.checked;else control.value=source.value;if(control.type==='color'){control.disabled=source.disabled;control.closest('label').hidden=source.disabled;}}}
function closeEditor(form){const editor=form.querySelector('[data-colour-editor]'),key=editor.dataset.editing;editor.hidden=true;editor.replaceChildren();delete editor.dataset.editing;refreshColourPreview();form.querySelector('[data-colour-preview-item="'+key+'"]').focus({preventScroll:true});}
function openEditor(form,key){
 if(!keys.includes(key))return;const editor=form.querySelector('[data-colour-editor]'),cap=key[0].toUpperCase()+key.slice(1);editor.replaceChildren();editor.dataset.editing=key;editor.hidden=false;
 const title=document.createElement('h4');title.textContent=translateText(titles[key]);editor.append(title);
 const add=(text,control,source)=>{const label=document.createElement('label');label.className=control.type==='checkbox'?'remember':'field';const caption=document.createElement('span');caption.textContent=translateText(text);control.dataset.colourSource=source;label.append(caption,control);editor.append(label);return control;};
 if(key==='gender'||key==='age'){
  const fields=key==='gender'?[['detail_gender','Gender (optional)']]:[['kind','Age group'],['age','Age (optional)']];
  for(const [source,label] of fields){const control=form.elements[source]?.cloneNode(true);if(!control)continue;control.removeAttribute('name');control.removeAttribute('id');add(label,control,source);}
  finishEditor(form,editor);return;
 }
 const appearance=key==='hair'?[['detail_hairLength','Hair length'],['detail_hairTexture','Hair texture']]:key==='beard'?[['detail_beardStyle','Beard style']]:[];
 for(const [source,label] of appearance){const control=form.elements[source].cloneNode(true);control.removeAttribute('name');control.removeAttribute('id');add(label,control,source);}
 const sourceName=key==='skin'?'skinTone':'detail_'+key+'Colour';let select;
 if(key==='skin'){select=document.createElement('select');for(const radio of form.querySelectorAll('[name=skinTone]')){const option=document.createElement('option');option.value=radio.value;option.textContent=translateText(skin[radio.value]?.[0]||'Not specified');select.append(option);}}
 else{select=form.elements[sourceName].cloneNode(true);select.removeAttribute('name');select.removeAttribute('id');}
 add(key==='skin'?'Skin tone (optional)':key==='eye'?'Eye colour':key==='hair'?'Hair colour':'Beard colour',select,sourceName);
 const toggle=document.createElement('input');toggle.type='checkbox';add('Use a precise shade',toggle,'use'+cap+'Shade');const colour=document.createElement('input');colour.type='color';add('Custom shade',colour,'detail_'+key+'Shade');
 finishEditor(form,editor);
}
document.addEventListener('click',e=>{const button=e.target.closest('[data-colour-preview-item], [data-close-colour-editor]');if(!button)return;const form=button.closest('#profile-form');if(button.hasAttribute('data-close-colour-editor'))closeEditor(form);else openEditor(form,button.dataset.colourPreviewItem);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&e.target.closest('[data-colour-editor]')){e.preventDefault();closeEditor(e.target.closest('#profile-form'));}});
for(const event of ['input','change'])document.addEventListener(event,e=>{const control=e.target;if(!control.dataset.colourSource)return;const form=control.closest('#profile-form'),source=form.elements[control.dataset.colourSource];if(!source)return;if(control.type==='checkbox')source.checked=control.checked;else source.value=control.value;const target=source instanceof RadioNodeList?[...source].find(r=>r.checked):source;if(target){target.dispatchEvent(new Event('input',{bubbles:true}));target.dispatchEvent(new Event('change',{bubbles:true}));}syncEditor(form);});

function finishEditor(form,editor){
 const note=document.createElement('p');note.className='form-note';note.textContent=translateText('Changes use the same Save and Create my model buttons.');editor.append(note);
 const close=document.createElement('button');close.type='button';close.dataset.closeColourEditor='';close.textContent=translateText('Done');editor.append(close);refreshColourPreview();editor.querySelector('select,input').focus({preventScroll:true});
}

document.addEventListener('invalid',e=>{if(e.target.name!=='age'||!e.target.closest('#profile-form'))return;e.preventDefault();const form=e.target.form;if(form.querySelector('[data-colour-editor]').dataset.editing!=='age')openEditor(form,'age');const input=form.querySelector('[data-colour-source=age]');input.focus({preventScroll:true});setTimeout(()=>input.isConnected&&input.reportValidity(),0);},true);
