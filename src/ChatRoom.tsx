import {inspectModelStartup} from './model-startup';
import {conversationStatus,type MicPhase} from './conversation-status';
import {lastEditableTurn,correctedContext} from './conversation-edit';
import {interruptReplyWork} from './interrupt-reply';
import {StreamingSpeech} from './streaming-speech';
import {selectOfflineMic} from './offline-mic';
import {guardedReply} from './reply-watchdog';
import {conversationInstructions,needsStructuredReply} from './conversation-policy';
import {watchModelWorker} from './model-health';
import {ModelInstallPrompt} from './ModelInstallPrompt';
import {OfflineMic,useOfflineMic} from './OfflineMic';
import {QuickGrounding} from './QuickGrounding';
import {stopGuides} from './useGuideAudio';
import { heartReady, heartSelected, synthesizeHeart, playHeartAudio, type HeartAudio, stopHeart, unlockHeart } from './local-voice';
import {localAIFailure} from './local-ai-status';
import { softenSpeech } from './speech';
import { CompanionMark, type CompanionAvatar } from './CompanionMark';
import { partialReply } from './reply-stream';
import { RoomCreations } from './RoomCreations';
import { type RoomArtifact } from './artifacts';
import { Icon } from './Icon';
import { useEffect, useRef, useState } from 'react';
import type { WebWorkerMLCEngine } from '@mlc-ai/web-llm';
import { loadLocalAI, localModelCached, boundedMessages, localInstructions, type Message } from './local-ai';
import { activityNames, parseCompanionReply, ReplyValidationError, replySchema, type Activity, type Ambience } from './chat-protocol';
import { CalmActivity } from './CalmActivity';
import { activities, activityIds } from './activity-registry';
import { contextPrompt, freshContext, recordTurn, planResponse, rememberResponse, declineActivity } from './adaptation';
import { VoiceLoop, subtitleSentence } from './voice-loop';
import type { Mood } from './mood';

