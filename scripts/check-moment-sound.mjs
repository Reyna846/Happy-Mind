import ts from 'typescript';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
let effects=[],contexts=[],clock=0;
const parameter=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}});
class Context{
 constructor(){this.state='running';this.currentTime=0;this.sampleRate=1000;this.destination={};this.sources=[];contexts.push(this);}
 createGain(){return {gain:parameter(),connect(){},disconnect(){}};}
 createOscillator(){const s={frequency:parameter(),connect(){},disconnect(){},start(){},stop(){}};this.sources.push(s);return s;}
 createBuffer(_,length){return {getChannelData:()=>new Float32Array(length)};}
 createBufferSource(){const s={connect(){},disconnect(){},start(){},stop(){}};this.sources.push(s);return s;}
 createBiquadFilter(){return {frequency:parameter(),Q:parameter(),connect(){},disconnect(){}};}
 resume(){return Promise.resolve();}close(){this.state='closed';return Promise.resolve();}
}
const source=ts.transpileModule(readFileSync('src/useMomentSound.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const doc={hidden:false,addEventListener(_,fn){this.hide=fn;},removeEventListener(){}};
const scope={exports:{},require:id=>id==='react'?{useRef:value=>({current:value}),useEffect:fn=>effects.push(fn)}:{volumeGain:()=>.1},AudioContext:Context,document:doc,performance:{now:()=>clock},Math,Float32Array};vm.runInNewContext(source,scope);
const play=scope.exports.useMomentSound(true,.5,0);const cleanup=effects.pop()();
for(const kind of ['bubble','glow','sand','water','draw','step','clear','saber']){clock+=350;play(kind);}
assert.equal(contexts.length,1);assert.equal(contexts[0].sources.length,8);play('bubble');assert.equal(contexts[0].sources.length,8);
clock+=350;play('water');const drops=contexts[0].sources.length;clock+=150;play('water');assert.equal(contexts[0].sources.length,drops,'water drag must space raindrops apart');
doc.hidden=true;doc.hide();assert.equal(contexts[0].state,'closed');clock+=150;play('water');assert.equal(contexts.length,1);cleanup();doc.hidden=false;
for(const [enabled,volume] of [[false,.5],[true,0]]){const silent=scope.exports.useMomentSound(enabled,volume,0);effects.pop()();clock+=150;silent('bubble');assert.equal(contexts.length,1);}
console.log('Moment sound checks passed: all eight voices, throttling, mute/zero volume, hidden-page cleanup.');
