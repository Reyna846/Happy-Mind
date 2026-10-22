export type MicState='off'|'loading'|'ready'|'error';
let state:MicState='off',message='',selected=localStorage.getItem('hm-mic-engine')!=='browser';
let worker:Worker|undefined,serial=0;
const listeners=new Set<()=>void>();
const pending=new Map<number,{resolve:(data:{text?:string})=>void;reject:(e:Error)=>void;timer:ReturnType<typeof setTimeout>}>();
export const subscribeMic=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
export const micSnapshot=()=>state+':'+selected+':'+message;
export const offlineMicSelected=()=>selected;
export const offlineMicReady=()=>state==='ready';
export const micStatus=()=>({state,message});
function notify(){for(const fn of listeners)fn();}
export function selectOfflineMic(value:boolean){selected=value;localStorage.setItem('hm-mic-engine',value?'offline':'browser');notify();}
export function resetOfflineMic(){worker?.terminate();worker=undefined;state='off';message='';for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Local microphone preparation stopped.'));}pending.clear();notify();}
function request(type:'prepare'|'transcribe',samples?:Float32Array){
 if(!worker){worker=new Worker(new URL('./offline-mic-worker.ts',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{if(data.type==='progress'){message='Downloading speech model · '+data.progress+'%';notify();return;}const p=pending.get(data.id);if(!p)return;clearTimeout(p.timer);pending.delete(data.id);if(data.type==='error'){if(state==='loading')state='error';p.reject(Error('Local speech could not run. Try preparing again, or type your words.'));notify();}else{if(data.type==='ready'){state='ready';message='English microphone ready on this device.';notify();}p.resolve(data);}};
  worker.onerror=()=>{resetOfflineMic();state='error';message='Local speech could not load. Check connection and prepare again.';notify();};
 }
 const id=++serial;
 return new Promise<{text?:string}>((resolve,reject)=>{const timer=setTimeout(()=>{resetOfflineMic();state='error';message='Local speech took too long. You can still type.';notify();},type==='prepare'?300000:90000);pending.set(id,{resolve,reject,timer});worker!.postMessage({id,type,samples},samples?[samples.buffer]:[]);});
}
export async function prepareOfflineMic(){if(state==='ready'||state==='loading')return;state='loading';message='Preparing English speech. Initial download required.';notify();try{await request('prepare');}catch(e){state='error';message=e instanceof Error?e.message:'Preparation failed.';notify();}}
export async function transcribeOffline(samples:Float32Array){if(state!=='ready')throw Error('Prepare the local microphone in Sound settings first.');return (await request('transcribe',samples)).text?.trim().slice(0,2000)||'';}
