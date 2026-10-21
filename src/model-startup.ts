// Cache inspection never starts a first-time download without consent.
export async function inspectModelStartup(options:{cached:()=>Promise<boolean>;alive:()=>boolean;checked:()=>void;warm:()=>void;offer:()=>void}){
 let installed=false;try{installed=await options.cached();}catch{/* Storage denial is treated as missing, never as consent. */}
 if(!options.alive())return;
 options.checked();if(installed)options.warm();else options.offer();
}
