// Explicit integration check: downloads Whisper if not already cached. Scripted audio only.
import {pipeline,env} from '@huggingface/transformers';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
env.allowLocalModels=false;
const wav=await readFile('public/audio/guides/look.wav');
const format=wav.readUInt16LE(20),bits=wav.readUInt16LE(34),rate=wav.readUInt32LE(24);
let offset=12,data;
while(offset+8<=wav.length){const size=wav.readUInt32LE(offset+4);if(wav.toString('ascii',offset,offset+4)==='data'){data=wav.subarray(offset+8,offset+8+size);break;}offset+=8+size+(size%2);}
assert(data);const stride=bits/8;
const read=i=>format===3?data.readFloatLE(i*stride):data.readInt16LE(i*stride)/32768;
const samples=new Float32Array(Math.floor(data.length/stride*16000/rate));
for(let i=0;i<samples.length;i++)samples[i]=read(Math.min(Math.floor(i*rate/16000),data.length/stride-1));
const model=await pipeline('automatic-speech-recognition','Xenova/whisper-tiny.en',{device:'cpu',dtype:'q8'});
const result=await model(samples);console.log(result.text);
assert.match(result.text,/colou?r/i);assert.match(result.text,/rest/i);
console.log('Whisper real inference passed on bundled scripted Heart audio. This does not test a physical microphone.');
