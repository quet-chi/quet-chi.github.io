/* Quét chi — mở được cả khi mạng chập chờn. Mạng trước (4 giây), hỏng thì dùng bản đã lưu.
   Chỉ lưu file của chính trang (index.html, sw.js) — không đụng dữ liệu chi tiêu (nằm ở localStorage). */
const C='quetchi-v2';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  const key=r.mode==='navigate'?'./':r;
  e.respondWith(new Promise(done=>{
    let xong=false;
    const fromCache=()=>caches.match(key,{ignoreSearch:true}).then(m=>m||caches.match('./'));
    const t=setTimeout(()=>fromCache().then(m=>{if(m&&!xong){xong=true;done(m);}}),4000);
    /* no-cache: luôn hỏi lại GitHub (ETag, rẻ) — không lấy bản cũ trong bộ nhớ đệm HTTP 10 phút của GitHub Pages */
    fetch(r.mode==='navigate'?r.url:r,{cache:'no-cache'}).then(res=>{clearTimeout(t);
      if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(key,cp));}
      if(!xong){xong=true;done(res);}})
    .catch(()=>{clearTimeout(t);fromCache().then(m=>{if(!xong){xong=true;done(m||Response.error());}});});
  }));});
