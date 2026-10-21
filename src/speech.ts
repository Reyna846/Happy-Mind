export type VoiceInfo={name:string;voiceURI:string;lang:string;default:boolean};
export function chooseVoice<T extends VoiceInfo>(voices:T[],saved:string,language:string):T|undefined{
 voices=voices.filter(v=>/^en(?:-|$)/i.test(v.lang));
 const explicit=voices.find(v=>v.voiceURI===saved);if(explicit)return explicit;
 const lang=language.split('-')[0];const matching=voices.filter(v=>v.lang.toLowerCase().startsWith(lang.toLowerCase()));const pool=matching.length?matching:voices;
 return [...pool].sort((a,b)=>score(b)-score(a))[0];
}
function score(v:VoiceInfo){return (/natural|neural|premium|enhanced/i.test(v.name)?100:0)+(/samantha|jenny|aria|google uk english female/i.test(v.name)?60:/karen|moira|tessa/i.test(v.name)?45:0)+(v.default?5:0);}
export function softenSpeech(utterance:SpeechSynthesisUtterance,volume:number){const voice=chooseVoice(window.speechSynthesis.getVoices(),localStorage.getItem('hm-voice')||'','en');utterance.lang='en-US';if(voice){utterance.voice=voice;utterance.lang=voice.lang;}utterance.rate=.86;utterance.pitch=1;utterance.volume=volume;}
