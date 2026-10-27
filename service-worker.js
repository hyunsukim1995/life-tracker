const CACHE='life-tracker-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./life-tracker-icon.svg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
});
self.addEventListener('push',event=>{
  let data={title:'Life Tracker',body:'확인할 알림이 있습니다.'};
  try{data={...data,...event.data.json()}}catch(e){}
  event.waitUntil(self.registration.showNotification(data.title,{
    body:data.body,
    icon:'./life-tracker-icon.svg',
    badge:'./life-tracker-icon.svg',
    data:data.url||'./'
  }));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data||'./'));
});