export async function verifyModelGeneration(engine:{
 chat:{completions:{create:(request:{messages:{role:'user';content:string}[];max_tokens:number;stream:false})=>Promise<unknown>}};
 resetChat:()=>Promise<void>;
}){
 // Loading weights does not prove the GPU can execute the first inference.
 await engine.chat.completions.create({messages:[{role:'user',content:'Hello'}],max_tokens:1,stream:false});
 await engine.resetChat();
}

export function watchModelWorker(worker:Pick<Worker,'addEventListener'|'removeEventListener'>,failed:(error:Error)=>void){
 const crash=()=>failed(new Error('Model worker stopped. The device may have run out of graphics memory.'));
 const unreadable=()=>failed(new Error('Model worker communication failed.'));
 worker.addEventListener('error',crash);
 worker.addEventListener('messageerror',unreadable);
 return ()=>{worker.removeEventListener('error',crash);worker.removeEventListener('messageerror',unreadable);};
}
