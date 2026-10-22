import {WindowVisitor,IdiotPebble,PondDuck,SillyFirefly} from './SillyMomentArt';
import {launchStone,stonePosition,closedLoop,type StoneFlight} from './moment-play';
import {useEffect,useId,useRef,useState} from 'react';
import type {PointerEvent} from 'react';
import {useMomentSound} from './useMomentSound';
import './nature-moments.css';

export const natureMoments=[
 {id:'dandelion',label:'Dandelion wishes',icon:'✳',sub:'Send seeds into the breeze'},
 {id:'garden',label:'Pocket garden',icon:'❀',sub:'Plant a little, water slowly'},
 {id:'fog',label:'Foggy window',icon:'〰',sub:'Draw on the misted glass'},
 {id:'stones',label:'Skipping stones',icon:'≋',sub:'A pebble, a few ripples'},
 {id:'firefly',label:'Firefly friend',icon:'✧',sub:'A little light beside you'},
] as const;
export type NatureMoment=typeof natureMoments[number]['id'];
type Point={x:number;y:number};
type Flower=Point&{growth:number};
type Trail={points:Point[];at:number;width:number};

const slots=[{x:65,y:215},{x:148,y:228},{x:238,y:210},{x:103,y:166},{x:208,y:163},{x:159,y:112}];
const hints:Record<NatureMoment,string>={
 dandelion:'Swipe across the seeds. Let the breeze take them.',
 garden:'Tap the earth to plant. Hold a flower to water it.',
 fog:'Wipe the glass. Someone very nosy is outside.',
 stones:'Pick a pebble. Drag back and let the little idiot fly.',
 firefly:'Boop his nose. Draw a loop. Stay still and see who visits.',
};

