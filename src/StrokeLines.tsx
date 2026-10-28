import {memo} from 'react';
import type {DrawingStroke} from './stroke-path';

// Completed strokes keep their coordinate strings while the current stroke changes.
export const InkLine=memo(function InkLine({stroke}:{stroke:DrawingStroke}){
 return <polyline points={stroke.points.map(p=>`${p.x},${p.y}`).join(' ')} stroke={stroke.colour} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>;
});
export const SandLine=memo(function SandLine({stroke}:{stroke:DrawingStroke}){
 const points=stroke.points.map(p=>`${p.x},${p.y}`).join(' ');
 return <g><polyline points={points} transform="translate(0 2.5)" stroke="#fff0d3" strokeWidth="9" opacity=".7"/><polyline points={points} stroke="#aa8054" strokeWidth="6"/><polyline points={points} transform="translate(0 -.8)" stroke="#86643f" strokeWidth="2" opacity=".5"/></g>;
});
