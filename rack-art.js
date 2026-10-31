// Original generated demo garments. These are not owned inventory or added Styles looks.
export const rackExamples=[
 {id:'demo-hoodie',art:'hoodie',name:'Botanical oversized hoodie',el:'Oversized φούτερ με βοτανικό σχέδιο',category:'Heavy cotton · washed ivory',elSub:'Βαμβακερό φούτερ · ιβουάρ'},
 {id:'demo-black-shirt',art:'black-shirt',name:'Washed charcoal overshirt',el:'Ξεβαμμένο ανθρακί πουκάμισο',category:'Denim texture · relaxed fit',elSub:'Υφή τζιν · άνετη γραμμή'},
 {id:'demo-tank',art:'tank',name:'Off Hours distressed tank',el:'Αμάνικο Off Hours με φθορές',category:'Paint-splashed cotton · oversized',elSub:'Βαμβάκι με πιτσιλιές · oversized'},
 {id:'demo-varsity',art:'varsity',name:'After-hours varsity',el:'Κολεγιακό μπουφάν',category:'Wool & leather look · black and ivory',elSub:'Υφή μαλλιού και δέρματος · μαύρο και ιβουάρ'},
 {id:'demo-blue-tee',art:'blue-tee',name:'Blue hour graphic tee',el:'Μπλε T-shirt με γραφικό σχέδιο',category:'Faded blue · heavyweight cotton',elSub:'Ξεβαμμένο μπλε · χοντρό βαμβάκι'},
 {id:'demo-jersey',art:'jersey',name:'Golden match-day jersey',el:'Χρυσοκίτρινη ποδοσφαιρική φανέλα',category:'Vintage sport · yellow and green',elSub:'Ρετρό αθλητικό στιλ · κίτρινο και πράσινο'},
 {id:'demo-white-tee',art:'white-tee',name:'Off-white everyday tee',el:'Καθημερινό υπόλευκο T-shirt',category:'Dropped shoulders · heavyweight cotton',elSub:'Χαμηλοί ώμοι · χοντρό βαμβάκι'},
 {id:'demo-lilac',art:'lilac',name:'Lilac afterglow hoodie',el:'Λιλά φούτερ με φερμουάρ',category:'Washed violet · oversized cotton',elSub:'Ξεβαμμένο βιολετί · oversized βαμβάκι'},
 {id:'demo-coral',art:'coral',name:'Coral coast graphic tee',el:'Κοραλλί T-shirt με γραφικό σχέδιο',category:'Coral & cobalt · heavyweight cotton',elSub:'Κοραλλί και μπλε κοβαλτίου · χοντρό βαμβάκι'}
];
const colours=[['Ivory','Ιβουάρ','#ded8c7'],['Charcoal','Ανθρακί','#333436'],['Charcoal','Ανθρακί','#424341'],['Black','Μαύρο','#242424'],['Blue','Μπλε','#789bbd'],['Yellow','Κίτρινο','#edd134'],['Off-white','Υπόλευκο','#eeeae0'],['Lilac','Λιλά','#a084c1'],['Coral','Κοραλλί','#e96b46']];
rackExamples.forEach((piece,i)=>{const [en,el,swatch]=colours[i];piece.tones=[{en,el,swatch,front:piece.art==='tank'?'tank-front':piece.art,back:piece.art+'-back'}]});
rackExamples[2].tones.push({en:'Sand',el:'Άμμος',swatch:'#c9b696',front:'tank-sand-front',back:'tank-sand-back'});
export const rackImage=name=>new URL('./assets/rack/'+name+'.webp',import.meta.url).href;
export function rackArt(piece){
 const tone=piece.tones[piece.tone||0];
 // Neck positions in the original 640 × 960 photos. Hide only the photographed
 // wire; preserve the wooden shoulders and the complete garment below them.
 const necks={"hoodie":[102,102],"black-shirt":[131,130],"tank":[83,82],"varsity":[111,110],"blue-tee":[121,119],"jersey":[106,103],"white-tee":[119,117],"lilac":[112,109],"coral":[119,118]};
 const [frontNeck,backNeck]=piece.art==='tank'&&piece.tone===1?[84,81]:necks[piece.art];
 const face=(name,side,neck)=>'<img class="demo-photo '+side+'" style="--neck:'+((neck-2)/960*100)+'%" src="'+rackImage(name)+'" alt="" draggable="false" decoding="async">';
 return '<span class="garment-turn">'+face(tone.front,'front-face',frontNeck)+face(tone.back,'back-face',backNeck)+'</span>';
}
export const rackHook='<svg class="hanger-hook" viewBox="0 0 40 64" aria-hidden="true"><path d="M6 19 C6 -3 34 -3 34 17 C34 30 20 30 20 42 L20 64" fill="none" stroke="#686b65" stroke-width="3.2" stroke-linecap="round"/><path d="M6 19 C6 -3 34 -3 34 17 C34 30 20 30 20 42 L20 64" fill="none" stroke="#d4d5cd" stroke-width="1.1" stroke-linecap="round"/></svg>';
