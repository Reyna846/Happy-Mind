import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const base = 'https://example.test/Happy-Mind/';
const manifest = JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));
assert.equal(manifest.display,'standalone');
for (const icon of manifest.icons) await access('dist/'+icon.src);
const entries = new Map(), handlers = {};
let online = true;
const fetchAsset = async input => {
  if (!online) throw new Error('offline');
  const url = new URL(typeof input==='string'?input:input.url);
  assert(url.pathname.startsWith('/Happy-Mind/'), 'asset must preserve repository base');
  const relative = url.pathname.slice('/Happy-Mind/'.length) || 'index.html';
  return new Response(await readFile('dist/'+relative));
};
const cache = {
  async addAll(urls) { for(const url of urls) entries.set(url, await fetchAsset(url)); },
  async match(input) { return entries.get(typeof input==='string'?input:input.url)?.clone(); }
};
vm.runInNewContext(await readFile('public/sw.js','utf8'), {
  URL, Response, fetch:fetchAsset,
  self:{location:new URL(base+'sw.js'),addEventListener:(name,fn)=>handlers[name]=fn},
  caches:{open:async()=>cache,match:cache.match,keys:async()=>['happy-mind-v5'],delete:async()=>true}
});
let installed;
handlers.install({waitUntil:p=>installed=p});
await installed;
assert([...entries.keys()].some(k=>k.endsWith('.js')),'built JS must be cached');
assert([...entries.keys()].some(k=>k.endsWith('.css')),'built CSS must be cached');
online=false;
for(const url of entries.keys()) {
 let result;
 handlers.fetch({request:{method:'GET',url,mode:url===base?'navigate':'cors'},respondWith:p=>result=p});
 assert.equal((await result).status,200, 'cached asset should work offline: '+url);
}
console.log(`PWA asset/cache checks passed: ${entries.size} resources under /Happy-Mind/. Browser/device offline validation remains required.`);
