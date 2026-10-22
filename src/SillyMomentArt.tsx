import type {CSSProperties} from 'react';
export type Spot={x:number;y:number};
const clamp=(v:number)=>Math.max(-3,Math.min(3,v));

export function Eyes({look={x:0,y:0},sleepy=false}:{look?:Spot;sleepy?:boolean}){
 return <g className="silly-eyes" stroke="#49394e" strokeWidth="1.8">
  {sleepy?<><path d="M-19-6q7 7 14 0M5-8q8 7 16-1" fill="none" strokeLinecap="round"/></>:<>
   <ellipse cx="-12" cy="-8" rx="9" ry="11" fill="#fffaf0"/><ellipse cx="13" cy="-10" rx="11" ry="13" fill="#fffaf0"/>
   <circle cx={-12+clamp(look.x)} cy={-6+clamp(look.y)} r="3.7" fill="#49394e"/><circle cx={13+clamp(look.x)} cy={-9+clamp(look.y)} r="4.5" fill="#49394e"/>
  </>}
 </g>;
}

export function WindowVisitor({visitor,look,booped}:{visitor:number;look:Spot;booped:boolean}){
 const kind=visitor%3;
 return <g className="window-visitor" data-visitor={kind} transform="translate(150 162)" stroke="#68506b" strokeWidth="2.5" strokeLinejoin="round">
  <ellipse cy="93" rx="60" ry="13" fill="#85718b33" stroke="none"/>
  <path d="M-39 83Q-64 21-28 9Q17-12 39 36L46 89" fill={kind===0?'#cfabc1':kind===1?'#e6cc87':'#acbea0'}/>
  {kind===0?<path d="M-43-9-49-59-14-41Q10-49 28-37L52-61 48-3Q48 37 4 40Q-40 43-43-9Z" fill="#e5c6cf"/>:kind===1?<><path d="M-42-10Q-45-49 0-47Q44-47 45-9Q48 31 0 34Q-41 35-42-10Z" fill="#f2dda1"/><path d="M-10-45q-4-21 8-12m1 13q7-25 14-14" fill="none" strokeLinecap="round"/></>:<><path d="M-47 1Q-62-45-28-43Q-10-61 7-42Q51-59 49-3Q44 39 1 38Q-37 40-47 1Z" fill="#b8c7a4"/></>}
  <Eyes look={look}/>
  {kind===1?<path d="M-10 4Q3-4 29 5Q34 19 1 19Q-13 16-10 4" fill="#d79b77"/>:<><path d="M-4 4 4 4 0 9Z" fill="#a46c87"/><path d="M-13 16q12 10 26-2" fill="none" strokeLinecap="round"/></>}
  {booped&&<path className="visitor-blep" d="M-3 18Q3 39 13 26L13 16" fill="#d88da7"/>}
  <g fill={kind===0?'#e5c6cf':kind===1?'#f2dda1':'#b8c7a4'}>
   <ellipse cx="-47" cy="36" rx="16" ry="22" transform="rotate(-15 -47 36)"/><ellipse cx="46" cy="48" rx="16" ry="21" transform="rotate(22 46 48)"/>
  </g>
  <path d="M-54 32v8m7-11v10m-1 48h28m28 0h28" fill="none" strokeLinecap="round" opacity=".65"/>
  <text y="68" textAnchor="middle" stroke="none" fill="#68506b" fontSize="9">{kind===0?'professional window inspector':kind===1?'definitely a normal cat':'i live here now'}</text>
 </g>;
}

