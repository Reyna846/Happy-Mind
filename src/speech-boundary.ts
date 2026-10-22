export class SpeechBoundary {
 private started:number;
 private previous:number;
 private voicedMs=0;
 private lastVoice:number;
 constructor(now:number){this.started=this.previous=this.lastVoice=now;}
 sample(rms:number,now:number):'listen'|'finish'|'empty'{
  const elapsed=Math.max(0,Math.min(100,now-this.previous));this.previous=now;
  if(rms>=.012){this.voicedMs+=elapsed;this.lastVoice=now;}
  const heard=this.voicedMs>=200;
  if(now-this.started>=30000)return heard?'finish':'empty';
  if(!heard&&now-this.started>=10000)return 'empty';
  if(heard&&now-this.lastVoice>=1500)return 'finish';
  return 'listen';
 }
}
