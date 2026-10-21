export type SculptureRotation={x:number;y:number};
export const restingRotation={x:-.12,y:-.2};
export function turnSculpture(start:SculptureRotation,dx:number,dy:number):SculptureRotation{return {x:Math.max(-1.35,Math.min(1.35,start.x+dy*.012)),y:start.y+dx*.012};}
export function sculptureBlend(current:number,target:number,delta:number){const next=current+(target-current)*(1-Math.exp(-Math.max(0,Math.min(delta,.1))*3));return Math.abs(next-target)<.001?target:next;}
export function smoothBlend(low:number,high:number,value:number){const t=Math.max(0,Math.min(1,(value-low)/(high-low)));return t*t*(3-2*t);}
