import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const phases=['in','out','in-left','out-left','in-right','out-right'];
for(const id of ['arrive','look','feel','listen','rest',...phases]){
 const wav=await readFile(`public/audio/guides/${id}.wav`);assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.readUInt16LE(20),3);assert.equal(wav.readUInt16LE(22),1);
 const rate=wav.readUInt32LE(24);let offset=12,data;
 while(offset+8<=wav.length){const size=wav.readUInt32LE(offset+4);if(wav.toString('ascii',offset,offset+4)==='data'){data=wav.subarray(offset+8,offset+8+size);break;}offset+=8+size+(size%2);}assert(data);
 const duration=data.length/4/rate;assert(duration>1&&duration<12);if(phases.includes(id))assert(duration<3.5,'cue must fit shortest four-second phase');
 let peak=0;for(let i=0;i<data.length;i+=4){const value=data.readFloatLE(i);assert(Number.isFinite(value));peak=Math.max(peak,Math.abs(value));}assert(peak>.01&&peak<=1,'audible, unclipped scripted cue');
}
console.log('Bundled Heart guides: 11 valid, audible/unclipped WAV files; phase cues fit breathing timing.');
