import { useEffect, useRef } from 'react';
import { volumeGain } from './soundscapes';
export type MomentSound='bubble'|'glow'|'sand'|'water'|'draw'|'step'|'clear';
export function useMomentSound(enabled:boolean,volume:number,pauseSignal:number){
 const context=useRef<AudioContext|null>(null),last=useRef(-Infinity);
 useEffect(()=>{const stop=()=>{const ctx=context.current;context.current=null;last.current=-Infinity;if(ctx&&ctx.state!=='closed')void ctx.close().catch(()=>{});};const hide=()=>{if(document.hidden)stop();};stop();document.addEventListener('visibilitychange',hide);return()=>{document.removeEventListener('visibilitychange',hide);stop();};},[enabled,volume,pauseSignal]);
 return (kind:MomentSound)=>{
  if(!enabled||volume<=0||document.hidden||performance.now()-last.current<120)return;
  last.current=performance.now();
  try{
   const ctx=context.current??(context.current=new AudioContext());void ctx.resume().catch(()=>{});
   const now=ctx.currentTime,duration=kind==='clear'?.65:kind==='sand'||kind==='draw'?.14:.3;
   const gain=ctx.createGain();gain.connect(ctx.destination);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(volumeGain(volume)*.45,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
   let source:AudioScheduledSourceNode;
   if(kind==='sand'||kind==='draw'||kind==='clear'){
    const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    const noise=ctx.createBufferSource();noise.buffer=buffer;const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=kind==='draw'?1800:900;filter.Q.value=.7;noise.connect(filter);filter.connect(gain);source=noise;source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
   }else{
    const tone=ctx.createOscillator();tone.type='sine';const pitch=({bubble:520,glow:880,water:660,step:440} as const)[kind]*(.94+Math.random()*.12);tone.frequency.setValueAtTime(pitch,now);tone.frequency.exponentialRampToValueAtTime(pitch*(kind==='bubble'?.28:kind==='water'?.65:1.5),now+duration);tone.connect(gain);source=tone;source.onended=()=>{source.disconnect();gain.disconnect();};
   }
   source.start(now);source.stop(now+duration+.02);
  }catch{/* Audio is optional on browsers without Web Audio. */}
 };
}
