import assert from 'node:assert/strict';import {DictationTurn} from '../src/dictation-turn.ts';
let t=new DictationTurn();t.append(' Hello ');t.append(' there. ');assert.equal(t.complete(true),'Hello there.');assert.equal(t.complete(true),null);t.append('duplicate');assert.equal(t.complete(true),null);
t=new DictationTurn();t.append('Editable chat draft');assert.equal(t.complete(false),null);
t=new DictationTurn();t.append('partial words');t.cancel();assert.equal(t.complete(true),null);
t=new DictationTurn();assert.equal(t.complete(true),null);t=new DictationTurn();t.append('x'.repeat(2500));assert.equal(t.complete(true).length,2000);
console.log('Dictation turn checks passed: Voice auto-submit exactly once; Chat does not auto-submit; errors/empty input do not send; length bounded.');