type ChatMessage=Message & {activity?:Activity|null };
type Props={opened?:boolean;active?:boolean;avatar:CompanionAvatar;still:boolean;creations:RoomArtifact[];onDismissArtifact:(index:number)=>void;onClearArtifacts:()=>void;surface?:'notice';creationsAllowed?:boolean;onArtifact?:(artifact:RoomArtifact)=>void;volume:number;audioEnabled:boolean;suspendKey:number;onExit:()=>void;onMood:(mood:Mood)=>void;onAmbience:(ambience:Ambience)=>void;onAudioActive:(active:boolean)=>void};
export function ChatRoom(props:Props){
 const offlineMic=useOfflineMic();

 const [liveReply,setLiveReply]=useState(''),[heardPulse,setHeardPulse]=useState(0);
 const [installOpen,setInstallOpen]=useState(false),[cacheChecked,setCacheChecked]=useState(false);
 const installDismissed=useRef(false);
 const started=useRef(false),loadAbort=useRef<AbortController|null>(null);
 const acceptArtifact=(artifact?:RoomArtifact|null)=>{if(artifact&&controls.current.creationsAllowed!==false&&controls.current.active!==false)controls.current.onArtifact?.(artifact);};
 const session=useRef(freshContext()),voiceLoop=useRef<VoiceLoop|null>(null),sendCurrent=useRef<(words?:string)=>void>(()=>{});
 const [voiceResume,setVoiceResume]=useState(0);
 const localVoiceControl=useRef<((action?:'pause'|'start')=>void)|null>(null);
 const [handsFree,setHandsFree]=useState(false),[caption,setCaption]=useState('');
 const controls=useRef(props);controls.current=props;const isActive=()=>controls.current.active!==false;
 const [view,setView]=useState<'voice'|'chat'>('voice'),[draft,setDraft]=useState(''),[messages,setMessages]=useState<ChatMessage[]>([]);
 const [micPhase,setMicPhase]=useState<MicPhase>('idle'),[voicePending,setVoicePending]=useState(false);
 const [interruptStartSignal,setInterruptStartSignal]=useState(0);
 const [interrupting,setInterrupting]=useState(false),[queuedWords,setQueuedWords]=useState<string|null>(null);
 const [editing,setEditing]=useState<{words:string;prefix:ChatMessage[]}|null>(null);
 const modelWork=useRef<Promise<unknown>|null>(null),interruptStart=useRef(false);
 const [replySeconds,setReplySeconds]=useState(0);
 const replyAbort=useRef<AbortController|null>(null);
 const [state,setState]=useState<'off'|'loading'|'ready'|'busy'>('off'),[progress,setProgress]=useState(''),[notice,setNotice]=useState('');
 const [listening,setListening]=useState(false),[speaking,setSpeaking]=useState(false),[muted,setMuted]=useState(false),[subtitle,setSubtitle]=useState('');
 const [activity,setActivity]=useState<Activity|null>(null),[showTools,setShowTools]=useState(false);
 useEffect(()=>{if(props.active!==false)window.scrollTo({top:0,behavior:'instant'});},[view,activity]);
 const viewCurrent=useRef(view),mutedCurrent=useRef(muted);viewCurrent.current=view;mutedCurrent.current=muted;
 const engine=useRef<WebWorkerMLCEngine|null>(null),worker=useRef<Worker|null>(null),epoch=useRef(0),speechEpoch=useRef(0),end=useRef<HTMLDivElement>(null);
 // Recognition owns microphone capture; a second stream for animation can conflict on phones.
 const avatarRef=useRef<HTMLButtonElement>(null);
 const stopMic=()=>{voiceLoop.current?.pause();setListening(false);};
 const narration=useRef<StreamingSpeech|null>(null),narrationAbort=useRef<AbortController|null>(null);
 const stopSpeaking=()=>{setVoicePending(false);narration.current?.cancel();narration.current=null;narrationAbort.current?.abort();narrationAbort.current=null;stopGuides();speechEpoch.current++;stopHeart();window.speechSynthesis?.cancel();setSpeaking(false);};
 const unwatchWorker=useRef<(()=>void)|null>(null);
 const stopAI=()=>{loadAbort.current?.abort();loadAbort.current=null;modelWork.current=null;setInterrupting(false);setQueuedWords(null);interruptStart.current=false;localVoiceControl.current?.('pause');stopSpeaking();replyAbort.current?.abort();replyAbort.current=null;unwatchWorker.current?.();unwatchWorker.current=null;voiceLoop.current?.stop();epoch.current++;worker.current?.terminate();worker.current=null;engine.current=null;setLiveReply('');setState('off');};
 
 useEffect(()=>{controls.current.onAudioActive(listening||speaking);return()=>controls.current.onAudioActive(false);},[listening,speaking]);
 useEffect(()=>{if(controls.current.active!==false)end.current?.scrollIntoView({block:'nearest',behavior:'instant'});},[messages,state]);
 useEffect(()=>{const hide=()=>{if(document.hidden){stopAI();stopMic();setInstallOpen(false);setNotice('Voice paused while you were away. Your words are still here.');}};document.addEventListener('visibilitychange',hide);return()=>{document.removeEventListener('visibilitychange',hide);voiceLoop.current?.stop();narration.current?.cancel();narrationAbort.current?.abort();epoch.current++;speechEpoch.current++;loadAbort.current?.abort();replyAbort.current?.abort();unwatchWorker.current?.();worker.current?.terminate();stopHeart();window.speechSynthesis?.cancel();controls.current.onAudioActive(false);};},[]);
 useEffect(()=>{if(props.active===false){stopAI();stopMic();setInstallOpen(false);}},[props.active]);
 useEffect(()=>{if(!props.audioEnabled){voiceLoop.current?.stop();stopSpeaking();}},[props.audioEnabled]);
 useEffect(()=>{localVoiceControl.current?.('pause');voiceLoop.current?.stop();stopSpeaking();},[props.volume]);
 useEffect(()=>{if(props.suspendKey){voiceLoop.current?.stop();stopMic();stopSpeaking();}},[props.suspendKey]);
 const startStreamingVoice=(token:number)=>{
  if(controls.current.active===false||mutedCurrent.current||!controls.current.audioEnabled)return null;
  const controller=new AbortController();narrationAbort.current=controller;
  const current=()=>!controller.signal.aborted&&token===speechEpoch.current&&controls.current.active!==false&&viewCurrent.current==='voice'&&!mutedCurrent.current&&controls.current.audioEnabled;
  const useHeart=heartSelected()&&heartReady();
  const queue=new StreamingSpeech({prepare:useHeart?phrase=>{if(current())setVoicePending(true);return synthesizeHeart(planResponse({reply:phrase,activity:null,mood:null,ambience:'keep'},session.current).reply);}:undefined,play:(phrase,audio)=>new Promise<void>((resolve,reject)=>{
   if(!current()){resolve();return;}
   setVoicePending(true);
   const text=planResponse({reply:phrase,activity:null,mood:null,ambience:'keep'},session.current).reply;
   let settled=false;
   const finish=(error?:Error)=>{if(settled)return;settled=true;clearTimeout(timer);controller.signal.removeEventListener('abort',abort);if(error)reject(error);else resolve();};
   const abort=()=>finish();const timer=setTimeout(()=>finish(new Error('Voice playback took too long.')),60000);
   controller.signal.addEventListener('abort',abort,{once:true});
   const started=()=>{if(current()){setVoicePending(false);setSpeaking(true);setCaption(text);setNotice('');}};
   if(useHeart){
    void playHeartAudio(audio as HeartAudio,controls.current.volume,current,started,()=>finish()).then(()=>{if(!current())finish();}).catch(error=>finish(error));
   }else if(window.speechSynthesis){
    const utterance=new SpeechSynthesisUtterance(text);softenSpeech(utterance,controls.current.volume);utterance.onstart=started;
    utterance.onboundary=event=>{if(current())setCaption(subtitleSentence(text,event.charIndex));};
    utterance.onend=()=>finish();utterance.onerror=()=>finish(new Error('Voice audio could not play. Your text reply is still available.'));
    window.speechSynthesis.speak(utterance);
   }else finish(new Error('Read-aloud is unavailable here. Your text reply is still available.'));
  }),onDrain:()=>{if(current()){setVoicePending(false);setSpeaking(false);setCaption('');voiceLoop.current?.resume();setVoiceResume(n=>n+1);}if(narration.current===queue)narration.current=null;},onError:error=>{if(current()){setVoicePending(false);setSpeaking(false);setCaption('');setNotice(error instanceof Error?error.message:'Voice could not play. Your text reply is still here.');voiceLoop.current?.stop();localVoiceControl.current?.('pause');controller.abort();stopHeart();window.speechSynthesis?.cancel();}if(narration.current===queue)narration.current=null;}});
  narration.current=queue;return queue;
 };
 const changeView=(next:'voice'|'chat')=>{voiceLoop.current?.stop();stopMic();stopSpeaking();setActivity(null);setShowTools(false);setView(next);};
 const prepare=async()=>{if(worker.current||controls.current.active===false||document.hidden)return;if(!('gpu' in navigator)){setNotice('This browser cannot run the free local model. The activities and voice welcome still work.');return;}const token=++epoch.current;const cancellation=new AbortController();loadAbort.current=cancellation;setState('loading');setProgress('Preparing a little company…');setNotice('');try{const w=new Worker(new URL('./ai-worker.ts',import.meta.url),{type:'module'});worker.current=w;unwatchWorker.current?.();unwatchWorker.current=watchModelWorker(w,error=>{if(worker.current!==w)return;stopAI();setNotice(localAIFailure(error,'reply'));});let deadline:ReturnType<typeof setTimeout>|undefined;let e:WebWorkerMLCEngine;try{e=await Promise.race([loadLocalAI(w,text=>{if(token===epoch.current)setProgress(text);}),new Promise<never>((_,reject)=>{cancellation.signal.addEventListener('abort',()=>reject(new Error('Loading cancelled')),{once:true});deadline=setTimeout(()=>reject(new Error('load timeout')),300000);})]);}finally{if(deadline)clearTimeout(deadline);if(loadAbort.current===cancellation)loadAbort.current=null;}if(token!==epoch.current){w.terminate();return;}engine.current=e;setState('ready');setInstallOpen(false);setNotice('Companion ready. You can speak or type now.');}catch(error){if(token===epoch.current){stopAI();setNotice(localAIFailure(error,'prepare'));}}};
 const send=async(spoken?:string,baseHistory:ChatMessage[]=messages)=>{if(state!=='ready'||!engine.current||replyAbort.current||!isActive()||document.hidden||!(spoken||draft).trim())return;voiceLoop.current?.pause();stopMic();stopSpeaking();setNotice('');const words=(spoken||draft).trim();session.current=recordTurn(session.current,words);const history:ChatMessage[]=[...baseHistory,{role:'user' as const,content:words}];setMessages(history);setDraft('');setSubtitle('');setLiveReply('');setReplySeconds(0);setState('busy');const token=++epoch.current;const speechToken=speechEpoch.current;const voiceReply=viewCurrent.current==='voice';const structured=!voiceReply&&needsStructuredReply(words);const controller=new AbortController();replyAbort.current=controller;const speech=voiceReply?startStreamingVoice(speechToken):null;

 try{const generate=async(pulse:()=>void)=>{const stream=await engine.current!.chat.completions.create({messages:[{role:'system',content:(structured?localInstructions:conversationInstructions)+(voiceReply?' Reply in one or two short sentences, about 20–40 words.':'')+'\n'+(structured?contextPrompt(session.current):session.current.preference==='listen'?'Listen without advice.':'')+(structured?'\nAutomatic room creations: '+(props.creationsAllowed!==false?'enabled':'paused; artifact must be null')+(props.surface==='notice'?'\nYou are in the Notice space. Offer a fitting sensory visual or reflection via artifact, without claiming it will calm someone.':''):'')},...boundedMessages(history,!structured)],stream:true,max_tokens:structured?350:voiceReply?80:112,temperature:.6,...(structured?{response_format:{type:'json_object' as const,schema:replySchema}}:{})});let raw='';for await(const chunk of stream){if(token!==epoch.current)return null;const text=chunk.choices[0]?.delta.content||'';if(text){pulse();speech?.push(text);}raw+=text;if(raw.length>6000){engine.current?.interruptGenerate();throw new ReplyValidationError('Reply too large');}setLiveReply(structured?partialReply(raw):raw.slice(0,1200));}return structured?parseCompanionReply(raw):{reply:raw.trim().slice(0,1200),activity:null,mood:null,ambience:'keep' as const};};const parsed=await guardedReply(pulse=>{const work=generate(pulse);modelWork.current=work;const clear=()=>{if(modelWork.current===work)modelWork.current=null;};void work.then(clear,clear);return work;},seconds=>{if(token===epoch.current)setReplySeconds(seconds);},{signal:controller.signal});if(token!==epoch.current||!parsed)return;if(!parsed.reply.trim())throw new ReplyValidationError('Empty reply');const response=planResponse(parsed,session.current);session.current=rememberResponse(session.current,response);acceptArtifact(response.artifact);setMessages([...history,{role:'assistant',content:response.reply,activity:response.activity}]);setSubtitle(response.reply);setLiveReply('');setState('ready');if(controls.current.active!==false){if(response.mood)controls.current.onMood(response.mood);controls.current.onAmbience(response.ambience);}if(speech)speech.finish();else if(speechToken===speechEpoch.current){voiceLoop.current?.resume();setVoiceResume(n=>n+1);}}
 catch(error){if(token===epoch.current){if(error instanceof ReplyValidationError){stopSpeaking();setLiveReply('');setState('ready');setNotice('That reply could not be read. Your words are still here. You can try another message.');}else{stopAI();setNotice(localAIFailure(error,'reply'));}}}finally{if(replyAbort.current===controller)replyAbort.current=null;}};
 useEffect(()=>{if(!props.opened||props.active===false||started.current)return;started.current=true;let cancelled=false;void inspectModelStartup({cached:localModelCached,alive:()=>!cancelled,checked:()=>setCacheChecked(true),offer:()=>{if(!installDismissed.current)setInstallOpen(true);}});return()=>{cancelled=true;started.current=false;};},[props.opened,props.active]);
 sendCurrent.current=words=>{if(interrupting&&words?.trim()){setQueuedWords(words);return;}void send(words);};
 useEffect(()=>{if(state==='ready'&&!interrupting&&queuedWords){setQueuedWords(null);void send(queuedWords);}},[state,interrupting,queuedWords]);
 const beginBrowserVoice=(continuous:boolean)=>{
  if(state!=='ready'&&!interrupting){setNotice(state==='loading'?'The companion is still preparing.':'Restart the companion before speaking.');return;}
  if(heartSelected())unlockHeart();
  voiceLoop.current?.stop();stopMic();stopSpeaking();setDraft('');setNotice('');
  const loop=new VoiceLoop({create:()=>{const Constructor=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Constructor)throw new Error('unsupported');return new Constructor();},language:'en-US',onWords:words=>{setDraft(words);setHeardPulse(n=>n+1);},onTurn:words=>{if(!continuous)loop.stop();sendCurrent.current(words);},onState:(active,hearing)=>{setHandsFree(continuous&&active);setListening(hearing);},onError:setNotice});
  voiceLoop.current=loop;loop.start();
 };
 const startHandsFree=()=>{if(offlineMic){localVoiceControl.current?.();return;}if(handsFree){stopSpeaking();voiceLoop.current?.finishTurn();return;}beginBrowserVoice(true);};
 const dictate=()=>{if(offlineMic){setNotice('Use the local record button to record your words.');return;}if(listening){voiceLoop.current?.finishTurn();return;}beginBrowserVoice(false);};
 const interrupt=async(recordNext:boolean,preservePartial=true)=>{
  const running=engine.current,work=modelWork.current,hadWork=state==='busy'&&!!work;
  const token=++epoch.current;
  localVoiceControl.current?.('pause');voiceLoop.current?.stop();stopSpeaking();stopMic();
  replyAbort.current?.abort();replyAbort.current=null;setQueuedWords(null);setLiveReply('');setNotice('');
  if(preservePartial&&hadWork&&liveReply.trim())setMessages(current=>[...current,{role:'assistant',content:liveReply.trim()}]);
  setInterrupting(true);interruptStart.current=recordNext;if(recordNext)setInterruptStartSignal(n=>n+1);
  try{if(hadWork&&running)await interruptReplyWork(running,work);if(token===epoch.current&&engine.current===running){setState(running?'ready':'off');setInterrupting(false);}}
  catch(error){if(token===epoch.current){stopAI();setNotice(error instanceof Error?error.message:'The companion could not pause. Restart it to continue.');}}
 };
 useEffect(()=>{if(interruptStart.current&&(interrupting||state==='ready')){interruptStart.current=false;if(offlineMic)localVoiceControl.current?.('start');else beginBrowserVoice(true);}},[interrupting,state,interruptStartSignal]);
 const editLastWords=()=>{const turn=lastEditableTurn(messages);if(!turn)return;setEditing({words:turn.words,prefix:turn.prefix});void interrupt(false,false);};
 const resendEdit=()=>{if(!editing?.words.trim()||state!=='ready'||interrupting)return;const {words,prefix}=editing;session.current=correctedContext(session.current,prefix);setEditing(null);void send(words,prefix);};
 const chooseActivity=(kind:Activity)=>{voiceLoop.current?.stop();stopMic();stopSpeaking();setActivity(kind);setShowTools(false);};
 const lastSuggestion=[...messages].reverse().find(m=>m.role==='assistant')?.activity;
 const busy=state==='busy';
 const status=conversationStatus({model:state,mic:micPhase,listening,speaking,voicePending,editing:!!editing,interrupting});
 const waitingLabel=replySeconds<10?status.label:`${status.label} · ${replySeconds}s`;
 const editable=lastEditableTurn(messages);

 return <section className={'chat-room view-'+view+(props.surface?' notice-chat':'')+(activity?' activity-open':'')} aria-label="Conversation room"><div className="chat-title-row"><div><h1 className="sr-only">Conversation</h1></div></div>
 <ModelInstallPrompt open={installOpen&&!!props.opened&&props.active!==false} loading={state==='loading'} error={notice} progress={progress} onInstall={()=>void prepare()} onLater={()=>{installDismissed.current=true;setInstallOpen(false);}} onCancel={()=>{installDismissed.current=true;stopAI();setInstallOpen(false);}}/>
 <div className="conversation-mode-row" aria-label="Conversation view"><button className="mode-chip" aria-pressed={view==='voice'} onClick={()=>changeView('voice')}><Icon name="mic" size={17}/>Voice</button><button className="mode-chip" aria-pressed={view==='chat'} onClick={()=>changeView('chat')}><Icon name="chat" size={17}/>Chat</button></div>
 {!offlineMic&&<button className="quiet-link" onClick={()=>{voiceLoop.current?.stop();stopMic();stopSpeaking();selectOfflineMic(true);}}>Use on-device microphone instead</button>}
 {notice&&<div className="chat-notice" role="status">{notice}<button className="icon-button" aria-label="Dismiss chat notice" onClick={()=>setNotice('')}>×</button></div>}
 {cacheChecked&&state==='off'&&!installOpen&&<p className="local-model-status">The companion is not ready. <button className="quiet-link" onClick={()=>setInstallOpen(true)}>Restart companion</button></p>}
 <div className="conversation-status" data-phase={status.phase} role="status"><span className="status-mark" aria-hidden="true"><i/><i/><i/></span><span>{status.label}</span></div>
 {view==='voice'&&!editing&&<div className="voice-stage"><button ref={avatarRef} className={'voice-orb avatar-'+props.avatar+' '+(speaking?'speaking':listening?'listening':busy?'thinking':'resting')} data-phase={status.phase} aria-label={busy||speaking||voicePending?'Interrupt and speak':handsFree?'Pause conversation':'Start voice conversation'} onClick={()=>{if(busy||speaking||voicePending)void interrupt(true);else startHandsFree();}} disabled={state==='off'||state==='loading'}><span className="orb-ring ring-one"/><span className="orb-ring ring-two"/><span className="orb-core"/><span key={heardPulse} className={'orb-mark '+(heardPulse?'heard-feedback':'')}><CompanionMark kind={props.avatar}/></span></button><div className="subtitle-box" role="region" aria-label="Voice subtitles" aria-live={busy?'off':'polite'} aria-busy={busy}><span>{status.phase==='listening'?'YOUR TURN':status.phase==='speaking'?'SPEAKING':'HERE WITH YOU'}</span><textarea className="subtitle-text" aria-label="Conversation subtitles" readOnly value={state==='loading'?progress:state==='off'?'Prepare the companion, then speak or type.':listening?(draft||'I’m listening…'):speaking?(caption||liveReply||subtitle):busy?(liveReply||waitingLabel):(subtitle||'I’m here. Ready when you are.')} rows={3}/></div>{editable&&<div className="last-words"><div><small>You said</small><p>{editable.words}</p></div><button className="quiet-link" onClick={editLastWords}>Edit words</button></div>}<div className="voice-actions">{offlineMic?<OfflineMic continuous onPhase={setMicPhase} resumeSignal={voiceResume} controlRef={localVoiceControl} onSessionChange={setHandsFree} onPause={()=>{voiceLoop.current?.stop();stopSpeaking();}} active={props.active!==false&&view==='voice'&&!activity} disabled={(state!=='ready'&&!interrupting)||!!queuedWords} pauseSignal={props.suspendKey} onText={words=>sendCurrent.current(words)} onBeforeRecord={()=>{voiceLoop.current?.stop();stopMic();stopSpeaking();}} onAudioActive={props.onAudioActive}/>:<button className={'hands-free-button '+(handsFree?'active':'')} disabled={state!=='ready'&&!handsFree} aria-pressed={handsFree} onClick={startHandsFree}><Icon name={handsFree?'close':'mic'} size={18}/>{state==='loading'?'Preparing…':handsFree?(listening&&draft.trim()?'Finish & reply':'Pause voice'):'Let’s talk'}</button>}<div className="voice-secondary"><button className="voice-mute icon-button" aria-label={muted?'Unmute voice':'Mute voice'} aria-pressed={muted} onClick={()=>{localVoiceControl.current?.('pause');voiceLoop.current?.stop();stopSpeaking();setMuted(m=>!m);}}><Icon name={muted?'mute':'sound'} size={19}/></button>{!offlineMic&&<button className="icon-button" aria-label={listening?'Finish and send speech':'Dictate and send'} disabled={busy} onClick={dictate}><Icon name={listening?'close':'mic'} size={20}/></button>}</div></div><QuickGrounding active={props.active!==false} sound={props.audioEnabled&&!muted} volume={props.volume} pauseSignal={props.suspendKey} onBeforePlay={()=>{localVoiceControl.current?.('pause');voiceLoop.current?.stop();stopMic();stopSpeaking();}}/>{(draft.trim()||listening)&&<div className="voice-draft"><p>{draft||'Listening…'}</p><button className="primary" disabled={!draft.trim()||state!=='ready'} onClick={()=>void send()}>Share ↑</button></div>}</div>}
 {view==='chat'&&<div className="chat-transcript" role="log" aria-label="Conversation" aria-live="polite">{messages.length===0?<div className="chat-empty"><span>✧</span><p>What’s on your mind?</p></div>:messages.map((m,i)=><div className={'message '+m.role} key={i}><small>{m.role==='user'?'YOU':'COMPANION'}</small><p>{m.content}</p>{i===editable?.index&&<button className="quiet-link edit-words" onClick={editLastWords}>Edit words</button>}{m.activity&&!session.current.declined.includes(m.activity)&&<button className="suggestion-button" onClick={()=>chooseActivity(m.activity!)}>Try {activityNames[m.activity].toLowerCase()} ↗</button>}</div>)}{busy&&liveReply&&<div className="message assistant streaming-message"><small>COMPANION</small><p>{liveReply}</p></div>}{busy&&!liveReply&&<div className="thinking" role="status"><i/><i/><i/><span>{waitingLabel}</span></div>}<div ref={end}/></div>}
 {editing&&<form className="transcript-editor" onSubmit={event=>{event.preventDefault();resendEdit();}}><label htmlFor="corrected-words">Your words</label><textarea id="corrected-words" autoFocus rows={4} maxLength={2000} value={editing.words} onChange={event=>setEditing(current=>current?{...current,words:event.target.value}:null)}/><p>Sending again replaces this turn and its reply.</p><div><button type="button" className="quiet-link" onClick={()=>setEditing(null)}>Cancel</button><button type="submit" className="primary" disabled={!editing.words.trim()||state!=='ready'||interrupting}>Send correction</button></div></form>}
 {view==='chat'&&!editing&&<div className="chat-composer"><label className="sr-only" htmlFor="chat-thought">Message your companion</label><textarea id="chat-thought" rows={2} maxLength={2000} placeholder={listening?'Listening…':'Say what’s here for you…'} value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();void send();}}}/><div className="chat-composer-controls">{offlineMic?<OfflineMic compact onPhase={setMicPhase} active={props.active!==false&&view==='chat'&&!activity} disabled={(state!=='ready'&&!interrupting)||!!queuedWords} pauseSignal={props.suspendKey} onText={words=>sendCurrent.current(words)} onBeforeRecord={()=>{voiceLoop.current?.stop();stopMic();stopSpeaking();}} onAudioActive={props.onAudioActive}/>:<button className={'dictate-control '+(listening?'active':'')} aria-label={listening?'Finish and send speech':'Dictate and send'} aria-pressed={listening} onClick={dictate} disabled={busy}><Icon name={listening?'close':'mic'} size={20}/></button>}<span>{state==='off'?'Companion not ready':listening?'Listening…':''}</span>{busy?<button className="send-message" aria-label="Stop sending" aria-busy="true" onClick={()=>{stopAI();setNotice('Reply stopped. Your words are still here.');}}><span className="send-stop" aria-hidden="true"/></button>:<button className="send-message" aria-label="Send message" disabled={!draft.trim()||state!=='ready'} onClick={()=>void send()}>↑</button>}</div></div>}

 {activityIds.filter(kind=>props.active!==false&&activity===kind).map(kind=><div key={kind} hidden={activity!==kind} inert={activity!==kind} className="session-panel"><CalmActivity sessionKey="chat" active={props.active!==false&&activity===kind} sound={props.audioEnabled&&props.active!==false&&activity===kind&&!speaking&&!listening} volume={props.volume} kind={kind} pauseSignal={props.suspendKey} onClose={()=>setActivity(null)} onFeedback={helped=>{if(helped)session.current={...session.current,helpful:[...new Set([...session.current.helpful,kind])]};else session.current=declineActivity(session.current,kind);}}/></div>)}
 {lastSuggestion&&(view==='chat'||activity)&&!session.current.declined.includes(lastSuggestion)&&<button className="quiet-link decline-suggestion" onClick={()=>{session.current=declineActivity(session.current,lastSuggestion);setNotice('I won’t suggest that activity again during this visit.');}}>Don’t suggest this again</button>}
 {!props.surface&&<RoomCreations controls={false} items={props.creations} onDismiss={props.onDismissArtifact}/>}
 {view==='voice'&&busy&&!handsFree&&<button className="quiet-link stop-reply" onClick={stopAI}>Stop reply</button>}
 <div className="module-tray"><button className="quiet-link" aria-expanded={showTools} onClick={()=>setShowTools(s=>!s)}><Icon name="sun" size={17}/> Moments <span>{showTools?'−':'+'}</span></button></div>{showTools&&<div className="module-picker" aria-label="Calming activities">{activityIds.map(kind=><button key={kind} onClick={()=>chooseActivity(kind)}><span>{activities[kind].icon}</span><strong>{activityNames[kind]}</strong></button>)}</div>}



 </section>;
}
