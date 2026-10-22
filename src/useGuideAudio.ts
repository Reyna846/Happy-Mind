import {useCallback,useEffect,useRef,useState} from 'react';
export const stopGuides=()=>window.dispatchEvent(new Event('hm-stop-guides'));
export type GuideCue='arrive'|'look'|'feel'|'listen'|'rest'|'in'|'out'|'in-left'|'out-left'|'in-right'|'out-right';
export function useGuideAudio({active,sound,volume,pauseSignal=0}:{active:boolean;sound:boolean;volume:number;pauseSignal?:number}){
 const epoch=useRef(0),speaking=useRef(false);
 const audio=useRef<HTMLAudioElement|null>(null),controls=useRef({active,sound,volume});controls.current={active,sound,volume};
 const [notice,setNotice]=useState(''),[playing,setPlaying]=useState(false);
 const stop=useCallback(()=>{epoch.current++;setPlaying(false);if(speaking.current){speaking.current=false;window.dispatchEvent(new CustomEvent('hm-guide-audio',{detail:false}));}audio.current?.pause();if(audio.current)audio.current.currentTime=0;},[]);
 const play=useCallback((cue:GuideCue)=>{
  const c=controls.current;if(!c.active||!c.sound||c.volume<=0||document.hidden)return;
  const element=audio.current??=new Audio();const url=import.meta.env.BASE_URL+'audio/guides/'+cue+'.wav';
  if(element.src.endsWith('/audio/guides/'+cue+'.wav')&&!element.paused)return;
  const token=++epoch.current;element.pause();element.onended=()=>{if(token===epoch.current){speaking.current=false;setPlaying(false);window.dispatchEvent(new CustomEvent('hm-guide-audio',{detail:false}));}};element.src=url;element.volume=c.volume;setNotice('');
  speaking.current=true;setPlaying(true);window.dispatchEvent(new CustomEvent('hm-guide-audio',{detail:true}));
  void element.play().catch(()=>{if(token===epoch.current){speaking.current=false;setPlaying(false);window.dispatchEvent(new CustomEvent('hm-guide-audio',{detail:false}));setNotice('Guide audio could not play. The visual cues are still available.');}});
 },[]);
 useEffect(()=>{stop();},[active,sound,volume,pauseSignal,stop]);
 useEffect(()=>{const hide=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hide);window.addEventListener('hm-stop-guides',stop);return()=>{stop();document.removeEventListener('visibilitychange',hide);window.removeEventListener('hm-stop-guides',stop);};},[stop]);
 return {play,stop,notice,playing};
}
