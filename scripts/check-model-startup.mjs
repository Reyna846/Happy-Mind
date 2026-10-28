import assert from 'node:assert/strict';
import {inspectModelStartup} from '../src/model-startup.ts';
for(const installed of [true,false]){const calls=[];await inspectModelStartup({cached:async()=>installed,alive:()=>true,checked:()=>calls.push('checked'),offer:()=>calls.push('offer')});assert.deepEqual(calls,installed?['checked']:['checked','offer']);}
let prompted=0;
await inspectModelStartup({cached:async()=>{throw Error('storage denied');},alive:()=>true,checked:()=>{},offer:()=>prompted++});assert.equal(prompted,1);
await inspectModelStartup({cached:async()=>true,alive:()=>false,checked:()=>{throw Error('unmounted');},offer:()=>prompted++});assert.equal(prompted,1);
console.log('Model startup: cached models stay unloaded, missing/denied-cache consent prompt and inactive-result guard passed.');
