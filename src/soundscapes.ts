export const soundscapes={hum:{title:'Room tone',description:'A warm, almost-silent hum'},rain:{title:'Soft rain',description:'A real rainfall recording'},drops:{title:'Water droplets',description:'Water falling into a bowl'},waves:{title:'Slow shore',description:'Soft, generated waves'}} as const;
export type Soundscape=keyof typeof soundscapes;
export const volumeGain=(level:number)=>level<=0?0:10**((-42+Math.min(1,Math.max(0,level))*30)/20);
export function createSoundscape(ctx:AudioContext,target:AudioNode,id:Soundscape,onFallback:()=>void){
 const bus=ctx.createGain();bus.gain.setValueAtTime(0,ctx.currentTime);bus.connect(target);const sources:AudioScheduledSourceNode[]=[];let stopped=false;const abort=new AbortController();
 const fadeIn=()=>{bus.gain.cancelScheduledValues(ctx.currentTime);bus.gain.setValueAtTime(0,ctx.currentTime);bus.gain.linearRampToValueAtTime(1,ctx.currentTime+4);};
 const waves=()=>{const buffer=ctx.createBuffer(1,ctx.sampleRate*8,ctx.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=650;const level=ctx.createGain();level.gain.value=.13;const lfo=ctx.createOscillator(),depth=ctx.createGain();lfo.frequency.value=.09;depth.gain.value=.075;lfo.connect(depth);depth.connect(level.gain);source.connect(filter);filter.connect(level);level.connect(bus);sources.push(source,lfo);source.start();lfo.start();fadeIn();};
 if(id==='hum'){[87.3,130.81].forEach(hz=>{const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.frequency.value=hz;gain.gain.value=.035;oscillator.connect(gain);gain.connect(bus);sources.push(oscillator);oscillator.start();});fadeIn();}
 else if(id==='waves')waves();
 else void(async()=>{try{const response=await fetch(import.meta.env.BASE_URL+`audio/${id==='rain'?'rain':'water-drops'}.ogg`,{signal:abort.signal});if(!response.ok)throw new Error('audio unavailable');const buffer=await ctx.decodeAudioData(await response.arrayBuffer());if(stopped||ctx.state==='closed')return;
 // Blend the end into the beginning to soften the loop seam.
 const fade=Math.min(ctx.sampleRate,Math.floor(buffer.length/4));const loop=ctx.createBuffer(buffer.numberOfChannels,buffer.length-fade,buffer.sampleRate);
 for(let ch=0;ch<buffer.numberOfChannels;ch++){const original=buffer.getChannelData(ch),data=loop.getChannelData(ch);data.set(original.subarray(fade));for(let i=0;i<fade;i++){const mix=i/fade;data[data.length-fade+i]=data[data.length-fade+i]*(1-mix)+original[i]*mix;}}
 const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=loop;source.loop=true;gain.gain.value=id==='drops'?.28:.38;source.connect(gain);gain.connect(bus);sources.push(source);source.start();fadeIn();
 }catch{if(!stopped&&ctx.state!=='closed'){waves();onFallback();}}})();
 return {stop(immediate=false){if(stopped)return;stopped=true;abort.abort();if(ctx.state==='closed')return;bus.gain.cancelScheduledValues(ctx.currentTime);bus.gain.setTargetAtTime(0,ctx.currentTime,.45);const dispose=()=>{sources.forEach(source=>{try{source.stop();}catch{}});bus.disconnect();};if(immediate)dispose();else setTimeout(dispose,2200);}};
}
