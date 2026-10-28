import assert from 'node:assert/strict';
import {beginStroke,extendStroke,maxStrokes,maxStrokePoints} from '../src/stroke-path.ts';
let strokes=[];
for(let line=0;line<80;line++){
 const previous=strokes.at(-1);
 strokes=beginStroke(strokes,{x:0,y:line},'sage');
 for(let i=1;i<2500;i++)strokes=extendStroke(strokes,{x:i*2,y:line+Math.sin(i)});
 assert(strokes.length<=maxStrokes);
 assert(strokes.every(s=>s.points.length<=maxStrokePoints));
 assert.equal(strokes.at(-1).points.at(-1).x,4998,'long gestures keep following the finger');
 if(previous&&strokes.length>1)assert.equal(strokes.at(-2),previous,'finished strokes retain their identity');
}
const unchanged=extendStroke(strokes,strokes.at(-1).points.at(-1));assert.equal(unchanged,strokes);
assert.equal(extendStroke([], {x:1,y:1}).length,0);
console.log('Drawing checks passed: bounded total geometry, continuous long gestures, stable completed strokes and redundant-move filtering.');
