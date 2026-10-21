import {pipeline,env,type AutomaticSpeechRecognitionPipeline} from '@huggingface/transformers';
env.allowLocalModels=false;
let model:AutomaticSpeechRecognitionPipeline|undefined;
self.onmessage=async({data})=>{
 try{
  if(data.type==='prepare'){
   model=await pipeline<'automatic-speech-recognition'>('automatic-speech-recognition','Xenova/whisper-tiny.en',{device:'wasm',dtype:'q8',progress_callback:p=>{if(p.status==='progress')self.postMessage({type:'progress',progress:Math.round(p.progress)});}});
   self.postMessage({id:data.id,type:'ready'});
  }else{
   if(!model)throw Error('not ready');
   const result=await model(new Float32Array(data.samples),{max_new_tokens:100});
   self.postMessage({id:data.id,type:'text',text:Array.isArray(result)?result.map(r=>r.text).join(' '):result.text});
  }
 }catch{self.postMessage({id:data.id,type:'error'});}
};
