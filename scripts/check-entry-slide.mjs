import assert from 'node:assert/strict';
import {slideProgress,slideComplete} from '../src/entry-slide.ts';
assert.equal(slideProgress(-30,220),0);assert.equal(slideProgress(110,220),.5);assert.equal(slideProgress(300,220),1);assert.equal(slideProgress(10,0),0);assert.equal(slideComplete(.89),false);assert.equal(slideComplete(.9),true);
console.log('Entry slide checks passed: clamping, invalid travel, partial gesture and completion threshold.');
