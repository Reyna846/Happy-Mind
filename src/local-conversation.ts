type Options={record:()=>void;changed:(active:boolean)=>void;delay?:(fn:()=>void,ms:number)=>ReturnType<typeof setTimeout>;cancel?:(timer:ReturnType<typeof setTimeout>)=>void};
export class LocalConversation {
 private enabled=false;private timer:ReturnType<typeof setTimeout>|undefined;private epoch=0;
 constructor(options:Options){this.options=options;}
 private options:Options;
 active(){return this.enabled;}
 start(){if(this.enabled)return;this.enabled=true;this.options.changed(true);this.options.record();}
 cancelPending(){this.epoch++;if(this.timer!==undefined)(this.options.cancel||clearTimeout)(this.timer);this.timer=undefined;}
 pause(){this.cancelPending();if(this.enabled){this.enabled=false;this.options.changed(false);}}
 replyFinished(){
  if(!this.enabled)return;this.cancelPending();const token=this.epoch;
  // Let speaker output settle before capturing the next turn.
  const resume=()=>{this.timer=undefined;if(this.enabled&&token===this.epoch)this.options.record();};
  this.timer=this.options.delay?this.options.delay(resume,300):setTimeout(resume,300);
 }
}
