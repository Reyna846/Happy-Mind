// Buffer tokens into speakable phrases, while playback proceeds independently.
type Options={prepare?:(text:string)=>Promise<unknown>;play:(text:string,prepared?:unknown)=>Promise<void>;onDrain:()=>void;onError:(error:unknown)=>void};
type Phrase={text:string;prepared?:Promise<unknown>};
export class StreamingSpeech {
 private buffer='';private queue:Phrase[]=[];private playing=false;private ended=false;private stopped=false;private drained=false;private first=true;
 private preparation:Promise<unknown>=Promise.resolve();
 private options:Options;
 constructor(options:Options){this.options=options;}
 push(text:string){if(this.stopped||this.ended)return;this.buffer+=text;this.flush(false);}
 finish(){if(this.stopped||this.ended)return;this.ended=true;this.flush(true);}
 cancel(){this.stopped=true;this.buffer='';this.queue=[];}
 private flush(final:boolean){
  while(this.buffer.trim()){
   // Wait for a delimiter, including whitespace after punctuation, so token boundaries
   // do not split decimals or a punctuation mark from the rest of a word.
   const boundary=/[.!?](?:[”"')\]]*)\s|[,;:](?=\s)/g;
   let match:RegExpExecArray|null,end=0;
   while((match=boundary.exec(this.buffer))){const candidate=match.index+match[0].length;if(/[.!?]/.test(match[0])||candidate>=45){end=candidate;break;}}
   if(!end&&this.buffer.length>=(this.first?64:110)){const space=this.buffer.lastIndexOf(' ',this.first?60:100);if(space>=32)end=space;}
   if(!end){if(!final)break;end=this.buffer.length;}
   const phrase=this.buffer.slice(0,end).trim();this.buffer=this.buffer.slice(end);if(phrase){this.first=false;this.queue.push({text:phrase});}
  }
  if(this.playing)this.prefetch(this.queue[0]);
  void this.pump();
 }
 private prefetch(phrase?:Phrase){
  if(!phrase||phrase.prepared||!this.options.prepare||this.stopped)return;
  phrase.prepared=this.preparation.then(()=>this.stopped?undefined:this.options.prepare!(phrase.text));
  this.preparation=phrase.prepared.catch(()=>{});
 }
 private async pump(){
  if(this.playing||this.stopped)return;this.playing=true;
  try{while(this.queue.length&&!this.stopped){const phrase=this.queue.shift()!;this.prefetch(phrase);this.prefetch(this.queue[0]);const prepared=phrase.prepared?await phrase.prepared:undefined;if(!this.stopped)await this.options.play(phrase.text,prepared);}}
  catch(error){if(!this.stopped){this.cancel();this.options.onError(error);}}
  finally{this.playing=false;if(this.ended&&!this.stopped&&!this.queue.length&&!this.drained){this.drained=true;this.options.onDrain();}}
 }
}
