import {rackStyles} from './rack-styles.js?v=20261030-rack-v5';
import {rackArt,rackExamples,rackImage} from './rack-art.js?v=20261030-rack-v5';
import {installRackUploads} from './rack-uploads.js?v=20261030-rack-v5';
import {getLanguage,translateText} from './i18n.js?v=20261030-rack-v2';

// Isolated rack view with account-scoped local photo storage.
class WardrobeRack extends HTMLElement {
 connectedCallback(){
  this.cleanup?.();
  const thisHost=this,root=this.shadowRoot||this.attachShadow({mode:'open'});
  root.innerHTML='<style>'+rackStyles+'</style>'+"<p class=\"hint\" data-t=\"hint\"></p><section class=\"studio\" aria-label=\"Interactive clothing rack\"><div class=\"rail\"></div><div class=\"rail-end left\"></div><div class=\"rail-end right\"></div><div id=\"rack\" class=\"rack\"></div><span class=\"studio-label\" data-t=\"studio\">FIVE PIECES. MANY POSSIBILITIES.</span><button class=\"close\" id=\"close\" hidden data-t=\"back\">← Back to the rail</button></section>\n<section class=\"details\"><button id=\"previous\" class=\"arrow\" aria-label=\"Previous piece\">←</button><div class=\"piece-info\" aria-live=\"polite\"><p class=\"eyebrow\" id=\"counter\"></p><h2 id=\"name\"></h2><p id=\"description\"></p><button class=\"inspect\" id=\"inspect\" data-t=\"inspect\">Take a closer look ↗</button></div><button id=\"next\" class=\"arrow\" aria-label=\"Next piece\">→</button></section>\n<div id=\"dots\" class=\"dots\" aria-label=\"Choose a piece\"></div>";
  root.querySelector('.studio').insertAdjacentHTML('beforeend','<div class="colour-tags" id="colour-tags"></div>');
  root.querySelector('.piece-info').insertAdjacentHTML('beforeend','<div class="view-switch" id="view-switch"><button id="front-view" type="button"></button><button id="back-view" type="button"></button></div><button class="return-link" id="return-link" type="button" hidden></button>');
  const controller=new AbortController();
  const on=(node,type,handler,options={})=>node.addEventListener(type,handler,{...options,signal:controller.signal});
// The demo collection is separate from the 40-piece capsule and personal uploads.
const examples=rackExamples;
let pieces=examples.map(p=>({...p,canonical:p.name,en:p.name,el:p.el,enSub:p.category,elSub:p.elSub}));
const copy={en:{preview:'LOCAL PREVIEW',eyebrow:'THE CAPSULE / AN INTERACTIVE STUDY',title:'A little room for discovery.',hint:'Swipe or drag to browse. Tap a piece to explore.<br>Swipe again or tap Back to return to the rail.',studio:'FIVE PIECES. MANY POSSIBILITIES.',back:'← Back to the rail',inspect:'Take a closer look ↗',footer:'DayWear Rack — interaction prototype',note:'Illustrated capsule pieces · Drag, tap, or use ← → · Esc to return',previous:'Previous piece',next:'Next piece'},el:{preview:'ΤΟΠΙΚΗ ΠΡΟΕΠΙΣΚΟΠΗΣΗ',eyebrow:'Η ΓΚΑΡΝΤΑΡΟΜΠΑ / ΜΙΑ ΔΙΑΔΡΑΣΤΙΚΗ ΜΕΛΕΤΗ',title:'Λίγος χώρος για ανακάλυψη.',hint:'Σύρετε για να δείτε τα ρούχα. Πατήστε ένα για λεπτομέρειες.<br>Σύρετε ξανά ή πατήστε επιστροφή στην κρεμάστρα.',studio:'ΠΕΝΤΕ ΡΟΥΧΑ. ΠΟΛΛΕΣ ΔΥΝΑΤΟΤΗΤΕΣ.',back:'← Πίσω στην κρεμάστρα',inspect:'Δείτε το από κοντά ↗',footer:'DayWear Rack — διαδραστικό πρωτότυπο',note:'Εικονογραφημένα ρούχα · Σύρετε, πατήστε ή χρησιμοποιήστε ← → · Esc για επιστροφή',previous:'Προηγούμενο ρούχο',next:'Επόμενο ρούχο'}};
let current=2,focused=false,lang=getLanguage()==='el'?'el':'en';
const $=s=>root.querySelector(s),rack=$('#rack');

function garment(p,i){return p.image?'<img class="owned-photo" src="'+p.image+'" alt="" draggable="false">':rackArt(p,i);}
rack.innerHTML=pieces.map((p,i)=>`<button class="garment" data-i="${i}">${garment(p,i)}</button>`).join('');
$('#dots').innerHTML='<input id="piece-range" type="range" min="0" max="'+(pieces.length-1)+'" value="0" step="1">';
// Animate a continuous rail position independently of the selected piece.
let garments=[...root.querySelectorAll('.garment')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let position=2,target=2,velocity=0,frame=0,lastTime=0,zoom=0;
let down=null,dragged=false,hoverEnabled=true,wheelTimer,hoverAnchor=0,hoverX=0;
const clamp=n=>Math.max(0,Math.min(pieces.length-1,n));
const spacing=()=>thisHost.clientWidth<=650?76:Math.min(148,(thisHost.clientWidth-210)/6);
function render(){
 pieces.forEach(p=>p.en=p.image?p.name:translateText(p.canonical,getLanguage()));
 thisHost.lang=lang;
 root.querySelectorAll('[data-t]').forEach(el=>el.innerHTML=el.dataset.t==='studio'?(pieces.some(p=>p.image)?(lang==='el'?'ΤΑ ΔΙΚΑ ΣΑΣ ΡΟΥΧΑ':'YOUR OWN CLOTHES'):(lang==='el'?'ΔΟΚΙΜΑΣΤΙΚΗ ΣΥΛΛΟΓΗ STREETWEAR':'THE STREETWEAR EDIT · DEMO COLLECTION')):copy[lang][el.dataset.t]);
 $('.studio').ariaLabel=lang==='el'?'Διαδραστική κρεμάστρα ρούχων':'Interactive clothing rack';
 $('#dots').ariaLabel=lang==='el'?'Επιλέξτε ρούχο':'Choose a piece';
 root.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===lang));
 garments.forEach((b,i)=>{
  b.tabIndex=focused&&i!==current?-1:0;
  b.setAttribute('aria-hidden',focused&&i!==current?'true':'false');
  b.setAttribute('aria-label',pieces[i][lang]);b.setAttribute('aria-pressed',i===current);
 });
 $('#piece-range').max=Math.max(0,pieces.length-1);$('#piece-range').value=current;$('#piece-range').ariaLabel=lang==='el'?'Επιλέξτε ρούχο':'Choose a piece';const p=pieces[current];if(!p){$('#colour-tags').replaceChildren();$('#view-switch').hidden=true;return;}$('#counter').textContent=`${String(current+1).padStart(2,"0")} / ${pieces.length}`;
 $('#name').textContent=p[lang];$('#description').textContent=p[lang+'Sub'];
 $('#inspect').hidden=focused;$('#close').hidden=!focused;
 $('#return-link').hidden=!focused;$('#return-link').textContent=copy[lang].back;
 $('.studio').classList.toggle('is-focused',focused);
 $('#view-switch').hidden=!p.art;
 $('#front-view').textContent=lang==='el'?'Μπροστά':'Front';$('#back-view').textContent=lang==='el'?'Πίσω':'Back';
 $('#front-view').setAttribute('aria-pressed',!p.reversed);$('#back-view').setAttribute('aria-pressed',!!p.reversed);
 $('#colour-tags').hidden=!p.art||!focused;
 $('#colour-tags').setAttribute('aria-label',lang==='el'?'Χρώματα':'Colours');
 $('#colour-tags').innerHTML=p.tones?p.tones.map((t,i)=>'<button type="button" class="colour-tag" data-tone="'+i+'" style="--tag:'+t.swatch+';color:'+(['Charcoal','Black'].includes(t.en)?'#fff':'#424638')+'" aria-pressed="'+((p.tone||0)===i)+'" aria-label="'+(lang==='el'?'Χρώμα: ':'Colour: ')+t[lang]+'"><span>'+t[lang]+'</span></button>').join(''):'';
 garments.forEach((b,i)=>{b.querySelector('.garment-turn')?.classList.toggle('is-back',!!pieces[i].reversed)});
 if(p.tones){const t=p.tones[p.tone||0];$('#description').textContent=p[lang+'Sub']+' · '+t[lang]}
 $('#previous').ariaLabel=copy[lang].previous;$('#next').ariaLabel=copy[lang].next;
 $('#previous').disabled=current===0;$('#next').disabled=current===pieces.length-1;
 root.querySelectorAll('[data-index]').forEach((b,i)=>{b.setAttribute('aria-pressed',i===current);b.ariaLabel=pieces[i][lang]});
 wake();
}
function paint(){
 garments.forEach((b,i)=>{
  const d=i-position,proximity=Math.exp(-d*d*2),side=Math.tanh(d*2.1);
  if(Math.abs(d)>4){b.style.visibility='hidden';b.tabIndex=-1;return;}
  b.style.visibility='visible';
  const spread=side*42*(1-zoom);
  const swing=reduced.matches?0:Math.max(-3,Math.min(3,velocity*1.4));
  b.style.transform=`translateX(calc(-50% + ${d*spacing()*(1+zoom*.5)+spread-(thisHost.clientWidth<=650?zoom*24:0)}px)) translateY(${proximity*zoom*18}px) rotateY(${-side*81*(1-proximity*.85)}deg) rotateZ(${-side*2+swing*(.5+proximity*.5)}deg) scale(${.88+proximity*.12+zoom*proximity*.12})`;
  b.style.opacity=1-zoom*(i===current?0:.80);
  b.style.filter=i===current?'none':'blur('+zoom*9+'px)';
  b.style.zIndex=String(20-Math.round(Math.abs(d)*3));
  b.style.pointerEvents=focused&&i!==current?'none':'auto';b.style.visibility=Math.abs(d)>4?'hidden':'visible';b.tabIndex=Math.abs(d)>4||focused&&i!==current?-1:0;
 });
}
function animate(time){
 const dt=Math.min((time-lastTime)/1000||1/60,1/30);lastTime=time;
 if(reduced.matches){position=target;velocity=0;zoom=Number(focused)}
 else{
  velocity+=(target-position)*(down?.locked?220:95)*dt;velocity*=Math.exp(-(down?.locked?28:18)*dt);position+=velocity*dt;
  zoom+=(Number(focused)-zoom)*(1-Math.exp(-10*dt));
 }
 paint();
 if(Math.abs(position-target)>.0005||Math.abs(velocity)>.003||Math.abs(zoom-Number(focused))>.001)frame=requestAnimationFrame(animate);
 else{position=target;zoom=Number(focused);velocity=0;paint();frame=0;lastTime=0;}
}
function wake(){if(!frame)frame=requestAnimationFrame(animate)}
function move(n){if(!pieces.length)return;target=clamp(n);const next=Math.round(target);if(next!==current){current=next;render();root.dispatchEvent(new Event('rack:selection'))}wake()}
function step(d){hoverEnabled=false;focused=false;move(current+d);render()}
function inspect(){hoverEnabled=false;focused=true;move(current);render();$('.studio').scrollIntoView({block:'start',behavior:reduced.matches?'auto':'smooth'});$('#close').focus({preventScroll:true})}
function close(restoreFocus=true){focused=false;hoverEnabled=false;move(current);render();if(restoreFocus)garments[current]?.focus({preventScroll:true})}
// Stable pointer mapping prevents moving garments from causing hover flicker.
function hover(e){
 if(e.pointerType!=='mouse'||!hoverEnabled||focused)return;
 move(hoverAnchor+(e.clientX-hoverX)/spacing());
}
on(rack,'pointerenter',e=>{hoverEnabled=true;hoverAnchor=target;hoverX=e.clientX});
on(rack,'pointerdown',e=>{
 if(e.button!==0||!e.isPrimary)return;
 down={id:e.pointerId,x:e.clientX,y:e.clientY,start:target,lastX:e.clientX,lastTime:performance.now(),speed:0,locked:false};dragged=false;
});
on(rack,'pointermove',e=>{
 if(!down){hover(e);return}if(e.pointerId!==down.id)return;
 const dx=e.clientX-down.x,dy=e.clientY-down.y;
 if(!down.locked){
  if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8&&e.pointerType!=='mouse'){down=null;return}
  if(Math.abs(dx)<8||Math.abs(dx)<Math.abs(dy)*1.2)return;
  down.locked=true;dragged=true;rack.setPointerCapture(e.pointerId);rack.classList.add('dragging');
  if(focused){focused=false;render()}
 }
 const now=performance.now();down.speed=down.speed*.55+(e.clientX-down.lastX)/Math.max(8,now-down.lastTime)*.45;
 down.lastX=e.clientX;down.lastTime=now;move(down.start-dx/spacing());
});
function release(e,cancelled=false){
 if(!down||e.pointerId!==down.id)return;
 const state=down;down=null;rack.classList.remove('dragging');
 if(rack.hasPointerCapture(e.pointerId))rack.releasePointerCapture(e.pointerId);
 if(state.locked){
  hoverEnabled=false;
  const momentum=cancelled||performance.now()-state.lastTime>100?0:Math.max(-1.2,Math.min(1.2,state.speed*110/spacing()));
  move(Math.round(clamp(target-momentum)));
 }
}
on(rack,'pointerup',e=>release(e));
on(rack,'pointercancel',e=>release(e,true));
on(rack,'lostpointercapture',e=>release(e,true));
on(rack,'pointerleave',()=>{if(!down){hoverEnabled=true;move(Math.round(target))}});
on(rack,'wheel',e=>{
 if(e.ctrlKey)return;
 if(focused)close(false);
 const delta=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*(e.deltaMode===1?16:e.deltaMode===2?rack.clientWidth:1);
 if((target===0&&delta<0)||(target===pieces.length-1&&delta>0))return;
 e.preventDefault();hoverEnabled=false;move(target+delta/500);
 clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>move(Math.round(target)),180);
},{passive:false});
on(rack,'click',e=>{
 if(dragged){dragged=false;return}
 const b=e.target.closest('[data-i]');if(!b){if(focused)close(false);return;}
 const i=Number(b.dataset.i);hoverEnabled=false;if(i===current){if(focused)close();else inspect()}else{focused=false;move(i);render()}
});
$('#previous').onclick=()=>step(-1);$('#next').onclick=()=>step(1);$('#inspect').onclick=inspect;$('#close').onclick=()=>close();$('#return-link').onclick=()=>close();
$('#dots').onclick=e=>{if(e.target.dataset.index!==undefined){hoverEnabled=false;move(Number(e.target.dataset.index))}};

