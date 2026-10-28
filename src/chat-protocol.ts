import { artifactSchema, parseArtifact, type RoomArtifact } from './artifacts.ts';
import type { Mood } from './mood';
import { activityIds } from './activity-registry.ts';
export type { Activity } from './activity-registry.ts';
import type { Activity } from './activity-registry.ts';
export type Ambience = 'keep' | 'soften' | 'quiet';
export type CompanionReply = { reply:string; activity:Activity|null; mood:Mood|null; ambience:Ambience; artifact?:RoomArtifact|null };
export const replySchema = JSON.stringify({type:'object',additionalProperties:false,required:['reply','activity','mood','ambience'],properties:{artifact:artifactSchema,reply:{type:'string'},activity:{enum:[...activityIds,null]},mood:{enum:['lake','dusk','sand',null]},ambience:{enum:['keep','soften','quiet']}}});
export class ReplyValidationError extends Error {}
export function parseCompanionReply(raw:string):CompanionReply {
 try{return parseReply(raw);}catch{throw new ReplyValidationError('Invalid companion reply');}
}
function parseReply(raw:string):CompanionReply {
 const text=raw.trim();
 if(!text||text.length>6000)throw new Error('Invalid reply');
 // Providers without structured output may return plain text; that text gets no UI authority.
 if(!text.startsWith('{')&&!text.startsWith('[')&&!text.startsWith('```'))return {reply:text.slice(0,1200),activity:null,mood:null,ambience:'keep'};
 const value=JSON.parse(text);
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['reply','activity','mood','ambience','artifact'].includes(k)))throw new Error('Invalid envelope');
 if(typeof value.reply!=='string'||!value.reply.trim()||value.reply.length>1200)throw new Error('Invalid reply');
 if(![null,...activityIds].includes(value.activity)||![null,'lake','dusk','sand'].includes(value.mood)||!['keep','soften','quiet'].includes(value.ambience))throw new Error('Invalid action');
 return {reply:value.reply.trim(),activity:value.activity,mood:value.mood,ambience:value.ambience,...(Object.hasOwn(value,'artifact')?{artifact:parseArtifact(value.artifact)}:{})};
}
export { activityNames } from './activity-registry.ts';
export function breathAt(elapsedMs:number){const cycle=((elapsedMs%10000)+10000)%10000;const inhale=cycle<5000;return {inhale,progress:inhale?cycle/5000:1-(cycle-5000)/5000,remaining:Math.max(1,Math.ceil((5000-cycle%5000)/1000))};}
