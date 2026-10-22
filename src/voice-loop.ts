export type RecognitionLike={continuous:boolean;interimResults:boolean;lang:string;start:()=>void;abort:()=>void;onspeechstart?:(()=>void)|null;onspeechend?:(()=>void)|null;onresult:((event:{resultIndex:number;results:{length:number;[n:number]:{isFinal:boolean;[n:number]:{transcript:string}}}})=>void)|null;onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null};
type Options={create:()=>RecognitionLike;onWords:(words:string)=>void;onTurn:(words:string)=>void;onState:(active:boolean,listening:boolean)=>void;onError:(message:string)=>void;language:string;delay?:(fn:()=>void,ms:number)=>ReturnType<typeof setTimeout>;cancel?:(timer:ReturnType<typeof setTimeout>)=>void};
// Turn coordination is independent of React, model latency, and browser event ordering.
export class VoiceLoop {
 private options:Options;private current:RecognitionLike|null=null;private timer:ReturnType<typeof setTimeout>|null=null;private active=false;private paused=false;private waiting=false;private text='';private emptyEnds=0;
 constructor(options:Options){this.options=options;}
 private later(fn:()=>void,ms:number){return this.options.delay?this.options.delay(fn,ms):setTimeout(fn,ms);}
 private clearTimer(){if(this.timer!==null)(this.options.cancel||clearTimeout)(this.timer);this.timer=null;}
 private release(){this.clearTimer();const old=this.current;this.current=null;old?.abort();}
 start(){this.stop();this.active=true;this.paused=false;this.waiting=false;this.emptyEnds=0;this.listen();}
 stop(){this.active=false;this.paused=false;this.waiting=false;this.text='';this.release();this.options.onState(false,false);}
 pause(){if(!this.active)return;this.paused=true;this.release();this.options.onState(true,false);}
 resume(){if(!this.active)return;this.paused=false;this.waiting=false;this.emptyEnds=0;this.listen();}
 isActive(){return this.active;}
 finishTurn(){if(this.active&&!this.paused&&!this.waiting&&this.text.trim())this.flush();else this.stop();}
 private listen(){if(!this.active||this.paused||this.waiting||this.current)return;this.text='';let r:RecognitionLike;try{r=this.options.create();}catch{this.fail('Hands-free speech is not supported in this browser. Typing and activities are still available.');return;}this.current=r;r.continuous=false;r.interimResults=true;r.lang=this.options.language;
 let ended=false;
 r.onspeechstart=()=>{if(this.current!==r)return;ended=false;this.clearTimer();};
 r.onspeechend=()=>{if(this.current!==r)return;ended=true;this.clearTimer();if(this.text)this.timer=this.later(()=>this.flush(),600);};
 r.onresult=event=>{if(this.current!==r||!this.active)return;let words='';for(let i=0;i<event.results.length;i++)words+=event.results[i][0].transcript+' ';const next=words.trim().slice(0,2000);if(next===this.text)return;this.text=next;this.options.onWords(this.text);this.emptyEnds=0;this.clearTimer();if(this.text)this.timer=this.later(()=>this.flush(),ended?600:1800);};
 r.onerror=event=>{if(this.current!==r)return;if(event.error==='no-speech'){this.emptyEnds++;if(this.emptyEnds>=3)this.fail('No speech was detected. Start again whenever you’re ready.');return;}this.fail(event.error==='network'?'Browser dictation could not connect. Check your connection or use Local English in Sound settings.':event.error==='not-allowed'||event.error==='service-not-allowed'?'Microphone permission was not allowed. Hands-free is off; you can type instead.':'Speech recognition stopped. Hands-free is off; try again or type.');};
 r.onend=()=>{if(this.current!==r)return;this.current=null;if(!this.active||this.paused||this.waiting)return;if(this.text){this.flush();return;}this.emptyEnds++;if(this.emptyEnds>=3){this.fail('The browser keeps ending listening. Try the Speak button or type instead.');return;}this.options.onState(true,false);this.clearTimer();this.timer=this.later(()=>this.listen(),400);};
 try{r.start();this.options.onState(true,true);}catch{this.fail('The microphone could not start. Hands-free is off; you can type instead.');}}
 private flush(){if(!this.active||this.paused||this.waiting||!this.text)return;const words=this.text;this.waiting=true;this.text='';this.release();this.options.onState(true,false);this.options.onTurn(words);}
 private fail(message:string){this.stop();this.options.onError(message);}
}
export function subtitleSentence(text:string,index:number){const sentences=[...text.matchAll(/[^.!?]+[.!?]+\s*|[^.!?]+$/g)];const safe=Math.max(0,Math.min(text.length,index));return sentences.find(match=>safe>=match.index!&&safe<match.index!+match[0].length)?.[0].trim()||text;}
