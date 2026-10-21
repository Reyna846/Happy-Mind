import { useEffect, useRef } from 'react';
import { volumeGain } from './soundscapes';
export type MomentSound='bubble'|'glow'|'sand'|'water'|'draw'|'step'|'clear'|'saber';
export function useMomentSound(enabled:boolean,volume:number,pauseSignal:number){
 const context=useRef<AudioContext|null>(null),last=useRef(-Infinity);
 useEffect(()=>{const stop=()=>{const ctx=context.current;context.current=null;last.current=-Infinity;if(ctx&&ctx.state!=='closed')void ctx.close().catch(()=>{});};const hide=()=>{if(document.hidden)stop();};stop();document.addEventListener('visibilitychange',hide);return()=>{document.removeEventListener('visibilitychange',hide);stop();};},[enabled,volume,pauseSignal]);
 return (kind:MomentSound)=>{
  if(!enabled||volume<=0||document.hidden||performance.now()-last.current<(kind==='water'?300:120))return;
  last.current=performance.now();
  try{
   const ctx=context.current??(context.current=new AudioContext());void ctx.resume().catch(()=>{});
   const now=ctx.currentTime,duration=kind==='saber'?.85:kind==='clear'?.65:kind==='sand'||kind==='draw'?.14:.3;
   const gain=ctx.createGain();gain.connect(ctx.destination);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(volumeGain(volume)*.45,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
   let source:AudioScheduledSourceNode;
   if(kind==='saber'){
    const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),data=buffer.getChannelData(0);let phase=0;
    for(let i=0;i<data.length;i++){const t=i/ctx.sampleRate,u=t/duration,swing=Math.sin(Math.PI*u);phase+=2*Math.PI*(82+130*swing)/ctx.sampleRate;const hum=(Math.sin(phase)+.35*Math.sin(phase*2.01)+.16*Math.sin(phase*3))*.48;const air=(Math.random()*2-1)*.2*swing;const envelope=Math.min(1,t/.045)*Math.min(1,(duration-t)/.18);data[i]=(hum+air)*envelope;}
    const sweep=ctx.createBufferSource();sweep.buffer=buffer;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime(450,now);filter.frequency.exponentialRampToValueAtTime(2600,now+.26);filter.frequency.exponentialRampToValueAtTime(220,now+duration);sweep.connect(filter);filter.connect(gain);source=sweep;source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
   }else if(kind==='water'){
    const length=Math.ceil(ctx.sampleRate*.28),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);let phase=0;
    const variation=.9+Math.random()*.2;
    for(let i=0;i<length;i++){const t=i/ctx.sampleRate;const hz=variation*(t<.025?520+26000*t:1170*Math.exp(-(t-.025)*8));phase+=2*Math.PI*hz/ctx.sampleRate;const envelope=Math.min(1,t/.003)*Math.exp(-t*24);data[i]=(Math.sin(phase)*.8+(Math.random()*2-1)*.1*Math.exp(-t*150))*envelope;}
    const drop=ctx.createBufferSource();drop.buffer=buffer;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2600;drop.connect(filter);filter.connect(gain);source=drop;source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
   }else if(kind==='sand'||kind==='draw'||kind==='clear'){
    const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    const noise=ctx.createBufferSource();noise.buffer=buffer;const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=kind==='draw'?1800:900;filter.Q.value=.7;noise.connect(filter);filter.connect(gain);source=noise;source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
   }else{
    const tone=ctx.createOscillator();tone.type='sine';const pitch=({bubble:520,glow:880,step:440} as const)[kind]*(.94+Math.random()*.12);tone.frequency.setValueAtTime(pitch,now);tone.frequency.exponentialRampToValueAtTime(pitch*(kind==='bubble'?.28:1.5),now+duration);tone.connect(gain);source=tone;source.onended=()=>{source.disconnect();gain.disconnect();};
   }
   source.start(now);source.stop(now+duration+.02);
  }catch{/* Audio is optional on browsers without Web Audio. */}
 };
}
