export type Point={x:number;y:number};
export type DrawingStroke={points:Point[];colour:string};
export const maxStrokes=32,maxStrokePoints=256;

export function beginStroke(strokes:DrawingStroke[],point:Point,colour:string):DrawingStroke[]{
 return [...strokes.slice(-(maxStrokes-1)),{points:[point,{x:point.x+.1,y:point.y}],colour}];
}

export function extendStroke(strokes:DrawingStroke[],point:Point):DrawingStroke[]{
 const stroke=strokes.at(-1),last=stroke?.points.at(-1);
 if(!stroke||!last||Math.hypot(point.x-last.x,point.y-last.y)<1.5)return strokes;
 // Preserve the whole gesture, simplifying older samples instead of stopping a long stroke.
 const points=stroke.points.length>=maxStrokePoints?stroke.points.filter((_,i)=>i%2===0):stroke.points;
 return [...strokes.slice(0,-1),{...stroke,points:[...points,point]}];
}
