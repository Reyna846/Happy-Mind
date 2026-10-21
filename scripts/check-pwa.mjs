import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const base = 'https://example.test/Happy-Mind/';
const manifest = JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));
assert.equal(manifest.display,'standalone');
for (const icon of manifest.icons) await access('dist/'+icon.src);
const entries = new Map(), handlers = {};
let online = true, revised=false, skipped=false;
const fetchAsset = async input => {
  if (!online) throw new Error('offline');
  const url = new URL(typeof input==='string'?input:input.url);
  if(url.origin==='https://cdn.jsdelivr.net')return new Response('wasm runtime fixture');
  assert(url.pathname.startsWith('/Happy-Mind/'), 'asset must preserve repository base');
  const relative = url.pathname.slice('/Happy-Mind/'.length) || 'index.html';
  const bytes=await readFile('dist/'+relative);return new Response(relative==='index.html'&&revised?bytes.toString()+'<!-- refreshed -->':bytes);
};
const cache = {
  async addAll(urls) { for(const url of urls) entries.set(url, await fetchAsset(url)); },
  async put(input,response){entries.set(typeof input==='string'?input:input.url,response);},
  async match(input) { return entries.get(typeof input==='string'?input:input.url)?.clone(); }
};
vm.runInNewContext(await readFile('public/sw.js','utf8'), {
  URL, Response, fetch:fetchAsset,
  self:{skipWaiting:()=>{skipped=true;},location:new URL(base+'sw.js'),addEventListener:(name,fn)=>handlers[name]=fn},
  caches:{open:async()=>cache,match:cache.match,keys:async()=>['happy-mind-v5'],delete:async()=>true}
});
let installed;
handlers.install({waitUntil:p=>installed=p});
await installed;
assert([...entries.keys()].some(k=>k.endsWith('.js')),'built JS must be cached');
assert([...entries.keys()].some(k=>k.endsWith('.css')),'built CSS must be cached');
assert([...entries.keys()].filter(k=>k.includes('/audio/guides/')).length===11,'all guides precached');
const runtime='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/ort-wasm-simd-threaded.jsep.wasm';
let warm;handlers.fetch({request:{method:'GET',url:runtime,mode:'cors'},respondWith:p=>warm=p});assert.equal((await warm).status,200);assert(entries.has(runtime),'runtime cached after first preparation');
let apiIntercepted;handlers.fetch({request:{method:'GET',url:base+'api/voice/status',mode:'cors'},respondWith:p=>apiIntercepted=p});
await apiIntercepted;assert(!entries.has(base+'api/voice/status'),'private API must not be cached');
revised=true;let page;handlers.fetch({request:{method:'GET',url:base,mode:'navigate'},respondWith:p=>page=p});assert.match(await (await page).text(),/refreshed/,'online navigation fetches new HTML');assert.match(await (await cache.match(base)).text(),/refreshed/,'fresh HTML replaces stale shell');handlers.message({data:{type:'SKIP_WAITING'}});assert(skipped,'explicit restart activates waiting update');
online=false;
for(const url of entries.keys()) {
 let result;
 handlers.fetch({request:{method:'GET',url,mode:url===base?'navigate':'cors'},respondWith:p=>result=p});
 assert.equal((await result).status,200, 'cached asset should work offline: '+url);
}
console.log(`PWA asset/cache checks passed: ${entries.size} cached resources: app shell, guides and optional runtime. Browser/device offline validation remains required.`);
