import assert from 'node:assert/strict';
import {SpeechBoundary} from '../src/speech-boundary.ts';
let detector=new SpeechBoundary(0);for(let t=50;t<10000;t+=50)assert.equal(detector.sample(0,t),'listen');assert.equal(detector.sample(0,10000),'empty');
detector=new SpeechBoundary(0);for(let t=50;t<=500;t+=50)assert.equal(detector.sample(.04,t),'listen');assert.equal(detector.sample(0,1900),'listen');assert.equal(detector.sample(0,2000),'finish');
detector=new SpeechBoundary(0);assert.equal(detector.sample(.1,50),'listen');assert.equal(detector.sample(0,2000),'listen');assert.equal(detector.sample(0,10000),'empty');
detector=new SpeechBoundary(0);for(let t=50;t<=1000;t+=50)detector.sample(.025,t);assert.equal(detector.sample(0,2000),'listen');assert.equal(detector.sample(.04,2100),'listen');assert.equal(detector.sample(0,3500),'listen');assert.equal(detector.sample(0,3600),'finish');
detector=new SpeechBoundary(0);for(let t=50;t<30000;t+=50)assert.equal(detector.sample(.02,t),'listen');assert.equal(detector.sample(.02,30000),'finish');
console.log('Speech boundaries passed: silence, short noise, real voiced turn, pause/resume, and 30-second bound.');
