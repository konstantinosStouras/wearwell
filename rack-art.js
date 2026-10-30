// Original generated demo garments. These are not owned inventory or added Styles looks.
export const rackExamples=[
 {id:'demo-hoodie',art:'hoodie',name:'Botanical oversized hoodie',el:'Oversized φούτερ με βοτανικό σχέδιο',category:'Heavy cotton · washed ivory',elSub:'Βαμβακερό φούτερ · ιβουάρ'},
 {id:'demo-black-shirt',art:'black-shirt',name:'Washed charcoal overshirt',el:'Ξεβαμμένο ανθρακί πουκάμισο',category:'Denim texture · relaxed fit',elSub:'Υφή τζιν · άνετη γραμμή'},
 {id:'demo-tank',art:'tank',name:'Slate studio tank',el:'Αμάνικο σε γκρι σχιστόλιθου',category:'Washed cotton · oversized',elSub:'Ξεβαμμένο βαμβάκι · oversized'},
 {id:'demo-varsity',art:'varsity',name:'After-hours varsity',el:'Κολεγιακό μπουφάν',category:'Wool & leather look · black and ivory',elSub:'Υφή μαλλιού και δέρματος · μαύρο και ιβουάρ'},
 {id:'demo-blue-tee',art:'blue-tee',name:'Blue hour graphic tee',el:'Μπλε T-shirt με γραφικό σχέδιο',category:'Faded blue · heavyweight cotton',elSub:'Ξεβαμμένο μπλε · χοντρό βαμβάκι'},
 {id:'demo-jersey',art:'jersey',name:'Golden match-day jersey',el:'Χρυσοκίτρινη ποδοσφαιρική φανέλα',category:'Vintage sport · yellow and green',elSub:'Ρετρό αθλητικό στιλ · κίτρινο και πράσινο'},
 {id:'demo-white-tee',art:'white-tee',name:'Off-white everyday tee',el:'Καθημερινό υπόλευκο T-shirt',category:'Dropped shoulders · heavyweight cotton',elSub:'Χαμηλοί ώμοι · χοντρό βαμβάκι'},
 {id:'demo-lilac',art:'lilac',name:'Lilac afterglow hoodie',el:'Λιλά φούτερ με φερμουάρ',category:'Washed violet · oversized cotton',elSub:'Ξεβαμμένο βιολετί · oversized βαμβάκι'},
 {id:'demo-coral',art:'coral',name:'Coral coast graphic tee',el:'Κοραλλί T-shirt με γραφικό σχέδιο',category:'Coral & cobalt · heavyweight cotton',elSub:'Κοραλλί και μπλε κοβαλτίου · χοντρό βαμβάκι'}
];
export function rackArt(piece){
 const src=new URL('./assets/rack/'+piece.art+'.webp',import.meta.url).href;
 return '<img class="demo-photo" src="'+src+'" alt="" draggable="false" decoding="async">';
}