on(thisHost,'keydown',e=>{
 if(e.altKey||e.ctrlKey||e.metaKey||e.composedPath()[0]?.id==='piece-range')return;
 if(e.key==='ArrowRight'){e.preventDefault();step(1)}
 if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}
 if(e.key==='Escape'&&focused)close();
});
on($('#piece-range'),'input',e=>{hoverEnabled=false;focused=false;move(Number(e.target.value));render()});
function showSide(back){const p=pieces[current];if(!p?.art)return;p.reversed=back;hoverEnabled=false;move(current);render()}
on($('#front-view'),'click',()=>showSide(false));on($('#back-view'),'click',()=>showSide(true));
on($('#colour-tags'),'click',e=>{
 const button=e.target.closest('[data-tone]'),p=pieces[current];if(!button||!p?.tones)return;
 p.tone=Number(button.dataset.tone);const tone=p.tones[p.tone],b=garments[current];
 b.querySelector('.front-face').src=rackImage(tone.front);b.querySelector('.back-face').src=rackImage(tone.back);
 hoverEnabled=false;render();$('#colour-tags').querySelector('[data-tone="'+p.tone+'"]').focus({preventScroll:true});
});
on(rack,'dragstart',e=>e.preventDefault());
on(reduced,'change',wake);on(window,'resize',wake);render();


  on(document,'wardrobe:language',()=>{lang=getLanguage()==='el'?'el':'en';render()});
  const resize=new ResizeObserver(()=>wake());resize.observe(this);

  const stopUploads=installRackUploads(root,examples,next=>{
   pieces=next.map(p=>({...p,canonical:p.name,en:p.name,el:p.image?p.name:p.el,enSub:p.image?'':p.category,elSub:p.image?'':p.elSub}));
   current=position=target=next.some(p=>p.art)?2:0;velocity=zoom=0;focused=false;
   rack.innerHTML=pieces.map((p,i)=>'<button class="garment" data-i="'+i+'">'+garment(p,i)+'</button>').join('');
   garments=[...rack.children];render();
  },()=>pieces[current]);
  this.cleanup=()=>{stopUploads();pieces=[];rack.replaceChildren();controller.abort();resize.disconnect();cancelAnimationFrame(frame);clearTimeout(wheelTimer)};
 }
 disconnectedCallback(){this.cleanup?.();this.cleanup=null}
}
customElements.define('wardrobe-rack',WardrobeRack);
