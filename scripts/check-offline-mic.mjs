import {transform} from 'esbuild';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const workers=[],saved=new Map();globalThis.localStorage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)};
globalThis.Worker=class{constructor(){workers.push(this);}postMessage(data){this.last=data;}terminate(){this.dead=true;}reply(data){this.onmessage({data:{id:this.last.id,...data}});}};
const source=(await readFile('src/offline-mic.ts','utf8')).replace("new URL('./offline-mic-worker.ts',import.meta.url)","'test-worker'");
const {code}=await transform(source,{loader:'ts',format:'esm'});const mic=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
assert.equal(mic.offlineMicSelected(),true,'new users default to local transcription');
let changes=0;const unsub=mic.subscribeMic(()=>changes++);
mic.selectOfflineMic(true);assert(mic.offlineMicSelected());assert.equal(saved.get('hm-mic-engine'),'offline');
const prepared=mic.prepareOfflineMic();assert.equal(mic.micStatus().state,'loading');workers[0].reply({type:'progress',progress:45});assert.match(mic.micStatus().message,/45/);workers[0].reply({type:'ready'});await prepared;assert(mic.offlineMicReady());
const words=mic.transcribeOffline(new Float32Array([.2,.1]));workers[0].reply({type:'text',text:'  A quiet moment.  '});assert.equal(await words,'A quiet moment.');
const pending=mic.transcribeOffline(new Float32Array([.2]));mic.resetOfflineMic();await assert.rejects(pending);assert(workers[0].dead);assert(!mic.offlineMicReady());
const cancelledPreparation=mic.prepareOfflineMic();mic.resetOfflineMic();await cancelledPreparation;assert.equal(mic.micStatus().state,'off','a cancelled preparation cannot overwrite the released state');
await assert.rejects(mic.transcribeOffline(new Float32Array([.1])),/Prepare/);assert(changes>=4);unsub();
console.log('Offline microphone worker client: opt-in, preparation/progress, transcript, cancellation, unavailable state passed. No microphone/network used.');

saved.set('hm-mic-engine','browser');const browserMic=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64')+'#saved-browser');assert.equal(browserMic.offlineMicSelected(),false,'explicit browser preference is respected');
