import assert from 'node:assert/strict';
import {LocalConversation} from '../src/local-conversation.ts';
import {SpeechBoundary} from '../src/speech-boundary.ts';
import {StreamingSpeech} from '../src/streaming-speech.ts';
const flush=async()=>{for(let n=0;n<10;n++)await Promise.resolve();};
function setup(){let recorded=0,id=0;const states=[],timers=new Map();const session=new LocalConversation({record:()=>recorded++,changed:on=>states.push(on),delay:fn=>{timers.set(++id,fn);return id;},cancel:id=>timers.delete(id)});return {session,states,timers,count:()=>recorded,run:()=>{for(const [id,fn]of [...timers]){timers.delete(id);fn();}}};}
{
 const t=setup();t.session.replyFinished();t.run();assert.equal(t.count(),0,'never listen without opt-in');t.session.start();assert.equal(t.count(),1);t.session.start();assert.equal(t.count(),1);t.session.replyFinished();assert.equal(t.count(),1);t.run();assert.equal(t.count(),2,'reply drain reopens microphone');
 t.session.replyFinished();const stale=[...t.timers.values()][0];t.session.pause();stale();t.run();assert.equal(t.count(),2,'pause invalidates callbacks even if already scheduled');assert.deepEqual(t.states,[true,false]);
 t.session.start();t.session.replyFinished();t.session.cancelPending();t.run();assert.equal(t.count(),3,'generation blocks queued microphone restarts');assert(t.session.active());t.session.replyFinished();t.run();assert.equal(t.count(),4);t.session.pause();
}
{
 const detector=new SpeechBoundary(0,true);for(let ms=50;ms<30000;ms+=50)assert.equal(detector.sample(0,ms),'listen','conversation waits through long quiet pauses');assert.equal(detector.sample(0,30000),'empty','silent windows discarded instead of transcribed');
}
{
 const t=setup();t.session.start();const ends=[];const queue=new StreamingSpeech({play:()=>new Promise(resolve=>ends.push(resolve)),onDrain:()=>t.session.replyFinished(),onError:error=>{throw error;}});
 queue.push('First phrase. Second phrase. ');assert.equal(t.count(),1);ends.shift()();await flush();t.run();assert.equal(t.count(),1,'no microphone in gaps between phrases');queue.finish();assert.equal(t.count(),1);ends.shift()();await flush();assert.equal(t.count(),1,'small speaker-tail delay');t.run();assert.equal(t.count(),2,'reopen only after generation and all audio have finished');t.session.pause();
}
console.log('Local conversation passed: opt-in, exactly-once rearm, pause/stale callback guards, generation blocking, quiet waiting, and microphone reopens only after audio drain.');
