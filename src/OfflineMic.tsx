import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {offlineMicReady,offlineMicSelected,micSnapshot,subscribeMic,micStatus,prepareOfflineMic,resetOfflineMic,selectOfflineMic,transcribeOffline} from './offline-mic';
import {Icon} from './Icon';
import {SpeechBoundary} from './speech-boundary';
export function useOfflineMic(){useSyncExternalStore(subscribeMic,micSnapshot);return offlineMicSelected();}
export function OfflineMicSettings(){const selected=useOfflineMic(),{state,message}=micStatus();const [storage,setStorage]=useState('');return <div className="offline-mic-settings"><label htmlFor="mic-engine">Microphone</label><select id="mic-engine" value={selected?'offline':'browser'} onChange={e=>selectOfflineMic(e.target.value==='offline')}><option value="browser">Browser recognition · may need internet</option><option value="offline">Local English · automatic turns</option></select>{selected&&<><p className="setting-hint">Whisper Tiny runs on this device. Download once while online; cached files can work offline. Pause after speaking to send, or tap Finish. Turns are limited to 30 seconds. Your recording is not uploaded or saved.</p><button className="quiet-link" disabled={state==='ready'} onClick={()=>{if(state==='loading')resetOfflineMic();else void prepareOfflineMic();}}>{state==='ready'?'Local microphone ready':state==='loading'?'Cancel microphone download':'Prepare local microphone'}</button><p className="guide-notice" role="status">{message}</p><button className="quiet-link" onClick={()=>{if(!navigator.storage?.persist){setStorage('Storage protection is unavailable here.');return;}void navigator.storage.persist().then(kept=>setStorage(kept?'Downloads are protected from automatic storage cleanup. Clearing site data still removes them.':'This browser may clear downloads when space is low. Recheck offline readiness before relying on it.')).catch(()=>setStorage('Storage protection is unavailable here.'));}}>Keep downloads on this device</button>{storage&&<small role="status">{storage}</small>}</>}</div>;}
export function OfflineMic({active,disabled=false,compact=false,pauseSignal=0,onText,onBeforeRecord,onAudioActive}:{active:boolean;disabled?:boolean;compact?:boolean;pauseSignal?:number;onText:(text:string)=>void;onBeforeRecord:()=>void;onAudioActive:(value:boolean)=>void}){
 useSyncExternalStore(subscribeMic,micSnapshot);
 const modelStatus=micStatus();
 const monitor=useRef<(()=>void)|null>(null);
 const [recording,setRecording]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const controls=useRef({active,disabled,onText,onBeforeRecord,onAudioActive});controls.current={active,disabled,onText,onBeforeRecord,onAudioActive};
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),epoch=useRef(0),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const cancel=()=>{epoch.current++;monitor.current?.();monitor.current=null;clearTimeout(timer.current);const r=recorder.current;recorder.current=null;if(r&&r.state!=='inactive')r.stop();stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;setRecording(false);setBusy(false);controls.current.onAudioActive(false);};
 useEffect(()=>{if(!active||disabled)cancel();},[active,disabled]);
 useEffect(()=>{cancel();},[pauseSignal]);
 useEffect(()=>{const hide=()=>{if(document.hidden)cancel();};document.addEventListener('visibilitychange',hide);return()=>{cancel();document.removeEventListener('visibilitychange',hide);};},[]);
 const begin=async()=>{
  if(recording){recorder.current?.stop();return;}
  if(!offlineMicReady()){setNotice('Prepare voice below before speaking.');return;}
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){setNotice('Local recording is unavailable in this browser. You can type instead.');return;}
  controls.current.onBeforeRecord();cancel();const token=++epoch.current;setNotice('');setBusy(true);
  try{
   const media=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
   if(token!==epoch.current||!controls.current.active){media.getTracks().forEach(t=>t.stop());return;}stream.current=media;
   const r=new MediaRecorder(media);recorder.current=r;const chunks:Blob[]=[];
   r.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   r.onerror=()=>{if(token===epoch.current){cancel();setNotice('Recording stopped. Try again or type.');}};
   r.onstop=async()=>{
    monitor.current?.();monitor.current=null;media.getTracks().forEach(t=>t.stop());clearTimeout(timer.current);if(token!==epoch.current)return;
    recorder.current=null;stream.current=null;setRecording(false);setBusy(true);controls.current.onAudioActive(false);let ctx:AudioContext|undefined;
    try{
     ctx=new AudioContext();const decoded=await ctx.decodeAudioData(await new Blob(chunks,{type:r.mimeType}).arrayBuffer());
     const duration=Math.min(30,decoded.duration);if(duration<.3)throw Error('Recording was too short. Try a few words.');
     const offline=new OfflineAudioContext(1,Math.ceil(duration*16000),16000),source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();
     const rendered=await offline.startRendering(),samples=rendered.getChannelData(0);
     if(token!==epoch.current)return;
     if(!samples.some(n=>Math.abs(n)>.005))throw Error('No speech was detected. Try again when ready.');
     const text=await transcribeOffline(new Float32Array(samples));if(token!==epoch.current)return;
     if(text){setNotice('Words recognised. Sending to your companion…');controls.current.onText(text);}else setNotice('No words detected. You can try again or type.');
    }catch(e){if(token===epoch.current)setNotice(e instanceof Error?e.message:'Local speech could not run. You can type instead.');}finally{void ctx?.close();if(token===epoch.current)setBusy(false);}
   };
   const capture=new AudioContext(),input=capture.createMediaStreamSource(media),analyser=capture.createAnalyser();analyser.fftSize=1024;input.connect(analyser);
   const samples=new Float32Array(analyser.fftSize),boundary=new SpeechBoundary(performance.now());let check:ReturnType<typeof setInterval>|undefined;
   monitor.current=()=>{clearInterval(check);input.disconnect();analyser.disconnect();void capture.close().catch(()=>{});};
   await capture.resume();if(token!==epoch.current)return;if(!controls.current.active||controls.current.disabled){cancel();return;}
   r.start();setRecording(true);setBusy(false);setNotice('Listening on your device. Pause when finished, or tap Finish.');controls.current.onAudioActive(true);
   check=setInterval(()=>{if(token!==epoch.current||r.state!=='recording')return;analyser.getFloatTimeDomainData(samples);const rms=Math.sqrt(samples.reduce((sum,n)=>sum+n*n,0)/samples.length);const action=boundary.sample(rms,performance.now());if(action==='empty'){cancel();setNotice('No speech was captured. Check microphone permission or try speaking closer.');}else if(action==='finish')r.stop();},50);
   timer.current=setTimeout(()=>{if(token===epoch.current&&r.state==='recording')r.stop();},30000);
  }catch{if(token===epoch.current){cancel();setNotice('Microphone access was unavailable. You can type instead.');}}
 };
 if(!offlineMicReady())return <div className="offline-mic-control"><small>Voice needs a separate, one-time Whisper speech-model download. Your recording stays on this device.</small><button className={compact?'quiet-link':'hands-free-button'} disabled={disabled||!active} onClick={()=>{if(modelStatus.state==='loading')resetOfflineMic();else void prepareOfflineMic();}}><Icon name="mic" size={20}/>{modelStatus.state==='loading'?'Cancel voice preparation':'Prepare voice'}</button>{modelStatus.message&&<small role="status">{modelStatus.message}</small>}</div>;
 return <div className={'offline-mic-control '+(compact?'compact':'')}><button className={compact?'icon-button':'hands-free-button'} aria-label={recording?'Finish local recording':busy?'Transcribing locally':'Let’s talk'} disabled={disabled||busy||!active} onClick={()=>void begin()}><Icon name={recording?'close':'mic'} size={20}/>{!compact&&(recording?'Finish & send':busy?'Turning speech into text…':'Let’s talk')}</button>{(recording||busy)&&<button className="quiet-link" aria-label="Cancel local recording" onClick={cancel}>Cancel</button>}{notice&&<small role="status">{notice}</small>}</div>;
}
