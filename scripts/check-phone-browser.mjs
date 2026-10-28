import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.HAPPY_MIND_PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const url=process.env.HAPPY_MIND_TEST_URL||'http://127.0.0.1:5173';
await mkdir('test-results',{recursive:true});
const errors=[];
const context=await browser.newContext({viewport:{width:393,height:851},isMobile:true,hasTouch:true,deviceScaleFactor:1});
await context.addInitScript(()=>{localStorage.setItem('hm-sound','off');});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
const nav=name=>page.getByRole('navigation',{name:'Rooms'}).getByRole('button',{name,exact:true});
const tile=name=>page.locator('.moment-tile').filter({has:page.locator('strong',{hasText:new RegExp('^'+name+'$')})});
async function draw(surface,strokes=8){
 await surface.scrollIntoViewIfNeeded();
 const box=await surface.boundingBox();assert(box);
 for(let line=0;line<strokes;line++){
  await page.mouse.move(box.x+15,box.y+30+line%5*20);await page.mouse.down();
  await surface.evaluate(async(element,box)=>{
   for(let i=0;i<100;i++){
    element.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:1,pointerType:'mouse',buttons:1,clientX:box.x+15+(i%70)/70*(box.width-30),clientY:box.y+40+(Math.sin(i/8)+1)*50}));
    if(i%10===9)await new Promise(requestAnimationFrame);
   }
  },box);
  await page.mouse.up();
 }
}
try{
 let homeDOM=0;
 if(!process.env.HAPPY_MIND_TEST_MODEL_ONLY){
 await page.goto(url);await page.getByRole('button',{name:/Slide into a softer moment/}).press('Enter');
 await page.locator('.interactive-bloom[data-renderer="webgl"],.interactive-bloom[data-renderer="fallback"]').waitFor();
 assert.equal(await page.locator('.chat-room,.calm-module,.fidget-play').count(),0,'Home does not construct hidden chat or toys');
 homeDOM=await page.locator('*').count();
 const homeActivityDOM=await page.locator('main *').count();
 await page.screenshot({path:'test-results/phone-home.png',animations:'disabled'});
 await nav('Moments').click();await tile('Bubbles').click();
 assert.equal(await page.locator('.fidget-play').count(),1);
 await page.locator('.soft-bubble').first().evaluate(element=>{for(let i=0;i<200;i++)element.click();});
 assert.equal(await page.locator('.soft-bubble[aria-pressed="true"]').count(),0,'rapid toggles are not lost');
 await page.getByRole('group',{name:'Choose a little moment'}).getByRole('button',{name:'Sand',exact:true}).click();
 await draw(page.getByRole('img',{name:/Sand drawing surface/}));
 const sandMarks=await page.locator('.sand-surface polyline').count();assert(sandMarks>0);
 await page.getByRole('group',{name:'Choose a little moment'}).getByRole('button',{name:'Bubbles',exact:true}).click();
 await page.getByRole('button',{name:'Bubble 1',exact:true}).click();
 await page.getByRole('group',{name:'Choose a little moment'}).getByRole('button',{name:'Sand',exact:true}).click();
 assert.equal(await page.locator('.sand-surface polyline').count(),sandMarks,'sand marks survive toy switches');
 await nav('Moments').click();await tile('Sand').click();
 assert.equal(await page.locator('.sand-surface polyline').count(),sandMarks,'sand marks survive room disposal');
 await page.getByRole('group',{name:'Choose a little moment'}).getByRole('button',{name:'Bubbles',exact:true}).click();
 assert.equal(await page.getByRole('button',{name:'Bubble 1',exact:true}).getAttribute('aria-pressed'),'true','toy progress survives switching');
 await page.getByRole('button',{name:'Reset bubbles'}).click();
 await page.getByRole('group',{name:'Choose a little moment'}).getByRole('button',{name:'Sand',exact:true}).click();
 assert.equal(await page.locator('.fidget-play').count(),1);
 await page.screenshot({path:'test-results/phone-sand.png',animations:'disabled'});
 await page.getByRole('button',{name:'Clean',exact:true}).click();
 await nav('Moments').click();await tile('Draw').click();
 await draw(page.getByRole('img',{name:/Drawing surface/}),12);
 const drawingMarks=await page.locator('.drawing-paper polyline').count();assert(drawingMarks>0);
 await nav('Moments').click();await tile('Draw').click();
 assert.equal(await page.locator('.drawing-paper polyline').count(),drawingMarks,'practice drawing survives room disposal');
 await page.getByRole('button',{name:'Clear drawing',exact:true}).click();
 assert.equal(await page.locator('.drawing-paper polyline').count(),0);
 for(let i=0;i<25;i++){
  await nav('Moments').click();await tile(i%2?'Water':'Bubbles').click();
  if(i%2){await page.getByRole('button',{name:'Make a ripple in the water'}).tap({force:true});assert(await page.locator('.ripple').count()<=16);}
  else assert.equal(await page.locator('.fidget-play').count(),1);
 }
 await nav('Home').click();
 await page.locator('.interactive-bloom[data-renderer="webgl"],.interactive-bloom[data-renderer="fallback"]').waitFor();
 assert.equal(await page.locator('.fidget-play,.drawing-paper,.ripple-pond').count(),0,'leaving a toy disposes its scene');
 assert.equal(await page.locator('main *').count(),homeActivityDOM,'room cycles do not accumulate hidden activity DOM');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'phone layout fits the viewport');
 console.log('Touch checks passed: 200 rapid taps, 2000 drawing moves and 25 room cycles without retained activity DOM.');
 await page.setViewportSize({width:320,height:740});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'320px phone layout fits');
 const audioPage=await context.newPage();audioPage.on('pageerror',e=>errors.push(e.message));
 await audioPage.addInitScript(()=>{
  localStorage.setItem('hm-sound','on');window.__audio=[];
  const Base=window.AudioContext;
  window.AudioContext=class extends Base{constructor(...args){super(...args);window.__audio.push(this);}};
 });
 await audioPage.goto(url);await audioPage.getByRole('button',{name:/Slide into a softer moment/}).press('Enter');
 await audioPage.getByRole('navigation',{name:'Rooms'}).getByRole('button',{name:'Moments',exact:true}).click();
 await audioPage.locator('.moment-tile').filter({hasText:'Bubbles'}).click();
 await audioPage.locator('.soft-bubble').first().evaluate(element=>{for(let i=0;i<200;i++)element.click();});
 assert(await audioPage.evaluate(()=>window.__audio.filter(c=>c.state!=='closed').length)<=2,'rapid taps share one toy audio context');
 await audioPage.getByRole('navigation',{name:'Rooms'}).getByRole('button',{name:'Moments',exact:true}).click();
 await audioPage.waitForFunction(()=>window.__audio.filter(c=>c.state!=='closed').length<=1);
 await audioPage.getByRole('button',{name:'Volume',exact:true}).click();await audioPage.getByRole('button',{name:'Mute',exact:true}).click();
 await audioPage.waitForFunction(()=>window.__audio.every(c=>c.state==='closed'));
 await audioPage.close();
 }
 // A cached-model fixture validates lifecycle without downloading or running a model.
 const modelPage=await context.newPage();modelPage.on('pageerror',e=>errors.push(e.message));
 await modelPage.addInitScript(()=>{
  window.__workers=[];window.__loads=0;window.__reply='';
  Object.defineProperty(navigator,'gpu',{value:{},configurable:true});
  window.Worker=class extends EventTarget{constructor(url){super();this.url=String(url);this.dead=false;window.__workers.push(this);}postMessage(){}terminate(){this.dead=true;}};
 });
 await modelPage.route('**/src/local-ai.ts',route=>route.fulfill({contentType:'application/javascript',body:`
  export const localInstructions='';export const localModelId='fixture';
  export const localModelCached=async()=>window.__cached!==false;export const boundedMessages=m=>m;
  export async function loadLocalAI(){window.__loads++;if(window.__holdLoad)await new Promise(r=>window.__finishLoad=r);return {interruptGenerate(){window.__endReply?.();},chat:{completions:{async *create(){if(window.__reply==='hold')await new Promise(r=>window.__endReply=r);else if(window.__reply)yield {choices:[{delta:{content:window.__reply}}]};}}}};}
 `}));
 await modelPage.goto(url);await modelPage.getByRole('button',{name:/Slide into a softer moment/}).press('Enter');
 assert.equal(await modelPage.evaluate(()=>window.__loads),0);
 const modelNav=name=>modelPage.getByRole('navigation',{name:'Rooms'}).getByRole('button',{name,exact:true});
 await modelNav('Talk').click();await modelPage.getByRole('button',{name:'Restart companion'}).waitFor();
 assert.equal(await modelPage.evaluate(()=>window.__loads),0,'cached models never auto-start');
 await modelPage.getByRole('button',{name:'Restart companion'}).click();
 await modelPage.getByRole('button',{name:'Install Llama companion'}).evaluate(element=>{element.click();element.click();});
 await modelPage.locator('.chat-notice').filter({hasText:'Companion ready. You can speak or type now.'}).waitFor();
 assert.equal(await modelPage.evaluate(()=>window.__loads),1,'duplicate preparation is coalesced');
 await modelPage.getByRole('button',{name:'Chat',exact:true}).click();
 await modelPage.getByRole('textbox',{name:'Message your companion'}).fill('Hello');
 await modelPage.getByRole('button',{name:'Send message'}).click();
 await modelPage.locator('.chat-notice').filter({hasText:/That reply could not be read/}).waitFor();
 assert.equal(await modelPage.evaluate(()=>window.__workers.filter(w=>!w.dead).length),1,'empty reply retains the working engine');
 await modelPage.evaluate(()=>{window.__reply='A small moment.';});
 await modelPage.getByRole('textbox',{name:'Message your companion'}).fill('Hello again');
 await modelPage.getByRole('button',{name:'Send message'}).click();await modelPage.locator('.message.assistant p').filter({hasText:'A small moment.'}).waitFor();
 await modelPage.evaluate(()=>{window.__reply='hold';});
 await modelPage.getByRole('textbox',{name:'Message your companion'}).fill('One more thought');
 await modelPage.getByRole('button',{name:'Send message'}).click();
 await modelNav('Moments').click();
 assert.equal(await modelPage.evaluate(()=>window.__workers.filter(w=>!w.dead).length),0,'leaving Talk terminates its worker');
 await modelPage.evaluate(()=>window.__endReply?.());
 await modelNav('Talk').click();
 assert(await modelPage.getByText('Hello again',{exact:true}).count(),'conversation survives model release');
 await modelPage.getByRole('button',{name:'Restart companion'}).click();
 await modelPage.evaluate(()=>{window.__holdLoad=true;});
 await modelPage.getByRole('button',{name:'Install Llama companion'}).click();
 await modelPage.getByRole('button',{name:'Cancel download'}).click();
 assert.equal(await modelPage.evaluate(()=>window.__workers.filter(w=>!w.dead).length),0,'cancelling loading releases its worker');
 await modelPage.evaluate(()=>window.__finishLoad?.());
 await modelPage.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 assert.equal(await modelPage.evaluate(()=>window.__workers.filter(w=>!w.dead).length),0);
 await modelPage.addInitScript(()=>{window.__cached=false;});
 await modelPage.reload();await modelPage.getByRole('button',{name:/Slide into a softer moment/}).press('Enter');
 await modelNav('Talk').click();await modelPage.getByRole('button',{name:'Not now',exact:true}).click();
 await modelNav('Moments').click();await modelNav('Talk').click();
 assert.equal(await modelPage.locator('.model-install').evaluate(element=>element.open),false,'Not now is remembered for the visit');
 await modelPage.getByRole('button',{name:'Restart companion'}).click();
 await modelPage.getByRole('button',{name:'Install Llama companion'}).waitFor();
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({passed:true,...(!process.env.HAPPY_MIND_TEST_MODEL_ONLY?{homeDOM,rapidBubbleTaps:200,roomCycles:25,drawingMoves:2000}:{}),errors,modelTests:'cached startup, duplicate prepare, recoverable reply, navigation cancellation, transcript retention and load cancellation'}));
}finally{await browser.close();}
