import admin from 'firebase-admin';
import { DateTime } from 'luxon';

const serviceAccount=JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
const brevoApiKey=process.env.BREVO_API_KEY;
const senderEmail=process.env.BREVO_SENDER_EMAIL;
const senderName=process.env.BREVO_SENDER_NAME||'Control Soporte';
if(!brevoApiKey)throw new Error('Falta BREVO_API_KEY');
if(!senderEmail)throw new Error('Falta BREVO_SENDER_EMAIL');
admin.initializeApp({credential:admin.credential.cert(serviceAccount)});
const db=admin.firestore();
const now=DateTime.utc();
const candidates=await db.collection('reminders').where('enabled','==',true).get();
const due=candidates.docs.filter(s=>{const t=s.data().nextAt;return t&&t.toDate()<=now.toJSDate();});
let sent=0,failed=0,skipped=0;
const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function sendEmail(r){
 const body=`<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:24px;color:#172033"><h2 style="margin:0 0 16px;color:#073b7a">🔔 Recordatorio — Control Soporte</h2><div style="border:1px solid #dbe3ef;border-radius:14px;padding:18px"><h3 style="margin:0 0 8px">${esc(r.title)}</h3>${r.note?`<p style="margin:0 0 12px">${esc(r.note)}</p>`:''}<p style="margin:0;color:#667085">Programado para ${esc(r.date)} a las ${esc(r.time)}</p></div></div>`;
 const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{accept:'application/json','api-key':brevoApiKey,'content-type':'application/json'},body:JSON.stringify({sender:{name:senderName,email:senderEmail},to:[{email:r.email}],subject:`🔔 Recordatorio: ${r.title}`,htmlContent:body,textContent:`Recordatorio — Control Soporte\n\n${r.title}${r.note?`\n${r.note}`:''}\n\nProgramado para ${r.date} a las ${r.time}`})});
 if(!response.ok)throw new Error(`Brevo ${response.status}: ${await response.text()}`);
 return response.json();
}
for(const snap of due){
 const r=snap.data();
 if(!r.email){console.warn(`Sin correo: ${snap.id}`);skipped++;continue;}
 try{await sendEmail(r);sent++;}catch(e){failed++;console.error(`Falló ${snap.id}:`,e.message);continue;}
 if(r.repeat==='daily'||r.repeat==='weekly'){
  const zone=r.timezone||'America/Tegucigalpa';let next=DateTime.fromISO(`${r.date}T${r.time}`,{zone});
  do{next=r.repeat==='daily'?next.plus({days:1}):next.plus({weeks:1});}while(next.toUTC()<=now);
  await snap.ref.update({nextAt:admin.firestore.Timestamp.fromDate(next.toJSDate()),date:next.toFormat('yyyy-MM-dd'),time:next.toFormat('HH:mm'),lastSentAt:admin.firestore.Timestamp.now()});
 }else await snap.ref.update({enabled:false,sentAt:admin.firestore.Timestamp.now()});
}
console.log(`Recordatorios revisados: ${due.length}; enviadas: ${sent}; fallos: ${failed}; sin correo: ${skipped}`);
