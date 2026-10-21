import {useEffect,useId,useRef,useState} from 'react';
type Point={x:number;y:number;t:number};
export function SwipeTrail({contact,active}:{contact:{x:number;y:number}|null;active:boolean}){
 const id=useId().replace(/:/g,''),target=useRef(contact),head=useRef(contact),history=useRef<Point[]>([]);
 target.current=contact;
 const [points,setPoints]=useState<Point[]>([]);
 useEffect(()=>{
  if(document.documentElement.dataset.still==='true'||window.matchMedia('(prefers-reduced-motion: reduce)').matches){history.current=[];setPoints([]);return;}
  let frame=0,last=performance.now(),cancelled=false;
  if(active&&target.current){head.current={...target.current};history.current=[];}
  const tick=(now:number)=>{
   const dt=Math.min(40,now-last);last=now;
   if(active&&target.current){const dest=target.current,h=head.current??dest,k=1-Math.exp(-dt/32);head.current={x:h.x+(dest.x-h.x)*k,y:h.y+(dest.y-h.y)*k};const prev=history.current.at(-1);if(!prev||Math.hypot(head.current.x-prev.x,head.current.y-prev.y)>1.2)history.current.push({...head.current,t:now});}
   history.current=history.current.filter(p=>now-p.t<380).slice(-28);
   if(!cancelled)setPoints([...history.current]);
   if(!cancelled&&(active||history.current.length))frame=requestAnimationFrame(tick);
  };
  if(active||history.current.length)frame=requestAnimationFrame(tick);else setPoints([]);
  return()=>{cancelled=true;cancelAnimationFrame(frame);};
 },[active]);
 if(points.length<2)return null;
 const end=points.at(-1)!,fade=Math.min(1,Math.max(0,(380-(performance.now()-end.t))/180));
 return <svg className="swipe-ribbon" aria-hidden="true"><defs><linearGradient id={id} x1="0" x2="1"><stop stopColor="#cab0ed"/><stop offset=".6" stopColor="#f5e7ff"/><stop offset="1" stopColor="#fff9ee"/></linearGradient></defs>{points.slice(1).map((p,i)=>{const previous=points[i],next=points[i+2]??p,f=(i+1)/points.length,start=i===0?previous:{x:(previous.x+p.x)/2,y:(previous.y+p.y)/2};return <path key={p.t} d={`M${start.x} ${start.y}Q${p.x} ${p.y} ${(p.x+next.x)/2} ${(p.y+next.y)/2}`} stroke={`url(#${id})`} strokeWidth={.7+f*4} opacity={f*.72*fade} fill="none" strokeLinecap="round"/>;})}<circle cx={end.x} cy={end.y} r={3.5*fade} fill="#fff7eb"/>{points.filter((_,i)=>i%7===0).map((p,i)=><circle key={p.t} cx={p.x} cy={p.y-6-Math.sin(i)*4} r={1+i*.2} fill="#fff6f7" opacity={.55*fade}/>)}</svg>;
}
