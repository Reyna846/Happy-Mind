import assert from 'node:assert/strict';
import {breathState,breathDuration} from '../src/breath-timing.ts';
assert.deepEqual(breathState(0),{phase:'Ready',count:2,scale:.72,done:false});
assert.equal(breathState(1.2).count,1);
for(const offset of [0,14,28]){
 assert.equal(breathState(2+offset).phase,'Breathe in');assert.equal(breathState(2+offset).count,5);
 assert.equal(breathState(7+offset).phase,'Hold softly');assert.equal(breathState(7+offset).count,2);assert.equal(breathState(8.9+offset).scale,1);
 assert.equal(breathState(9+offset).phase,'Breathe out');assert.equal(breathState(9+offset).count,5);
 assert.equal(breathState(14+offset).phase,'Rest softly');assert.equal(breathState(14+offset).count,2);assert.equal(breathState(15.9+offset).scale,.72);
}
assert.equal(breathDuration,44);assert.equal(breathState(43.99).done,false);assert.equal(breathState(44).done,true);
for(let t=0;t<46;t+=.07){const b=breathState(t);assert.ok(b.scale>=.72&&b.scale<=1);assert.ok(b.count>=0&&b.count<=5);}
console.log('Breathing checks passed: preparation, 5/2/5/2 boundaries and counts, held scales, three cycles and completion.');
