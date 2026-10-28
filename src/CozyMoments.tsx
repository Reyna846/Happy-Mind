import {useRetainedState,useRetainedRef} from './SessionMemory';
import {useEffect,useId,useRef,useState} from 'react';
import type {PointerEvent} from 'react';
import {Eyes} from './SillyMomentArt';
import {useMomentSound} from './useMomentSound';
import './nature-moments.css';
import './cozy-moments.css';

export const cozyMoments=[
 {id:'sleepy',label:'Sleepy creature',icon:'☾',sub:'Pet a very sleepy little loaf'},
 {id:'boat',label:'Paper boat',icon:'⌁',sub:'A few folds, a little voyage'},
 {id:'clouds',label:'Cloud shapes',icon:'☁',sub:'Stretch a cloud into something silly'},
] as const;
export type CozyMoment=typeof cozyMoments[number]['id'];
type Point={x:number;y:number};
type Wake=Point&{at:number};
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const foldHints=['Swipe up to fold the paper in half.','Swipe inward to fold the corners.','Swipe up to turn up the little brim.','Pull sideways to open your boat.'];
const cloudNames=['a highly qualified potato','a cloud with rabbit ambitions','a whale with nowhere to be'];

export function CozyMoments({kind,active,sound,volume,pauseSignal,still=false}:{kind:CozyMoment;active:boolean;sound:boolean;volume:number;pauseSignal:number;still?:boolean}){
 const id=useId().replace(/:/g,'');
 const [systemStill,setSystemStill]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [visible,setVisible]=useState(!document.hidden),[time,setTime]=useRetainedState('cozy:'+kind+':time',0);
 const reduced=still||systemStill;
 const play=useMomentSound(sound&&active,volume,pauseSignal);
 const clock=useRetainedRef('cozy:'+kind+':clock',0),pointer=useRef<number|null>(null),start=useRef<Point>({x:150,y:140}),last=useRef<Point>({x:150,y:140});
 const [message,setMessage]=useRetainedState('cozy:'+kind+':message',''),[touch,setTouch]=useState<Point|null>(null);
 const [settled,setSettled]=useRetainedState('cozy:'+kind+':settled',0),[sneezeUntil,setSneezeUntil]=useRetainedState('cozy:'+kind+':sneezeUntil',0),[blanket,setBlanket]=useRetainedState('cozy:'+kind+':blanket',false);
 const [fold,setFold]=useRetainedState('cozy:'+kind+':fold',0),[sailing,setSailing]=useRetainedState('cozy:'+kind+':sailing',false),[paper,setPaper]=useRetainedState('cozy:'+kind+':paper',0),[boat,setBoat]=useRetainedState<Point>('cozy:'+kind+':boat',{x:150,y:185}),[wakes,setWakes]=useRetainedState<Wake[]>('cozy:'+kind+':wakes',[]);
 const boatRef=useRetainedRef<Point>('cozy:'+kind+':boatRef',{x:150,y:185}),destination=useRetainedRef<Point>('cozy:'+kind+':destination',{x:150,y:185}),lastWake=useRetainedRef('cozy:'+kind+':lastWake',0),lastQuack=useRef(-Infinity);
 const [cloud,setCloud]=useRetainedState('cozy:'+kind+':cloud',0),[stretch,setStretch]=useRetainedState('cozy:'+kind+':stretch',{x:1,y:1}),[look,setLook]=useRetainedState<Point>('cozy:'+kind+':look',{x:0,y:0});
 const initialStretch=useRef({x:1,y:1}),lastCloudMove=useRef(0);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)'),motion=()=>setSystemStill(media.matches),visibility=()=>setVisible(!document.hidden);
  media.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);
  return()=>{media.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 useEffect(()=>{pointer.current=null;setTouch(null);destination.current=boatRef.current;},[active,visible,pauseSignal]);
 useEffect(()=>{
  if(!active||!visible)return;
  let previous=performance.now();
  const timer=setInterval(()=>{
   const now=performance.now(),dt=Math.min(150,now-previous);previous=now;clock.current+=dt;setTime(clock.current);
   if(kind==='boat'&&sailing){
    const current=boatRef.current,target=destination.current,factor=reduced?1:1-Math.exp(-dt/400);
    const next={x:current.x+(target.x-current.x)*factor,y:current.y+(target.y-current.y)*factor};
    if(Math.hypot(next.x-current.x,next.y-current.y)>.08){boatRef.current=next;setBoat(next);}
   }
  },60);
  return()=>clearInterval(timer);
 },[kind,active,visible,sailing,reduced]);
 const point=(event:PointerEvent<SVGSVGElement>)=>{
  const svg=event.currentTarget,matrix=svg.getScreenCTM();if(!matrix)return {x:150,y:140};
  const cursor=svg.createSVGPoint();cursor.x=event.clientX;cursor.y=event.clientY;const p=cursor.matrixTransform(matrix.inverse());
  return {x:clamp(p.x,15,285),y:clamp(p.y,20,260)};
 };
 const pet=(amount=.2)=>{
  setSettled(current=>clamp(current+amount,0,1));
  setMessage(settled>.8?'A small loaf. A very big nap.':settled>.45?'The eyelids are getting very heavy.':'Excellent. You found the off switch.');
 };
 const foldPaper=()=>{if(fold>=4)return;setFold(v=>Math.min(4,v+1));setMessage(fold===3?'Seaworthy? Emotionally, yes.':'A little fold. Looking more boat-ish.');play('draw');};
 const sailTo=(p:Point)=>{
  const next={x:clamp(p.x,40,260),y:clamp(p.y,100,215)};destination.current=next;
  if(clock.current-lastWake.current>100){lastWake.current=clock.current;setWakes(list=>[...list.filter(w=>clock.current-w.at<2200).slice(-14),{...boatRef.current,at:clock.current}]);}
  if(Math.hypot(next.x-240,next.y-130)<48&&clock.current-lastQuack.current>1800){lastQuack.current=clock.current;setMessage('The duck has appointed himself harbourmaster.');play('water');}
 };
 const action=()=>{
  if(!active||!visible)return;
  if(kind==='sleepy'){if(settled>=1){setBlanket(v=>!v);setMessage(blanket?'One foot out. Perfect temperature.':'Tucked in. Dreaming of soup.');}else pet(.22);play('step');}
  if(kind==='boat'){
   if(fold<4)foldPaper();
   else if(!sailing){setSailing(true);setMessage('Captain Snail is taking this very seriously.');play('water');}
   else{sailTo({x:boat.x<150?245:55,y:120+(paper%3)*25});play('clear');setMessage('A tiny breeze. An enormous expedition.');}
  }
  if(kind==='clouds'){setCloud(v=>(v+1)%3);setStretch({x:1,y:1});lastCloudMove.current=clock.current;setMessage('Found '+cloudNames[(cloud+1)%3]+'.');play('glow');}
 };
 const reset=()=>{
  pointer.current=null;setTouch(null);setSettled(0);setBlanket(false);setSneezeUntil(0);setFold(0);setSailing(false);setPaper(v=>v+1);
  const dock={x:150,y:185};setBoat(dock);boatRef.current=dock;destination.current=dock;setWakes([]);lastQuack.current=-Infinity;lastWake.current=0;setLook({x:0,y:0});setCloud(0);setStretch({x:1,y:1});lastCloudMove.current=clock.current;setMessage('A fresh little moment.');
 };
 const end=(event:PointerEvent<SVGSVGElement>,cancel=false)=>{
  if(pointer.current!==event.pointerId)return;pointer.current=null;setTouch(null);
  if(cancel)return;
  if(kind==='boat'&&!sailing&&fold<4&&Math.hypot(last.current.x-start.current.x,last.current.y-start.current.y)>18)foldPaper();
  if(kind==='boat'&&sailing){const dx=last.current.x-start.current.x,dy=last.current.y-start.current.y;sailTo({x:last.current.x+dx*.5,y:last.current.y+dy*.5});play('water');}
  if(kind==='clouds'){setMessage(stretch.x>1.25?'A cloud sausage. No further questions.':stretch.y>1.15?'A very tall thought.':'A perfectly unreasonable cloud.');play('glow');}
 };
 const asleep=settled>=1,heavy=settled>.5,sneezing=time<sneezeUntil;
 const birds=kind==='clouds'&&time-lastCloudMove.current>2400;
 const title=cozyMoments.find(m=>m.id===kind)!.label;
 const hint=kind==='sleepy'?'Stroke the little loaf. Boop the nose for a tiny snorf.':kind==='boat'?(sailing?'Guide your boat. Say hello to the duck.':fold<4?foldHints[fold]:'Your boat is ready. Set it afloat.'):'Pull the edges. Stretch a very silly cloud.';
 const label=kind==='sleepy'?(asleep?(blanket?'One foot out':'Tuck the loaf in'):'Pet the little loaf'):kind==='boat'?(fold<4?['Fold in half','Fold the corners','Turn up the brim','Open the boat'][fold]:sailing?'A little breeze':'Set it afloat'):'Find another shape';
 const paperColour=['#f0cfda','#d1c9eb','#f0dda9'][paper%3];
 return <div className={'nature-moment cozy-moment cozy-'+kind} data-active={active&&visible}>
  <h2>{title}</h2><p className="intro">{hint}</p>
  <svg className="nature-scene cozy-scene" viewBox="0 0 300 280" tabIndex={0} role="group" aria-label={`${title}. ${hint} Enter or Space also plays.${kind==='clouds'?' Arrow keys stretch the cloud.':kind==='boat'?' Arrow keys steer while sailing.':''}`}
   onKeyDown={event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();action();}
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
     event.preventDefault();const dx=event.key==='ArrowLeft'?-.12:event.key==='ArrowRight'?.12:0,dy=event.key==='ArrowUp'?.12:event.key==='ArrowDown'?-.12:0;
     if(kind==='clouds'){setStretch(s=>({x:clamp(s.x+dx,.65,1.5),y:clamp(s.y+dy,.65,1.35)}));lastCloudMove.current=clock.current;}
     if(kind==='boat'&&sailing)sailTo({x:destination.current.x+dx*180,y:destination.current.y-dy*180});
    }
   }}
   onPointerDown={event=>{
    if(!active||!visible||pointer.current!==null||(event.pointerType==='mouse'&&event.button!==0))return;
    pointer.current=event.pointerId;event.currentTarget.setPointerCapture(event.pointerId);const p=point(event);start.current=p;last.current=p;setTouch(p);initialStretch.current=stretch;
    if(kind==='sleepy'){if(Math.hypot(p.x-(asleep?105:150),p.y-(asleep?175:157))<20){setSneezeUntil(clock.current+900);setMessage('snorf. A dignified woodland creature.');play('bubble');}else play('step');}
    if(kind==='boat'&&sailing)sailTo(p);
    if(kind==='clouds'){lastCloudMove.current=clock.current;play('glow');}
   }}
   onPointerMove={event=>{
    if(pointer.current!==event.pointerId)return;const p=point(event),distance=Math.hypot(p.x-last.current.x,p.y-last.current.y);setTouch(p);
    if(kind==='sleepy'&&p.x>50&&p.x<250&&p.y>100&&p.y<240&&distance>2)pet(Math.min(distance,22)/700);
    if(kind==='boat'&&sailing)sailTo(p);
    if(kind==='clouds'){
     const dx=p.x-start.current.x,dy=p.y-start.current.y;
     setStretch({x:clamp(initialStretch.current.x+dx*(start.current.x>=150?1:-1)/110,.65,1.5),y:clamp(initialStretch.current.y+dy*(start.current.y>=140?1:-1)/110,.65,1.35)});
     setLook({x:(p.x-150)/30,y:(p.y-140)/25});lastCloudMove.current=clock.current;
    }
    last.current=p;
   }} onPointerUp={event=>end(event)} onPointerCancel={event=>end(event,true)} onLostPointerCapture={event=>end(event,true)}>
   <defs><linearGradient id={id+'sky'} x2=".4" y2="1"><stop stopColor={kind==='sleepy'?'#8d89ad':kind==='boat'?'#c8dce0':'#babbdc'}/><stop offset="1" stopColor={kind==='sleepy'?'#c4a9bc':kind==='boat'?'#9abac0':'#e4d5e5'}/></linearGradient><radialGradient id={id+'glow'}><stop stopColor="#fff9dd" stopOpacity=".65"/><stop offset="1" stopColor="#fff9dd" stopOpacity="0"/></radialGradient></defs>
   <rect width="300" height="280" fill={`url(#${id}sky)`}/>
   {kind==='sleepy'&&<>
    <circle cx="242" cy="49" r="26" fill="#f4e5c6"/><circle cx="251" cy="41" r="24" fill="#9390b1"/>
    {[30,75,123,186].map((x,i)=><path key={x} d={`M${x} ${35+i%2*27}v7m-3-3h6`} stroke="#f5e4d0" strokeWidth="1.2"/>)}
    <ellipse cx="150" cy="235" rx="118" ry="27" fill="#a186a6"/><ellipse cx="150" cy="229" rx="106" ry="24" fill="#e3c4d5" stroke="#94758f" strokeWidth="2"/>
    <g className={'sleepy-loaf'+(asleep?' is-asleep':'')+(sneezing?' is-snorfing':'')} data-asleep={asleep} style={{transform:reduced?'none':`translate(0,${asleep?Math.sin(time/900)*1.5:0}px)`}}>
     <path d={asleep?'M65 216Q47 161 98 155Q102 126 159 137Q222 134 238 193Q257 237 173 240Q91 244 65 216Z':'M63 209Q48 149 88 133L88 99 122 122Q167 104 193 125L224 105 221 151Q249 181 236 215Q211 245 135 239Q72 243 63 209Z'} fill="#c9bdab" stroke="#756877" strokeWidth="3" strokeLinejoin="round"/>
     <path d="M80 193q-36-15-31 17q5 21 29 4" fill="#c9bdab" stroke="#756877" strokeWidth="3"/>
     <ellipse cx="108" cy="232" rx="20" ry="8" fill="#b5a796"/><ellipse cx="202" cy="231" rx="16" ry="9" fill="#b5a796"/>
     <g transform={`translate(${asleep?105:150} ${asleep?175:156})`}>
      <Eyes look={{x:touch?(touch.x-150)/30:0,y:touch?(touch.y-150)/30:0}} sleepy={heavy||sneezing}/>
      <path d="M-5 2 5 3 0 8Z" fill="#9c758c"/><path d={sneezing?'M-8 17q8-12 16 0':asleep?'M-5 16q6 4 11-1':'M-9 16q9 7 18-1'} stroke="#756877" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {!heavy&&<path d="M3 19v8q7 3 7-7" fill="#d897ab"/>}
     </g>
     {blanket&&<path d="M114 190Q183 170 239 199L232 235Q183 254 113 236Z" fill="#ad98c4" stroke="#8d749f" strokeWidth="2"/>}
     {blanket&&<path d="M131 206h88m-86 15h86" stroke="#d3c0e0" strokeWidth="3" strokeDasharray="5 9"/>}
    </g>
    {touch&&<g transform={`translate(${touch.x} ${touch.y})`} fill="none" stroke="#fff4e7" strokeWidth="2" strokeLinecap="round"><path d="M-13-9q13-8 26 0m-10-8 8 2"/></g>}
    {sneezing&&<text x="210" y="120" fill="#645067" fontSize="15" transform="rotate(12 210 120)">snorf!</text>}
    {asleep&&<><text x="225" y="137" fill="#fff0dc" fontSize="21">z</text><text x="244" y="112" fill="#fff0dc" fontSize="12">z</text><text x="150" y="47" fill="#f7eadc" textAnchor="middle" fontSize="10">{blanket?'dreaming of soup.':'not available for meetings.'}</text></>}
   </>}
   {kind==='boat'&&<>
    <path d="M0 75Q70 55 140 78T300 68V0H0" fill="#839fa0"/><path d="M0 266Q120 230 300 264V280H0" fill="#b6a69c"/>
    {[118,166,217].map(y=><path key={y} d={`M12 ${y}q75-9 145 0t130 0`} fill="none" stroke="#eff7ef" strokeWidth="1.5" opacity=".45"/>)}
    <g transform="translate(240 130)" stroke="#766274" strokeWidth="1.5"><ellipse cy="15" rx="23" ry="5" fill="#f4f5dd55" stroke="none"/><path d="M-20 0q21 12 20-9q-5-19 10-18q15 3 9 20q9 22-17 24q-18 0-22-17Z" fill="#e7ce96"/><path d="M20-14h12l-12 7" fill="#c89073"/><circle cx="10" cy="-17" r="5" fill="#fff8e9"/><circle cx={time-lastQuack.current<1600?12:9} cy="-16" r="2" fill="#62495c"/>{time-lastQuack.current<1600&&<text x="-20" y="-17" stroke="none" fill="#68566a" fontSize="11">quack.</text>}</g>
    {sailing?<>
     {wakes.map((w,i)=><ellipse key={i} cx={w.x} cy={w.y+19} rx={reduced?20:12+(time-w.at)/90} ry={reduced?5:3+(time-w.at)/330} fill="none" stroke="#eff8f0" strokeWidth="1.4" opacity={Math.max(0,.6-(time-w.at)/3200)}/>)}
     <g className="paper-sailor" data-sailing="true" transform={`translate(${boat.x} ${boat.y+(reduced?0:Math.sin(time/600)*2)}) rotate(${reduced?0:Math.sin(time/850)*3})`}>
      <path d="M-48 0H49L29 24H-26Z" fill={paperColour} stroke="#9b829c" strokeWidth="2"/><path d="M-31 0 3-40 31 0Z" fill="#f9edeb" stroke="#b69eb4" strokeWidth="2"/><path d="M3-40 3 0H31" fill={paperColour} stroke="#b69eb4" strokeWidth="1.5"/>
      <g transform="translate(-11 -4)" stroke="#826f87" strokeWidth="1.5"><path d="M-9 0h22q9-2 7-9l-1-9m-5 4 3-11" fill="none"/><circle cx="-5" cy="-7" r="9" fill="#bcaccc"/><path d="M-5-11q-7 0-4 6q4 4 6-1" fill="none"/><circle cx="19" cy="-20" r="2.5" fill="#fff9e7"/><circle cx="17" cy="-25" r="2.5" fill="#fff9e7"/></g>
     </g>
    </>:<g className="paper-fold" key={fold} data-fold={fold} transform="translate(150 150)" stroke="#a48b9f" strokeWidth="2" strokeLinejoin="round">
     <ellipse cy="70" rx="95" ry="12" fill="#6b738126" stroke="none"/>
     {fold===0?<><path d="M-91-54H91V63H-91Z" fill={paperColour}/><path d="M-88 5H88" strokeDasharray="5 7"/><path d="m-12 43 12-18 12 18m-12-18v29" fill="none" stroke="#91718f"/></>:fold===1?<><path d="M-91 0H91V63H-91Z" fill={paperColour}/><path d="M-85 7 0 54 85 7M0 0V63" strokeDasharray="5 7" fill="none"/></>:fold===2?<><path d="M-85 50 0-41 85 50Z" fill={paperColour}/><path d="M0-40V50" fill="none" strokeDasharray="4 6"/><path d="M-88 50H88V64H-88Z" fill="#f7e6e5"/></>:fold===3?<><path d="M-88 42 0-45 88 42Z" fill={paperColour}/><path d="M-88 42H88L68 65H-68Z" fill="#f7e6e5"/><path d="M-68 64 0 11 68 64" fill="none" strokeDasharray="5 7"/></>:<><path d="M-88 13H88L49 61H-48Z" fill={paperColour}/><path d="M-48 13 5-52 51 13Z" fill="#f9edeb"/><path d="M5-52V13H51" fill={paperColour}/><path d="M-17 32q5 6 10 0m15 0q5 6 10 0" stroke="#8d738f" fill="none"/></>}
     <text x="0" y="91" textAnchor="middle" fill="#66586e" stroke="none" fontSize="10">{fold<4?['one small piece of possibility.','an excellent paper sandwich.','a hat? keep going.','a very promising hat.'][fold]:'a boat! probably.'}</text>
    </g>}
   </>}
   {kind==='clouds'&&<>
    <circle cx="246" cy="46" r="27" fill="#f5e5c4"/><circle cx="241" cy="43" r="2" fill="#bca58e"/><circle cx="251" cy="41" r="2.5" fill="#bca58e"/>
    <path d="M-30 232q38-28 57 1q25-20 39 6q14-2 16 13H-30M228 250q22-32 46-7q25-12 43 9v28h-89Z" fill="#eee5f0" opacity=".55"/>
    <g className="stretch-cloud" data-cloud={cloud} data-stretch-x={stretch.x.toFixed(2)} data-stretch-y={stretch.y.toFixed(2)} transform={`translate(150 143) scale(${stretch.x} ${stretch.y})`} fill="#f5edf1" stroke="#c6b5d0" strokeWidth="2.2" strokeLinejoin="round">
     {cloud===0?<path d="M-70 30Q-105 27-87 0Q-96-29-62-32Q-50-65-19-43Q10-68 31-39Q70-56 73-20Q107-12 85 17Q93 46 57 43H-49Q-63 45-70 30Z"/>:cloud===1?<><path d="M-51-20Q-78-101-49-100Q-29-100-29-33M15-33Q17-111 43-96Q58-88 35-18"/><path d="M-69 31Q-93 10-67-18Q-41-45-12-29Q36-51 68-19Q93 2 68 31Q33 51-10 36Q-43 50-69 31Z"/></>:<><path d="M-81 0Q-57-48-10-36Q35-40 57-15L85-38 92-9 69 7Q63 48 7 45Q-58 55-81 0Z"/><path d="M-12-36q-8-24 7-31q8 18 21 26"/></>}
     <g transform={`translate(${cloud===2?-30:0} 5) scale(.85)`}><Eyes look={look}/><path d="M-6 15q7 5 16-1" fill="none" stroke="#9c86a9" strokeWidth="2"/><path d="M2 18v9q7 4 8-6" fill="#dfa8c0" stroke="none"/></g>
     {birds&&<g transform="translate(39 -43) scale(.8)" fill="#b1a0b8" stroke="#8f7d9a"><ellipse rx="9" ry="6"/><circle cx="6" cy="-6" r="5"/><path d="m11-7 7 3-7 2" fill="#d4af9d"/><circle cx="7" cy="-7" r="1.2" fill="#67546e" stroke="none"/><path d="M-3 5v5m7-4v5"/></g>}
    </g>
    <text x="150" y="263" textAnchor="middle" fill="#86758e" fontSize="10">{touch?'extremely serious cloud science.':birds?'a bird has approved your cloud.':cloudNames[cloud]}</text>
   </>}
  </svg>
  <div className="nature-actions"><button className="secondary" onClick={action}>{label}</button><button className="quiet-link" onClick={reset}>{kind==='boat'?'Fold another':'Start fresh'}</button></div>
  <p className="nature-status" role="status">{message||'No hurry. Nothing to get right.'}</p>
 </div>;
}
