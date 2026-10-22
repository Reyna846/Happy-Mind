let worker: Worker | undefined;
let ready = false;
let serial = 0;
let source: AudioBufferSourceNode | undefined;
let context: AudioContext | undefined;
let playbackEpoch=0;
let output:GainNode|undefined;
const pending = new Map<number,{resolve:(data:any)=>void;reject:(error:Error)=>void;timer:ReturnType<typeof setTimeout>}>();
export const heartReady = () => ready;
export const heartSelected = () => (localStorage.getItem('hm-tts-engine') || 'heart') === 'heart';
function request(type:string,text?:string):Promise<any> {
 if (!worker) {
  worker = new Worker(new URL('./kokoro-worker.ts',import.meta.url),{type:'module'});
  worker.onmessage = ({data}) => {
   const task=pending.get(data.id); if(!task)return;
   clearTimeout(task.timer);pending.delete(data.id);
   if(data.type==='error')task.reject(new Error('Heart could not prepare or speak. Try the device voice.'));
   else {if(data.type==='ready')ready=true;task.resolve(data);}
  };
  worker.onerror=()=>resetHeart();
 }
 const id=++serial;
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{resetHeart();},type==='prepare'?300000:60000);
  pending.set(id,{resolve,reject,timer});worker!.postMessage({id,type,text});
 });
}
export function resetHeart(){
 worker?.terminate();worker=undefined;ready=false;stopHeart();
 for(const task of pending.values()){clearTimeout(task.timer);task.reject(new Error('Heart stopped. Try preparing again or use the device voice.'));}pending.clear();
}
export async function prepareHeart(){if(!ready)await request('prepare');}
export function unlockHeart(){
 context??=new AudioContext();void context.resume().catch(()=>{});
}
export function stopHeart(){playbackEpoch++;output?.disconnect();output=undefined;if(source){source.onended=null;source.stop();source.disconnect();source=undefined;}}
export async function speakHeart(text:string,volume:number,isCurrent:()=>boolean,onStart:()=>void,onEnd:()=>void){
 const epoch=playbackEpoch;
 if(!ready)throw new Error('Prepare Heart in Settings → Sound first.');
 const data=await request('speak',text);
 if(epoch!==playbackEpoch||!isCurrent())return;
 unlockHeart();await context!.resume();
 if(epoch!==playbackEpoch||!isCurrent())return;
 if(context!.state!=='running')throw new Error('Tap Preview in Sound settings to enable audio.');
 const buffer=context!.createBuffer(1,data.samples.length,data.rate);buffer.copyToChannel(new Float32Array(data.samples),0);
 const gain=context!.createGain();output=gain;gain.gain.value=volume;gain.connect(context!.destination);
 const node=context!.createBufferSource();node.buffer=buffer;node.connect(gain);source=node;
 node.onended=()=>{node.disconnect();gain.disconnect();if(source===node)source=undefined;if(isCurrent())onEnd();};
 node.start();onStart();
}
