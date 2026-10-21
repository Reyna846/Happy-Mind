import { activityIds, type Activity } from './activity-registry.ts';
import type { CompanionReply } from './chat-protocol';
export type SessionContext={turn:number;preference:'open'|'listen';declined:Activity[];offered:{id:Activity;turn:number}[];helpful:Activity[];lastMoodTurn:number};
export const freshContext=():SessionContext=>({turn:0,preference:'open',declined:[],offered:[],helpful:[],lastMoodTurn:-3});
const aliases:Record<Activity,string>={draw:'draw(?:ing)?|trac(?:e|ing)',breathe:'breath(?:e|ing)?',ground:'ground(?:ing)?',release:'shoulder|tension|relaxation',body:'body(?: scan| check-in)?',listen:'listening activity|sound exercise',hand:'hand trac(?:e|ing)|finger(?:tip)?'};
export function recordTurn(context:SessionContext,words:string):SessionContext{
 const text=words.toLowerCase().replace(/’/g,"'");const next={...context,turn:context.turn+1,declined:[...context.declined]};
 if(/\b(just listen|no advice|don't (?:want|need) (?:any )?advice|without advice|no (?:more )?activities)\b/.test(text))next.preference='listen';
 else if(/\b(suggest|help me try|give me an activity|i want to try|i would like to try|i (?:want|would like) to (?:draw|breathe|try)|let's (?:draw|breathe|try))\b/.test(text))next.preference='open';
 for(const id of activityIds){const pattern=aliases[id];if(new RegExp(`\\b(?:no more|don't (?:want|like)|do not (?:want|like)|stop|skip|not interested in)\\s+(?:the |any |more )?(?:${pattern})\\b`).test(text)&&!next.declined.includes(id))next.declined.push(id);}
 return next;
}
export function planResponse(response:CompanionReply,context:SessionContext):CompanionReply{
 const result={...response};
 if(context.preference==='listen'){if(result.artifact)result.artifact=null;result.mood=null;result.ambience='keep';if(/\b(would you like to try|how about|you (?:should|could)|try (?:a|an|some)|let's (?:draw|breathe|try))\b/i.test(result.reply))result.reply='We can leave advice and activities aside. What would you like me to understand?';}
 if(context.preference==='listen'||(result.activity&&context.declined.includes(result.activity))||(result.activity&&context.offered.some(item=>item.id===result.activity&&context.turn-item.turn<3)))result.activity=null;
 if(context.turn-context.lastMoodTurn<2)result.mood=null;
 return result;
}
export function rememberResponse(context:SessionContext,response:CompanionReply):SessionContext{return {...context,offered:response.activity?[...context.offered.slice(-5),{id:response.activity,turn:context.turn}]:context.offered,lastMoodTurn:response.mood?context.turn:context.lastMoodTurn};}
export function declineActivity(context:SessionContext,id:Activity):SessionContext{return {...context,declined:[...new Set([...context.declined,id])]};}
export function contextPrompt(context:SessionContext){return `Session preferences (honor them): ${JSON.stringify({mode:context.preference,doNotOffer:context.declined,recentlyOffered:context.offered.slice(-3).map(o=>o.id),helpful:context.helpful})}. Use the recent conversation to understand what they are asking for. Do not repeat a declined or recent activity. Listen without suggestions in listen mode. Do not infer a diagnosis. Keep the room steady; avoid unnecessary mood changes.`;}
