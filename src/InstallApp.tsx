import {useEffect,useState} from 'react';

interface InstallPrompt extends Event {
 prompt:()=>Promise<void>;
 userChoice:Promise<{outcome:'accepted'|'dismissed'}>;
}

export function InstallApp(){
 const [prompt,setPrompt]=useState<InstallPrompt|null>(null);
 const [installed,setInstalled]=useState(()=>window.matchMedia('(display-mode: standalone)').matches||(navigator as Navigator&{standalone?:boolean}).standalone===true);
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{
  const display=window.matchMedia('(display-mode: standalone)');
  const ready=(event:Event)=>{event.preventDefault();setPrompt(event as InstallPrompt);setNotice('');};
  const done=()=>{setInstalled(true);setPrompt(null);setNotice('');};
  const changed=()=>setInstalled(display.matches||(navigator as Navigator&{standalone?:boolean}).standalone===true);
  window.addEventListener('beforeinstallprompt',ready);
  window.addEventListener('appinstalled',done);
  display.addEventListener('change',changed);
  return()=>{window.removeEventListener('beforeinstallprompt',ready);window.removeEventListener('appinstalled',done);display.removeEventListener('change',changed);};
 },[]);
 const install=async()=>{
  if(!prompt){
   const apple=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
   setNotice(apple?'In Safari, open Share, choose Add to Home Screen, then Add. You may need to scroll through the share options.':'Open your browser menu and look for Install app or Add to Home screen. If neither appears, try opening Happy Mind in Chrome or Edge.');
   return;
  }
  setBusy(true);
  try{await prompt.prompt();const choice=await prompt.userChoice;setNotice(choice.outcome==='accepted'?'Installation requested. Follow your browser’s next steps.':'No hurry. You can install later from your browser menu.');}
  catch{setNotice('The install prompt could not open. Try Install app or Add to Home screen in your browser menu.');}
  finally{setPrompt(null);setBusy(false);}
 };
 return <div className="install-app"><div className="setting"><div>Keep a little calm nearby<small>Open Happy Mind from your home screen.</small></div><button className="secondary" disabled={installed||busy} onClick={()=>void install()}>{installed?'App installed':busy?'Opening…':'Install app'}</button></div>{notice&&<p className="setting-hint" role="status">{notice}</p>}</div>;
}
