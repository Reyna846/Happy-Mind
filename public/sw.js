const CACHE = 'happy-mind-v39';
self.addEventListener('install', event => { event.waitUntil((async () => { const cache = await caches.open(CACHE); const base = new URL('./', self.location); await cache.addAll(['./','icon.svg','apple-touch-icon.png','icon-192.png','icon-512.png','manifest.webmanifest','art/room.svg','art/moon/sleepy-moon-strip.png','models/brain-anatomy.glb','audio/rain.ogg','audio/water-drops.ogg','audio/CREDITS.md',...['arrive','look','feel','listen','rest','in','out','in-left','out-left','in-right','out-right'].map(id=>'audio/guides/'+id+'.wav')].map(p=>new URL(p,base).href)); const html = await (await cache.match(base.href)).text(); const assets = [...html.matchAll(/(?:src|href)="([^" ]+\.(?:js|css))"/g)].map(m=>new URL(m[1],base).href); await cache.addAll(assets); })()); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('happy-mind-') && k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients?.claim())); });
self.addEventListener('fetch', event => {
 const url=new URL(event.request.url),base=new URL('./',self.location);
 const same=url.origin===self.location.origin;
 const runtime=same&&url.pathname.startsWith(base.pathname+'assets/')||url.origin==='https://cdn.jsdelivr.net'&&/^\/npm\/@huggingface\/transformers@3\.8\.1\/dist\/ort-[^/]+\.(wasm|mjs)$/.test(url.pathname);
 if(event.request.method!=='GET'||(!same&&!runtime))return;
 event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(async response=>{
  if(runtime&&response.ok){try{const cache=await caches.open(CACHE);await cache.put(event.request,response.clone());}catch{/* Cache quota does not block playback. */}}
  return response;
 }).catch(()=>event.request.mode==='navigate'?caches.match(base.href):Response.error())));
});
