import {useTheme} from './useTheme';
import type {ThemePreference} from './useTheme';
import {cozyMoments} from './CozyMoments';
import {InstallApp} from './InstallApp';
import {AppUpdate} from './AppUpdate';
import { RoomCarousel } from './RoomCarousel';
import { stopHeart } from './local-voice';
import {SlideEntry} from './SlideEntry';
import {CalmActivity} from './CalmActivity';
import {activities} from './activity-registry';
import type {Activity} from './chat-protocol';
import {useGentleHaptics} from './useGentleHaptics';
import { Breathing } from './Breathing';
import { CompanionMark, type CompanionAvatar } from './CompanionMark';
import { RoomCreations } from './RoomCreations';
import { VoiceSettings } from './VoiceSettings';
import { WindDown } from './WindDown';
import { NoticeRoom } from './NoticeRoom';
import type { RoomArtifact } from './artifacts';
import { WaterPond } from './WaterPond';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import './responsive.css';
import './controls.css';
import './theme.css';
import {natureMoments} from './NatureMoments';
import type {Toy} from './FidgetRoom';
import { FidgetRoom } from './FidgetRoom';
import { Atmosphere } from './Atmosphere';
import { moodFromWords, type Mood } from './mood';
import { ChatRoom } from './ChatRoom';
import { Icon } from './Icon';
import { WelcomeBloom } from './WelcomeBloom';
import { createSoundscape, soundscapes, volumeGain, type Soundscape } from './soundscapes';
import type { Ambience } from './chat-protocol';

type Room = 'home' | 'flow' | 'talk' | 'breathe' | 'ground' | 'ripple' | 'fidget' | 'moments' | 'winddown' | 'practice';

type Recognition = { continuous:boolean; interimResults:boolean; lang:string; start:()=>void; stop:()=>void; abort:()=>void; onresult:((e:{results:{length:number;[n:number]:{isFinal:boolean;[n:number]:{transcript:string}}};resultIndex:number})=>void)|null; onerror:((e:{error:string})=>void)|null; onend:(()=>void)|null; };
declare global { interface Window { SpeechRecognition?:new()=>Recognition; webkitSpeechRecognition?:new()=>Recognition; } }


