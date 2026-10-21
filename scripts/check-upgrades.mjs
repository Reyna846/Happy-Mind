import assert from 'node:assert/strict';
import {VoiceLoop,subtitleSentence} from '../src/voice-loop.ts';
import {freshContext,recordTurn,planResponse,rememberResponse,declineActivity,contextPrompt} from '../src/adaptation.ts';
import {activityIds,activities} from '../src/activity-registry.ts';
import {parseCompanionReply} from '../src/chat-protocol.ts';
let context=recordTurn(freshContext(),'I want to try an activity');
const reply={reply:'Would a little drawing help?',activity:'draw',mood:'sand',ambience:'keep'};
assert.equal(planResponse(reply,context).activity,'draw');
context=rememberResponse(context,reply);context=recordTurn(context,'Thank you');
assert.equal(planResponse(reply,context).activity,null);assert.equal(planResponse(reply,context).mood,null);
context=declineActivity(context,'draw');context=recordTurn(context,'Just listen, no advice');assert.equal(planResponse({...reply,activity:'ground'},context).activity,null);
context=recordTurn(context,'Could you suggest an activity?');assert.equal(planResponse(reply,context).activity,null);
context=recordTurn(context,"I don't want breathing");assert(context.declined.includes('breathe'));
assert(contextPrompt(context).includes('doNotOffer'));
for(const id of activityIds){assert(activities[id].source.startsWith('https://'));assert.equal(parseCompanionReply(JSON.stringify({...reply,activity:id})).activity,id);}
assert.equal(subtitleSentence('First thought. Second thought!',16),'Second thought!');
let time=0,id=0,queue=new Map(),recognizers=[],turns=[],errors=[],states=[];
const delay=(fn,ms)=>{queue.set(++id,{fn,due:time+ms});return id;};
const cancel=id=>queue.delete(id);
const advance=ms=>{time+=ms;for(const [id,item] of [...queue])if(item.due<=time){queue.delete(id);item.fn();}};
const create=()=>{const r={continuous:false,interimResults:false,lang:'',onresult:null,onerror:null,onend:null,start(){},abort(){this.onend?.();}};recognizers.push(r);return r;};
const loop=new VoiceLoop({create,delay,cancel,language:'en',onWords(){},onTurn:t=>turns.push(t),onState:(a,l)=>states.push([a,l]),onError:e=>errors.push(e)});
loop.start();const first=recognizers.at(-1);first.onresult({resultIndex:0,results:[{0:{transcript:'A thought'},isFinal:true}]});advance(1799);assert.equal(turns.length,0);advance(1);assert.deepEqual(turns,['A thought']);
first.onend();advance(1000);assert.equal(turns.length,1);assert.equal(recognizers.length,1);
loop.pause();loop.resume();assert.equal(recognizers.length,2);
const second=recognizers.at(-1);second.onresult({resultIndex:0,results:[{0:{transcript:'Do not send me'},isFinal:true}]});loop.stop();advance(2000);assert.equal(turns.length,1);second.onend();advance(1000);assert.equal(recognizers.length,2);
loop.start();recognizers.at(-1).onerror({error:'not-allowed'});advance(5000);assert.equal(loop.isActive(),false);assert.equal(errors.length,1);assert.deepEqual(states.at(-1),[false,false]);
console.log('Upgrade checks passed: preference/decline/cooldown policy, catalog actions, subtitles, silence auto-send, exactly-once turns, resume, cancellation, and permission failure.');
const {readFile}=await import('node:fs/promises');
for(const file of ['rain.ogg','water-drops.ogg']){const bytes=await readFile(new URL('../public/audio/'+file,import.meta.url));assert.equal(bytes.subarray(0,4).toString(),'OggS');assert(bytes.length>100000);}
const {volumeGain}=await import('../src/soundscapes.ts');assert.equal(volumeGain(0),0);assert(volumeGain(.5)<volumeGain(1));assert(volumeGain(1)<1);
console.log('Audio asset signatures and volume/headroom checks passed.');

const listenOnly=recordTurn(freshContext(),'Just listen, no advice');const guarded=planResponse({...reply,reply:'Would you like to try a little drawing?'},listenOnly);assert.equal(guarded.activity,null);assert.equal(guarded.mood,null);assert(!guarded.reply.includes('drawing'));assert.equal(recordTurn(listenOnly,'I would like to draw').preference,'open');
