import {rackStyles} from './rack-styles.js?v=20261031-white-rack-v2';
import {rackArt,rackExamples,rackImage,rackHook} from './rack-art.js?v=20261031-save-v1';
import {installRackUploads} from './rack-uploads.js?v=20261031-save-v1';
import {getLanguage,translateText} from './i18n.js?v=20261031-create-palette-v1';

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
const copy={en:{preview:'LOCAL PREVIEW',eyebrow:'THE CAPSULE / AN INTERACTIVE STUDY',title:'A little room for discovery.',hint:'Hover, swipe or drag to browse. Tap any piece to open.<br>Double-tap to flip; tap beside it to return.',studio:'FIVE PIECES. MANY POSSIBILITIES.',back:'← Back to the rail',inspect:'Take a closer look ↗',footer:'DayWear Rack — interaction prototype',note:'Illustrated capsule pieces · Drag, tap, or use ← → · Esc to return',previous:'Previous piece',next:'Next piece'},el:{preview:'ΤΟΠΙΚΗ ΠΡΟΕΠΙΣΚΟΠΗΣΗ',eyebrow:'Η ΓΚΑΡΝΤΑΡΟΜΠΑ / ΜΙΑ ΔΙΑΔΡΑΣΤΙΚΗ ΜΕΛΕΤΗ',title:'Λίγος χώρος για ανακάλυψη.',hint:'Κινήστε τον δείκτη ή σύρετε για να δείτε τα ρούχα. Πατήστε ένα για λεπτομέρειες.<br>Διπλό πάτημα για περιστροφή· πάτημα δίπλα του για επιστροφή.',studio:'ΠΕΝΤΕ ΡΟΥΧΑ. ΠΟΛΛΕΣ ΔΥΝΑΤΟΤΗΤΕΣ.',back:'← Πίσω στην κρεμάστρα',inspect:'Δείτε το από κοντά ↗',footer:'DayWear Rack — διαδραστικό πρωτότυπο',note:'Εικονογραφημένα ρούχα · Σύρετε, πατήστε ή χρησιμοποιήστε ← → · Esc για επιστροφή',previous:'Προηγούμενο ρούχο',next:'Επόμενο ρούχο'}};
let current=4,focused=false,previewing=true,lang=getLanguage()==='el'?'el':'en';
const $=s=>root.querySelector(s),rack=$('#rack');

