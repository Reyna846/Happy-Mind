import type {Message} from './local-ai';
import {freshContext,recordTurn,type SessionContext} from './adaptation.ts';
export function lastEditableTurn<T extends Message>(messages:T[]){
 for(let index=messages.length-1;index>=0;index--)if(messages[index].role==='user')return {index,words:messages[index].content,prefix:messages.slice(0,index)};
 return null;
}
export function correctedContext(previous:SessionContext,prefix:Message[]):SessionContext{
 let restored=freshContext();for(const message of prefix)if(message.role==='user')restored=recordTurn(restored,message.content);
 return {...restored,declined:[...new Set([...previous.declined,...restored.declined])],helpful:[...previous.helpful],offered:previous.offered.filter(item=>item.turn<=restored.turn),lastMoodTurn:Math.min(previous.lastMoodTurn,restored.turn)};
}
