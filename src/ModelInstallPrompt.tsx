import {useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
export function ModelInstallPrompt({open,loading,progress,error,onInstall,onLater,onCancel}:{open:boolean;loading:boolean;progress:string;error:string;onInstall:()=>void;onLater:()=>void;onCancel:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(open&&!dialog.current?.open)dialog.current?.showModal();if(!open&&dialog.current?.open)dialog.current.close();},[open]);
 return createPortal(<dialog ref={dialog} className="model-install" aria-labelledby="model-install-title" onCancel={e=>{e.preventDefault();if(loading)onCancel();else onLater();}}><h2 id="model-install-title">A companion, on your device.</h2><p>Install Llama 3.2 1B to talk privately on this device, with no API fees. This is a separate download from the previous companion: several hundred MB, requiring a compatible WebGPU browser. After preparation, replies are generated on your device. Quiet activities and spoken grounding guides work without it.</p>{!loading&&error&&<p role="status">{error}</p>}{loading?<><p role="status">{progress}</p><button className="quiet-link" onClick={onCancel}>Cancel download</button></>:<div><button className="primary" onClick={onInstall}>Install Llama companion</button><button className="quiet-link" onClick={onLater}>Not now</button></div>}</dialog>,document.body);
}
