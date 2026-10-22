import assert from 'node:assert/strict';
import {guardedReply} from '../src/reply-watchdog.ts';
function fakeClock(){let time=0,tick=()=>{},resume=()=>{},cleaned=0;return {clock:{now:()=>time,every:fn=>{tick=fn;return()=>cleaned++;},onResume:fn=>{resume=fn;return()=>cleaned++;}},advance:ms=>{time+=ms;tick();},resumeAfter:ms=>{time+=ms;resume();},cleaned:()=>cleaned};}
const hung=()=>new Promise(()=>{});
{
 const f=fakeClock(),elapsed=[];const promise=guardedReply(hung,s=>elapsed.push(s),{clock:f.clock});
 f.advance(59000);assert.equal(elapsed.at(-1),59);f.advance(1000);await assert.rejects(promise,/timeout/);assert.equal(f.cleaned(),2);
}
{
 const f=fakeClock();let pulse;const promise=guardedReply(p=>{pulse=p;return hung();},()=>{},{clock:f.clock});
 for(let i=0;i<5;i++){f.advance(30000);pulse();}f.advance(30000);await assert.rejects(promise,/timeout/);
}
{
 const f=fakeClock();const promise=guardedReply(hung,()=>{},{clock:f.clock});f.resumeAfter(90000);await assert.rejects(promise,/timeout/);
}
{
 const f=fakeClock(),controller=new AbortController();const promise=guardedReply(hung,()=>{},{clock:f.clock,signal:controller.signal});controller.abort();await assert.rejects(promise,/cancelled/);assert.equal(f.cleaned(),2);
}
{
 const f=fakeClock();assert.equal(await guardedReply(async()=> 'reply',()=>{},{clock:f.clock}),'reply');assert.equal(f.cleaned(),2);
}
console.log('Reply watchdog passed: idle timeout, bounded progressing stream, resume after suspension, cancellation and cleanup.');
