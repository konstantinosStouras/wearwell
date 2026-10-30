import {rackArt} from './rack-art.js?v=20261030-rack-v2';
import {installRackUploads} from './rack-uploads.js?v=20261030-rack-v2';
import {getLanguage,translateText} from './i18n.js?v=20261030-rack-v2';
import {pieces as capsule,looks} from './data.js?v=20261030-rack-v2';
// Isolated rack view with account-scoped local photo storage.
class WardrobeRack extends HTMLElement {
 connectedCallback(){
  this.cleanup?.();
  const thisHost=this,root=this.shadowRoot||this.attachShadow({mode:'open'});
  root.innerHTML='<link rel="stylesheet" href="'+new URL('./wardrobe-rack.css?v=20261030-rack-v2',import.meta.url).href+'">'+"<p class=\"hint\" data-t=\"hint\"></p><section class=\"studio\" aria-label=\"Interactive clothing rack\"><div class=\"rail\"></div><div class=\"rail-end left\"></div><div class=\"rail-end right\"></div><div id=\"rack\" class=\"rack\"></div><span class=\"studio-label\" data-t=\"studio\">FIVE PIECES. MANY POSSIBILITIES.</span><button class=\"close\" id=\"close\" hidden data-t=\"back\">← Back to the rail</button></section>\n<section class=\"details\"><button id=\"previous\" class=\"arrow\" aria-label=\"Previous piece\">←</button><div class=\"piece-info\" aria-live=\"polite\"><p class=\"eyebrow\" id=\"counter\"></p><h2 id=\"name\"></h2><p id=\"description\"></p><button class=\"inspect\" id=\"inspect\" data-t=\"inspect\">Take a closer look ↗</button></div><button id=\"next\" class=\"arrow\" aria-label=\"Next piece\">→</button></section>\n<div id=\"dots\" class=\"dots\" aria-label=\"Choose a piece\"></div>";
  const controller=new AbortController();
  const on=(node,type,handler,options={})=>node.addEventListener(type,handler,{...options,signal:controller.signal});
// Interaction study using five IDs from the existing 40-piece capsule.
const examples=capsule.filter(p=>looks.some(l=>l.pieces.includes(p.id)));
let pieces=examples.map(p=>({...p,canonical:p.name,en:p.name,el:translateText(p.name,'el'),enSub:p.category,elSub:translateText(p.category,'el')}));
const copy={en:{preview:'LOCAL PREVIEW',eyebrow:'THE CAPSULE / AN INTERACTIVE STUDY',title:'A little room for discovery.',hint:'Move across the clothes, or drag the rail.<br>Click a piece to take a closer look.',studio:'FIVE PIECES. MANY POSSIBILITIES.',back:'← Back to the rail',inspect:'Take a closer look ↗',footer:'DayWear Rack — interaction prototype',note:'Illustrated capsule pieces · Drag, tap, or use ← → · Esc to return',previous:'Previous piece',next:'Next piece'},el:{preview:'ΤΟΠΙΚΗ ΠΡΟΕΠΙΣΚΟΠΗΣΗ',eyebrow:'Η ΓΚΑΡΝΤΑΡΟΜΠΑ / ΜΙΑ ΔΙΑΔΡΑΣΤΙΚΗ ΜΕΛΕΤΗ',title:'Λίγος χώρος για ανακάλυψη.',hint:'Κινήστε τον δείκτη πάνω στα ρούχα ή σύρετε.<br>Πατήστε ένα ρούχο για να το δείτε από κοντά.',studio:'ΠΕΝΤΕ ΡΟΥΧΑ. ΠΟΛΛΕΣ ΔΥΝΑΤΟΤΗΤΕΣ.',back:'← Πίσω στην κρεμάστρα',inspect:'Δείτε το από κοντά ↗',footer:'DayWear Rack — διαδραστικό πρωτότυπο',note:'Εικονογραφημένα ρούχα · Σύρετε, πατήστε ή χρησιμοποιήστε ← → · Esc για επιστροφή',previous:'Προηγούμενο ρούχο',next:'Επόμενο ρούχο'}};
let current=0,focused=false,lang=getLanguage()==='el'?'el':'en';
const $=s=>root.querySelector(s),rack=$('#rack');

function garment(p,i){return p.image?'<img class="owned-photo" src="'+p.image+'" alt="" draggable="false">':rackArt(p,i);}
rack.innerHTML=pieces.map((p,i)=>`<button class="garment" data-i="${i}">${garment(p,i)}</button>`).join('');
$('#dots').innerHTML='<input id="piece-range" type="range" min="0" max="'+(pieces.length-1)+'" value="0" step="1">';
// Animate a continuous rail position independently of the selected piece.
let garments=[...root.querySelectorAll('.garment')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let position=0,target=0,velocity=0,frame=0,lastTime=0,zoom=0;
let down=null,dragged=false,hoverEnabled=true,wheelTimer,hoverAnchor=0,hoverX=0;
const clamp=n=>Math.max(0,Math.min(pieces.length-1,n));
const spacing=()=>thisHost.clientWidth<=650?108:180;
function render(){
 pieces.forEach(p=>p.en=p.image?p.name:translateText(p.canonical,getLanguage()));
 thisHost.lang=lang;
 root.querySelectorAll('[data-t]').forEach(el=>el.innerHTML=el.dataset.t==='studio'?(pieces.some(p=>p.image)?(lang==='el'?'ΤΑ ΔΙΚΑ ΣΑΣ ΡΟΥΧΑ':'YOUR OWN CLOTHES'):(lang==='el'?'ΡΟΥΧΑ ΑΠΟ ΤΗ ΣΥΛΛΟΓΗ ΣΤΥΛ':'PIECES FROM THE STYLES COLLECTION')):copy[lang][el.dataset.t]);
 $('.studio').ariaLabel=lang==='el'?'Διαδραστική κρεμάστρα ρούχων':'Interactive clothing rack';
 $('#dots').ariaLabel=lang==='el'?'Επιλέξτε ρούχο':'Choose a piece';
 root.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===lang));
 garments.forEach((b,i)=>{
  b.tabIndex=focused&&i!==current?-1:0;
  b.setAttribute('aria-hidden',focused&&i!==current?'true':'false');
  b.setAttribute('aria-label',pieces[i][lang]);b.setAttribute('aria-pressed',i===current);
 });
 $('#piece-range').max=Math.max(0,pieces.length-1);$('#piece-range').value=current;$('#piece-range').ariaLabel=lang==='el'?'Επιλέξτε ρούχο':'Choose a piece';const p=pieces[current];if(!p)return;$('#counter').textContent=`${String(current+1).padStart(2,"0")} / ${pieces.length}${p.image?'':' — '+p.id}`;
 $('#name').textContent=p[lang];$('#description').textContent=p[lang+'Sub'];
 $('#inspect').hidden=focused;$('#close').hidden=!focused;
 $('#previous').ariaLabel=copy[lang].previous;$('#next').ariaLabel=copy[lang].next;
 $('#previous').disabled=current===0;$('#next').disabled=current===pieces.length-1;
 root.querySelectorAll('[data-index]').forEach((b,i)=>{b.setAttribute('aria-pressed',i===current);b.ariaLabel=pieces[i][lang]});
 wake();
}
function paint(){
 garments.forEach((b,i)=>{
  const d=i-position,proximity=Math.exp(-d*d*2),side=Math.tanh(d*1.5);
  const spread=side*25*(1-zoom);
  const swing=reduced.matches?0:Math.max(-7,Math.min(7,velocity*3));
  b.style.transform=`translateX(calc(-50% + ${d*spacing()*(1+zoom*.5)+spread}px)) translateY(${proximity*zoom*18}px) rotateY(${-side*65*(1-proximity*.3)}deg) rotateZ(${-side*2+swing*(.5+proximity*.5)}deg) scale(${.88+proximity*.12+zoom*proximity*.12})`;
  b.style.opacity=1-zoom*(i===current?0:1);
  b.style.zIndex=String(20-Math.round(Math.abs(d)*3));
  b.style.pointerEvents=focused&&i!==current?'none':'auto';b.style.visibility=Math.abs(d)>4?'hidden':'visible';b.tabIndex=Math.abs(d)>4||focused&&i!==current?-1:0;
 });
}
function animate(time){
 const dt=Math.min((time-lastTime)/1000||1/60,1/30);lastTime=time;
 if(reduced.matches){position=target;velocity=0;zoom=Number(focused)}
 else{
  velocity+=(target-position)*130*dt;velocity*=Math.exp(-20*dt);position+=velocity*dt;
  zoom+=(Number(focused)-zoom)*(1-Math.exp(-13*dt));
 }
 paint();
 if(Math.abs(position-target)>.0005||Math.abs(velocity)>.003||Math.abs(zoom-Number(focused))>.001)frame=requestAnimationFrame(animate);
 else{position=target;zoom=Number(focused);velocity=0;paint();frame=0;lastTime=0;}
}
function wake(){if(!frame)frame=requestAnimationFrame(animate)}
function move(n){if(!pieces.length)return;target=clamp(n);const next=Math.round(target);if(next!==current){current=next;render();root.dispatchEvent(new Event('rack:selection'))}wake()}
function step(d){hoverEnabled=false;move(current+d)}
function inspect(){hoverEnabled=false;focused=true;move(current);render();$('#close').focus({preventScroll:true})}
function close(){focused=false;render();garments[current].focus({preventScroll:true})}
// Stable pointer mapping prevents moving garments from causing hover flicker.
function hover(e){
 if(e.pointerType!=='mouse'||!hoverEnabled||focused)return;
 move(hoverAnchor+(e.clientX-hoverX)/spacing());
}
on(rack,'pointerenter',e=>{hoverEnabled=true;hoverAnchor=target;hoverX=e.clientX});
on(rack,'pointerdown',e=>{
 if(e.button!==0)return;
 down={id:e.pointerId,x:e.clientX,y:e.clientY,start:target,lastX:e.clientX,lastTime:performance.now(),speed:0,locked:false};dragged=false;
});
on(rack,'pointermove',e=>{
 if(!down){hover(e);return}if(e.pointerId!==down.id)return;
 const dx=e.clientX-down.x,dy=e.clientY-down.y;
 if(!down.locked){
  if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8&&e.pointerType!=='mouse'){down=null;return}
  if(Math.abs(dx)<6)return;
  down.locked=true;dragged=true;rack.setPointerCapture(e.pointerId);rack.classList.add('dragging');
  if(focused){focused=false;render()}
 }
 const now=performance.now();down.speed=(e.clientX-down.lastX)/Math.max(8,now-down.lastTime);
 down.lastX=e.clientX;down.lastTime=now;move(down.start-dx/spacing());
});
function release(e,cancelled=false){
 if(!down||e.pointerId!==down.id)return;
 const state=down;down=null;rack.classList.remove('dragging');
 if(rack.hasPointerCapture(e.pointerId))rack.releasePointerCapture(e.pointerId);
 if(state.locked){
  hoverEnabled=false;
  const momentum=cancelled||performance.now()-state.lastTime>100?0:state.speed*140/spacing();
  move(Math.round(clamp(target-momentum)));
 }
}
on(rack,'pointerup',e=>release(e));
on(rack,'pointercancel',e=>release(e,true));
on(rack,'lostpointercapture',e=>release(e,true));
on(rack,'pointerleave',()=>{if(!down){hoverEnabled=true;move(Math.round(target))}});
on(rack,'wheel',e=>{
 if(e.ctrlKey||focused)return;
 const delta=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*(e.deltaMode===1?16:e.deltaMode===2?rack.clientWidth:1);
 if((target===0&&delta<0)||(target===pieces.length-1&&delta>0))return;
 e.preventDefault();hoverEnabled=false;move(target+delta/500);
 clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>move(Math.round(target)),180);
},{passive:false});
on(rack,'click',e=>{
 if(dragged){dragged=false;return}
 const b=e.target.closest('[data-i]');if(!b)return;
 const i=Number(b.dataset.i);hoverEnabled=false;if(i===current)inspect();else move(i);
});
$('#previous').onclick=()=>step(-1);$('#next').onclick=()=>step(1);$('#inspect').onclick=inspect;$('#close').onclick=close;
$('#dots').onclick=e=>{if(e.target.dataset.index!==undefined){hoverEnabled=false;move(Number(e.target.dataset.index))}};

