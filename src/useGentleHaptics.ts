import {useEffect} from 'react';
import {createGentleHaptics} from './haptics';
export function useGentleHaptics(enabled:boolean,still:boolean){
 useEffect(()=>{
  if(!enabled||still||typeof navigator.vibrate!=='function')return;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const haptic=createGentleHaptics(n=>navigator.vibrate(n),()=>performance.now());
  const allowed=(event:Event)=>event.isTrusted&&!document.hidden&&!motion.matches;
  const click=(event:MouseEvent)=>{
   if(!allowed(event)||!(event.target instanceof Element))return;
   const target=event.target.closest('button,summary');
   if(!target||target.matches(':disabled,[aria-disabled="true"]')||target.closest('[hidden],[inert],.bedtime-panel'))return;
   if(target.matches('.centering-touch,.touch-water,.cat-touch'))return;
   haptic.pulse(target.matches('.soft-bubble,.send-message,.module-button')?10:6);
  };
  const touch=(event:PointerEvent)=>{
   if(!allowed(event)||event.button!==0||!(event.target instanceof Element))return;
   if(event.target.closest('.centering-touch,.touch-water,.cat-touch')&&!event.target.closest('[hidden],[inert]'))haptic.pulse(10);
  };
  const key=(event:KeyboardEvent)=>{if(allowed(event)&&!event.repeat&&(event.key==='Enter'||event.key===' ')&&event.target instanceof Element&&event.target.closest('.centering-touch'))haptic.pulse(10);};
  const hide=()=>{if(document.hidden)haptic.cancel();};
  const motionChange=()=>{if(motion.matches)haptic.cancel();};
  document.addEventListener('keydown',key);document.addEventListener('click',click);document.addEventListener('pointerdown',touch);document.addEventListener('visibilitychange',hide);motion.addEventListener('change',motionChange);
  return()=>{document.removeEventListener('keydown',key);document.removeEventListener('click',click);document.removeEventListener('pointerdown',touch);document.removeEventListener('visibilitychange',hide);motion.removeEventListener('change',motionChange);haptic.cancel();};
 },[enabled,still]);
}