function garment(p,i){return p.image?'<img class="owned-photo" src="'+p.image+'" alt="" draggable="false">':rackArt(p,i);}
rack.innerHTML=pieces.map((p,i)=>`<button class="garment" data-i="${i}">${garment(p,i)}</button>${p.art?rackHook.replace('class="hanger-hook"','class="hanger-hook" data-hook="'+i+'"'):''}`).join('');
$('#dots').innerHTML='<input id="piece-range" type="range" min="0" max="'+(pieces.length-1)+'" value="0" step="1">';
// Animate a continuous rail position independently of the selected piece.
let garments=[...root.querySelectorAll('.garment')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let position=4,target=4,velocity=0,frame=0,lastTime=0,zoom=0;
let reveals=pieces.map((_,i)=>Number(previewing&&i===current));
let swings=pieces.map(()=>({angle:0,speed:0,kick:0,delay:0}));
let down=null,dragged=false,hoverEnabled=true,wheelTimer,activationIndex=null,lastTap=null,lastPointerType='mouse',lastHoverX=null;
const clamp=n=>Math.max(0,Math.min(pieces.length-1,n));
const spacing=()=>thisHost.clientWidth<=650?52:Math.min(64,Math.max(38,(thisHost.clientWidth-340)/8));
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
  b.setAttribute('aria-label',pieces[i][lang]);b.setAttribute('aria-pressed',previewing&&i===current);
 });
 $('#piece-range').max=Math.max(0,pieces.length-1);$('#piece-range').value=current;$('#piece-range').ariaLabel=lang==='el'?'Επιλέξτε ρούχο':'Choose a piece';const p=pieces[current];if(!p){$('#colour-tags').replaceChildren();$('#view-switch').hidden=true;return;}$('#counter').textContent=`${String(current+1).padStart(2,"0")} / ${pieces.length}`;
 $('#name').textContent=p[lang];$('#description').textContent=p[lang+'Sub'];
 $('#inspect').hidden=focused;$('#close').hidden=!focused;
 $('#return-link').hidden=!focused;$('#return-link').textContent=copy[lang].back;
 $('.studio').classList.toggle('is-focused',focused);
 $('#view-switch').hidden=!p.art||!focused;
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
 paint();
 wake();
}
function paint(){
 const desktop=thisHost.clientWidth>650;
 const railCenter=desktop?(pieces.length<=9?(pieces.length-1)/2:Math.max(4,Math.min(pieces.length-5,position))):position;
 garments.forEach((b,i)=>{
  const d=i-position,proximity=reveals[i]||0;
  if(Math.abs(i-railCenter)>4.5){b.style.visibility='hidden';rack.querySelector('[data-hook="'+i+'"]')?.style.setProperty('visibility','hidden');b.tabIndex=-1;return;}
  b.style.visibility='visible';
  // Transfer the opening with the garment's turn, closing the old gap as
  // the next opens. Resting hangers stay closely packed on either side.
  const opening=reveals.reduce((sum,v,j)=>sum+Math.sign(i-j)*v,0);
  const railX=(i-railCenter)*spacing()+opening*(desktop?128:112);
  const detailX=d*spacing()*1.35-(desktop?0:24);
  const x=railX*(1-zoom)+detailX*zoom;
  const swing=reduced.matches?0:(swings[i]?.angle||0)*(1-zoom);
  // Counter the off-axis perspective so clothes at either end keep a natural
  // visible side profile instead of collapsing into a one-pixel sliver.
  const restingAngle=70+(i%3)*2-Math.atan(x/2400)*180/Math.PI;
  const tilt=((i%3)-1)*.6*(1-proximity)+swing;
  const hook=rack.querySelector('[data-hook="'+i+'"]');
  if(hook){
   hook.style.visibility=b.style.visibility;
   hook.style.transform=`translateX(calc(-50% + ${x}px)) translateY(${proximity*zoom*18}px) rotateZ(${tilt}deg) scale(${.94+proximity*.06+zoom*proximity*.12})`;
   hook.style.opacity=1-zoom*(i===current?0:.80);
   hook.style.zIndex=String(21-Math.round(Math.abs(d)*3));
  }
  b.style.transform=`translateX(calc(-50% + ${x}px)) translateY(${proximity*zoom*18}px) rotateZ(${tilt}deg) rotateY(${restingAngle*(1-proximity)}deg) scale(${.94+proximity*.06+zoom*proximity*.12})`;
  b.style.opacity=1-zoom*(i===current?0:.80);
  b.style.filter=i===current?'none':'blur('+zoom*9+'px)';
  b.style.zIndex=String(20-Math.round(Math.abs(d)*3));
  b.style.pointerEvents=focused&&i!==current?'none':'auto';b.tabIndex=focused&&i!==current?-1:0;
 });
}
function animate(time){
 const dt=Math.min((time-lastTime)/1000||1/60,1/30);lastTime=time;
 if(reduced.matches){swings.forEach(s=>{s.angle=0;s.speed=0;s.kick=0;s.delay=0});position=target;velocity=0;zoom=Number(focused);reveals=pieces.map((_,i)=>Number(previewing&&i===current))}
 else{
  velocity+=(target-position)*(down?.locked?220:95)*dt;velocity*=Math.exp(-(down?.locked?28:18)*dt);position+=velocity*dt;
  swings.forEach((s,i)=>{
   // The small nudge travels out along the rail, rather than moving all
   // hangers in sync. Keep existing momentum when browsing quickly.
   if(s.kick){s.delay-=dt;if(s.delay<=0){s.speed=Math.max(-18,Math.min(18,s.speed+s.kick));s.kick=0}}
   s.speed+=(-(60+(i%3)*4)*s.angle-7*s.speed)*dt;
   s.angle=Math.max(-2.1,Math.min(2.1,s.angle+s.speed*dt));
  });
  zoom+=(Number(focused)-zoom)*(1-Math.exp(-10*dt));
  reveals=reveals.map((v,i)=>v+(Number(previewing&&i===current)-v)*(1-Math.exp(-12*dt)));
 }
 paint();
 if(swings.some(s=>s.kick||Math.abs(s.angle)>.005||Math.abs(s.speed)>.02)||Math.abs(position-target)>.0005||Math.abs(velocity)>.003||Math.abs(zoom-Number(focused))>.001||reveals.some((v,i)=>Math.abs(v-Number(previewing&&i===current))>.001))frame=requestAnimationFrame(animate);
 else{position=target;zoom=Number(focused);velocity=0;reveals=pieces.map((_,i)=>Number(previewing&&i===current));paint();frame=0;lastTime=0;}
}
function wake(){if(!frame)frame=requestAnimationFrame(animate)}
function move(n){if(!pieces.length)return;const wasPacked=!previewing;previewing=true;target=clamp(n);const next=Math.round(target);if(next!==current){
 const direction=Math.sign(next-current);
 if(!reduced.matches){
  // The opened piece leads; neighbouring hangers respond more softly,
  // then settle. No perpetual wobble while the pointer remains still.
  swings.forEach((s,i)=>{
   const distance=Math.min(Math.abs(i-next),Math.abs(i-current));
   const primary=i===next||i===current;
   s.kick=(primary?direction:Math.sign(i-next))*(i===next?17:i===current?12:8*Math.exp(-distance*.48));
   s.delay=primary?0:Math.min(.18,distance*.035);
  });
 }
 current=next;render();root.dispatchEvent(new Event('rack:selection'))}else if(wasPacked)render();wake()}
