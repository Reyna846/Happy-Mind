import assert from 'node:assert/strict';
import {parseCompanionReply, ReplyValidationError, breathAt} from '../src/chat-protocol.ts';
import {boundedMessages} from '../src/local-ai.ts';
assert.throws(()=>parseCompanionReply('{bad json'),ReplyValidationError);
const valid={reply:'Would a little drawing feel useful?',activity:'draw',mood:'sand',ambience:'soften'};
assert.deepEqual(parseCompanionReply(JSON.stringify(valid)),valid);
for(const data of [ {...valid,activity:'eval'}, {...valid,mood:'red'}, {...valid,ambience:'enable_microphone'}, {...valid,url:'https://example.com'}, {...valid,reply:''}, {...valid,reply:'x'.repeat(1201)}, {...valid,activity:undefined}, [] ])assert.throws(()=>parseCompanionReply(JSON.stringify(data)));
assert.deepEqual(parseCompanionReply('A moment of quiet.'),{reply:'A moment of quiet.',activity:null,mood:null,ambience:'keep'});
assert.throws(()=>parseCompanionReply('```json\n{}\n```'));
assert.throws(()=>parseCompanionReply('{"reply":'));
assert.equal(breathAt(0).inhale,true);assert.equal(breathAt(0).progress,0);
assert.equal(breathAt(2500).progress,.5);assert.equal(breathAt(4999).inhale,true);
assert.equal(breathAt(5000).inhale,false);assert.equal(breathAt(5000).progress,1);
assert.equal(breathAt(7500).progress,.5);assert.equal(breathAt(10000).progress,0);
const turns=Array.from({length:20},(_,i)=>({role:i%2?'assistant':'user',content:'test '+i}));
const bounded=boundedMessages(turns);assert.equal(bounded.length,8);assert.equal(bounded[0].role,'user');assert.equal(bounded.at(-1).content,'test 19');
assert.equal(boundedMessages([{role:'assistant',content:'old'},{role:'user',content:'new'}])[0].content,'new');
console.log('Chat checks passed: validated UI actions, rejected unsupported commands, plain-text fallback, 5/5 breath boundaries, bounded history.');

assert.deepEqual(boundedMessages([{role:'user',content:'first'},{role:'user',content:'after cancellation'}]),[{role:'user',content:'first\nafter cancellation'}]);

const artifact={kind:'garden',title:'Room to grow',text:'A moment at a time.',palette:'lake'};
assert.deepEqual(parseCompanionReply(JSON.stringify({...valid,artifact})),{...valid,artifact});
assert.equal(parseCompanionReply(JSON.stringify({...valid,artifact:null})).artifact,null);
for(const bad of [{...artifact,kind:'script'},{...artifact,title:'x'.repeat(61)},{...artifact,text:'x'.repeat(241)},{...artifact,palette:'red'},{...artifact,html:'<script />'},[],{},'garden'])assert.throws(()=>parseCompanionReply(JSON.stringify({...valid,artifact:bad})));
console.log('Artifact checks passed: compatible optional action, bounded text, rejected unknown kinds/palettes/executable fields.');
const {planResponse,freshContext}=await import('../src/adaptation.ts');
assert.equal(planResponse({...valid,artifact},{...freshContext(),preference:'listen'}).artifact,null);

// Spoken context stays smaller while preserving the newest user turn.
const voiceHistory = Array.from({length:8},(_,i)=>({role:i%2?'user':'assistant',content:'x'.repeat(600)}));
const {boundedMessages:voiceBounded}=await import('../src/local-ai.ts');
const shortHistory=voiceBounded(voiceHistory,true);
assert.equal(shortHistory.at(-1).role,'user');
assert(shortHistory.length<=4);
assert(shortHistory.reduce((sum,m)=>sum+m.content.length,0)<=2400);
assert(voiceBounded(voiceHistory).length>shortHistory.length);
