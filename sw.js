/* Quét chi — LẤY BẢN MỚI TRƯỚC (06/10): trang chính hỏi mạng trước, đợi tối đa 3 giây; mất mạng / chậm thì mở bản đã lưu.
   Trước đây mở bản lưu trước cho nhanh → một bản lỗi bị kẹt trên máy, app không vào được. Chỉ lưu file của chính trang. */
const C='quetchi-v4';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  const nav=r.mode==='navigate',key=nav?'./':r;
  e.respondWith(caches.open(C).then(c=>new Promise(done=>{
    let xong=false;const fin=x=>{if(!xong&&x){xong=true;done(x);}};
    const fromCache=()=>c.match(key,{ignoreSearch:true});
    const t=setTimeout(()=>fromCache().then(fin),3000);
    fetch(nav?r.url:r,{cache:'no-cache'}).then(res=>{clearTimeout(t);if(res.ok)c.put(key,res.clone());fin(res);})
      .catch(()=>{clearTimeout(t);fromCache().then(m=>fin(m||Response.error()));});
  })));});
