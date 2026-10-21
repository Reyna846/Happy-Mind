import {createServer} from 'node:http';
import {readFileSync,writeFileSync,mkdirSync,renameSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {timingSafeEqual} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const clamp=(value,fallback,min,max)=>Number.isFinite(Number(value))?Math.min(max,Math.max(min,Math.floor(Number(value)))):fallback;
export function createVoiceServer({env=process.env,request=fetch,ledgerPath=resolve('.runtime/voice-quota.json')}={}){
 const enabled=env.VOICE_ENABLED==='1'&&!!env.OPENAI_API_KEY&&!!env.OPENAI_REALTIME_MODEL&&(env.VOICE_ACCESS_CODE?.length??0)>=24&&!!env.APP_ORIGIN;
 const maxSeconds=clamp(env.VOICE_MAX_SECONDS??180,180,30,300),maxDaily=clamp(env.VOICE_DAILY_SESSIONS??3,3,1,10),calls=new Set();
 const instructions=readFileSync(new URL('../agent.md',import.meta.url),'utf8').split('## Runtime integration')[0]+'\nSpeak in one or two short sentences. No automatic greeting: wait for the person. Do not claim to create visuals or launch activities. Never request secrets.';
 const auth=value=>{const a=Buffer.from(value??''),b=Buffer.from('Bearer '+env.VOICE_ACCESS_CODE);return a.length===b.length&&timingSafeEqual(a,b);};
 const reserve=()=>{mkdirSync(dirname(ledgerPath),{recursive:true});const day=new Date().toISOString().slice(0,10);let ledger={day,count:0};if(existsSync(ledgerPath)){const saved=JSON.parse(readFileSync(ledgerPath,'utf8'));if(typeof saved.day!=='string'||!Number.isInteger(saved.count)||saved.count<0)throw Error('quota corrupt');if(saved.day===day)ledger=saved;}if(ledger.count>=maxDaily)return false;ledger.count++;writeFileSync(ledgerPath+'.tmp',JSON.stringify(ledger),{mode:0o600});renameSync(ledgerPath+'.tmp',ledgerPath);return true;};
 const hangup=async(id)=>{try{await request('https://api.openai.com/v1/realtime/calls/'+encodeURIComponent(id)+'/hangup',{method:'POST',headers:{Authorization:'Bearer '+env.OPENAI_API_KEY},signal:AbortSignal.timeout(10000)});}catch{/* Client closes its peer connection independently. */}};
 const server=createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  const origin=req.headers.origin;if(req.url==='/api/voice/status'&&req.method==='GET'&&!origin){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({enabled,maxSeconds,maxDaily}));return;}if(origin!==env.APP_ORIGIN){res.writeHead(403);res.end();return;}res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');
  if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.writeHead(204);res.end();return;}
  const json=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(value));};
  if(req.url==='/api/voice/status'&&req.method==='GET'){json(200,{enabled,maxSeconds,maxDaily});return;}
  if(req.url!=='/api/voice/session'||req.method!=='POST'){json(404,{error:'Not found'});return;}
  if(!enabled){json(503,{error:'Voice backend is not configured yet.'});return;}
  if(!auth(req.headers.authorization)){json(401,{error:'Access code not accepted.'});return;}
  if(calls.size){json(429,{error:'A voice session is already reserved. Try after its time limit.'});return;}
  const reservation={};calls.add(reservation);
  let upstreamId;
  try{
   let body='';for await(const chunk of req){body+=chunk.toString();if(Buffer.byteLength(body)>65536){json(413,{error:'Request too large.'});return;}}
   const {sdp}=JSON.parse(body);if(typeof sdp!=='string'||!sdp.startsWith('v=0')){json(400,{error:'Invalid voice offer.'});return;}
   if(!reserve()){json(429,{error:'Daily voice-session limit reached.'});return;}
   const form=new FormData();form.set('sdp',sdp);form.set('session',JSON.stringify({type:'realtime',model:env.OPENAI_REALTIME_MODEL,instructions,max_output_tokens:512,audio:{input:{transcription:{model:'gpt-4o-mini-transcribe'},turn_detection:{type:'server_vad',silence_duration_ms:1200,create_response:true,interrupt_response:true}},output:{voice:'marin'}}}));
   const response=await request('https://api.openai.com/v1/realtime/calls',{method:'POST',headers:{Authorization:'Bearer '+env.OPENAI_API_KEY},body:form,signal:AbortSignal.timeout(25000)});
   if(!response.ok){json(502,{error:'OpenAI voice could not connect. Check server configuration and API billing.'});return;}
   upstreamId=response.headers.get('location')?.split('/').pop();
   if(!upstreamId){json(502,{error:'Voice provider did not return a session identifier.'});return;}
   const id=upstreamId;reservation.id=id;const timer=setTimeout(()=>{void hangup(id);calls.delete(reservation);},maxSeconds*1000);timer.unref();reservation.timer=timer;
   res.on('close',()=>{if(!res.writableFinished)void hangup(id);});
   json(200,{sdp:await response.text(),maxSeconds});
  }catch{if(upstreamId)void hangup(upstreamId);json(502,{error:'Voice connection failed. No automatic retry.'});}
  finally{if(!reservation.timer)calls.delete(reservation);}
 });
 server.on('close',()=>{for(const call of calls){clearTimeout(call.timer);if(call.id)void hangup(call.id);}calls.clear();});
 return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const server=createVoiceServer();server.listen(Number(process.env.PORT)||8787,process.env.HOST||'127.0.0.1',()=>console.log('Happy Mind voice backend listening. Paid calls remain disabled unless explicitly configured.'));}
