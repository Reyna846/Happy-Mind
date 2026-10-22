import {useEffect,useLayoutEffect,useState} from 'react';
export type ThemePreference='light'|'dark'|'system';
export const resolveTheme=(preference:ThemePreference,systemDark:boolean)=>preference==='system'?(systemDark?'dark':'light'):preference;
function readTheme():ThemePreference{
 try{const saved=localStorage.getItem('hm-theme');return saved==='dark'||saved==='system'?saved:'light';}catch{return 'light';}
}
export function useTheme(){
 const [theme,setTheme]=useState<ThemePreference>(readTheme);
 const [systemDark,setSystemDark]=useState(()=>matchMedia('(prefers-color-scheme: dark)').matches);
 useEffect(()=>{const media=matchMedia('(prefers-color-scheme: dark)'),change=()=>setSystemDark(media.matches);change();media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 useLayoutEffect(()=>{
  const resolved=resolveTheme(theme,systemDark);document.documentElement.dataset.theme=resolved;document.documentElement.style.colorScheme=resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',resolved==='dark'?'#211b2c':'#cbb9e5');
  try{localStorage.setItem('hm-theme',theme);}catch{/* The theme still works when storage is unavailable. */}
 },[theme,systemDark]);
 return [theme,setTheme] as const;
}
