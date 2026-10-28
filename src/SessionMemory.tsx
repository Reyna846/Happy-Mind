import {createContext,useContext,useLayoutEffect,useRef,useState,type ReactNode,type Dispatch,type SetStateAction} from 'react';

// Session-only data survives scene disposal, without retaining DOM, timers or audio.
const Memory=createContext<Map<string,unknown>|null>(null);
export function SessionMemory({children}:{children:ReactNode}){
 const memory=useRef(new Map<string,unknown>());
 return <Memory.Provider value={memory.current}>{children}</Memory.Provider>;
}
export const useSessionMemory=()=>useContext(Memory);
export function useRetainedState<T>(key:string,initial:T|(()=>T)):[T,Dispatch<SetStateAction<T>>]{
 const memory=useSessionMemory();
 const [value,setValue]=useState<T>(()=>memory?.has(key)?memory.get(key) as T:typeof initial==='function'?(initial as ()=>T)():initial);
 useLayoutEffect(()=>{memory?.set(key,value);},[memory,key,value]);
 return [value,setValue];
}
export function useRetainedRef<T>(key:string,initial:T){
 const memory=useSessionMemory();
 const ref=useRef<{current:T}|null>(null);
 if(!ref.current)ref.current=(memory?.get(key) as {current:T}|undefined)??{current:initial};
 useLayoutEffect(()=>{memory?.set(key,ref.current);},[memory,key]);
 return ref.current;
}
