type Clock={now:()=>number;every:(tick:()=>void)=>()=>void;onResume:(tick:()=>void)=>()=>void};
const browserClock:Clock={
 now:()=>Date.now(),
 every:tick=>{const id=setInterval(tick,1000);return()=>clearInterval(id);},
 onResume:tick=>{document.addEventListener('visibilitychange',tick);return()=>document.removeEventListener('visibilitychange',tick);}
};

export async function guardedReply<T>(work:(progress:()=>void)=>Promise<T>,onElapsed:(seconds:number)=>void,options:{clock?:Clock;signal?:AbortSignal}={}):Promise<T>{
 const clock=options.clock||browserClock;
 const started=clock.now();let lastProgress=started,finished=false;
 let rejectTimeout:(error:Error)=>void=()=>{};
 const timeout=new Promise<never>((_,reject)=>{rejectTimeout=reject;});
 const abort=()=>rejectTimeout(new Error('Reply cancelled'));
 options.signal?.addEventListener('abort',abort,{once:true});
 if(options.signal?.aborted)abort();
 const check=()=>{
  if(finished)return;
  const now=clock.now();onElapsed(Math.floor((now-started)/1000));
  if(now-lastProgress>=60000||now-started>=180000)rejectTimeout(new Error('reply timeout'));
 };
 const stopClock=clock.every(check),stopResume=clock.onResume(check);
 try{
  return await Promise.race([timeout,options.signal?.aborted?timeout:work(()=>{check();lastProgress=clock.now();})]);
 }finally{finished=true;stopClock();stopResume();options.signal?.removeEventListener('abort',abort);}
}