export function NatureMoments({kind,active,sound,volume,pauseSignal,still=false}:{kind:Exclude<NatureMoment,'dandelion'>;active:boolean;sound:boolean;volume:number;pauseSignal:number;still?:boolean}){
 const id=useId().replace(/:/g,'');
 const [systemStill,setSystemStill]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const reduced=still||systemStill;
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setSystemStill(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 const play=useMomentSound(sound&&active,volume,pauseSignal);
 const [time,setTime]=useState(0),[visible,setVisible]=useState(!document.hidden);
 const [flowers,setFlowers]=useState<Flower[]>([]),[trails,setTrails]=useState<Trail[]>([]),[skips,setSkips]=useState<StoneFlight[]>([]);
 const [fly,setFly]=useState<Point>({x:150,y:130}),[resting,setResting]=useState(true);
 const [message,setMessage]=useState('');
 const [wipeSize,setWipeSize]=useState(30);
 const [visitor,setVisitor]=useState(0),[blepUntil,setBlepUntil]=useState(0),[look,setLook]=useState<Point>({x:0,y:0});
 const [pebble,setPebble]=useState(0),[aim,setAim]=useState<Point|null>(null);
 const [bonkUntil,setBonkUntil]=useState(0),[danceUntil,setDanceUntil]=useState(0),[friends,setFriends]=useState(0);
 const flyTrail=useRef<(Point&{at:number})[]>([]),lastSplash=useRef('');
 const lastWipeSound=useRef(-Infinity);
 const pointer=useRef<number|null>(null),start=useRef<Point>({x:0,y:0}),last=useRef<Point>({x:0,y:0}),watering=useRef<number|null>(null),idle=useRef(0);
 const elapsed=useRef(0);
 useEffect(()=>{const change=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',change);return()=>document.removeEventListener('visibilitychange',change);},[]);
 useEffect(()=>{pointer.current=null;watering.current=null;setAim(null);setResting(true);},[active,visible,pauseSignal]);
 useEffect(()=>{
  if(!active||!visible)return;
  let previous=performance.now();
  const timer=setInterval(()=>{
   const now=performance.now(),dt=Math.min(150,now-previous);previous=now;elapsed.current+=dt;setTime(elapsed.current);
   if(kind==='garden'&&watering.current!==null){const index=watering.current;setFlowers(list=>list.map((flower,i)=>i===index?{...flower,growth:Math.min(1,flower.growth+dt/2600)}:flower));}
   if(kind==='firefly'){
    const quiet=elapsed.current-idle.current;
    if(quiet>900)setResting(true);
    setFriends(Math.min(3,Math.max(0,Math.floor((quiet-1500)/1400))));
   }
  },kind==='stones'||kind==='firefly'?40:100);
  return()=>clearInterval(timer);
 },[active,visible,kind]);
 const point=(event:PointerEvent<SVGSVGElement>):Point=>{
  const svg=event.currentTarget,matrix=svg.getScreenCTM();
  if(!matrix)return {x:150,y:140};
  const cursor=svg.createSVGPoint();cursor.x=event.clientX;cursor.y=event.clientY;
  const p=cursor.matrixTransform(matrix.inverse());
  return {x:Math.max(15,Math.min(285,p.x)),y:Math.max(20,Math.min(260,p.y))};
 };

 const tend=(p:Point,hold:boolean)=>{
  let nearest=0;slots.forEach((slot,i)=>{if(Math.hypot(slot.x-p.x,slot.y-p.y)<Math.hypot(slots[nearest].x-p.x,slots[nearest].y-p.y))nearest=i;});
  const slot=slots[nearest],index=flowers.findIndex(f=>f.x===slot.x&&f.y===slot.y);
  if(index>=0){if(hold)watering.current=index;else setFlowers(list=>list.map((flower,i)=>i===index?{...flower,growth:Math.min(1,flower.growth+.35)}:flower));setMessage('A little water. A little growth.');play('water');}
  else{setFlowers(list=>[...list,{...slot,growth:0}]);setMessage('A tiny beginning. Hold your flower to help it grow.');play('step');}
 };
 const skip=(from:Point,to:Point={x:from.x+50,y:from.y-100},variant=pebble)=>{
  const stone=launchStone(from,to,elapsed.current,variant);
  setSkips(list=>[...list.slice(-3),stone]);setPebble((variant+1)%3);setAim(null);
  setMessage(['Sir Plop requests another flight.','The dumpling has no regrets.','Bean has absolutely no idea what happened.'][variant]);play('step');
 };
 useEffect(()=>{
  if(kind!=='stones'||!active||!visible||!skips.length)return;
  const stone=skips.at(-1)!,hop=reduced?stone.hops:Math.floor((time-stone.at)/460);
  if(hop<1||hop>stone.hops)return;
  const key=stone.at+':'+hop;
  if(lastSplash.current!==key){lastSplash.current=key;play('water');}
 },[time,kind,active,visible,reduced,skips]);
 const peek=(p:Point)=>{
  setLook({x:(p.x-150)/22,y:(p.y-152)/22});
  if(Math.hypot(p.x-150,p.y-162)<58){setBlepUntil(elapsed.current+1800);setMessage(['You found the window inspector. Excellent blep.','That is definitely not a cat.','He says this is his window now.'][visitor%3]);if(elapsed.current-lastWipeSound.current>1300){lastWipeSound.current=elapsed.current;play('bubble');}}
 };
 const moveFly=(p:Point)=>{
  const previous=flyTrail.current.at(-1);
  if(!previous||Math.hypot(p.x-previous.x,p.y-previous.y)>5){
   flyTrail.current=[...flyTrail.current.filter(v=>elapsed.current-v.at<5000).slice(-47),{...p,at:elapsed.current}];
   if(closedLoop(flyTrail.current)&&elapsed.current>danceUntil){setDanceUntil(elapsed.current+2200);setMessage('He thinks he is a helicopter.');flyTrail.current=[];play('glow');}
  }
  setFly(p);setResting(false);setFriends(0);idle.current=elapsed.current;
 };
 const boop=()=>{setBonkUntil(elapsed.current+1300);setMessage('bonk. One whole thought has left his head.');play('bubble');idle.current=elapsed.current;};
 const keyboardAction=()=>{
  if(!active||!visible)return;
  if(kind==='garden'){const growing=flowers.find(f=>f.growth<1);tend(growing??slots[flowers.length%slots.length],false);}
  if(kind==='fog'){setTrails(list=>[...list.slice(-19),{width:wipeSize,at:elapsed.current,points:Array.from({length:45},(_,i)=>({x:40+i*5,y:130+Math.sin(i/7)*35}))}]);peek({x:150,y:150});play('draw');}
  if(kind==='stones')skip({x:100+(skips.length*37)%100,y:232});
  if(kind==='firefly')boop();
 };
 const end=(event:PointerEvent<SVGSVGElement>,cancel=false)=>{
  if(pointer.current!==event.pointerId)return;
  pointer.current=null;watering.current=null;setAim(null);
  if(!cancel&&kind==='stones')skip(start.current,last.current,Math.max(0,Math.min(2,Math.round((start.current.x-55)/95))));
 };
 const reset=()=>{pointer.current=null;watering.current=null;setFlowers([]);setTrails([]);setSkips([]);setFly({x:150,y:130});setResting(true);setAim(null);setVisitor(v=>v+1);setBlepUntil(0);setBonkUntil(0);setDanceUntil(0);setFriends(0);flyTrail.current=[];idle.current=elapsed.current;setMessage(kind==='fog'?'Someone else is at the window.':'A fresh little moment.');};
 const aimedStone=aim?launchStone(start.current,aim,0,pebble):null;
 const flyCenter={x:Math.max(48,Math.min(252,fly.x)),y:Math.max(65,Math.min(210,fly.y))};
 const actions={garden:'Plant or water a flower',stones:'Skip a stone',firefly:'Boop the little guy'};
 return <div className={'nature-moment nature-'+kind} data-active={active&&visible}>
  <h2>{natureMoments.find(m=>m.id===kind)!.label}</h2><p className="intro">{hints[kind]}</p>
  <svg className="nature-scene" viewBox="0 0 300 280" role="group" tabIndex={0} aria-label={`${natureMoments.find(m=>m.id===kind)!.label}. ${hints[kind]} Enter or Space also plays.`}
   onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();keyboardAction();}if(kind==='firefly'&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();moveFly({x:Math.max(20,Math.min(280,fly.x+(event.key==='ArrowLeft'?-18:event.key==='ArrowRight'?18:0))),y:Math.max(25,Math.min(250,fly.y+(event.key==='ArrowUp'?-18:event.key==='ArrowDown'?18:0)))});}}}
   onPointerDown={event=>{
    if(!active||!visible||pointer.current!==null||(event.pointerType==='mouse'&&event.button!==0))return;
    pointer.current=event.pointerId;event.currentTarget.setPointerCapture(event.pointerId);const p=point(event);start.current=p;last.current=p;
    if(kind==='garden')tend(p,true);
    if(kind==='fog'){setTrails(list=>[...list.slice(-19),{width:wipeSize,points:[p,{x:p.x+.1,y:p.y}],at:elapsed.current}]);peek(p);play('draw');}
    if(kind==='stones'){setAim(p);setPebble(Math.max(0,Math.min(2,Math.round((p.x-55)/95))));}
    if(kind==='firefly'){if(Math.hypot(p.x-fly.x,p.y-fly.y)<40)boop();else moveFly(p);}
   }}
   onPointerMove={event=>{
    if(!active||!visible)return;
    const p=point(event);
    if(kind==='firefly'&&(event.pointerType==='mouse'||pointer.current===event.pointerId))moveFly(p);
    if(pointer.current!==event.pointerId)return;
    if(kind==='stones')setAim(p);
    if(kind==='fog')peek(p);
    if(kind==='garden'&&Math.hypot(p.x-start.current.x,p.y-start.current.y)>30)watering.current=null;
    if(kind==='fog'&&Math.hypot(p.x-last.current.x,p.y-last.current.y)>3){setTrails(list=>{const trail=list.at(-1);return !trail||trail.points.length>=180?list:[...list.slice(0,-1),{...trail,points:[...trail.points,p],at:elapsed.current}];});}
    last.current=p;
   }} onPointerUp={event=>end(event)} onPointerCancel={event=>end(event,true)} onLostPointerCapture={event=>end(event,true)}>
   <defs>
    <linearGradient id={id+'sky'} x2=".25" y2="1"><stop stopColor={kind==='firefly'?'#292d50':kind==='stones'?'#b9d6d8':'#e8ddef'}/><stop offset="1" stopColor={kind==='firefly'?'#4d526e':kind==='garden'?'#c5cbb0':'#b6c7ca'}/></linearGradient>
    <radialGradient id={id+'light'}><stop stopColor="#fff8be" stopOpacity=".9"/><stop offset="1" stopColor="#fff8be" stopOpacity="0"/></radialGradient>
    <mask id={id+'mist'}><rect width="300" height="280" fill="white"/>{trails.map((trail,i)=><polyline key={i} points={trail.points.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="black" strokeWidth={trail.width} strokeLinecap="round" strokeLinejoin="round" opacity={Math.max(0,1-(time-trail.at)/14000)}/>)}</mask>
   </defs>
   <rect width="300" height="280" fill={`url(#${id}sky)`}/>
   {kind==='garden'&&<>
    <circle cx="242" cy="49" r="28" fill="#fff1c777"/><path d="M0 130Q100 110 300 137V280H0" fill="#9da986"/><path d="M0 153Q120 125 300 155V280H0" fill="#a48d77"/>
    {slots.map((slot,i)=><ellipse key={i} cx={slot.x} cy={slot.y+6} rx="22" ry="7" fill="#6e625c30"/>)}
    {flowers.map((flower,i)=>{const height=18+flower.growth*53,top=flower.y-height;return <g key={i} className="pocket-flower"><path d={`M${flower.x} ${flower.y}Q${flower.x-5} ${top+20} ${flower.x} ${top}`} fill="none" stroke="#496e55" strokeWidth="3"/><ellipse cx={flower.x-8} cy={flower.y-14} rx="10" ry="4" transform={`rotate(28 ${flower.x-8} ${flower.y-14})`} fill="#69865b"/><ellipse cx={flower.x+8} cy={flower.y-22} rx="10" ry="4" transform={`rotate(-28 ${flower.x+8} ${flower.y-22})`} fill="#567952"/><g transform={`translate(${flower.x} ${top}) scale(${.22+flower.growth*.8})`}>{Array.from({length:6},(_,petal)=><ellipse key={petal} cy="-10" rx="6" ry="11" transform={`rotate(${petal*60})`} fill={['#f1c0d2','#dfceef','#f6db9e'][i%3]}/>)}<circle r="5" fill="#a27b51"/></g></g>;})}
   </>}
   {kind==='fog'&&<>
    <rect width="300" height="280" fill="#a6bbad"/>
    <path d="M0 225Q75 173 150 223T300 216V280H0" fill="#8ba08e"/>
    <g stroke="#cbd9d6" strokeWidth="2" opacity=".7">{Array.from({length:14},(_,i)=><path key={i} d={`M${10+i*23} ${10+(i*43)%160}l-4 15`}/>)}</g>
    <WindowVisitor visitor={visitor} look={look} booped={time<blepUntil}/>
    <rect width="300" height="280" fill="#e9e7ee" opacity=".94" mask={`url(#${id}mist)`}/>
    {Array.from({length:9},(_,i)=><g key={i} fill="#fff8"><ellipse cx={20+i*32} cy={25+(i*37)%195} rx="2" ry="4"/></g>)}
    <path d="M0 3H300M3 0V280M297 0V280M0 277H300" stroke="#b398b5" strokeWidth="6"/>
   </>}
   {kind==='stones'&&<>
    <path d="M0 70Q75 40 150 70T300 65V0H0" fill="#819c9d"/>
    <g stroke="#eff8f5" fill="none" opacity=".4">{[105,147,191].map(y=><path key={y} d={`M20 ${y}Q90 ${y-8} 150 ${y}T280 ${y}`}/>)}</g>
    <PondDuck reduced={reduced} startled={!!skips.length&&time-skips.at(-1)!.at<skips.at(-1)!.hops*460+800}/>
    {skips.map((stone,i)=>{
     const position=stonePosition(stone,time,reduced),age=(time-stone.at)/1000;
     return <g className="pebble-flight" key={stone.at+'-'+i} data-hops={stone.hops} data-landed={position.landed}>
      {Array.from({length:stone.hops},(_,n)=>{const t=age-(n+1)*.46;if(t<0||t>2.4)return null;const x=stone.x+(stone.targetX-stone.x)*(n+1)/stone.hops,y=230-stone.distance*(n+1)/stone.hops;return <g key={n}>
       <ellipse cx={x} cy={y} rx={reduced?18:6+t*18} ry={reduced?5:2+t*5} fill="none" stroke="#f5fff5" strokeWidth="1.7" opacity={Math.max(0,1-t/2.4)}/>
       {!reduced&&t<.3&&[0,1,2,3,4].map(drop=><circle key={drop} cx={x+(drop-2)*t*28} cy={y-Math.sin(t/.3*Math.PI)*(8+(drop%2)*8)} r="1.8" fill="#eaf5ed"/>)}
      </g>;})}
      <g transform={`translate(${position.x} ${position.y}) rotate(${position.angle}) scale(.48)`}><IdiotPebble variant={stone.variant} sleepy={position.landed}/></g>
      {position.landed&&age<5&&<text x={position.x} y={position.y-21} textAnchor="middle" fill="#485a61" fontSize="9">{['nailed it.','i am soup now.','again?'][stone.variant]}</text>}
     </g>;
    })}
    <path d="M0 236Q130 212 300 237V280H0" fill="#c2b2a9"/>
    {[55,150,245].map((x,i)=><g key={i} transform={`translate(${x} 249)`}>
     {pebble===i&&<ellipse cy="10" rx="30" ry="15" fill="#fff4" stroke="#fff8" strokeWidth="1.5"/>}
     <g transform={`rotate(${i===1?-8:i===2?9:0}) scale(.66)`}><IdiotPebble variant={i} look={{x:aim?(aim.x-x)/40:0,y:-1}}/></g>
    </g>)}
    {aim&&aimedStone&&<g stroke="#796780" fill="none" strokeWidth="2" strokeLinecap="round"><path strokeDasharray="3 6" d={`M${aimedStone.x} 230Q${(aimedStone.x+aimedStone.targetX)/2} ${175-aimedStone.distance} ${aimedStone.targetX} ${230-aimedStone.distance}`}/><path d={`M${start.current.x} 230L${aim.x} ${aim.y}`}/><g transform={`translate(${aim.x} ${aim.y}) scale(.7)`}><IdiotPebble variant={pebble}/></g></g>}
   </>}
   {kind==='firefly'&&<>
    {Array.from({length:14},(_,i)=><circle key={i} cx={15+(i*47)%275} cy={16+(i*31)%180} r={i%3===0?1.5:.8} fill="#f5ecd0" opacity=".5"/>)}
    <path d="M0 260Q90 210 170 252T300 245V280H0" fill="#313e4d"/>
    <path d="M16 264Q20 211 63 224Q42 251 16 264M250 280Q221 215 283 202Q287 249 250 280" fill="#607f76" stroke="#8b9c85" strokeWidth="1.5"/>
    {flyTrail.current.filter(p=>time-p.at<3500).map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={1.5+i%3*.5} fill="#f1df9d" opacity={Math.max(0,.45-(time-p.at)/7800)}/>)}
    {Array.from({length:friends},(_,i)=><g key={i} className="firefly-visitor" transform={`translate(${Math.max(24,Math.min(276,i===0?flyCenter.x-65:i===1?flyCenter.x+65:flyCenter.x))} ${Math.min(250,i===2?flyCenter.y+72:flyCenter.y+25)}) scale(.48)`}><SillyFirefly look={{x:i===0?2:-2,y:-1}} sleepy={i===2} bonked={false} dancing={false} small lightId={id+'light'} reduced={reduced}/></g>)}
    <g className={'firefly-friend '+(resting?'is-resting':'is-flying')} style={{transform:`translate(${flyCenter.x}px,${flyCenter.y}px)`}}>
     <SillyFirefly look={{x:(last.current.x-fly.x)/20,y:(last.current.y-fly.y)/20}} sleepy={resting&&time>=bonkUntil&&time>=danceUntil} bonked={time<bonkUntil} dancing={time<danceUntil} lightId={id+'light'} reduced={reduced}/>
    </g>
    <text x="150" y="27" textAnchor="middle" fill="#e5dfcc" fontSize="10">{time<danceUntil?'HELICOPTER MODE':time<bonkUntil?'one brain cell. briefly unavailable.':friends?'the entire committee has arrived.':resting?'thinking about absolutely nothing.':'doing his very best.'}</text>
   </>}

  </svg>
  <div className="nature-actions">{kind==='fog'?<fieldset className="wipe-sizes"><legend>Wipe size</legend>{([{label:'Small',width:15},{label:'Medium',width:30},{label:'Large',width:55}] as const).map(size=><button key={size.width} aria-label={size.label+' wipe'} aria-pressed={wipeSize===size.width} onClick={()=>setWipeSize(size.width)}><span aria-hidden="true" style={{width:6+size.width/5,height:6+size.width/5}}/>{size.label}</button>)}</fieldset>:<button className="secondary" onClick={keyboardAction}>{actions[kind]}</button>}<button className="quiet-link" onClick={reset}>{kind==='fog'?'Who’s next?':'Start fresh'}</button></div>
  <p className="nature-status" role="status">{message||'No hurry. Nothing to get right.'}</p>
 </div>;
}
