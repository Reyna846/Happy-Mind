export type Point={x:number;y:number};
export type StoneFlight={x:number;targetX:number;distance:number;hops:number;at:number;variant:number};
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
export function launchStone(from:Point,to:Point,at:number,variant:number):StoneFlight{
 const pull=to.y>from.y? -1:1;
 const distance=clamp(Math.hypot(to.x-from.x,to.y-from.y),45,145);
 return {x:clamp(from.x,35,265),targetX:clamp(from.x+(to.x-from.x)*pull*.8,30,270),distance,hops:2+Math.floor(distance/40),at,variant};
}
export function stonePosition(stone:StoneFlight,time:number,reduced=false){
 const age=Math.max(0,(time-stone.at)/1000),progress=reduced?stone.hops:Math.min(stone.hops,age/.46);
 const hop=Math.floor(progress),part=progress-hop,landed=progress>=stone.hops;
 return {x:stone.x+(stone.targetX-stone.x)*progress/stone.hops,y:230-stone.distance*progress/stone.hops-(landed?0:Math.sin(part*Math.PI)*(27-hop*3)),angle:reduced||landed?0:progress*210,landed,hop};
}
export function closedLoop(points:Point[]){
 if(points.length<10)return false;
 const first=points[0],last=points.at(-1)!;
 let length=0,area=0;for(let i=1;i<points.length;i++){length+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);area+=points[i-1].x*points[i].y-points[i].x*points[i-1].y;}
 area+=last.x*first.y-first.x*last.y;
 const width=Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x));
 const height=Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y));
 return Math.abs(area)>2400&&length>170&&width>45&&height>45&&Math.hypot(first.x-last.x,first.y-last.y)<28;
}
