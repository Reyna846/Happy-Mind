import assert from 'node:assert/strict';
import {StreamingSpeech} from '../src/streaming-speech.ts';
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
{
 const spoken=[],done=[];let drained=0;const queue=new StreamingSpeech({play:text=>{spoken.push(text);return new Promise(resolve=>done.push(resolve));},onDrain:()=>drained++,onError:error=>{throw error;}});
 queue.push('Take');queue.push(' a breath.');assert.equal(spoken.length,0);queue.push(' Now');assert.deepEqual(spoken,['Take a breath.'],'speech begins before generation finishes');
 queue.push(' let your shoulders rest. A final thought');queue.finish();assert.equal(spoken.length,1,'never overlap playback');assert.equal(drained,0);
 done.shift()();await flush();assert.equal(spoken[1],'Now let your shoulders rest.');done.shift()();await flush();assert.equal(spoken[2],'A final thought');assert.equal(drained,0);
 done.shift()();await flush();assert.equal(drained,1,'resume only after generated tail has played');queue.finish();queue.push('Do not repeat');assert.equal(drained,1);assert.equal(spoken.length,3);
}
{
 const spoken=[];let finish;const queue=new StreamingSpeech({play:text=>{spoken.push(text);return new Promise(resolve=>finish=resolve);},onDrain:()=>assert.fail('cancel must not resume microphone'),onError:()=>assert.fail()});queue.push('First sentence. Another sentence. ');queue.cancel();queue.finish();queue.push('Late text');finish();await flush();assert.deepEqual(spoken,['First sentence.']);
}
{
 const spoken=[];const queue=new StreamingSpeech({play:async text=>{spoken.push(text);},onDrain(){},onError:error=>{throw error;}});queue.push('Count 3.');assert.equal(spoken.length,0);queue.push('5 seconds. ');await flush();assert.deepEqual(spoken,['Count 3.5 seconds.']);queue.finish();
}
{
 const spoken=[];const queue=new StreamingSpeech({play:async text=>spoken.push(text),onDrain(){},onError:error=>{throw error;}});queue.push('You can start by writing the first line on a small card and keeping it beside you');assert.ok(spoken.length,'long unpunctuated opening starts without waiting for full reply');queue.finish();await flush();assert.equal(spoken.join(' '),'You can start by writing the first line on a small card and keeping it beside you');
}
{
 let errors=0,drained=0;const queue=new StreamingSpeech({play:async()=>{throw Error('audio blocked');},onDrain:()=>drained++,onError:()=>errors++});queue.push('First. Second. ');queue.finish();await flush();assert.equal(errors,1);assert.equal(drained,0);queue.push('Ignored');
}
console.log('Streaming speech passed: audio before generation completion, token boundaries/decimals, short first phrase, ordered playback, trailing flush, no duplicate full read, drain-only resume, cancellation and errors.');
{
 const preparing=[],played=[],playEnds=[],prepared=[];let active=0,maxActive=0,drained=0;
 const queue=new StreamingSpeech({prepare:text=>{active++;maxActive=Math.max(maxActive,active);preparing.push(text);return new Promise(resolve=>prepared.push(()=>{active--;resolve(text+' audio');}));},play:(text,audio)=>{played.push([text,audio]);return new Promise(resolve=>playEnds.push(resolve));},onDrain:()=>drained++,onError:error=>{throw error;}});
 queue.push('First. Second. Third. ');queue.finish();await flush();assert.deepEqual(preparing,['First.']);prepared.shift()();await flush();assert.deepEqual(preparing,['First.','Second.']);assert.equal(played[0][1],'First. audio');prepared.shift()();await flush();assert.equal(preparing.length,2,'only one future phrase may be prefetched');
 playEnds.shift()();await flush();assert.deepEqual(preparing,['First.','Second.','Third.']);assert.equal(played[1][1],'Second. audio');prepared.shift()();await flush();playEnds.shift()();await flush();playEnds.shift()();await flush();assert.equal(maxActive,1,'synthesis requests stay serialized');assert.equal(drained,1);
}
console.log('Heart prefetch passed: next phrase prepares during playback, only one lookahead, serialized inference, ordered audio.');
