import {getLanguage,translateText} from './i18n.js?v=20261022-tryon-v2';
import {pieces as capsule} from './data.js?v=20261022-tryon-v2';
// Self-contained view: no account state, personal images or new outfits.
class WardrobeRack extends HTMLElement {
 connectedCallback(){
  this.cleanup?.();
  const thisHost=this,root=this.shadowRoot||this.attachShadow({mode:'open'});
  root.innerHTML='<link rel="stylesheet" href="'+new URL('./wardrobe-rack.css?v=20261030-rack-v1',import.meta.url).href+'">'+"<p class=\"hint\" data-t=\"hint\"></p><section class=\"studio\" aria-label=\"Interactive clothing rack\"><div class=\"rail\"></div><div class=\"rail-end left\"></div><div class=\"rail-end right\"></div><div id=\"rack\" class=\"rack\"></div><span class=\"studio-label\" data-t=\"studio\">FIVE PIECES. MANY POSSIBILITIES.</span><button class=\"close\" id=\"close\" hidden data-t=\"back\">← Back to the rail</button></section>\n<section class=\"details\"><button id=\"previous\" class=\"arrow\" aria-label=\"Previous piece\">←</button><div class=\"piece-info\" aria-live=\"polite\"><p class=\"eyebrow\" id=\"counter\"></p><h2 id=\"name\"></h2><p id=\"description\"></p><button class=\"inspect\" id=\"inspect\" data-t=\"inspect\">Take a closer look ↗</button></div><button id=\"next\" class=\"arrow\" aria-label=\"Next piece\">→</button></section>\n<div id=\"dots\" class=\"dots\" aria-label=\"Choose a piece\"></div>";
  const controller=new AbortController();
  const on=(node,type,handler,options={})=>node.addEventListener(type,handler,{...options,signal:controller.signal});
// Interaction study using five IDs from the existing 40-piece capsule.
const pieces=[
 {id:'P01',en:'White heavyweight T-shirt',el:'Λευκό T-shirt από χοντρό βαμβάκι',color:'#e9e7df',dark:'#c4c3b9',type:'tee',enSub:'White · An everyday foundation',elSub:'Λευκό · Η βάση της καθημερινότητας'},
 {id:'P03',en:'Forest linen camp shirt',el:'Λινό πουκάμισο σε πράσινο του δάσους',color:'#566b53',dark:'#2f422e',type:'shirt',enSub:'Forest · Easy summer layers',elSub:'Πράσινο του δάσους · Ανάλαφρες καλοκαιρινές στρώσεις'},
 {id:'P06',en:'Chocolate merino polo',el:'Πόλο merino σε σοκολατί',color:'#685043',dark:'#36271f',type:'polo',enSub:'Chocolate · A softer kind of smart',elSub:'Σοκολατί · Διακριτική κομψότητα'},
 {id:'P09',en:'Oatmeal chunky knit',el:'Χοντρό πλεκτό σε μπεζ της βρώμης',color:'#c7bca4',dark:'#90826d',type:'knit',enSub:'Oatmeal · Texture for colder days',elSub:'Μπεζ της βρώμης · Υφή για τις κρύες μέρες'},
 {id:'P26',en:'Forest cotton overshirt',el:'Βαμβακερό overshirt σε πράσινο του δάσους',color:'#647461',dark:'#354631',type:'jacket',enSub:'Forest · The finishing layer',elSub:'Πράσινο του δάσους · Η τελευταία στρώση'}];
const copy={en:{preview:'LOCAL PREVIEW',eyebrow:'THE CAPSULE / AN INTERACTIVE STUDY',title:'A little room for discovery.',hint:'Move across the clothes, or drag the rail.<br>Click a piece to take a closer look.',studio:'FIVE PIECES. MANY POSSIBILITIES.',back:'← Back to the rail',inspect:'Take a closer look ↗',footer:'DayWear Rack — interaction prototype',note:'Illustrated capsule pieces · Drag, tap, or use ← → · Esc to return',previous:'Previous piece',next:'Next piece'},el:{preview:'ΤΟΠΙΚΗ ΠΡΟΕΠΙΣΚΟΠΗΣΗ',eyebrow:'Η ΓΚΑΡΝΤΑΡΟΜΠΑ / ΜΙΑ ΔΙΑΔΡΑΣΤΙΚΗ ΜΕΛΕΤΗ',title:'Λίγος χώρος για ανακάλυψη.',hint:'Κινήστε τον δείκτη πάνω στα ρούχα ή σύρετε.<br>Πατήστε ένα ρούχο για να το δείτε από κοντά.',studio:'ΠΕΝΤΕ ΡΟΥΧΑ. ΠΟΛΛΕΣ ΔΥΝΑΤΟΤΗΤΕΣ.',back:'← Πίσω στην κρεμάστρα',inspect:'Δείτε το από κοντά ↗',footer:'DayWear Rack — διαδραστικό πρωτότυπο',note:'Εικονογραφημένα ρούχα · Σύρετε, πατήστε ή χρησιμοποιήστε ← → · Esc για επιστροφή',previous:'Προηγούμενο ρούχο',next:'Επόμενο ρούχο'}};
let current=2,focused=false,lang=getLanguage()==='el'?'el':'en';
const $=s=>root.querySelector(s),rack=$('#rack');
pieces.forEach(p=>{p.canonical=capsule.find(item=>item.id===p.id).name});
function garment(p,i){const long=['knit','jacket'].includes(p.type),collar=['shirt','polo','jacket'].includes(p.type);const shape=long?'M76 69 L42 83 17 255 46 262 69 148 65 302 Q115 309 165 302 L161 148 184 262 213 255 188 83 154 69 Q115 90 76 69Z':'M76 69 L43 83 12 133 48 153 67 123 65 298 Q115 306 165 298 L163 123 182 153 218 133 187 83 154 69 Q115 89 76 69Z';return `<svg viewBox="0 0 230 330" aria-hidden="true"><defs><linearGradient id="fabric${i}" x1="0" x2="1"><stop stop-color="${p.dark}"/><stop offset=".15" stop-color="${p.color}"/><stop offset=".44" stop-color="${p.color}"/><stop offset=".66" stop-color="${p.dark}" stop-opacity=".8"/><stop offset=".8" stop-color="${p.color}"/><stop offset="1" stop-color="${p.dark}"/></linearGradient><pattern id="weave${i}" width="${p.type==='knit'?5:3}" height="4" patternUnits="userSpaceOnUse"><path d="M0 0L2 4M3 0L5 4" stroke="white" stroke-opacity=".09" stroke-width=".5"/></pattern><clipPath id="clip${i}"><path d="${shape}"/></clipPath></defs><path d="M115 27V15C115 8 126 8 126 1C126-9 111-10 108-1" fill="none" stroke="#8b918a" stroke-width="2.3"/><path d="M115 25L62 65Q58 71 67 72H164Q172 71 166 65Z" fill="#9a7150" stroke="#795237" stroke-width="2"/><path d="M75 65L115 35 154 65Z" fill="#f7f8f4"/><path d="${shape}" fill="url(#fabric${i})" stroke="${p.dark}" stroke-width=".7"/><path d="${shape}" fill="url(#weave${i})"/><g clip-path="url(#clip${i})" fill="none" stroke="${p.dark}" stroke-opacity=".28"><path d="M73 98Q88 157 75 287M157 98Q140 177 156 286M98 126Q104 207 96 294M133 118Q126 216 135 296" stroke-width="2"/><path d="M67 290Q115 297 165 290M21 135L49 147M184 147L211 135" stroke-width="1"/></g>${collar?`<path d="M77 70L96 61 115 82 133 61 154 70 139 101 115 83 92 101Z" fill="${p.color}" stroke="${p.dark}" stroke-width="1.2"/><path d="M115 84V${p.type==='polo'?141:298}" stroke="${p.dark}" stroke-width="3"/>${Array.from({length:p.type==='polo'?2:6},(_,n)=>`<circle cx="116" cy="${108+n*32}" r="1.7" fill="#d7cbb7"/>`).join('')}${p.type==='jacket'?`<path d="M79 118H104V159Q90 166 79 159ZM129 118H151V159Q140 165 129 159Z" fill="${p.color}" stroke="${p.dark}"/><path d="M79 125H104M129 125H151" stroke="${p.dark}"/>`:''}`:`<path d="M78 70Q114 111 152 70" fill="none" stroke="${p.dark}" stroke-width="8"/><path d="M79 70Q115 101 151 70" fill="none" stroke="${p.color}" stroke-width="5"/>`}${p.type==='knit'?'<path d="M68 286Q115 293 162 286" fill="none" stroke="#978a73" stroke-width="13" stroke-dasharray="1.4 2"/>':''}</svg>`;}
rack.innerHTML=pieces.map((p,i)=>`<button class="garment" data-i="${i}">${garment(p,i)}</button>`).join('');
$('#dots').innerHTML=pieces.map((p,i)=>`<button data-index="${i}"></button>`).join('');
// Animate a continuous rail position independently of the selected piece.
const garments=[...root.querySelectorAll('.garment')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let position=2,target=2,velocity=0,frame=0,lastTime=0,zoom=0;
let down=null,dragged=false,hoverEnabled=true,wheelTimer;
const clamp=n=>Math.max(0,Math.min(pieces.length-1,n));
const spacing=()=>thisHost.clientWidth<=650?108:180;
function render(){
 pieces.forEach(p=>p.en=translateText(p.canonical,getLanguage()));
 thisHost.lang=lang;
 root.querySelectorAll('[data-t]').forEach(el=>el.innerHTML=copy[lang][el.dataset.t]);
 $('.studio').ariaLabel=lang==='el'?'Διαδραστική κρεμάστρα ρούχων':'Interactive clothing rack';
 $('#dots').ariaLabel=lang==='el'?'Επιλέξτε ρούχο':'Choose a piece';
 root.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===lang));
 garments.forEach((b,i)=>{
  b.tabIndex=focused&&i!==current?-1:0;
  b.setAttribute('aria-hidden',focused&&i!==current?'true':'false');
  b.setAttribute('aria-label',pieces[i][lang]);b.setAttribute('aria-pressed',i===current);
 });
 const p=pieces[current];$('#counter').textContent=`0${current+1} / 05 — ${p.id}`;
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
  b.style.pointerEvents=focused&&i!==current?'none':'auto';
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
function move(n){target=clamp(n);const next=Math.round(target);if(next!==current){current=next;render()}wake()}
function step(d){hoverEnabled=false;move(current+d)}
function inspect(){hoverEnabled=false;focused=true;move(current);render();$('#close').focus({preventScroll:true})}
function close(){focused=false;render();garments[current].focus({preventScroll:true})}
// Stable pointer mapping prevents moving garments from causing hover flicker.
function hover(e){
 if(e.pointerType!=='mouse'||!hoverEnabled||focused)return;
 const rect=rack.getBoundingClientRect(),width=Math.min(rect.width-40,spacing()*(pieces.length-1));
 move(((e.clientX-rect.left-(rect.width-width)/2)/width)*(pieces.length-1));
}
on(rack,'pointerenter',()=>{hoverEnabled=true});
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
 if(e.altKey||e.ctrlKey||e.metaKey)return;
 if(e.key==='ArrowRight'){e.preventDefault();step(1)}
 if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}
 if(e.key==='Escape'&&focused)close();
});
on(reduced,'change',wake);on(window,'resize',wake);render();


  on(document,'wardrobe:language',()=>{lang=getLanguage()==='el'?'el':'en';render()});
  const resize=new ResizeObserver(()=>wake());resize.observe(this);
  this.cleanup=()=>{controller.abort();resize.disconnect();cancelAnimationFrame(frame);clearTimeout(wheelTimer)};
 }
 disconnectedCallback(){this.cleanup?.();this.cleanup=null}
}
customElements.define('wardrobe-rack',WardrobeRack);
