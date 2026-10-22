import {useEffect,useRef,useState,useSyncExternalStore,type RefObject} from 'react';
import {offlineMicReady,offlineMicSelected,micSnapshot,subscribeMic,micStatus,prepareOfflineMic,resetOfflineMic,selectOfflineMic,transcribeOffline} from './offline-mic';
import {Icon} from './Icon';
import {SpeechBoundary} from './speech-boundary';
import {LocalConversation} from './local-conversation';
import type {MicPhase} from './conversation-status';
export function useOfflineMic(){useSyncExternalStore(subscribeMic,micSnapshot);return offlineMicSelected();}
export function OfflineMicSettings(){const selected=useOfflineMic(),{state,message}=micStatus();const [storage,setStorage]=useState('');return <div className="offline-mic-settings"><label htmlFor="mic-engine">Microphone</label><select id="mic-engine" value={selected?'offline':'browser'} onChange={e=>selectOfflineMic(e.target.value==='offline')}><option value="browser">Browser recognition · may need internet</option><option value="offline">Local English · automatic turns</option></select>{selected&&<><p className="setting-hint">Whisper Tiny runs on this device. Download once while online; cached files can work offline. Pause after speaking to send, or tap Finish. Turns are limited to 30 seconds. Your recording is not uploaded or saved.</p><button className="quiet-link" disabled={state==='ready'} onClick={()=>{if(state==='loading')resetOfflineMic();else void prepareOfflineMic();}}>{state==='ready'?'Local microphone ready':state==='loading'?'Cancel microphone download':'Prepare local microphone'}</button><p className="guide-notice" role="status">{message}</p><button className="quiet-link" onClick={()=>{if(!navigator.storage?.persist){setStorage('Storage protection is unavailable here.');return;}void navigator.storage.persist().then(kept=>setStorage(kept?'Downloads are protected from automatic storage cleanup. Clearing site data still removes them.':'This browser may clear downloads when space is low. Recheck offline readiness before relying on it.')).catch(()=>setStorage('Storage protection is unavailable here.'));}}>Keep downloads on this device</button>{storage&&<small role="status">{storage}</small>}</>}</div>;}
export function OfflineMic({active,disabled=false,compact=false,pauseSignal=0,continuous=false,resumeSignal=0,controlRef,onSessionChange,onPhase,onPause,onText,onBeforeRecord,onAudioActive}:{active:boolean;disabled?:boolean;compact?:boolean;pauseSignal?:number;continuous?:boolean;resumeSignal?:number;controlRef?:RefObject<((action?:'pause'|'start')=>void)|null>;onSessionChange?:(active:boolean)=>void;onPhase?:(phase:MicPhase)=>void;onPause?:()=>void;onText:(text:string)=>void;onBeforeRecord:()=>void;onAudioActive:(value:boolean)=>void}){
 useSyncExternalStore(subscribeMic,micSnapshot);
 const modelStatus=micStatus();
 const monitor=useRef<(()=>void)|null>(null);
 const [sessionOn,setSessionOn]=useState(false);
 const beginRef=useRef<()=>void>(()=>{}),lastResume=useRef(resumeSignal),pendingResume=useRef(false);
 const [recording,setRecording]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const controls=useRef({active,disabled,onText,onBeforeRecord,onAudioActive,onSessionChange,onPhase,onPause});controls.current={active,disabled,onText,onBeforeRecord,onAudioActive,onSessionChange,onPhase,onPause};
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),epoch=useRef(0),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const conversation=useRef<LocalConversation|null>(null);
 if(!conversation.current)conversation.current=new LocalConversation({record:()=>beginRef.current(),changed:value=>{setSessionOn(value);controls.current.onSessionChange?.(value);}});
 const cancel=()=>{epoch.current++;monitor.current?.();monitor.current=null;clearTimeout(timer.current);const r=recorder.current;recorder.current=null;if(r&&r.state!=='inactive')r.stop();stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;setRecording(false);setBusy(false);controls.current.onAudioActive(false);controls.current.onPhase?.('idle');};
 const pause=()=>{pendingResume.current=false;conversation.current?.pause();cancel();controls.current.onPause?.();};
 useEffect(()=>{if(!active)pause();else if(disabled){conversation.current?.cancelPending();cancel();}},[active,disabled]);
 useEffect(()=>{pause();},[pauseSignal]);
 useEffect(()=>{if(modelStatus.state!=='ready'){conversation.current?.pause();cancel();}},[modelStatus.state]);
 useEffect(()=>{const hide=()=>{if(document.hidden)pause();};document.addEventListener('visibilitychange',hide);return()=>{conversation.current?.pause();cancel();if(controlRef)controlRef.current=null;document.removeEventListener('visibilitychange',hide);};},[]);
 useEffect(()=>{if(resumeSignal!==lastResume.current){lastResume.current=resumeSignal;pendingResume.current=true;}if(pendingResume.current&&active&&!disabled&&!document.hidden){pendingResume.current=false;conversation.current?.replyFinished();}},[resumeSignal,active,disabled]);
 const begin=async()=>{
  if(!controls.current.active||controls.current.disabled||document.hidden)return;
  if(recording){recorder.current?.stop();return;}
  if(!offlineMicReady()){conversation.current?.pause();setNotice('Prepare voice below before speaking.');return;}
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){conversation.current?.pause();setNotice('Local recording is unavailable in this browser. You can type instead.');return;}
  controls.current.onBeforeRecord();cancel();const token=++epoch.current;setNotice('');setBusy(true);controls.current.onPhase?.('opening');
  try{
   const media=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
   if(token!==epoch.current||!controls.current.active){media.getTracks().forEach(t=>t.stop());return;}stream.current=media;
   const r=new MediaRecorder(media);recorder.current=r;const chunks:Blob[]=[];
   r.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   r.onerror=()=>{if(token===epoch.current){pause();controls.current.onPhase?.('error');setNotice('Recording stopped. Try again or type.');}};
   r.onstop=async()=>{
    media.getTracks().forEach(t=>t.stop());if(token!==epoch.current)return;monitor.current?.();monitor.current=null;clearTimeout(timer.current);
    recorder.current=null;stream.current=null;setRecording(false);setBusy(true);controls.current.onPhase?.('transcribing');controls.current.onAudioActive(false);let ctx:AudioContext|undefined;
    try{
     ctx=new AudioContext();const decoded=await ctx.decodeAudioData(await new Blob(chunks,{type:r.mimeType}).arrayBuffer());
     const duration=Math.min(30,decoded.duration);if(duration<.3)throw Error('Recording was too short. Try a few words.');
     const offline=new OfflineAudioContext(1,Math.ceil(duration*16000),16000),source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();
     const rendered=await offline.startRendering(),samples=rendered.getChannelData(0);
     if(token!==epoch.current)return;
     if(!samples.some(n=>Math.abs(n)>.005))throw Error('No speech was detected. Try again when ready.');
     const text=await transcribeOffline(new Float32Array(samples));if(token!==epoch.current)return;
     if(text){setNotice('Words recognised. Sending to your companion…');controls.current.onText(text);}else {conversation.current?.pause();setNotice('No words detected. You can try again or type.');}
    }catch(e){if(token===epoch.current){conversation.current?.pause();setNotice(e instanceof Error?e.message:'Local speech could not run. You can type instead.');}}finally{void ctx?.close();if(token===epoch.current){setBusy(false);controls.current.onPhase?.('idle');}}
   };
   const capture=new AudioContext(),input=capture.createMediaStreamSource(media),analyser=capture.createAnalyser();analyser.fftSize=1024;input.connect(analyser);
   const samples=new Float32Array(analyser.fftSize),boundary=new SpeechBoundary(performance.now(),!!conversation.current?.active());let check:ReturnType<typeof setInterval>|undefined;
   monitor.current=()=>{clearInterval(check);input.disconnect();analyser.disconnect();void capture.close().catch(()=>{});};
   await capture.resume();if(token!==epoch.current)return;if(!controls.current.active||controls.current.disabled){cancel();return;}
   r.start();setRecording(true);setBusy(false);controls.current.onPhase?.('listening');setNotice('Listening on your device. Pause when finished, or tap Finish.');controls.current.onAudioActive(true);
   check=setInterval(()=>{if(token!==epoch.current||r.state!=='recording')return;analyser.getFloatTimeDomainData(samples);const rms=Math.sqrt(samples.reduce((sum,n)=>sum+n*n,0)/samples.length);const action=boundary.sample(rms,performance.now());if(action==='empty'){const keepWaiting=!!conversation.current?.active();cancel();if(keepWaiting){setNotice('Still here. Speak whenever you’re ready.');conversation.current?.replyFinished();}else setNotice('No speech was captured. Check microphone permission or try speaking closer.');}else if(action==='finish')r.stop();},50);
   timer.current=setTimeout(()=>{if(token!==epoch.current||r.state!=='recording')return;const action=boundary.sample(0,performance.now());if(action==='empty'&&conversation.current?.active()){cancel();conversation.current.replyFinished();}else r.stop();},30100);
  }catch{if(token===epoch.current){pause();controls.current.onPhase?.('error');setNotice('Microphone access was unavailable. You can type instead.');}}
 };
 beginRef.current=()=>void begin();
 const toggle=()=>{if(conversation.current?.active())pause();else if(controls.current.active&&!controls.current.disabled){if(continuous)conversation.current?.start();else void begin();}};
 if(controlRef)controlRef.current=action=>{if(action==='pause')pause();else if(action==='start'){if(controls.current.active&&!controls.current.disabled){if(continuous)conversation.current?.start();else void begin();}}else toggle();};
 if(!offlineMicReady())return <div className="offline-mic-control"><small>Voice needs a separate, one-time Whisper speech-model download. Your recording stays on this device.</small><button className={compact?'quiet-link':'hands-free-button'} disabled={disabled||!active} onClick={()=>{if(modelStatus.state==='loading')resetOfflineMic();else void prepareOfflineMic();}}><Icon name="mic" size={20}/>{modelStatus.state==='loading'?'Cancel voice preparation':'Prepare voice'}</button>{modelStatus.message&&<small role="status">{modelStatus.message}</small>}</div>;
 return <div className={'offline-mic-control '+(compact?'compact':'')}><button className={compact?'icon-button':'hands-free-button'} aria-label={recording?'Finish local recording':busy?'Transcribing locally':'Let’s talk'} disabled={disabled||busy||!active} onClick={()=>{if(recording)recorder.current?.stop();else toggle();}}><Icon name={recording?'close':'mic'} size={20}/>{!compact&&(recording?'Finish & send':busy?'Turning speech into text…':'Let’s talk')}</button>{sessionOn?<button className="quiet-link" aria-label="Pause conversation" onClick={pause}>Pause conversation</button>:(recording||busy)&&<button className="quiet-link" aria-label="Cancel local recording" onClick={pause}>Cancel</button>}{notice&&<small role="status">{notice}</small>}{sessionOn&&<small>Conversation on · the microphone returns after each reply.</small>}</div>;
}
