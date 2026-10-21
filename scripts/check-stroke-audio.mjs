import assert from 'node:assert/strict';import {createStrokeAudio} from '../src/stroke-audio.ts';
for(const kind of ['draw','sand']){
 let starts=0,stops=0,targets=[];const parameter=()=>({value:0,cancelScheduledValues(){},setTargetAtTime(value,time,fade){targets.push({value,fade});}});
 const ctx={sampleRate:1000,currentTime:0,destination:{},createBuffer:(_,length)=>({getChannelData:()=>new Float32Array(length)}),createBufferSource:()=>({connect(){},disconnect(){},start(){starts++;},stop(){stops++;}}),createBiquadFilter:()=>({frequency:parameter(),Q:parameter(),connect(){},disconnect(){}}),createGain:()=>({gain:parameter(),connect(){},disconnect(){}})};
 const sound=createStrokeAudio(ctx,kind,.5);assert.equal(starts,1);for(let i=0;i<100;i++){ctx.currentTime+=.016;sound.move(.3);}assert.equal(starts,1,'movement must not restart noise');assert(targets.every(t=>t.fade>0));sound.quiet();assert.equal(targets.at(-1).value,0);sound.dispose();sound.dispose();assert.equal(stops,1);const count=targets.length;sound.move(1);assert.equal(targets.length,count);
}
console.log('Stroke audio checks passed: one looping source per texture, continuous gain/filter smoothing, quiet fade, idempotent disposal and no post-disposal movement.');
