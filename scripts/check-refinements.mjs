import assert from 'node:assert/strict';
import {chooseVoice} from '../src/speech.ts';
const voice=(name,lang='en-US')=>({name,lang,voiceURI:name,default:false});
const basic=voice('Basic'),natural=voice('Jenny Natural'),french=voice('French Natural','fr-FR');
assert.equal(chooseVoice([basic,natural,french],'','en-IN'),natural);
assert.equal(chooseVoice([basic,natural],basic.voiceURI,'en-US'),basic);
assert.equal(chooseVoice([], '', 'en-US'),undefined);
assert.equal(chooseVoice([french,basic],'','fr-FR'),french);
console.log('Voice checks passed: saved override, natural/language fallback, empty voices.');
