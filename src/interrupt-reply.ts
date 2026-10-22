export async function interruptReplyWork(engine:{interruptGenerate:()=>void},work:Promise<unknown>|null,timeoutMs=10000){
 engine.interruptGenerate();
 if(!work)return;
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{await Promise.race([work.catch(()=>{}),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('The companion could not pause. Restart it to continue.')),timeoutMs);})]);}
 finally{if(timer)clearTimeout(timer);}
}
