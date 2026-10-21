import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { restingRotation, sculptureBlend, smoothBlend, turnSculpture } from './sculpture-motion';
import type { SculptureRotation } from './sculpture-motion';

type Mode='auto'|'flower'|'brain';
function disposeModel(root:THREE.Object3D){const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();root.traverse(object=>{if(object instanceof THREE.Mesh){geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:[object.material]){materials.add(material);for(const value of Object.values(material))if(value instanceof THREE.Texture)textures.add(value);}}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>{t.dispose();const bitmap=t.image as {close?:()=>void}|undefined;bitmap?.close?.();});}
function makeModels(){
 const root=new THREE.Group(),flower=new THREE.Group(),brain=new THREE.Group();root.add(flower,brain);
 const petalMaterial=new THREE.MeshStandardMaterial({color:0xe6bcf0,roughness:.48,metalness:0,transparent:true});
 const rearMaterial=new THREE.MeshStandardMaterial({color:0xbfa4e0,roughness:.6,transparent:true});
 const centreMaterial=new THREE.MeshStandardMaterial({color:0xffdbaf,roughness:.48,transparent:true});
 const brainMaterials=new Set<THREE.MeshStandardMaterial>();

 const petalGeometry=new THREE.SphereGeometry(1,28,20);
 const petals:{mesh:THREE.Mesh;angle:number;radius:number;tilt:number;z:number}[]=[];
 for(let layer=0;layer<2;layer++)for(let i=0;i<(layer?8:10);i++){
  const count=layer?8:10,angle=i/count*Math.PI*2+(layer?.2:0),radius=layer?.39:.53;
  const mesh=new THREE.Mesh(petalGeometry,layer?petalMaterial:rearMaterial);mesh.scale.set(layer?.19:.23,layer?.43:.5,layer?.12:.1);
  const tilt=layer?.12:.25,z=layer?.16:0;
  mesh.position.set(Math.sin(angle)*radius,Math.cos(angle)*radius,z);mesh.rotation.set(tilt,0,-angle);flower.add(mesh);petals.push({mesh,angle,radius,tilt,z});
 }
 const centre=new THREE.Mesh(new THREE.SphereGeometry(.23,32,20),centreMaterial);centre.scale.z=.65;centre.position.z=.27;flower.add(centre);
 const installBrain=(asset:THREE.Group)=>{const box=new THREE.Box3().setFromObject(asset),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());asset.position.sub(center);const normalized=new THREE.Group();normalized.rotation.set(.12,-.55,0);normalized.scale.setScalar(1.65/Math.max(size.y,.001));normalized.add(asset);brain.add(normalized);asset.traverse(object=>{if(object instanceof THREE.Mesh){for(const material of Array.isArray(object.material)?object.material:[object.material])if(material instanceof THREE.MeshStandardMaterial){material.color.set(0xffc8dc);material.roughness=.62;material.transparent=true;brainMaterials.add(material);}}});};
 return {root,installBrain,update:(blend:number,time:number,moving:boolean)=>{
  const closing=smoothBlend(0,1,blend),flowerOpacity=brain.children.length?1-smoothBlend(.12,.8,blend):1,brainOpacity=smoothBlend(.22,.9,blend);
  flower.visible=flowerOpacity>.002;brain.visible=brainOpacity>.002;
  for(const material of [petalMaterial,rearMaterial,centreMaterial]){material.opacity=flowerOpacity;material.depthWrite=flowerOpacity>.98;}
  for(const material of brainMaterials){material.opacity=brainOpacity;material.depthWrite=brainOpacity>.98;}
  flower.scale.setScalar(1-closing*.25);brain.scale.setScalar(.75+closing*.4);
  for(const petal of petals){const r=petal.radius*(1-closing*.38);petal.mesh.position.set(Math.sin(petal.angle)*r,Math.cos(petal.angle)*r,petal.z+closing*.08);petal.mesh.rotation.x=petal.tilt+closing*.55;}
  const breathe=moving?1+Math.sin(time*.7)*.012:1;root.scale.setScalar(breathe);
 }};
}
export default function MindSculpture({still,fallback}:{still:boolean;fallback:ReactNode}){
 const host=useRef<HTMLDivElement>(null),helpId=useId();
 const [mode,setMode]=useState<Mode>('auto'),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[rotation,setRotation]=useState(restingRotation),[reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const pose=useRef<SculptureRotation>({...restingRotation}),state=useRef({mode:'auto' as Mode,blend:0,target:0,dirty:true,reset:true});
 const velocity=useRef({x:0,y:0}),drag=useRef<{id:number;x:number;y:number;pose:SculptureRotation;lastX:number;lastY:number;time:number}|null>(null);
 const quiet=still||reduced,quietRef=useRef(quiet);quietRef.current=quiet;
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setReduced(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 useEffect(()=>{state.current.dirty=true;velocity.current={x:0,y:0};},[quiet]);
 useEffect(()=>{
  const element=host.current;if(!element)return;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.domElement.setAttribute('aria-hidden','true');element.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,30);camera.position.set(0,0,4.2);
  const models=makeModels();let disposed=false;const assetAbort=new AbortController();element.dataset.brainAsset='loading';
  void fetch(import.meta.env.BASE_URL+'models/brain-anatomy.glb',{signal:assetAbort.signal}).then(response=>{if(!response.ok)throw new Error('Brain asset unavailable');return response.arrayBuffer();}).then(buffer=>new GLTFLoader().parseAsync(buffer,import.meta.env.BASE_URL+'models/')).then(gltf=>{if(disposed){disposeModel(gltf.scene);return;}models.installBrain(gltf.scene);element.dataset.brainAsset='ready';state.current.dirty=true;}).catch(()=>{if(!disposed){element.dataset.brainAsset='error';setFailed(true);}});
  scene.add(models.root);scene.add(new THREE.HemisphereLight(0xfff8ff,0x9c7fb9,2));
  const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(-3,4,6);scene.add(key);const rim=new THREE.DirectionalLight(0xd8c5fb,1.8);rim.position.set(3,1,-2);scene.add(rim);
  let last=0,elapsed=0,sinceSwitch=0,bounce=0,bounceVelocity=0,inView=true,lost=false;
  const resize=()=>{const width=element.clientWidth,height=element.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();state.current.dirty=true;};
  const observer=new ResizeObserver(resize);observer.observe(element);resize();
  const frame=(now:number)=>{
   const dt=last?Math.min((now-last)/1000,.05):0;last=now;elapsed+=dt;
   const s=state.current;if(s.reset){sinceSwitch=0;s.reset=false;}
   if(s.mode==='auto'&&!quietRef.current&&!drag.current){sinceSwitch+=dt;if(sinceSwitch>7){s.target=s.target===0?1:0;sinceSwitch=0;}}
   const before=s.blend;s.blend=quietRef.current?s.target:sculptureBlend(s.blend,s.target,dt);const displayed=s.blend===0?'flower':s.blend===1?'brain':'transition';if(element.dataset.form!==displayed)element.dataset.form=displayed;
   if(!drag.current&&!quietRef.current){pose.current.x=Math.max(-1.35,Math.min(1.35,pose.current.x+velocity.current.x*dt));pose.current.y+=velocity.current.y*dt;velocity.current.x*=Math.exp(-1.65*dt);velocity.current.y*=Math.exp(-1.65*dt);}
   if(quietRef.current&&!s.dirty&&before===s.blend)return;
   models.root.rotation.set(pose.current.x,pose.current.y,0);models.update(s.blend,elapsed,!quietRef.current);if(!quietRef.current){const speed=Math.hypot(velocity.current.x,velocity.current.y);bounceVelocity+=(-48*bounce-7*bounceVelocity)*dt;if(!drag.current)bounceVelocity+=speed*.16*dt;else bounceVelocity=.7;bounce=Math.max(-.08,Math.min(.08,bounce+bounceVelocity*dt));models.root.position.y=bounce;}else{bounce=0;bounceVelocity=0;models.root.position.y=0;}element.dataset.rotation=`${pose.current.x.toFixed(3)},${pose.current.y.toFixed(3)}`;renderer.render(scene,camera);s.dirty=false;
  };
  const run=()=>{last=0;renderer.setAnimationLoop(!document.hidden&&inView&&!lost?frame:null);};
  const visibility=()=>{velocity.current={x:0,y:0};drag.current=null;state.current.dirty=true;run();};document.addEventListener('visibilitychange',visibility);
  const intersection=new IntersectionObserver(entries=>{inView=entries[0]?.isIntersecting??true;run();});intersection.observe(element);
  const contextLost=(event:Event)=>{event.preventDefault();lost=true;renderer.setAnimationLoop(null);setFailed(true);};renderer.domElement.addEventListener('webglcontextlost',contextLost);
  frame(0);setReady(true);run();
  return()=>{renderer.setAnimationLoop(null);observer.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',contextLost);disposed=true;assetAbort.abort();disposeModel(models.root);renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
 },[]);
 const select=(shape:'flower'|'brain')=>{state.current.mode=shape;state.current.target=shape==='brain'?1:0;state.current.dirty=true;velocity.current={x:0,y:0};setMode(shape);};
 const reset=()=>{pose.current={...restingRotation};setRotation({...restingRotation});velocity.current={x:0,y:0};state.current={...state.current,mode:'auto',target:0,dirty:true,reset:true};setMode('auto');};
 const stopDrag=()=>{const previous=drag.current;drag.current=null;if(quietRef.current||(previous&&performance.now()-previous.time>120))velocity.current={x:0,y:0};};
 return <div className="interactive-bloom" data-mode={mode} data-renderer={failed?'fallback':ready?'webgl':'loading'}>
  <div className="mind-turntable" role="group" tabIndex={0} aria-label="Rotate the 3D flower and brain" aria-describedby={helpId} title="Drag to turn" data-rotation={`${rotation.x.toFixed(2)},${rotation.y.toFixed(2)}`} onPointerDown={e=>{if(drag.current||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();e.currentTarget.focus({preventScroll:true});e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,pose:{...pose.current},lastX:e.clientX,lastY:e.clientY,time:performance.now()};velocity.current={x:0,y:0};select(state.current.blend>.5?'brain':'flower');}} onPointerMove={e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const now=performance.now(),dt=Math.max(.016,(now-d.time)/1000);velocity.current={x:Math.max(-2,Math.min(2,(e.clientY-d.lastY)*.012/dt)),y:Math.max(-2,Math.min(2,(e.clientX-d.lastX)*.012/dt))};pose.current=turnSculpture(d.pose,e.clientX-d.x,e.clientY-d.y);setRotation({...pose.current});state.current.dirty=true;d.lastX=e.clientX;d.lastY=e.clientY;d.time=now;}} onPointerUp={e=>{if(drag.current?.id===e.pointerId)stopDrag();}} onPointerCancel={e=>{if(drag.current?.id===e.pointerId){stopDrag();velocity.current={x:0,y:0};}}} onLostPointerCapture={e=>{if(drag.current?.id===e.pointerId)stopDrag();}} onKeyDown={e=>{if(e.key==='Home'){e.preventDefault();reset();return;}if(e.key===' '){e.preventDefault();select(state.current.target?'flower':'brain');return;}const delta:Record<string,[number,number]>={ArrowLeft:[-14,0],ArrowRight:[14,0],ArrowUp:[0,-14],ArrowDown:[0,14]};if(!delta[e.key])return;e.preventDefault();select(state.current.blend>.5?'brain':'flower');pose.current=turnSculpture(pose.current,...delta[e.key]);setRotation({...pose.current});}}>
   <div ref={host} className="mind-canvas"/>{(!ready||failed)&&<div className="sculpture-fallback" data-form={mode==='brain'?'brain':'flower'} style={{transform:`rotateX(${rotation.x}rad) rotateY(${rotation.y}rad)`}}>{fallback}</div>}
  </div>
  <p id={helpId} className="sr-only">Drag to rotate. Arrow keys turn the sculpture; Space changes its form; Home resets the view. {failed?'A lightweight illustration is shown because 3D is unavailable.':''}</p>
  <div className="sculpture-controls" aria-label="Sculpture form"><button aria-label="Show flower" aria-pressed={mode==='flower'} onClick={()=>select('flower')} title="Flower"><svg viewBox="0 0 24 24" aria-hidden="true">{Array.from({length:6},(_,i)=><ellipse key={i} cx="12" cy="7" rx="3" ry="5" transform={`rotate(${i*60} 12 12)`}/>)}<circle cx="12" cy="12" r="2.5"/></svg></button><button aria-label="Show brain" aria-pressed={mode==='brain'} onClick={()=>select('brain')} title="Mind"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4c-3-4-7 0-7 3-4 1-4 7-1 8-1 4 4 7 8 4 4 3 9 0 8-4 3-1 3-7-1-8 0-3-4-7-7-3Zm0 0v15M5 8q5-2 4 4m10-4q-5-2-4 4M5 15q3-2 4 1m10-1q-3-2-4 1"/></svg></button></div>
 </div>;
}
