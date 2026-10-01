/* Quét chi — MỞ NGAY: có bản đã lưu thì trả luôn (0 giây chờ mạng), đồng thời tải bản mới ở nền và lưu cho lần sau.
   Bản mới khác bản đang chạy → báo trang hiện "có bản mới". Chưa có bản lưu (lần đầu) → lấy từ mạng.
   Chỉ lưu file của chính trang — không đụng dữ liệu chi tiêu (localStorage). */
const C='quetchi-v3';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  const nav=r.mode==='navigate',key=nav?'./':r;
  e.respondWith(caches.open(C).then(async c=>{
    const old=await c.match(key,{ignoreSearch:true});
    /* no-cache: hỏi lại máy chủ (ETag, rẻ) — không lấy bản cũ trong bộ nhớ đệm HTTP */
    const net=fetch(nav?r.url:r,{cache:'no-cache'}).then(async res=>{
      if(res.ok){
        if(nav&&old){const [a,b]=await Promise.all([old.clone().text(),res.clone().text()]);
          if(a!==b)(await self.clients.matchAll()).forEach(cl=>cl.postMessage('ban-moi'));}
        await c.put(key,res.clone());}
      return res;});
    if(old){e.waitUntil(net.catch(()=>{}));return old;}
    return net.catch(()=>Response.error());
  }));});
