import assert from 'node:assert/strict';
import {inspectModelStartup} from '../src/model-startup.ts';
for(const installed of [true,false]){const calls=[];await inspectModelStartup({cached:async()=>installed,alive:()=>true,checked:()=>calls.push('checked'),warm:()=>calls.push('warm'),offer:()=>calls.push('offer')});assert.deepEqual(calls,['checked',installed?'warm':'offer']);}
let prompted=0,warmed=0;
await inspectModelStartup({cached:async()=>{throw Error('storage denied');},alive:()=>true,checked:()=>{},warm:()=>warmed++,offer:()=>prompted++});assert.equal(prompted,1);assert.equal(warmed,0);
await inspectModelStartup({cached:async()=>true,alive:()=>false,checked:()=>{throw Error('unmounted');},warm:()=>warmed++,offer:()=>prompted++});assert.equal(warmed,0);
console.log('Model startup: cached auto-warm, missing/denied-cache consent prompt and unmount guard passed.');
