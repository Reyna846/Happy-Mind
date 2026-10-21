import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {offlineMicReady,offlineMicSelected,micSnapshot,subscribeMic,micStatus,prepareOfflineMic,resetOfflineMic,selectOfflineMic,transcribeOffline} from './offline-mic';
import {Icon} from './Icon';
export function useOfflineMic(){useSyncExternalStore(subscribeMic,micSnapshot);return offlineMicSelected();}
export function OfflineMicSettings(){const selected=useOfflineMic(),{state,message}=micStatus();const [storage,setStorage]=useState('');return <div className="offline-mic-settings"><label htmlFor="mic-engine">Microphone</label><select id="mic-engine" value={selected?'offline':'browser'} onChange={e=>selectOfflineMic(e.target.value==='offline')}><option value="browser">Browser recognition · may need internet</option><option value="offline">Local English · recorded turns</option></select>{selected&&<><p className="setting-hint">Whisper Tiny runs on this device. Download once while online; cached files can work offline. Record up to 30 seconds, then Finish. Your recording is not uploaded or saved.</p><button className="quiet-link" disabled={state==='ready'} onClick={()=>{if(state==='loading')resetOfflineMic();else void prepareOfflineMic();}}>{state==='ready'?'Local microphone ready':state==='loading'?'Cancel microphone download':'Prepare local microphone'}</button><p className="guide-notice" role="status">{message}</p><button className="quiet-link" onClick={()=>{if(!navigator.storage?.persist){setStorage('Storage protection is unavailable here.');return;}void navigator.storage.persist().then(kept=>setStorage(kept?'Downloads are protected from automatic storage cleanup. Clearing site data still removes them.':'This browser may clear downloads when space is low. Recheck offline readiness before relying on it.')).catch(()=>setStorage('Storage protection is unavailable here.'));}}>Keep downloads on this device</button>{storage&&<small role="status">{storage}</small>}</>}</div>;}
export function OfflineMic({active,disabled=false,compact=false,pauseSignal=0,onText,onBeforeRecord,onAudioActive}:{active:boolean;disabled?:boolean;compact?:boolean;pauseSignal?:number;onText:(text:string)=>void;onBeforeRecord:()=>void;onAudioActive:(value:boolean)=>void}){
 useSyncExternalStore(subscribeMic,micSnapshot);
 const [recording,setRecording]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const controls=useRef({active,disabled,onText,onBeforeRecord,onAudioActive});controls.current={active,disabled,onText,onBeforeRecord,onAudioActive};
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),epoch=useRef(0),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const cancel=()=>{epoch.current++;clearTimeout(timer.current);const r=recorder.current;recorder.current=null;if(r&&r.state!=='inactive')r.stop();stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;setRecording(false);setBusy(false);controls.current.onAudioActive(false);};
 useEffect(()=>{if(!active||disabled)cancel();},[active,disabled]);
 useEffect(()=>{cancel();},[pauseSignal]);
 useEffect(()=>{const hide=()=>{if(document.hidden)cancel();};document.addEventListener('visibilitychange',hide);return()=>{cancel();document.removeEventListener('visibilitychange',hide);};},[]);
 const begin=async()=>{
  if(recording){recorder.current?.stop();return;}
  if(!offlineMicReady()){setNotice('Prepare the local microphone in Settings → Sound.');return;}
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){setNotice('Local recording is unavailable in this browser. You can type instead.');return;}
  controls.current.onBeforeRecord();cancel();const token=++epoch.current;setNotice('');setBusy(true);
  try{
   const media=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
   if(token!==epoch.current||!controls.current.active){media.getTracks().forEach(t=>t.stop());return;}stream.current=media;
   const r=new MediaRecorder(media);recorder.current=r;const chunks:Blob[]=[];
   r.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   r.onerror=()=>{if(token===epoch.current){cancel();setNotice('Recording stopped. Try again or type.');}};
   r.onstop=async()=>{
    media.getTracks().forEach(t=>t.stop());clearTimeout(timer.current);if(token!==epoch.current)return;
    recorder.current=null;stream.current=null;setRecording(false);setBusy(true);controls.current.onAudioActive(false);let ctx:AudioContext|undefined;
    try{
     ctx=new AudioContext();const decoded=await ctx.decodeAudioData(await new Blob(chunks,{type:r.mimeType}).arrayBuffer());
     const duration=Math.min(30,decoded.duration);if(duration<.3)throw Error('Recording was too short. Try a few words.');
     const offline=new OfflineAudioContext(1,Math.ceil(duration*16000),16000),source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();
     const rendered=await offline.startRendering(),samples=rendered.getChannelData(0);
     if(token!==epoch.current)return;
     if(!samples.some(n=>Math.abs(n)>.005))throw Error('No speech was detected. Try again when ready.');
     const text=await transcribeOffline(new Float32Array(samples));if(token!==epoch.current)return;
     if(text)controls.current.onText(text);else setNotice('No words detected. You can try again or type.');
    }catch(e){if(token===epoch.current)setNotice(e instanceof Error?e.message:'Local speech could not run. You can type instead.');}finally{void ctx?.close();if(token===epoch.current)setBusy(false);}
   };
   r.start();setRecording(true);setBusy(false);controls.current.onAudioActive(true);timer.current=setTimeout(()=>{if(token===epoch.current&&r.state==='recording')r.stop();},30000);
  }catch{if(token===epoch.current){cancel();setNotice('Microphone access was unavailable. You can type instead.');}}
 };
 return <div className={'offline-mic-control '+(compact?'compact':'')}><button className={compact?'icon-button':'hands-free-button'} aria-label={recording?'Finish local recording':busy?'Transcribing locally':'Record locally'} disabled={disabled||busy||!active} onClick={()=>void begin()}><Icon name={recording?'close':'mic'} size={20}/>{!compact&&(recording?'Finish & use words':busy?'Taking your words…':'Record locally')}</button>{(recording||busy)&&<button className="quiet-link" aria-label="Cancel local recording" onClick={cancel}>Cancel</button>}{notice&&<small role="status">{notice}</small>}</div>;
}
