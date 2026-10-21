export const breathDuration=44;
export function breathState(seconds:number){const t=Math.max(0,seconds);if(t<2)return {phase:'Ready',count:Math.ceil(2-t),scale:.72,done:false};if(t>=breathDuration)return {phase:'Good job.',count:0,scale:.72,done:true};const cycle=(t-2)%14;let phase:string,count:number,scale:number;
 if(cycle<5){phase='Breathe in';count=Math.ceil(5-cycle);scale=.72+(1-Math.cos(Math.PI*cycle/5))*.14;}
 else if(cycle<7){phase='Hold softly';count=Math.ceil(7-cycle);scale=1;}
 else if(cycle<12){phase='Breathe out';count=Math.ceil(12-cycle);scale=1-(1-Math.cos(Math.PI*(cycle-7)/5))*.14;}
 else{phase='Rest softly';count=Math.ceil(14-cycle);scale=.72;}
 return {phase,count,scale,done:false};}
