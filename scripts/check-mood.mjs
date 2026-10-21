import assert from 'node:assert/strict';
import { moodFromWords } from '../src/mood.ts';
const examples=[
 ['I feel overwhelmed and my thoughts are racing','lake'],
 ['I feel lonely tonight','sand'],
 ['I am exhausted and need rest','dusk'],
 ['I feel hopeful and grateful today','sand'],
 ['I am not anxious anymore',null],
 ["I’m not feeling very sad",null],
 ['The task is calmly organized',null],
 ['A normal day at work',null],
 ['',null],
 ['I am not tired but I am worried','lake']
];
for(const [text,mood] of examples)assert.equal(moodFromWords(text),mood,text);
console.log(`Mood checks passed: ${examples.length} examples, including negation and neutral fallback.`);
