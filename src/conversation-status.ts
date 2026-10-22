export type MicPhase='idle'|'opening'|'listening'|'transcribing'|'error';
export function conversationStatus(input:{model:'off'|'loading'|'ready'|'busy';mic:MicPhase;listening:boolean;speaking:boolean;voicePending:boolean;editing:boolean;interrupting:boolean}){
 if(input.editing)return {phase:'editing',label:'Review your words'};
 if(input.mic==='opening')return {phase:'opening',label:'Opening microphone…'};
 if(input.listening||input.mic==='listening')return {phase:'listening',label:'Listening, at your pace'};
 if(input.mic==='transcribing')return {phase:'transcribing',label:'Turning your words into text…'};
 if(input.speaking)return {phase:'speaking',label:'Speaking'};
 if(input.interrupting)return {phase:'interrupting',label:'Making room for your next thought…'};
 if(input.model==='loading')return {phase:'loading',label:'Preparing companion…'};
 if(input.voicePending)return {phase:'voice',label:'Preparing your voice reply…'};
 if(input.model==='busy')return {phase:'thinking',label:'Thinking about your words…'};
 if(input.mic==='error')return {phase:'error',label:'Microphone paused'};
 return {phase:'ready',label:input.model==='off'?'Companion not ready':'Ready when you are'};
}
