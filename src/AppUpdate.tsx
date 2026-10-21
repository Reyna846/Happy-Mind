import {useEffect,useRef,useState} from 'react';
export function AppUpdate(){
 const [waiting,setWaiting]=useState<ServiceWorker|null>(null),[failed,setFailed]=useState(false);const restarting=useRef(false);
 useEffect(()=>{if(!('serviceWorker' in navigator)||!import.meta.env.PROD)return;let disposed=false;const controller=()=>{if(restarting.current)location.reload();};navigator.serviceWorker.addEventListener('controllerchange',controller);
 void navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js').then(reg=>{const check=()=>{if(!disposed&&reg.waiting&&navigator.serviceWorker.controller)setWaiting(reg.waiting);};check();reg.addEventListener('updatefound',()=>{reg.installing?.addEventListener('statechange',check);});void reg.update().catch(()=>{});}).catch(()=>{});
 return()=>{disposed=true;navigator.serviceWorker.removeEventListener('controllerchange',controller);};},[]);
 return waiting?<aside className="app-update" role="status"><p>A new version is ready. Updating clears this visit’s conversation.</p><button className="primary" onClick={()=>{restarting.current=true;waiting.postMessage({type:'SKIP_WAITING'});setTimeout(()=>{if(restarting.current)setFailed(true);},10000);}}>Update & restart</button>{failed&&<small>Close all Happy Mind windows, then reopen the app to finish updating.</small>}</aside>:null;
}
