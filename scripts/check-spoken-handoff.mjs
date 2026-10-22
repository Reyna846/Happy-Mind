import assert from 'node:assert/strict';
import {VoiceLoop} from '../src/voice-loop.ts';
function setup(once=false){let time=0,id=0;const timers=new Map(),recognizers=[],sent=[],shown=[];const tick=ms=>{time+=ms;for(const [id,t] of [...timers])if(t.at<=time){timers.delete(id);t.fn();}};let loop;
loop=new VoiceLoop({create:()=>{const r={continuous:true,interimResults:false,lang:'',onresult:null,onerror:null,onend:null,start(){},abort(){this.onend?.();}};recognizers.push(r);return r;},language:'en-US',delay:(fn,ms)=>{timers.set(++id,{fn,at:time+ms});return id;},cancel:id=>timers.delete(id),onWords:words=>shown.push(words),onTurn:words=>{if(once)loop.stop();sent.push(words);},onState(){},onError:error=>{throw Error(error);}});
return {loop,tick,sent,shown,recognizers};}
const result=(r,text,final=false)=>r.onresult({resultIndex:0,results:[{0:{transcript:text},isFinal:final}]});
{
 const t=setup();t.loop.start();const r=t.recognizers.at(-1);assert.equal(r.continuous,false);assert.equal(r.interimResults,true);
 result(r,'Hello');r.onspeechend();t.tick(599);assert.deepEqual(t.sent,[]);result(r,'Hello there',true);t.tick(600);assert.deepEqual(t.sent,['Hello there']);assert.equal(t.shown.at(-1),'Hello there');r.onend();t.tick(2000);assert.equal(t.sent.length,1);
 t.loop.pause();t.loop.resume();assert.equal(t.recognizers.length,2);const next=t.recognizers.at(-1);result(next,'Second thought',true);next.onend();assert.deepEqual(t.sent,['Hello there','Second thought']);t.loop.stop();
}
{
 const t=setup(true);t.loop.start();const r=t.recognizers.at(-1);r.onspeechend();result(r,'One dictated chat message',true);r.onend();t.tick(2000);assert.deepEqual(t.sent,['One dictated chat message']);assert.equal(t.loop.isActive(),false);t.loop.resume();assert.equal(t.recognizers.length,1);
}
{
 const t=setup();t.loop.start();const r=t.recognizers.at(-1);result(r,'Not finished');r.onspeechend();t.tick(300);r.onspeechstart();t.tick(400);assert.equal(t.sent.length,0);result(r,'Not finished yet',true);r.onend();assert.deepEqual(t.sent,['Not finished yet']);t.loop.stop();
}
{
 const t=setup();t.loop.start();const r=t.recognizers.at(-1);result(r,'Cancelled');r.onspeechend();t.loop.stop();t.tick(5000);assert.equal(t.sent.length,0);
}
console.log('Spoken handoff passed: Android single-turn recognition, speech-end/final ordering, interim text, exactly-once auto-send, conversation resume, one-shot Chat, resumed speech and cancellation.');
