import {useEffect,useRef} from 'react';
import {volumeGain} from './soundscapes';
export function useBreathMusic(playing:boolean,enabled:boolean,volume:number,inhale:boolean){
 const voice=useRef<{ctx:AudioContext;tones:OscillatorNode[];gain:GainNode}|null>(null);
 useEffect(()=>{
  if(!playing||!enabled||volume<=0||document.hidden)return;
  let ctx:AudioContext;
  try{ctx=new AudioContext();}catch{return;}
  const gain=ctx.createGain();gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(volumeGain(volume)*.3,ctx.currentTime+.7);gain.connect(ctx.destination);
  const tones=[174.61,261.63,349.23].map((hz,i)=>{const oscillator=ctx.createOscillator(),level=ctx.createGain();oscillator.type='sine';oscillator.frequency.value=hz;level.gain.value=.3/(i+1);oscillator.connect(level);level.connect(gain);oscillator.start();return oscillator;});voice.current={ctx,tones,gain};
  const stop=()=>{if(voice.current?.ctx===ctx)voice.current=null;tones.forEach(t=>{try{t.stop();}catch{}});if(ctx.state!=='closed')void ctx.close().catch(()=>{});};const hide=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hide);void ctx.resume().catch(stop);
  return()=>{document.removeEventListener('visibilitychange',hide);stop();};
 },[playing,enabled,volume]);
 useEffect(()=>{const v=voice.current;if(!v||v.ctx.state==='closed')return;[174.61,261.63,349.23].forEach((hz,i)=>{v.tones[i].frequency.setTargetAtTime(hz*(inhale?1.12246:1),v.ctx.currentTime,1.1);});},[inhale,playing,enabled,volume]);
}