export function IdiotPebble({variant=0,look={x:0,y:0},sleepy=false}:{variant?:number;look?:Spot;sleepy?:boolean}){
 return <g stroke="#5d5268" strokeWidth="2.5" strokeLinejoin="round">
  {variant%3===0?<path d="M-28 9Q-40-22-8-29Q21-36 32-10Q47 23 4 25Q-23 29-28 9" fill="#bdb4cc"/>:variant%3===1?<path d="M-30 14-9-28Q-4-37 4-27L33 14Q34 27 4 25Q-31 30-30 14" fill="#d3b89c"/>:<path d="M-28-6Q-29-31-3-27Q15-29 11-5Q6 4 25 3Q44 10 27 26Q13 37-13 21Q-32 13-28-6" fill="#b2c8ba"/>}
  <g transform="scale(.8)"><Eyes look={look} sleepy={sleepy}/><path d="M-3 12q9 4 12-2" fill="none" strokeLinecap="round"/>{!sleepy&&<path d="M6 14v7q7 3 7-6" fill="#da9cae"/>}</g>
 </g>;
}

export function PondDuck({startled,reduced}:{startled:boolean;reduced:boolean}){
 return <g className="pond-duck" transform={`translate(235 112) rotate(${startled&&!reduced?-9:0})`} stroke="#665a6c" strokeWidth="1.5">
  <ellipse cy="18" rx="28" ry="5" fill="#f3f7f433" stroke="none"/><path d="M-22 5q22 10 25-9q-6-20 9-21q16 0 13 20q2 29-31 24q-14-2-16-14" fill="#ead5a2"/><path d="M22-10h15l-12 7" fill="#ca987f"/><circle cx="14" cy="-13" r="6" fill="#fff9e9"/><circle cx={startled?16:13} cy="-12" r="2.4" fill="#524452"/>
  {startled&&<text x="-15" y="-15" fill="#665a6c" stroke="none" fontSize="16">?</text>}
 </g>;
}

export function SillyFirefly({look,sleepy,bonked,dancing,small=false,lightId,reduced}:{look:Spot;sleepy:boolean;bonked:boolean;dancing:boolean;small?:boolean;lightId:string;reduced:boolean}){
 return <g className={'silly-firefly'+(bonked?' is-bonked':'')+(dancing&&!reduced?' is-dancing':'')} style={{'--bug-tilt':bonked?'15deg':'0deg'} as CSSProperties}>
  <circle r={small?30:48} fill={`url(#${lightId})`} opacity=".75"/>
  <g stroke="#423a55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
   <g className={!sleepy&&!reduced?'silly-wings':''}><ellipse cx="-18" cy="-3" rx="15" ry="8" transform="rotate(-28 -18 -3)" fill="#d7e4eecc"/><ellipse cx="19" cy="-3" rx="17" ry="9" transform="rotate(32 19 -3)" fill="#d7e4eecc"/></g>
   <path d="M-17 4Q-26-13-6-21Q17-26 24-1Q31 26 5 29Q-13 28-17 4" fill="#e9d794"/>
   <path d="M-14 13q18 10 35-3" fill="none" stroke="#c1a575"/>
   <path d="M-9-20-15-37-22-34M10-23l6-17 5 4" fill="none"/>
   <circle cx="-22" cy="-34" r="3" fill="#dfb6c8"/><circle cx="21" cy="-36" r="3" fill="#dfb6c8"/>
   <g transform="translate(0 -6) scale(.85)"><Eyes look={look} sleepy={sleepy}/></g>
   {bonked?<path d="m-7 3 5 3-5 3m16-6-5 3 5 3" fill="none"/>:<path d="M-3 3q4 5 10 1" fill="none"/>}
   {!sleepy&&<path d="M2 6v8q6 4 8-4V6" fill="#d994b2"/>}
   <path d="M-9 26-12 31-20 29M12 27l5 6 9-3" fill="none"/>
  </g>
  {sleepy&&!small&&<text x="29" y="-28" fill="#e9dba8" fontSize="12">z</text>}
  {bonked&&<g fill="#f2d6dc"><path d="m-33-25 3 5 5 1-5 2-2 5-2-5-5-2 5-1Z"/><circle cx="32" cy="-25" r="3"/></g>}
 </g>;
}