function packRail(){
 if(focused||!previewing)return;
 previewing=false;lastTap=null;
 if(!reduced.matches)swings.forEach((s,i)=>{s.kick=(Math.sign(i-current)||-1)*4*Math.exp(-Math.abs(i-current)*.45);s.delay=Math.min(.18,Math.abs(i-current)*.035)});
 render();
}
function step(d){hoverEnabled=false;focused=false;move(current+d);render()}
function inspect(){hoverEnabled=false;focused=true;move(current);render();$('.studio').scrollIntoView({block:'start',behavior:reduced.matches?'auto':'smooth'});$('#close').focus({preventScroll:true})}
function close(restoreFocus=true){focused=false;lastTap=null;hoverEnabled=false;move(current);render();if(restoreFocus)garments[current]?.focus({preventScroll:true})}
// Hit-test the photo silhouette, not its rectangular transparent image box.
// Cache a small alpha mask; keep the hit plane stable while the photo flips.
const photoMasks=new WeakMap();
function onGarment(e){
 if(e.detail===0&&e.type==='click')return true; // Keyboard activation.
 const b=garments[current],p=pieces[current];
 const img=b?.querySelector(p?.reversed?'.back-face':'.front-face')||b?.querySelector('img');
 if(!b||!img||!img.complete||!img.naturalWidth)return false;
 const r=b.getBoundingClientRect();
 const scale=Math.min(r.width/img.naturalWidth,r.height/img.naturalHeight);
 const width=img.naturalWidth*scale,height=img.naturalHeight*scale;
 const u=(e.clientX-r.left-(r.width-width)/2)/width;
 const v=(e.clientY-r.top-(r.height-height)/2)/height;
 if(u<0||u>=1||v<0||v>=1)return false;
 let mask=photoMasks.get(img);
 if(!mask||mask.src!==img.currentSrc){
  const canvas=document.createElement('canvas');canvas.width=96;canvas.height=144;
  const context=canvas.getContext('2d',{willReadFrequently:true});
  try{context.drawImage(img,0,0,96,144);mask={src:img.currentSrc,data:context.getImageData(0,0,96,144).data};photoMasks.set(img,mask)}
  catch{return u>.18&&u<.82&&v>.15&&v<.95}
 }
 return mask.data[(Math.floor(v*144)*96+Math.floor(u*96))*4+3]>32;
}
// Transparent corners of overlapping photos must not steal taps from a nearby shirt.
function pickAt(e){
 const hit=e.target.closest('[data-i]');if(!hit)return null;
 if(focused)return current;
 const active=garments[current].getBoundingClientRect(),center=(active.left+active.right)/2;
 const solidWidth=active.width*(pieces[current].art==='tank'?.70:.86);
 if(Math.abs(e.clientX-center)<solidWidth/2&&e.clientY>=active.top&&e.clientY<=active.bottom)return current;
 let choice=Number(hit.dataset.i),distance=Infinity;
 garments.forEach((b,i)=>{
  if(b.style.visibility==='hidden')return;
  const r=b.getBoundingClientRect();if(e.clientY<r.top||e.clientY>r.bottom)return;
  const gap=Math.abs(e.clientX-(r.left+r.right)/2);
  if(gap<distance){choice=i;distance=gap;}
 });
 return choice;
}
// Fixed hanger positions make hover a turn in place, not a moving carousel.
// Only physical pointer movement chooses another piece; layout changes do not.
function hover(e){
 if(e.pointerType!=='mouse'||thisHost.clientWidth<=650||focused)return;
 if(lastHoverX!==null&&Math.abs(e.clientX-lastHoverX)<3)return;
 lastHoverX=e.clientX;
 const i=pickAt(e);
 if(i!==null&&(!previewing||i!==current))move(i);
 else if(i===null&&previewing){
  const edge=garments[current].getBoundingClientRect();
  if((current===0&&e.clientX<edge.left)||(current===pieces.length-1&&e.clientX>edge.right))packRail();
 }
}
on(rack,'pointerdown',e=>{
 if(e.button!==0||!e.isPrimary)return;
 lastPointerType=e.pointerType;
 activationIndex=pickAt(e);
 down={id:e.pointerId,x:e.clientX,y:e.clientY,start:target,lastX:e.clientX,lastTime:performance.now(),speed:0,locked:false};dragged=false;
});
on(rack,'pointermove',e=>{
 if(!down){hover(e);return}if(e.pointerId!==down.id)return;
 const dx=e.clientX-down.x,dy=e.clientY-down.y;
 if(!down.locked){
  if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8&&e.pointerType!=='mouse'){down=null;activationIndex=null;return}
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
 if(cancelled)activationIndex=null;
 if(rack.hasPointerCapture(e.pointerId))rack.releasePointerCapture(e.pointerId);
 if(state.locked){
  activationIndex=null;
  hoverEnabled=false;
  const momentum=cancelled||performance.now()-state.lastTime>100?0:Math.max(-1.2,Math.min(1.2,state.speed*110/spacing()));
  move(Math.round(clamp(target-momentum)));
 }
}
on(rack,'pointerup',e=>release(e));
on(rack,'pointercancel',e=>release(e,true));
// Touch starts with implicit capture on the garment button. Moving capture to
// the rail emits a bubbling lostpointercapture from that button; this is a
// hand-off, not a cancelled swipe. Only a loss from the rail ends our drag.
on(rack,'lostpointercapture',e=>{if(e.target===rack)release(e,true)});
on(rack,'pointerleave',()=>{lastHoverX=null;if(!down){hoverEnabled=true;if(previewing)move(Math.round(target))}});
on(rack,'wheel',e=>{
 if(e.ctrlKey)return;
 if(focused)close(false);
 const delta=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*(e.deltaMode===1?16:e.deltaMode===2?rack.clientWidth:1);
 if((target===0&&delta<0)||(target===pieces.length-1&&delta>0))return;
 e.preventDefault();hoverEnabled=false;move(target+delta/500);
 clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>move(Math.round(target)),180);
},{passive:false});
on(rack,'click',e=>{
 if(dragged){dragged=false;activationIndex=null;return}
 if(focused&&!onGarment(e)){activationIndex=null;close(false);return}
 const b=e.target.closest('[data-i]'),i=activationIndex??(b?Number(b.dataset.i):null);activationIndex=null;
 if(i===null){if(focused)close(false);else packRail();return;}
 hoverEnabled=false;
 if(i===current&&focused){
  if(lastPointerType==='mouse')return;
  const now=performance.now();
  if(lastTap&&lastTap.index===i&&now-lastTap.time<450&&Math.hypot(e.clientX-lastTap.x,e.clientY-lastTap.y)<32){showSide(!pieces[i].reversed);lastTap=null;}
  else lastTap={index:i,time:now,x:e.clientX,y:e.clientY};
 }else{lastTap=null;move(i);inspect()}
});
on(rack,'dblclick',e=>{
 if(lastPointerType!=='mouse'||!focused||!e.target.closest('[data-i]')||!onGarment(e))return;
 e.preventDefault();showSide(!pieces[current].reversed);
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
function showSide(back){lastTap=null;const p=pieces[current];if(!p?.art)return;p.reversed=back;hoverEnabled=false;move(current);render()}
on($('#front-view'),'click',()=>showSide(false));on($('#back-view'),'click',()=>showSide(true));
on($('#colour-tags'),'click',e=>{
 const button=e.target.closest('[data-tone]'),p=pieces[current];if(!button||!p?.tones)return;
 p.tone=Number(button.dataset.tone);const tone=p.tones[p.tone],b=garments[current];
 b.innerHTML=rackArt(p);
 hoverEnabled=false;render();$('#colour-tags').querySelector('[data-tone="'+p.tone+'"]').focus({preventScroll:true});
});
on(rack,'dragstart',e=>e.preventDefault());
on(reduced,'change',wake);on(window,'resize',wake);render();


  on(document,'wardrobe:language',()=>{lang=getLanguage()==='el'?'el':'en';render()});
  const resize=new ResizeObserver(()=>wake());resize.observe(this);

  const stopUploads=installRackUploads(root,examples,next=>{
   pieces=next.map(p=>({...p,canonical:p.name,en:p.name,el:p.image?p.name:p.el,enSub:p.image?'':p.category,elSub:p.image?'':p.elSub}));
   current=position=target=next.some(p=>p.art)?4:0;velocity=zoom=0;focused=false;previewing=true;
   reveals=next.map((_,i)=>Number(previewing&&i===current));
   swings=next.map(()=>({angle:0,speed:0,kick:0,delay:0}));
   rack.innerHTML=pieces.map((p,i)=>`<button class="garment" data-i="${i}">${garment(p,i)}</button>${p.art?rackHook.replace('class="hanger-hook"','class="hanger-hook" data-hook="'+i+'"'):''}`).join('');
   garments=[...rack.querySelectorAll('.garment')];render();
  },()=>pieces[current]);
  this.cleanup=()=>{stopUploads();pieces=[];rack.replaceChildren();controller.abort();resize.disconnect();cancelAnimationFrame(frame);clearTimeout(wheelTimer)};
 }
 disconnectedCallback(){this.cleanup?.();this.cleanup=null}
}
customElements.define('wardrobe-rack',WardrobeRack);
