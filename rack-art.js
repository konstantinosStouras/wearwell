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
 return '<span class="garment-turn"><img class="demo-photo front-face" src="'+rackImage(tone.front)+'" alt="" draggable="false" decoding="async"><img class="demo-photo back-face" src="'+rackImage(tone.back)+'" alt="" draggable="false" decoding="async"></span>';
}
