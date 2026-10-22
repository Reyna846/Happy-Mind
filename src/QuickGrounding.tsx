import {useRef,useState} from 'react';
import {useGuideAudio,type GuideCue} from './useGuideAudio';
import {Icon} from './Icon';
const steps:[GuideCue,string][]=[['arrive','Notice where you are supported.'],['look','Rest your eyes on one colour.'],['feel','Notice one comfortable point of contact.'],['listen','Let one sound come and go.'],['rest','Let your breathing find its own pace.']];
export function QuickGrounding({active,sound,volume,pauseSignal,onBeforePlay}:{active:boolean;sound:boolean;volume:number;pauseSignal:number;onBeforePlay:()=>void}){
 const panel=useRef<HTMLDetailsElement>(null);
 const [step,setStep]=useState(0);const audio=useGuideAudio({active,sound,volume,pauseSignal});
 return <details ref={panel} className="quick-grounding" onToggle={e=>{if(!e.currentTarget.open)audio.stop();}}><summary><Icon name="sound" size={18}/>A spoken grounding moment</summary><p>{steps[step][1]}</p><div><button className="quiet-link guide-play" disabled={!sound} onClick={()=>{onBeforePlay();audio.play(steps[step][0]);}}><Icon name="sound" size={18}/>{audio.playing?'Playing…':'Listen'}</button><button className="quiet-link guide-next" disabled={!sound} onClick={()=>{const next=(step+1)%steps.length;setStep(next);onBeforePlay();audio.play(steps[next][0]);}}>Next cue <Icon name="arrow" size={16}/></button><button className="quiet-link guide-stop" aria-label="Stop guide" title="Stop guide" onClick={()=>{audio.stop();if(panel.current)panel.current.open=false;}}><Icon name="close" size={17}/></button></div>{!sound&&<small>Unmute sound to hear the guide.</small>}{audio.notice&&<small role="status">{audio.notice}</small>}</details>;
}
