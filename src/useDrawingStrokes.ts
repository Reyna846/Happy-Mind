import {useEffect,useRef} from 'react';
import {beginStroke,extendStroke,type DrawingStroke,type Point} from './stroke-path';
import {useRetainedState} from './SessionMemory';

export function useDrawingStrokes(key:string){
 const [lines,setLines]=useRetainedState<DrawingStroke[]>(key,[]);
 const pending=useRef<Point|null>(null),frame=useRef<number|null>(null);
 const cancel=()=>{if(frame.current!==null)cancelAnimationFrame(frame.current);frame.current=null;pending.current=null;};
 const flush=()=>{const point=pending.current;cancel();if(point)setLines(current=>extendStroke(current,point));};
 useEffect(()=>{const hide=()=>{if(document.hidden)cancel();};document.addEventListener('visibilitychange',hide);return()=>{cancel();document.removeEventListener('visibilitychange',hide);};},[]);
 return {lines,
  begin(point:Point,colour:string){flush();setLines(current=>beginStroke(current,point,colour));},
  move(point:Point){pending.current=point;if(frame.current===null)frame.current=requestAnimationFrame(flush);},
  end:flush,
  clear(){cancel();setLines([]);},
  add(points:Point[],colour:string){flush();setLines(current=>[...current.slice(-31),{points,colour}]);}
 };
}
