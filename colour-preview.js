import {translateText} from './i18n.js?v=20261031-colour-preview-v1';
const colours={Black:'#171414',Brown:'#6b4632',Blonde:'#cda96c',Red:'#9d4930',Grey:'#8e8b87',White:'#eee8de',Blue:'#567fa5',Green:'#647e54',Hazel:'#8b7847',Amber:'#b47d36','Salt and pepper':'linear-gradient(135deg,#383536 0 50%,#c6c3bd 50%)'};
const skin={'very-light':['Very light','#f2d6c4'],light:['Light','#dfb493'],medium:['Medium','#c4936e'],tan:['Tan','#a8724d'],brown:['Brown','#805335'],deep:['Deep','#4a3025']};
export function colourPreview(){return '<section class="colour-preview" aria-label="Selected colours"><h3>Selected colours</h3><div class="colour-preview-grid" data-colour-preview aria-live="polite" aria-atomic="true"></div><p class="form-note">Updates as you edit. Named colours are approximate; custom shades use your palette selection.</p></section>';}
export function refreshColourPreview(){
 const form=document.querySelector('#profile-form'),host=form?.querySelector('[data-colour-preview]');if(!host)return;
 const val=name=>form.elements[name]?.value||'',checked=name=>!!form.elements[name]?.checked;
 const nodes=['hair','skin','beard','eye'].map((key,i)=>{
  const title=['Hair','Skin','Beard','Eyes'][i],cap=key[0].toUpperCase()+key.slice(1),shade=val('detail_'+key+'Shade');
  let label='From your photos',colour='';
  if(checked('use'+cap+'Shade')&&/^#[0-9a-f]{6}$/i.test(shade)){label='Custom shade';colour=shade;}
  else if(key==='skin'){const choice=skin[val('skinTone')];if(choice)[label,colour]=choice;}
  else {const choice=val('detail_'+key+'Colour');if(choice){label=choice;colour=colours[choice]||'';}}
  if(key==='beard'&&val('detail_beardStyle')==='Clean-shaven'){label='Clean-shaven';colour='';}
  if(key==='hair'&&val('detail_hairLength')==='Shaved / bald'){label='Shaved / bald';colour='';}
  const item=document.createElement('div');item.className='colour-preview-item';item.dataset.colourPreviewItem=key;
  const swatch=document.createElement('span');swatch.className='colour-preview-swatch';swatch.setAttribute('aria-hidden','true');if(colour)swatch.style.background=colour;
  const text=document.createElement('span'),name=document.createElement('strong'),value=document.createElement('small');name.textContent=translateText(title);value.textContent=translateText(label);text.append(name,value);item.append(swatch,text);return item;
 });host.replaceChildren(...nodes);
}
for(const event of ['input','change'])document.addEventListener(event,e=>{if(e.target.closest('#profile-form')&&/^(detail_(hair|skin|beard|eye)|use(Hair|Skin|Beard|Eye)Shade|skinTone)/.test(e.target.name))refreshColourPreview();});
document.addEventListener('wardrobe:language',refreshColourPreview);
