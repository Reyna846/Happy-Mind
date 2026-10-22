import {useEffect,useId,useRef,useState} from 'react';
import type {PointerEvent} from 'react';
import {Eyes} from './SillyMomentArt';
import {useMomentSound} from './useMomentSound';

type Point={x:number;y:number};
type Seed=Point&{id:number;vx:number;vy:number};
type Bloom=Point&{id:number;at:number};
type Patch={time:number;wind:number;serial:number;seeds:Seed[];flowers:Bloom[];puffAt:number};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));

export function DandelionPlay({active,sound,volume,pauseSignal,still=false}:{active:boolean;sound:boolean;volume:number;pauseSignal:number;still?:boolean}){
 const id=useId().replace(/:/g,'');
 const world=useRef<Patch>({time:0,wind:0,serial:0,seeds:[],flowers:[],puffAt:-1000});
 const [frame,setFrame]=useState(world.current),[visible,setVisible]=useState(!document.hidden),[systemStill,setSystemStill]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [message,setMessage]=useState('Send a few tiny parachutists. See what grows.');
 const pointer=useRef<number|null>(null),last=useRef(150),play=useMomentSound(active&&sound,volume,pauseSignal),reduced=still||systemStill;
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)'),motion=()=>setSystemStill(media.matches),hide=()=>setVisible(!document.hidden);
  media.addEventListener('change',motion);document.addEventListener('visibilitychange',hide);
  return()=>{media.removeEventListener('change',motion);document.removeEventListener('visibilitychange',hide);};
 },[]);
 useEffect(()=>{pointer.current=null;world.current.wind=0;},[active,visible,pauseSignal]);
 useEffect(()=>{
  const w=world.current;if(!reduced||!w.seeds.length)return;
  w.flowers=[...w.flowers,...w.seeds.map(seed=>({x:seed.x,y:247+(seed.id%3)*5,id:seed.id,at:w.time}))].slice(-9);w.seeds=[];w.wind=0;setFrame({...w});
 },[reduced]);
 useEffect(()=>{
  if(!active||!visible)return;
  let before=performance.now();
  const timer=setInterval(()=>{
   const now=performance.now(),dt=Math.min(120,now-before)/1000;before=now;
   const w=world.current;w.time+=dt*1000;w.wind*=Math.exp(-dt*1.8);
   const flying:Seed[]=[];
   for(const seed of w.seeds){
    const vy=seed.vy+34*dt,vx=(seed.vx+w.wind*80*dt)*Math.exp(-dt*.18);
    const next={...seed,x:clamp(seed.x+vx*dt,20,280),y:seed.y+vy*dt,vx,vy};
    if(next.y>=238){w.flowers=[...w.flowers.slice(-8),{x:next.x,y:247+(seed.id%3)*5,id:seed.id,at:w.time}];}
    else flying.push(next);
   }
   if(w.seeds.length&&flying.length<w.seeds.length)setMessage('A ridiculous little garden. Excellent work, wind.');
   w.seeds=flying;setFrame({...w});
  },50);
  return()=>clearInterval(timer);
 },[active,visible]);
 const puff=(direction=1)=>{
  if(!active||!visible)return;
  const w=world.current;
  const seeds=Array.from({length:4},(_,i)=>({x:145+i*4,y:94+i*2,vx:direction*(10+i*7),vy:-46-i*5,id:++w.serial}));
  if(reduced){w.flowers=[...w.flowers,...seeds.map(seed=>({x:clamp(55+(seed.id*47)%210,25,275),y:247+(seed.id%3)*5,id:seed.id,at:w.time}))].slice(-9);w.seeds=[];}
  else w.seeds=[...w.seeds,...seeds].slice(-16);
  w.puffAt=w.time;w.wind=direction*.65;setFrame({...w});setMessage('They have absolutely no flight training. Drag to steer.');play('clear');
 };
 const point=(event:PointerEvent<SVGSVGElement>):Point=>{
  const svg=event.currentTarget,matrix=svg.getScreenCTM();if(!matrix)return {x:150,y:140};
  const p=svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;const local=p.matrixTransform(matrix.inverse());return {x:clamp(local.x,0,300),y:clamp(local.y,0,280)};
 };
 const reset=()=>{pointer.current=null;world.current={time:0,wind:0,serial:0,seeds:[],flowers:[],puffAt:-1000};setFrame(world.current);setMessage('A fresh patch. Plenty of room for nonsense.');};
 return <div className="nature-moment nature-dandelion" data-active={active&&visible}>
  <h2>Dandelion wishes</h2><p className="intro">Send tiny parachutists. Drag the breeze. Grow a silly garden.</p>
  <svg className="nature-scene" viewBox="0 0 300 280" role="group" tabIndex={0} aria-label="Dandelion garden. Swipe to send seeds, then drag to steer them. Enter or Space sends seeds. Arrow keys steer the breeze."
   onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();puff();}if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();world.current.wind=event.key==='ArrowLeft'?-2:2;}}}
   onPointerDown={event=>{if(!active||pointer.current!==null||(event.pointerType==='mouse'&&event.button!==0))return;pointer.current=event.pointerId;event.currentTarget.setPointerCapture(event.pointerId);const p=point(event);last.current=p.x;puff(p.x<150?-1:1);}}
   onPointerMove={event=>{if(pointer.current!==event.pointerId)return;const p=point(event);world.current.wind=clamp((p.x-last.current)/12,-2.5,2.5);last.current=p.x;}}
   onPointerUp={()=>pointer.current=null} onPointerCancel={()=>{pointer.current=null;world.current.wind=0;}} onLostPointerCapture={()=>pointer.current=null}>
   <defs><linearGradient id={id+'sky'} x2=".3" y2="1"><stop stopColor="#d1c4dd"/><stop offset="1" stopColor="#b3c7c2"/></linearGradient></defs>
   <rect width="300" height="280" fill={`url(#${id}sky)`}/><circle cx="249" cy="46" r="26" fill="#f0dfbd"/>
   <path d="M0 242Q80 216 151 242T300 237V280H0" fill="#8ba68e"/><path d="M0 265Q110 231 300 267V280H0" fill="#7c9982"/>
   <path d={`M145 257Q${165+frame.wind*5} 186 ${150+frame.wind*3} 108M151 220Q117 190 107 205Q124 229 151 231`} fill="none" stroke="#68856e" strokeWidth="4" strokeLinecap="round"/>
   <g transform={`translate(${150+(reduced?0:frame.wind*3)} 97) rotate(${reduced?0:frame.wind*5})`}>
    {Array.from({length:20},(_,i)=>{const a=i*Math.PI/10,x=Math.cos(a)*37,y=Math.sin(a)*37;return <g key={i} fill="none" stroke="#fbf4e5" strokeWidth="1.5"><path d={`M0 10L${x} ${y}m-6-4 6 4 5-6m-5 6v-9`}/><circle cx={x} cy={y} r="2" fill="#fbf4e5"/></g>;})}
    <ellipse cy="7" rx="17" ry="14" fill="#c7aa91"/><g transform="translate(0 7) scale(.5)"><Eyes look={{x:frame.wind,y:1}} sleepy={frame.time-frame.puffAt<380}/><path d="M-4 11q5 6 12 0" fill="none" stroke="#7f6177" strokeWidth="3"/></g>
   </g>
   {frame.seeds.map(seed=><g key={seed.id} className="parachute-seed" transform={`translate(${seed.x} ${seed.y}) rotate(${reduced?0:seed.vx*.3})`}>
    <path d="M0 9V-11m-12-3L0-10l12-7M0-10l-3-10" fill="none" stroke="#fff5df" strokeWidth="1.8" strokeLinecap="round"/>
    <ellipse cy="10" rx="5" ry="7" fill="#ae8c76"/><circle cx="-2" cy="8" r="2.3" fill="#fff9e8"/><circle cx="2" cy="7" r="2.7" fill="#fff9e8"/><circle cx="-2" cy="9" r="1" fill="#5d4a63"/><circle cx="3" cy="8" r="1" fill="#5d4a63"/>
   </g>)}
   {frame.flowers.map(flower=>{const growth=reduced?1:clamp((frame.time-flower.at)/900,.15,1),height=25+flower.id%4*8;return <g key={flower.id} className="wish-bloom" transform={`translate(${flower.x} ${flower.y}) scale(${growth})`}>
    <path d={`M0 0Q-4 -15 0 -${height}`} fill="none" stroke="#536f55" strokeWidth="2.5"/><ellipse cx="7" cy="-11" rx="9" ry="3" transform="rotate(-25 7 -11)" fill="#698361"/>
    <g transform={`translate(0 -${height})`} fill={['#e8bdce','#d7c6e9','#edda9c'][flower.id%3]}>{Array.from({length:5},(_,i)=><ellipse key={i} cy="-8" rx="5" ry="9" transform={`rotate(${i*72})`}/>)}<circle r="7" fill="#c4a187"/><g transform="scale(.3)"><Eyes/><path d="M-4 13q7 4 11-1" fill="none" stroke="#7b5d70" strokeWidth="3"/></g></g>
   </g>;})}
   <g transform={`translate(${242+(reduced?0:Math.sin(frame.time/600)*7)} 91)`} stroke="#8c7388" strokeWidth="1.4"><ellipse cx="-9" cy="-10" rx="9" ry="5" fill="#e7e5e4aa"/><ellipse cx="8" cy="-10" rx="9" ry="5" fill="#e7e5e4aa"/><ellipse rx="13" ry="10" fill="#dfc893"/><path d="M-3-9V9m8-17v16"/><circle cx="10" cy="-3" r="4" fill="#fff9e9"/><circle cx="12" cy="-2" r="1.5" fill="#594a60"/></g>
   <text x="150" y="24" textAnchor="middle" fill="#76637e" fontSize="10">{frame.seeds.length?'the airborne department.':frame.flowers.length?'a garden of extremely small opinions.':'head gardener. no qualifications.'}</text>
  </svg>
  <div className="nature-actions"><button className="secondary" onClick={()=>puff()}>Send a little breeze</button><button className="quiet-link" onClick={reset}>New patch</button></div>
  <p className="nature-status" role="status">{message}</p>
 </div>;
}
