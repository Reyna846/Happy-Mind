import ts from 'typescript';import vm from 'node:vm';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const ramps=[];let began=false;const param=()=>({value:0,setValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(){},linearRampToValueAtTime(value,time){ramps.push({value,time,began});}});
const node=()=>({connect(){},disconnect(){},start(){began=true;},stop(){},frequency:param(),gain:param()});
const ctx={currentTime:10,sampleRate:100,state:'running',createGain:node,createOscillator:node,createBufferSource:node,createBiquadFilter:node,createBuffer:(_,length)=>({getChannelData:()=>new Float32Array(length)})};
const js=ts.transpileModule(readFileSync('src/soundscapes.ts','utf8').replace('import.meta.env.BASE_URL',"'/'"),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const scope={exports:{},AbortController,Math,Float32Array,setTimeout};vm.runInNewContext(js,scope);
for(const kind of ['hum','waves']){ramps.length=0;began=false;const voice=scope.exports.createSoundscape(ctx,node(),kind,()=>{});assert.equal(ramps.length,1);assert.equal(ramps[0].time,14);assert.equal(ramps[0].value,1);assert.equal(ramps[0].began,true);voice.stop(true);}
console.log('Entry ambience checks passed: four-second fade begins after playback starts for generated soundscapes.');