on(thisHost,'keydown',e=>{
 if(e.altKey||e.ctrlKey||e.metaKey||e.composedPath()[0]?.id==='piece-range')return;
 if(e.key==='ArrowRight'){e.preventDefault();step(1)}
 if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}
 if(e.key==='Escape'&&focused)close();
});
on($('#piece-range'),'input',e=>{hoverEnabled=false;move(Number(e.target.value))});
on(reduced,'change',wake);on(window,'resize',wake);render();


  on(document,'wardrobe:language',()=>{lang=getLanguage()==='el'?'el':'en';render()});
  const resize=new ResizeObserver(()=>wake());resize.observe(this);

  const stopUploads=installRackUploads(root,examples,next=>{
   pieces=next.map(p=>({...p,canonical:p.name,en:p.name,el:p.image?p.name:translateText(p.name,'el'),enSub:p.image?'':p.category,elSub:p.image?'':translateText(p.category,'el')}));
   current=position=target=velocity=zoom=0;focused=false;
   rack.innerHTML=pieces.map((p,i)=>'<button class="garment" data-i="'+i+'">'+garment(p,i)+'</button>').join('');
   garments=[...rack.children];render();
  },()=>pieces[current]);
  this.cleanup=()=>{stopUploads();pieces=[];rack.replaceChildren();controller.abort();resize.disconnect();cancelAnimationFrame(frame);clearTimeout(wheelTimer)};
 }
 disconnectedCallback(){this.cleanup?.();this.cleanup=null}
}
customElements.define('wardrobe-rack',WardrobeRack);
