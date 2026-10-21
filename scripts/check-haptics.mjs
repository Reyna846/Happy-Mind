import assert from 'node:assert/strict';
import {createGentleHaptics} from '../src/haptics.ts';
let clock=0;const calls=[];const h=createGentleHaptics(n=>calls.push(n),()=>clock);
h.pulse();h.pulse();assert.deepEqual(calls,[7]);clock=180;h.pulse(100);assert.deepEqual(calls,[7,12]);clock=400;h.pulse(-3);h.cancel();assert.deepEqual(calls,[7,12,1,0]);
assert.doesNotThrow(()=>createGentleHaptics(()=>{throw Error('unsupported');},()=>0).pulse());
console.log('Haptics checks passed: short bounded pulses, rate limiting, cancellation and unavailable-device handling.');
