// Short, infrequent pulses; browsers control the actual motor strength.
export function createGentleHaptics(vibrate:(duration:number)=>unknown,now:()=>number){
 let last=-Infinity;
 return {pulse(duration=7){const time=now();if(time-last<180)return;last=time;try{vibrate(Math.min(12,Math.max(1,duration)));}catch{}},cancel(){try{vibrate(0);}catch{}}};
}