function App(){
const [theme,setTheme]=useTheme();
const [creationsAllowed,setCreationsAllowed]=useState(()=>localStorage.getItem('hm-creations')!=='off'),[avatar,setAvatar]=useState<CompanionAvatar>(()=>{const v=localStorage.getItem('hm-avatar');return v==='waves'||v==='glow'?v:'flower';});
useEffect(()=>{localStorage.setItem('hm-creations',creationsAllowed?'on':'off');},[creationsAllowed]);
useEffect(()=>{localStorage.setItem('hm-avatar',avatar);},[avatar]);
const [entering,setEntering]=useState(true);
const [practice,setPractice]=useState<Activity>('draw'),[toy,setToy]=useState<Toy>('cat');

const [creations,setCreations]=useState<RoomArtifact[]>([]),[volumeOpen,setVolumeOpen]=useState(false),[flowEntry,setFlowEntry]=useState(0);
const volumePanel=useRef<HTMLDivElement>(null);
useEffect(()=>{if(!volumeOpen)return;const outside=(e:PointerEvent)=>{if(!volumePanel.current?.contains(e.target as Node))setVolumeOpen(false);};const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setVolumeOpen(false);};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};},[volumeOpen]);
const [room,setRoom]=useState<Room>('home'),[mood,setMood]=useState<Mood>('lake');
const [guideSpeaking,setGuideSpeaking]=useState(false);
useEffect(()=>{const changed=(e:Event)=>setGuideSpeaking(Boolean((e as CustomEvent).detail));window.addEventListener('hm-guide-audio',changed);return()=>window.removeEventListener('hm-guide-audio',changed);},[]);
const [adaptive,setAdaptive]=useState(true),[chatAudioActive,setChatAudioActive]=useState(false),[ambience,setAmbience]=useState<Ambience>('keep'),[chatReset,setChatReset]=useState(0),[chatSuspend,setChatSuspend]=useState(0);
const [sound,setSound]=useState(()=>localStorage.getItem('hm-sound')!=='off');
const [scape,setScape]=useState<Soundscape>(()=>{const saved=localStorage.getItem('hm-scape');return saved&&saved in soundscapes?saved as Soundscape:'hum';}),[volume,setVolume]=useState(.55);
const ambient=useRef<ReturnType<typeof createSoundscape>|null>(null);
const [haptics,setHaptics]=useState(()=>localStorage.getItem('hm-haptics')!=='off');
useEffect(()=>{localStorage.setItem('hm-haptics',haptics?'on':'off');},[haptics]);
const [still,setStill]=useState(()=>localStorage.getItem('hm-still')==='on');
useGentleHaptics(haptics,still);
const mainRef=useRef<HTMLElement>(null);
useEffect(()=>{const node=mainRef.current;if(!node||entering||still||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const animation=node.animate([{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.2,.7,.3,1)'});return()=>animation.cancel();},[room,entering,still]);
const [input,setInput]=useState<'dictate'|'type'>('dictate');
const [draft,setDraft]=useState(''),[thoughts,setThoughts]=useState<string[]>([]),[listening,setListening]=useState(false),[notice,setNotice]=useState('');
const [paused,setPaused]=useState(false);
const dialog=useRef<HTMLDialogElement>(null), recognition=useRef<Recognition|null>(null), audio=useRef<AudioContext|null>(null), gain=useRef<GainNode|null>(null);
const returnRoom=useRef<Room>('home'),groundFromBreath=useRef(false);

const stopMic=()=>{recognition.current?.abort();recognition.current=null;setListening(false);};
const stopAudio=()=>{ambient.current?.stop(true);ambient.current=null;if(audio.current){void audio.current.close();audio.current=null;gain.current=null;}};
const startAudio=(enabled=sound)=>{ if(!enabled||audio.current)return; try {const ctx=new AudioContext();audio.current=ctx; const master=ctx.createGain();master.gain.value=ambience==='quiet'?0:volumeGain(volume)*(ambience==='soften'?.4:1);master.connect(ctx.destination);gain.current=master;
[174.61,261.63,349.23].forEach((freq,i)=>{const osc=ctx.createOscillator(),g=ctx.createGain();osc.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime);g.gain.linearRampToValueAtTime(.10/(i+1),ctx.currentTime+.9);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+5);osc.connect(g);g.connect(master);osc.start(ctx.currentTime+.15);osc.stop(ctx.currentTime+5.2);});
ambient.current=createSoundscape(ctx,master,scape,()=>setNotice('This recording could not play here. A gentle generated shore is playing instead.'));void ctx.resume();} catch {setNotice('Sound is unavailable here. You can still enjoy the room.');}};
const go=(next:Room)=>{setChatSuspend(n=>n+1);stopMic();stopHeart();window.speechSynthesis?.cancel();setNotice('');setDraft('');setVolumeOpen(false);if(next==='flow')setFlowEntry(n=>n+1);setRoom(next);window.scrollTo(0,0);setPaused(false);startAudio();};
useEffect(()=>{document.documentElement.dataset.mood=mood;document.documentElement.dataset.still=String(still);},[mood,still]);
useEffect(()=>{localStorage.setItem('hm-sound',sound?'on':'off');if(!sound)stopAudio();},[sound]);
useEffect(()=>{localStorage.setItem('hm-still',still?'on':'off');},[still]);

useEffect(()=>{const hide=()=>{if(document.hidden){stopMic();stopAudio();stopHeart();window.speechSynthesis?.cancel();setPaused(true);}};document.addEventListener('visibilitychange',hide);return()=>{document.removeEventListener('visibilitychange',hide);stopMic();stopAudio();};},[]);
useEffect(()=>{if(gain.current&&audio.current)gain.current.gain.setTargetAtTime(ambience==='quiet'?0:volumeGain(volume)*((listening||chatAudioActive||guideSpeaking)?.15:ambience==='soften'?.4:1),audio.current.currentTime,.5);},[listening,chatAudioActive,guideSpeaking,ambience,sound,volume]);
useEffect(()=>{localStorage.setItem('hm-scape',scape);if(audio.current&&gain.current){ambient.current?.stop();ambient.current=createSoundscape(audio.current,gain.current,scape,()=>setNotice('Recording unavailable. Playing generated shore instead.'));}},[scape]);
useEffect(()=>{if(!adaptive||room!=='flow'||draft.trim().length<5)return;const timer=setTimeout(()=>{const next=moodFromWords(draft);if(next)setMood(next);},1400);return()=>clearTimeout(timer);},[draft,room,adaptive]);
const dictate=()=>{if(listening){recognition.current?.stop();return;}const Constructor=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Constructor){setInput('type');setNotice('Dictation is not supported in this browser. You can type, or use your keyboard’s microphone.');return;}stopMic();const r=new Constructor();recognition.current=r;r.lang='en-US';r.continuous=true;r.interimResults=false;
r.onresult=e=>{if(recognition.current!==r)return;let words='';for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)words+=e.results[i][0].transcript+' ';setDraft(d=>(d+' '+words).trim().slice(0,2000));};
r.onerror=e=>{setListening(false);setNotice(e.error==='not-allowed'?'Microphone access was not allowed. Switch to typing whenever you like.':'Dictation paused. You can try again or switch to typing.');};r.onend=()=>{if(recognition.current===r){recognition.current=null;setListening(false);}};
try{r.start();setListening(true);setNotice('');}catch{setNotice('The microphone could not start. Try typing instead.');}};
const release=()=>{if(!draft.trim())return;stopMic();setThoughts(t=>[...t.slice(-19),draft.trim()]);setDraft('');setNotice('Your thought has a little space now.');};
const openTool=(tool:Room)=>{if(tool==='ground')groundFromBreath.current=room==='breathe';if(!['breathe','ground','ripple','fidget','practice','winddown'].includes(room))returnRoom.current=room;go(tool);};

const openSettings=()=>{stopMic();setPaused(true);setChatSuspend(n=>n+1);dialog.current?.showModal();};


const tools=<div className="tool-list"><button onClick={()=>openTool('breathe')}><span>◯</span><div>A softer breath<small>Follow a gentle rhythm</small></div><Icon name="arrow" size={18}/></button><button onClick={()=>openTool('ground')}><Icon name="sun"/><div>Come back to here<small>Notice the world around you</small></div><Icon name="arrow" size={18}/></button><button onClick={()=>openTool('ripple')}><Icon name="flow"/><div>A moment of ripples<small>No score. Nowhere to get to.</small></div><Icon name="arrow" size={18}/></button><button onClick={()=>openTool('fidget')}><span>⠿</span><div>Fidget</div><Icon name="arrow" size={18}/></button></div>;
return <>{entering&&<SlideEntry still={still} onOpen={()=>{setEntering(false);startAudio();requestAnimationFrame(()=>mainRef.current?.focus({preventScroll:true}));}}/>}<AppUpdate/><div inert={entering} className={'app-shell room-'+room}><div className="landscape" aria-hidden="true"/><div className="wash" aria-hidden="true"/><Atmosphere/>
<header><div className="header-left">{['breathe','ground','ripple','fidget','practice'].includes(room)&&<button className="icon-button header-back" aria-label="Back" onClick={()=>go(room==='ground'&&groundFromBreath.current?'breathe':['breathe','ground','ripple','fidget','practice','winddown'].includes(room)?returnRoom.current:'home')}><Icon name="back" size={20}/></button>}<div className="brand" aria-label="Happy Mind"><Icon name="leaf" size={25}/><span>happy mind<span className="brand-dot">.</span></span></div></div><div className="header-right"><div className="volume-popover-wrap" ref={volumePanel}><button className="icon-button" aria-expanded={volumeOpen} aria-controls="quick-volume" aria-label="Volume" onClick={()=>setVolumeOpen(v=>!v)}><Icon name={sound&&volume>0?'sound':'mute'} size={20}/></button>{volumeOpen&&<div className="volume-popover" id="quick-volume"><label htmlFor="quick-volume-range">Volume</label><input id="quick-volume-range" type="range" min="0" max="1" step=".01" value={sound?volume:0} onChange={e=>{const next=Number(e.target.value);setVolume(next);setSound(next>0);if(next>0){setAmbience('keep');startAudio(true);}}}/><button className="quiet-link" aria-pressed={!sound} onClick={()=>{if(sound)setSound(false);else{setSound(true);if(volume===0)setVolume(.4);setAmbience('keep');startAudio(true);}}}>{sound?'Mute':'Unmute'}</button></div>}</div><button className="icon-button" aria-label="Open settings" onClick={openSettings}><Icon name="settings" size={20}/></button></div></header>
<main ref={mainRef} id="main-content" tabIndex={-1}>
{room==='home'&&<section className="welcome home-start"><WelcomeBloom interactive still={still||entering}/><h1>Come as you are.</h1><p className="intro">A conversation, a quiet breath, or a little play.</p><RoomCarousel onChoose={next=>next==='breathe'?openTool('breathe'):go(next)}/><button className="quiet-link" onClick={()=>go('moments')}><Icon name="cat" size={20}/> A little play</button></section>}
<div className="session-panel talk-panel" hidden={room!=='talk'} inert={room!=='talk'}><ChatRoom opened={!entering} active={room==='talk'} key={chatReset} avatar={avatar} still={still} creations={creations} creationsAllowed={creationsAllowed} onDismissArtifact={i=>setCreations(items=>items.filter((_,n)=>n!==i))} onClearArtifacts={()=>setCreations([])} audioEnabled={sound&&volume>0} volume={volume} onArtifact={a=>setCreations(items=>[...items.slice(-2),a])} suspendKey={chatSuspend} onExit={()=>go('home')} onMood={next=>{if(adaptive)setMood(next);}} onAmbience={next=>{if(next!=='keep')setAmbience(next);}} onAudioActive={setChatAudioActive}/></div>
{room==='flow'&&<section className="session"><h1>Let it flow.</h1>
{thoughts.length>0&&<div className="thought-stream" aria-label="Your released thoughts">{thoughts.slice(-3).map((t,i)=><p key={thoughts.length+i}>{t}</p>)}</div>}
<div className="composer"><div className="composer-top"><div className="segmented" aria-label="Input method"><button aria-pressed={input==='dictate'} onClick={()=>setInput('dictate')}><Icon name="mic" size={15}/> Speak</button><button aria-pressed={input==='type'} onClick={()=>{stopMic();setInput('type');}}>Type</button></div></div>
{input==='dictate'&&<div className="dictation"><button className={'mic-button '+(listening?'listening':'')} aria-label={listening?'Stop dictation':'Start dictation'} aria-pressed={listening} onClick={dictate}><Icon name="mic" size={28}/></button><span>{listening?'Listening…':'Speak'}</span></div>}
<label className="sr-only" htmlFor="thought">Your thoughts</label><textarea id="thought" value={draft} maxLength={2000} onChange={e=>setDraft(e.target.value)} placeholder={input==='dictate'?'Your words will appear here…':'What would you like to put down?'} rows={input==='dictate'?2:4}/><div className="composer-bottom"><span>Only here, for this visit.</span><button className="primary" disabled={!draft.trim()} onClick={release}>Release<Icon name="arrow" size={17}/></button></div></div>
{thoughts.length>0&&<button className="quiet-link" onClick={()=>{setThoughts([]);setNotice('Released thoughts cleared.');}}>Clear my released thoughts</button>}
<details className="room-tools"><summary>✧ Moments</summary>{tools}</details></section>}
{room==='moments'&&<section className="moments-hub"><h1>A moment for you.</h1><p className="intro">Choose what feels good right now.</p><h2 className="moment-category">Settle & notice</h2><div className="moment-grid">{([{id:'breathe',title:'Breathe',sub:'A softer rhythm',icon:'◯'},{id:'ground',title:'Notice',sub:'Colour, touch & sound',icon:'✧'},{id:'draw',title:'Draw',sub:'Follow a leaf or wander',icon:'〰'},{id:'ripple',title:'Water',sub:'Make a little ripple',icon:'≋'}] as const).map(t=><button className="moment-tile" key={t.id} onClick={()=>{if(t.id==='draw'){setPractice('draw');openTool('practice');}else openTool(t.id);}}><span>{t.icon}</span><strong>{t.title}</strong><small>{t.sub}</small></button>)}</div><h2 className="moment-category">A little play</h2><div className="moment-grid">{([{id:'cat',title:'Car',sub:'A small purring friend',icon:'♡'},{id:'bubbles',title:'Bubbles',sub:'Soft little pops',icon:'⠿'},{id:'glow',title:'Glow',sub:'Leave a trail of light',icon:'✧'},{id:'sand',title:'Sand',sub:'Let your finger wander',icon:'〰'}] as const).map(t=><button className="moment-tile" key={t.id} onClick={()=>{setToy(t.id);openTool('fidget');}}><span>{t.id==='cat'?<Icon name="cat" size={28}/>:t.icon}</span><strong>{t.title}</strong><small>{t.sub}</small></button>)}</div><h2 className="moment-category">Little nature moments</h2><div className="moment-grid">{[...natureMoments,...cozyMoments].map(t=><button className="moment-tile" key={t.id} onClick={()=>{setToy(t.id);openTool('fidget');}}><span>{t.icon}</span><strong>{t.label}</strong><small>{t.sub}</small></button>)}</div><h2 className="moment-category">Make a little space</h2><div className="moment-grid">{(Object.keys(activities) as Activity[]).filter(id=>!['breathe','ground','draw'].includes(id)).map(id=><button className="moment-tile" key={id} onClick={()=>{setPractice(id);openTool('practice');}}><span>{activities[id].icon}</span><strong>{activities[id].title}</strong><small>{activities[id].summary}</small></button>)}</div></section>}
{(Object.keys(activities) as Activity[]).filter(id=>!['breathe','ground'].includes(id)).map(id=><div key={id+chatReset} className="session-panel" hidden={room!=='practice'||practice!==id} inert={room!=='practice'||practice!==id}><CalmActivity kind={id} sound={sound&&room==='practice'&&practice===id} volume={volume} pauseSignal={chatSuspend} onClose={()=>go('moments')}/></div>)}
<div className="session-panel bedtime-panel" hidden={room!=='winddown'} inert={room!=='winddown'}><WindDown key={chatReset}/></div>
<div className="session-panel notice-panel" hidden={room!=='ground'} inert={room!=='ground'}><NoticeRoom sound={sound} volume={volume} pauseSignal={chatSuspend} onTalk={()=>go('talk')} active={room==='ground'} onBreathe={()=>go('breathe')} key={chatReset} items={creations} onItems={setCreations}/></div>
{(['breathe','ripple','fidget'] as const).map(tool=><div key={tool+chatReset} className="session-panel" hidden={room!==tool} inert={room!==tool}><section className="activity"><h1>{tool==='breathe'?'Breathe.':tool==='ripple'?'Water.':'A little play.'}</h1>
{tool==='breathe'&&<Breathing active={room==='breathe'} sound={sound&&room==='breathe'} volume={volume} pauseSignal={chatSuspend} onNext={()=>{groundFromBreath.current=true;go('ground');}}/>}
{tool==='fidget'&&<FidgetRoom still={still} onToyChange={setToy} initialToy={toy} active={room==='fidget'} sound={sound&&room==='fidget'} volume={volume} pauseSignal={chatSuspend}/>}
{tool==='ripple'&&<><p className="intro">Touch the water.</p><WaterPond sound={sound&&room==='ripple'} volume={volume} pauseSignal={chatSuspend}/></>}
</section></div>)}
</main><nav className="room-nav" aria-label="Rooms">{([{id:'home',icon:'leaf',label:'Home'},{id:'talk',icon:'conversation',label:'Talk'},{id:'winddown',icon:'moon',label:'Wind down'},{id:'moments',icon:'sun',label:'Moments'}] as const).map(item=><button key={item.id} aria-current={(room===item.id||(item.id==='moments'&&['breathe','ground','ripple','fidget','practice'].includes(room)))?'page':undefined} onClick={()=>item.id==='winddown'?openTool('winddown'):go(item.id)}><Icon name={item.icon} size={21}/><span>{item.label}</span></button>)}</nav>
{notice&&<div className="notice" role="status"><span>{notice}</span><button className="icon-button" aria-label="Dismiss message" onClick={()=>setNotice('')}><Icon name="close" size={16}/></button></div>}
<dialog ref={dialog} onClose={()=>{stopHeart();window.speechSynthesis?.cancel();}} aria-labelledby="settings-title"><div className="dialog-header"><span className="eyebrow">YOUR LITTLE ROOM</span><button className="icon-button" aria-label="Close settings" onClick={()=>dialog.current?.close()}><Icon name="close"/></button></div><h2 id="settings-title">Settings</h2><InstallApp/><details className="settings-group"><summary><Icon name="sound" size={18}/> Sound</summary><div className="setting"><div>Welcome sound<small>A soft chime, then your soundscape.</small></div><button className="switch" role="switch" aria-checked={sound} aria-label="Welcome sound" onClick={()=>{if(sound)setSound(false);else {setAmbience('keep');setSound(true);startAudio(true);}}}><span/></button></div><fieldset className="sound-library"><legend>Background sound</legend><p className="setting-hint">Plays across rooms when sound is on; softens while you talk. Voice replies have their own voice setting below.</p><div className="sound-options">{(Object.keys(soundscapes) as Soundscape[]).map(id=><button key={id} aria-pressed={scape===id} onClick={()=>{setScape(id);if(sound)startAudio();}}><span>{['hum','rain','drops','waves'].indexOf(id)===0?'◌':id==='rain'?'⸬':id==='drops'?'⋮':'≋'}</span><strong>{soundscapes[id].title}</strong><small>{soundscapes[id].description}</small></button>)}</div><label className="volume-control">Ambient volume<input type="range" min="0" max="1" step=".01" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></label></fieldset><VoiceSettings sound={sound&&volume>0} volume={volume}/></details><details className="settings-group"><summary><Icon name="sun" size={18}/> Appearance</summary><fieldset className="theme-options"><legend>Theme</legend><div role="group" aria-label="App theme">{(['light','dark','system'] as ThemePreference[]).map(option=><button key={option} aria-pressed={theme===option} onClick={()=>setTheme(option)}><Icon name={option==='dark'?'moon':option==='light'?'sun':'settings'} size={18}/>{option==='light'?'Light':option==='dark'?'Dark':'System'}</button>)}</div><p className="setting-hint">System follows your device’s appearance. Your choice is saved on this device.</p></fieldset><div className="setting"><div>Gentle vibrations<small>Soft touch feedback on supported devices. Pauses with Less movement.</small></div><button className="switch" role="switch" aria-checked={haptics} aria-label="Gentle vibrations" onClick={()=>setHaptics(v=>!v)}><span/></button></div><div className="setting"><div>Less movement<small>A stiller place to rest your eyes.</small></div><button className="switch" role="switch" aria-checked={still} aria-label="Less movement" onClick={()=>setStill(s=>!s)}><span/></button></div><div className="setting"><div>Auto atmosphere<small>Colours respond to conversation cues.</small></div><button className="switch" role="switch" aria-checked={adaptive} aria-label="Adaptive atmosphere" onClick={()=>setAdaptive(a=>!a)}><span/></button></div><fieldset><legend>Palette</legend><div className="mood-options">{(['lake','dusk','sand'] as Mood[]).map(m=><button key={m} aria-pressed={m===mood} onClick={()=>{setAdaptive(false);setMood(m);}}><span className={'swatch '+m}/>{m==='lake'?'Lavender':m==='dusk'?'Twilight':'Rose'}</button>)}</div></fieldset></details><details className="settings-group"><summary><Icon name="chat" size={18}/> Companion</summary><fieldset className="avatar-settings"><legend>Voice avatar</legend><p className="setting-hint">The shape you see while talking. Your companion stays the same.</p><div className="avatar-options">{(['flower','waves','glow'] as const).map(kind=><button key={kind} aria-pressed={avatar===kind} onClick={()=>setAvatar(kind)}><CompanionMark kind={kind}/><span>{kind==='flower'?'Flower':kind==='waves'?'Waves':'Glow'}</span></button>)}</div></fieldset><RoomCreations items={creations} enabled={creationsAllowed} onToggle={()=>setCreationsAllowed(v=>!v)} onClear={()=>setCreations([])} onDismiss={i=>setCreations(items=>items.filter((_,n)=>n!==i))}/></details><details className="settings-group"><summary><Icon name="leaf" size={18}/> Privacy &amp; data</summary><div className="privacy"><strong>Your words belong to you.</strong><p>Thoughts stay in this tab’s memory. They aren’t saved by this app and clear when you reload. Browser recognition may use an online speech provider. Optional local microphone transcription runs on this device after a download; recordings are not uploaded or saved. Local AI runs on your device after a model download. The companion uses the local model; no cloud conversation option is offered. Spoken replies use your device’s speech service (which may process text online), or the optional downloaded Heart voice running locally. Voice mode uses microphone turns and read-aloud with subtitles; it is not full-duplex live audio.</p><p>This is your personal space to feel and reflect. If you need more support, reaching someone you trust is always an option.</p><p><a href={import.meta.env.BASE_URL+'audio/CREDITS.md'} target="_blank" rel="noreferrer">Sound recording credits</a> · Effib &amp; ZooFari · CC BY-SA 3.0</p></div><button className="quiet-link" onClick={()=>{stopMic();setDraft('');setThoughts([]);setCreations([]);setChatReset(n=>n+1);stopHeart();window.speechSynthesis?.cancel();setNotice('Your words have been cleared.');dialog.current?.close();}}>Clear all my words</button></details></dialog>
</div></>;
}

createRoot(document.getElementById('root')!).render(<App/>);
