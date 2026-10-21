import {useEffect,useRef,useState} from 'react';
import type {Message} from './local-ai';
type Props={active:boolean;suspendKey:number;sound:boolean;volume:number;history:Message[];onTranscript:(message:Message)=>void;onAudioActive:(active:boolean)=>void};
export function RealtimeVoice(props:Props){
 const [status,setStatus]=useState('Ready to connect'),[connected,setConnected]=useState(false),[busy,setBusy]=useState(false),[code,setCode]=useState(''),[consent,setConsent]=useState(false),[caption,setCaption]=useState('');
 const controls=useRef(props);controls.current=props;
 const peer=useRef<RTCPeerConnection|null>(null),mic=useRef<MediaStream|null>(null),output=useRef<HTMLAudioElement|null>(null),abort=useRef<AbortController|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),epoch=useRef(0),seen=useRef(new Set<string>());
 const base=(import.meta.env.VITE_VOICE_SERVER_URL??'').replace(/\/$/,'');
 const stop=()=>{epoch.current++;abort.current?.abort();abort.current=null;if(timer.current)clearTimeout(timer.current);mic.current?.getTracks().forEach(t=>t.stop());mic.current=null;peer.current?.close();peer.current=null;if(output.current){output.current.pause();output.current.srcObject=null;output.current=null;}setConnected(false);setBusy(false);controls.current.onAudioActive(false);};
 useEffect(()=>{if(!props.active)stop();},[props.active]);
 useEffect(()=>{stop();},[props.suspendKey]);
 useEffect(()=>{if(!props.sound)stop();if(output.current)output.current.volume=props.volume;},[props.sound,props.volume]);
 useEffect(()=>{const hide=()=>{if(document.hidden){stop();setStatus('Paused while away. Reconnect when ready.');}};document.addEventListener('visibilitychange',hide);return()=>{document.removeEventListener('visibilitychange',hide);stop();};},[]);
 const start=async()=>{
  if(busy||connected||!consent||!code.trim()||!props.sound)return;
  stop();const token=epoch.current;const current=()=>token===epoch.current;setBusy(true);setStatus('Checking voice availability…');const controller=new AbortController();abort.current=controller;
  try{
   const check=await fetch(base+'/api/voice/status',{signal:controller.signal});if(!check.ok||!(await check.json()).enabled)throw Error('Voice backend is not configured yet.');
   const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});if(!current()){stream.getTracks().forEach(t=>t.stop());return;}mic.current=stream;
   const pc=new RTCPeerConnection();peer.current=pc;const audio=new Audio();audio.autoplay=true;audio.volume=controls.current.volume;output.current=audio;
   pc.ontrack=e=>{if(current()){audio.srcObject=e.streams[0]??new MediaStream([e.track]);void audio.play().catch(()=>setStatus('Audio playback was blocked. End and reconnect.'));}};
   stream.getTracks().forEach(track=>pc.addTrack(track,stream));const channel=pc.createDataChannel('oai-events');seen.current.clear();
   channel.onopen=()=>{if(!current())return;for(const m of controls.current.history.slice(-8)){channel.send(JSON.stringify({type:'conversation.item.create',item:{type:'message',role:m.role,content:[{type:m.role==='user'?'input_text':'text',text:m.content.slice(0,500)}]}}));}setConnected(true);setBusy(false);setStatus('Listening · session ends automatically');controls.current.onAudioActive(true);};
   channel.onmessage=e=>{if(!current())return;try{const event=JSON.parse(e.data);if(event.type==='response.output_audio_transcript.delta')setCaption(c=>(c+String(event.delta||'')).slice(-2400));if(event.type==='response.created')setCaption('');let role:Message['role']|undefined;if(event.type==='conversation.item.input_audio_transcription.completed')role='user';if(event.type==='response.output_audio_transcript.done')role='assistant';if(role&&typeof event.transcript==='string'&&event.transcript.trim()){const key=role+':'+(event.item_id||event.event_id);if(!seen.current.has(key)){seen.current.add(key);controls.current.onTranscript({role,content:event.transcript.slice(0,6000)});if(role==='assistant')setCaption(event.transcript);}}if(event.type==='error'){stop();setStatus('Voice paused after a provider error.');}}catch{/* Ignore malformed transport events. */}};
   pc.onconnectionstatechange=()=>{if(current()&&['failed','disconnected','closed'].includes(pc.connectionState)){stop();setStatus('Voice disconnected. Reconnect when ready.');}};
   const offer=await pc.createOffer();await pc.setLocalDescription(offer);if(!current())return;
   const response=await fetch(base+'/api/voice/session',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+code.trim()},body:JSON.stringify({sdp:offer.sdp}),signal:controller.signal});const answer=await response.json();if(!response.ok)throw Error(answer.error||'Voice could not connect.');if(!current())return;
   await pc.setRemoteDescription({type:'answer',sdp:answer.sdp});setCode('');timer.current=setTimeout(()=>{if(current()){stop();setStatus('Session finished. Your transcript is in Chat.');}},Math.min(300,answer.maxSeconds||180)*1000);
  }catch(error){if(current()){stop();setStatus(error instanceof Error?error.message:'Voice unavailable.');}}
 };
 return <div className="realtime-voice"><p className="realtime-label">OpenAI voice</p><p className="realtime-caption" role="status">{caption||status}</p>{!connected&&!busy&&<><label className="voice-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Send microphone audio and recent conversation to OpenAI. API charges apply.</label><label className="voice-access">Private access code<input type="password" autoComplete="off" value={code} onChange={e=>setCode(e.target.value)} placeholder="Backend access code, not your OpenAI key"/></label></>}<button className="primary" disabled={!connected&&!busy&&(!consent||!code.trim()||!props.sound)} onClick={()=>{if(connected||busy){stop();setStatus('Voice ended. Your transcript is in Chat.');}else void start();}}>{connected?'End voice':busy?'Cancel connection':'Connect voice'}</button>{!props.sound&&<small>Unmute app sound before connecting.</small>}<small>Short sessions · no automatic reconnect · transcript stays in this visit</small></div>;
}
