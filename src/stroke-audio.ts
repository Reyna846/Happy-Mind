import {volumeGain} from './soundscapes.ts';
export function createStrokeAudio(ctx:AudioContext,kind:'draw'|'sand',volume:number){
 const length=Math.floor(ctx.sampleRate*3),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);let brown=0;
 for(let i=0;i<length;i++){const white=Math.random()*2-1;brown=(brown+.025*white)/1.025;data[i]=kind==='sand'?brown*4:white*.35+brown;}
 // Blend the loop seam once, rather than restarting a burst for each move.
 const seam=Math.floor(ctx.sampleRate*.08);for(let i=0;i<seam;i++){const mix=i/seam;data[length-seam+i]=data[length-seam+i]*(1-mix)+data[i]*mix;}
 const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;source.loopStart=seam/ctx.sampleRate;
 const texture=ctx.createBiquadFilter();texture.type='bandpass';texture.frequency.value=kind==='draw'?2100:650;texture.Q.value=.45;
 const soft=ctx.createBiquadFilter();soft.type='lowpass';soft.frequency.value=kind==='draw'?4200:1700;
 const gain=ctx.createGain();gain.gain.value=0;source.connect(texture);texture.connect(soft);soft.connect(gain);gain.connect(ctx.destination);source.start();let disposed=false;
 return {move(speed:number){if(disposed)return;const amount=Math.min(1,Math.max(0,speed));gain.gain.cancelScheduledValues(ctx.currentTime);gain.gain.setTargetAtTime(volumeGain(volume)*(kind==='draw'?.24:.38)*Math.sqrt(amount),ctx.currentTime,.045);texture.frequency.setTargetAtTime((kind==='draw'?1500:420)+amount*(kind==='draw'?1000:450),ctx.currentTime,.12);},quiet(){if(!disposed){gain.gain.cancelScheduledValues(ctx.currentTime);gain.gain.setTargetAtTime(0,ctx.currentTime,.045);}},dispose(){if(disposed)return;disposed=true;source.stop();source.disconnect();texture.disconnect();soft.disconnect();gain.disconnect();}};
}
