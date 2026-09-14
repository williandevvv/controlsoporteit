import admin from 'firebase-admin';
import webpush from 'web-push';
import { DateTime } from 'luxon';

const serviceAccount=JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
admin.initializeApp({credential:admin.credential.cert(serviceAccount)});
const db=admin.firestore();
const publicKey='BD-JjPNa97-sK55_fLcUnRs4g36LBa9f414fxv2FCjmK2FDHHqlcavKC4BqFB6ISVVm1wzm7kbarKKJI3msMhaM';
webpush.setVapidDetails('https://williandevvv.github.io/controlsoporteit/',publicKey,process.env.VAPID_PRIVATE_KEY);
const now=DateTime.utc();
const candidates=await db.collection('reminders').where('enabled','==',true).get();
const due=candidates.docs.filter(s=>{const t=s.data().nextAt;return t&&t.toDate()<=now.toJSDate();});
let sent=0,failed=0;
for(const snap of due){
 const r=snap.data();
 const subs=await db.collection('pushSubscriptions').where('uid','==',r.uid).get();
 const payload=JSON.stringify({notification:{title:'Control Soporte',body:r.title+(r.note?` — ${r.note}`:''),url:'https://williandevvv.github.io/controlsoporteit/'}});
 for(const s of subs.docs){try{await webpush.sendNotification(s.data(),payload);sent++;}catch(e){failed++;if(e.statusCode===404||e.statusCode===410)await s.ref.delete();}}
 if(r.repeat==='daily'||r.repeat==='weekly'){
  const zone=r.timezone||'America/Tegucigalpa';let next=DateTime.fromISO(`${r.date}T${r.time}`,{zone});
  do{next=r.repeat==='daily'?next.plus({days:1}):next.plus({weeks:1});}while(next.toUTC()<=now);
  await snap.ref.update({nextAt:admin.firestore.Timestamp.fromDate(next.toJSDate()),date:next.toFormat('yyyy-MM-dd'),time:next.toFormat('HH:mm')});
 }else await snap.ref.update({enabled:false,sentAt:admin.firestore.Timestamp.now()});
}
console.log(`Recordatorios revisados: ${due.length}; enviadas: ${sent}; fallos: ${failed}`);
