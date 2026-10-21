import { KokoroTTS } from 'kokoro-js';
import {writeFile} from 'node:fs/promises';
const cues={
 arrive:'There is no hurry. Notice where your body is supported. You can leave out anything that feels uncomfortable.',
 look:'Find one colour nearby. Let your eyes rest there for a moment. You do not need to change how you feel.',
 feel:'Notice the support beneath you. Let your hand rest on something comfortable, if you like.',
 listen:'Notice one sound near you. Let it come and go, without needing to follow it.',
 rest:'Let your breathing return to its own pace. You can stay here for a moment.',
 in:'Breathe in gently.',out:'Breathe out slowly.',
 'in-left':'In through your left.', 'out-right':'Out through your right.',
 'in-right':'In through your right.', 'out-left':'Out through your left.'
};
const model=await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX',{dtype:'q8',device:'cpu'});
for(const [id,text] of Object.entries(cues)){
 const audio=await model.generate(text,{voice:'af_heart',speed:.9});
 await writeFile(`public/audio/guides/${id}.wav`,Buffer.from(audio.toWav()));
 console.log(id,Math.round(audio.audio.length/audio.sampling_rate*10)/10+'s');
}
