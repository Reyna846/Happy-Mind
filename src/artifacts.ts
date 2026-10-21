import type { Mood } from './mood';
export type RoomArtifact={kind:'garden'|'stars'|'feeling';title:string;text:string;palette:Mood};
export const artifactSchema={type:['object','null'],additionalProperties:false,required:['kind','title','text','palette'],properties:{kind:{enum:['garden','stars','feeling']},title:{type:'string',maxLength:60},text:{type:'string',maxLength:240},palette:{enum:['lake','dusk','sand']}}};
export function parseArtifact(value:unknown):RoomArtifact|null{
 if(value===null)return null;
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid artifact');
 const a=value as Record<string,unknown>;
 if(Object.keys(a).some(k=>!['kind','title','text','palette'].includes(k))||!['garden','stars','feeling'].includes(a.kind as string)||!['lake','dusk','sand'].includes(a.palette as string)||typeof a.title!=='string'||!a.title.trim()||a.title.length>60||typeof a.text!=='string'||a.text.length>240)throw new Error('Invalid artifact');
 return {kind:a.kind as RoomArtifact['kind'],title:a.title.trim(),text:a.text,palette:a.palette as Mood};
}
export function demoArtifact(index:number):RoomArtifact{const items:RoomArtifact[]=[{kind:'garden',title:'A little room to grow',text:'One quiet moment at a time.',palette:'lake'},{kind:'stars',title:'Some space around it',text:'There is room for a pause.',palette:'dusk'},{kind:'feeling',title:'Here, as you are',text:'You don’t have to name everything yet.',palette:'sand'}];return items[index%items.length];}
