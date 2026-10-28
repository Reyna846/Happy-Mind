import {useRetainedState} from './SessionMemory';
import { useEffect, useRef, useState } from 'react';
import { volumeGain } from './soundscapes';

function purr(volume:number){
 const context=new AudioContext();const master=context.createGain();master.gain.value=0;master.connect(context.destination);
 const rumble=context.createOscillator();rumble.type='sine';rumble.frequency.value=65;
 const carrier=context.createGain();carrier.gain.value=.22;rumble.connect(carrier);carrier.connect(master);
 const flutter=context.createOscillator();flutter.frequency.value=26;const depth=context.createGain();depth.gain.value=.18;flutter.connect(depth);depth.connect(carrier.gain);
 const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate),samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*.5;
 const breath=context.createBufferSource();breath.buffer=buffer;breath.loop=true;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=180;breath.connect(filter);filter.connect(master);
 rumble.start();flutter.start();breath.start();master.gain.setTargetAtTime(volumeGain(volume)*.5,context.currentTime,.12);
 const ready=context.resume();
 return {ready,stop:()=>{master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(0,context.currentTime,.04);rumble.stop(context.currentTime+.2);flutter.stop(context.currentTime+.2);breath.stop(context.currentTime+.2);breath.onended=()=>{void context.close();};},context};
}
function meow(volume:number){const context=new AudioContext(),voice=context.createOscillator(),formant=context.createBiquadFilter(),gain=context.createGain();voice.type='sawtooth';voice.frequency.setValueAtTime(530,context.currentTime);voice.frequency.exponentialRampToValueAtTime(790,context.currentTime+.16);voice.frequency.exponentialRampToValueAtTime(400,context.currentTime+.65);formant.type='bandpass';formant.frequency.setValueAtTime(1600,context.currentTime);formant.frequency.linearRampToValueAtTime(950,context.currentTime+.65);formant.Q.value=2;gain.gain.setValueAtTime(0,context.currentTime);gain.gain.linearRampToValueAtTime(volumeGain(volume)*.45,context.currentTime+.08);gain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.75);voice.connect(formant);formant.connect(gain);gain.connect(context.destination);voice.start();voice.stop(context.currentTime+.8);const close=()=>{if(context.state!=='closed')void context.close().catch(()=>{});};voice.onended=close;void context.resume().catch(close);return close;}
export function CatCompanion({sound,volume,pauseSignal}:{sound:boolean;volume:number;pauseSignal:number}){
 const [asking,setAsking]=useRetainedState('cat'+':asking',false),[fed,setFed]=useRetainedState('cat'+':fed',false);const meowStop=useRef<(()=>void)|null>(null);
 const [happy,setHappy]=useState(false),[hearts,setHearts]=useState(0),[audioFailed,setAudioFailed]=useState(false),[purring,setPurring]=useState(false);
 const playing=useRef<ReturnType<typeof purr>|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),pointer=useRef<number|null>(null),lastMove=useRef(0);
 const stop=()=>{if(timer.current)clearTimeout(timer.current);timer.current=null;playing.current?.stop();playing.current=null;meowStop.current?.();meowStop.current=null;setPurring(false);setHappy(false);pointer.current=null;};
 useEffect(()=>{stop();},[sound,volume,pauseSignal]);
 useEffect(()=>{const hide=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hide);return()=>{document.removeEventListener('visibilitychange',hide);if(timer.current)clearTimeout(timer.current);playing.current?.stop();meowStop.current?.();};},[]);
 const scratch=()=>{setHappy(true);setHearts(n=>n+1);if(sound&&!playing.current)try{const voice=purr(volume);playing.current=voice;setAudioFailed(false);void voice.ready.then(()=>{if(playing.current===voice)setPurring(voice.context.state==='running'&&volume>0);}).catch(()=>{if(playing.current===voice){playing.current.stop();playing.current=null;setAudioFailed(true);setPurring(false);}});}catch{setAudioFailed(true);}if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(stop,1500);};
 return <div className={'cat-companion '+(happy?'cat-happy ':'')+(asking?'cat-asking':'')} data-purring={purring}>
 <button className="cat-touch" aria-label="Scratch the cat" onClick={e=>{if(e.detail===0)scratch();}} onPointerDown={e=>{if(pointer.current!==null)return;pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);lastMove.current=performance.now();scratch();}} onPointerMove={e=>{if(pointer.current!==e.pointerId||performance.now()-lastMove.current<140)return;lastMove.current=performance.now();scratch();}} onPointerUp={()=>pointer.current=null} onPointerCancel={stop} onLostPointerCapture={()=>pointer.current=null}>
 <svg viewBox="0 0 360 310" role="img" aria-label={happy?'A happy cat leans into your hand with closed eyes':'A soft cream cat waiting for a scratch'}>
 <defs><radialGradient id="cat-fur" cx="35%" cy="25%"><stop stopColor="#fffcf8"/><stop offset=".65" stopColor="#f2e5e5"/><stop offset="1" stopColor="#d8bfd6"/></radialGradient><linearGradient id="cat-ear" x2="1" y2="1"><stop stopColor="#f0bed1"/><stop offset="1" stopColor="#d69cbf"/></linearGradient><radialGradient id="cat-cushion"><stop stopColor="#eee1fc"/><stop offset="1" stopColor="#cdb3e1"/></radialGradient></defs>
 <ellipse cx="180" cy="274" rx="146" ry="27" fill="url(#cat-cushion)"/><ellipse cx="180" cy="277" rx="100" ry="12" fill="#946ca920"/>
 <path className="cat-tail" d="M247 249c70 5 77-72 47-80-28-7-37 36-10 37" fill="none" stroke="#ddc5da" strokeWidth="28" strokeLinecap="round"/>
 <g className="cat-body"><ellipse cx="183" cy="221" rx="81" ry="54" fill="url(#cat-fur)"/><ellipse cx="145" cy="259" rx="28" ry="13" fill="#f9eef0"/><ellipse cx="211" cy="259" rx="28" ry="13" fill="#f9eef0"/><path d="M135 257v7m9-7v7m58-7v7m9-7v7" stroke="#c1a0bb" strokeWidth="1.5" strokeLinecap="round"/></g>
 <g className="cat-head"><path d="M101 137 93 56q0-12 12-5l53 34m47 0 52-34q12-7 12 5l-7 81" fill="url(#cat-fur)" stroke="#ddc2d6" strokeWidth="2"/><path d="m104 66 5 59 35-34m73 0 34-25-6 59" fill="url(#cat-ear)"/>
 <ellipse cx="181" cy="149" rx="89" ry="73" fill="url(#cat-fur)"/><path d="m167 81 3 17m13-18v16m14-14-3 16" stroke="#d9bfce" strokeWidth="5" strokeLinecap="round"/>
 <g className="cat-open-eyes"><ellipse cx="146" cy="143" rx="8" ry="11" fill="#64506f"/><ellipse cx="217" cy="143" rx="8" ry="11" fill="#64506f"/><circle cx="148" cy="139" r="2.4" fill="#fff"/><circle cx="219" cy="139" r="2.4" fill="#fff"/></g>
 <g className="cat-closed-eyes" fill="none" stroke="#77607d" strokeWidth="3.5" strokeLinecap="round"><path d="M133 146q13-14 26 0m45 0q13-14 26 0"/></g>
 <ellipse cx="129" cy="166" rx="15" ry="8" fill="#e9b5ca" opacity=".5"/><ellipse cx="233" cy="166" rx="15" ry="8" fill="#e9b5ca" opacity=".5"/>
 <path d="M175 160q6-4 12 0l-6 6Z" fill="#bb879f"/><path d="M181 166v7m0 0q-8 9-15 0m15 0q8 9 15 0" fill="none" stroke="#aa7f99" strokeWidth="2" strokeLinecap="round"/>
 {asking&&<ellipse className="cat-meow-mouth" cx="181" cy="180" rx="5" ry="7" fill="#b9849b"/>}
 <g stroke="#b9a0bb" strokeWidth="1.5" strokeLinecap="round"><path d="m117 167-31-6m31 13-32 4m158-11 31-6m-31 13 32 4"/></g></g>
 {happy&&<g key={Math.floor(hearts/4)} className="cat-love" fill="#c68eb5"><path d="M287 83c-18-18-29 8 0 24 29-16 18-42 0-24Z"/><path d="M66 136c-12-12-20 5 0 17 20-12 12-29 0-17Z"/></g>}
 </svg></button><span className="cat-caption" role="status">{fed?'Car is happy. Thank you for the treat ♡':asking?'Smol car wants a treat':happy?'Car is happy ♡':'Smol car'}</span><button className="treat-button" onClick={()=>{if(asking){meowStop.current?.();meowStop.current=null;setAsking(false);setFed(true);scratch();}else{setFed(false);setAsking(true);meowStop.current?.();if(sound&&volume>0)try{meowStop.current=meow(volume);}catch{setAudioFailed(true);}}}}><span className="treat-cookie" aria-hidden="true">✿</span>{asking?'Feed Car':'Treat time'}<span className="treat-heart" aria-hidden="true">♡</span></button>{fed&&<div className="treat-bowl" aria-hidden="true">♡</div>}{audioFailed&&<small>Purr audio unavailable</small>}
 </div>;
}
