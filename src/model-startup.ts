// A cached download is not permission to allocate a model in the background.
export async function inspectModelStartup(options:{cached:()=>Promise<boolean>;alive:()=>boolean;checked:()=>void;offer:()=>void}){
 let installed=false;try{installed=await options.cached();}catch{/* Storage denial is treated as missing, never as consent. */}
 if(!options.alive())return;
 options.checked();if(!installed)options.offer();
}
