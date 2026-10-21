import {useRef,useState} from 'react';
import {Icon} from './Icon';
import {WelcomeBloom} from './WelcomeBloom';
import {slideProgress,slideComplete} from './entry-slide';
export function SlideEntry({onOpen,still}:{onOpen:()=>void;still:boolean}){
 const [progress,setProgress]=useState(0),[dragging,setDragging]=useState(false);
 const track=useRef<HTMLDivElement>(null),pointer=useRef<number|null>(null),start=useRef(0),value=useRef(0);
 const finish=(cancel=false)=>{if(pointer.current===null)return;pointer.current=null;setDragging(false);if(!cancel&&slideComplete(value.current)){onOpen();return;}value.current=0;setProgress(0);};
 return <div className="entry-screen slide-entry" aria-label="Welcome to Happy Mind"><WelcomeBloom still={still}/><h1>A little room for you.</h1><p>Take your time. Come in when you’re ready.</p><div ref={track} className={'entry-track'+(dragging?' is-dragging':'')} style={{'--entry-progress':progress} as React.CSSProperties}><span className="entry-slide-label" aria-hidden="true">Slide into a softer moment <span>› › ›</span></span><button className="entry-thumb" aria-label="Slide into a softer moment. Drag right, or press Enter or Space." onPointerDown={e=>{if(pointer.current!==null||e.button!==0)return;pointer.current=e.pointerId;start.current=e.clientX;value.current=0;setDragging(true);e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(pointer.current!==e.pointerId)return;const travel=(track.current?.clientWidth??64)-64;value.current=slideProgress(e.clientX-start.current,travel);setProgress(value.current);}} onPointerUp={e=>{if(e.pointerId===pointer.current)finish();}} onPointerCancel={()=>finish(true)} onLostPointerCapture={()=>finish(true)} onClick={e=>{if(e.detail===0)onOpen();}}><Icon name="arrow" size={25}/></button></div><small className="entry-key-hint">Keyboard: Tab to the arrow, then Enter.</small></div>;
}
