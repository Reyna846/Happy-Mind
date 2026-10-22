import { KokoroTTS } from 'kokoro-js';
let model: KokoroTTS | undefined;
let tasks=Promise.resolve();
self.onmessage = ({data}) => {tasks=tasks.then(()=>handle(data));};
async function handle(data:{id:number;type:string;text:string}) {
 try {
  if (data.type === 'prepare') {
   model = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {dtype:'q8',device:'wasm'});
   await model.generate('A quiet moment.',{voice:'af_heart',speed:.9});
   self.postMessage({id:data.id,type:'ready'});
  } else {
   if (!model) throw new Error('Prepare Heart first.');
   const result = await model.generate(data.text,{voice:'af_heart',speed:0.9});
   self.postMessage({id:data.id,type:'audio',samples:result.audio,rate:result.sampling_rate});
  }
 } catch { self.postMessage({id:data.id,type:'error'}); }
}
