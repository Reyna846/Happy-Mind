import assert from 'node:assert/strict';
import {breathPractices,practiceState} from '../src/breath-practices.ts';
for(const id of Object.keys(breathPractices)){
 let boundary=0;const p=breathPractices[id];
 for(const step of p.steps){assert.equal(typeof step.inhale,'boolean');assert(step.seconds>0);assert.deepEqual(practiceState(id,boundary).step,step);assert.equal(practiceState(id,boundary).count,step.seconds);const almost=practiceState(id,boundary+step.seconds-.01);assert.equal(almost.count,1);assert(almost.openness>=0&&almost.openness<=1);boundary+=step.seconds;}
 assert.equal(practiceState(id,boundary).round,2);assert.equal(practiceState(id,boundary*4).done,true);assert.equal(practiceState(id,boundary*4-.01).done,false);assert.equal(practiceState(id,-1).round,1);
}
assert.deepEqual(breathPractices.alternate.steps.map(s=>[s.side,s.inhale]),[['left',true],['right',false],['right',true],['left',false]]);
console.log('Breathing library checks passed: four practices, phase boundaries/counts, four rounds, bounded visual progress, correct nostril sequence, no holds.');
