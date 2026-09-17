import{initializeApp,getApps,getApp}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';import{getAuth,onAuthStateChanged}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';import{getFirestore,getDoc,doc}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';import{firebaseConfig}from'./config.js';
const app=getApps().length?getApp():initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
let profile=null;
const core={dashboard:'dashboard',tasks:'tasks',incidents:'incidents',inventory:'inventory',personnel:'personnel',pending:'pending',timeRecords:'timeRecords',reports:'reports'};
const special={'formatos':'formatos','jefatura':'executiveReport','supervision':'supervision','reminders':'reminders','spotify':'spotify','alerts':'alerts','productivity':'productivity','profile':'employeeProfile','agenda':'agenda','minutes':'minutes','audit':'audit','history':'history'};
const allowed=k=>profile?.role==='ADMIN'||profile?.permissions?.[k]===true;
function apply(){
  if(!profile)return;
  document.querySelectorAll('[data-view]').forEach(e=>{const k=core[e.dataset.view];if(k)e.style.display=allowed(k)?'':'none'});
  document.querySelectorAll('[data-side-tool]').forEach(e=>{const k=special[e.dataset.sideTool];if(k)e.style.display=allowed(k)?'':'none'});
  for(const [sel,k] of Object.entries({'[data-formatos-nav]':'formatos','[data-jefatura-nav]':'executiveReport','#supervision-fab':'supervision','#cs-r-fab':'reminders','[data-history-nav]':'history'}))document.querySelectorAll(sel).forEach(e=>e.style.display=allowed(k)?'':'none');
  document.querySelectorAll('[data-gestion-nav]').forEach(e=>{const k=special[e.dataset.gestionNav];if(k)e.style.display=allowed(k)?'':'none'});
  document.querySelectorAll('[data-quick]').forEach(e=>{const k=core[e.dataset.quick]||special[e.dataset.quick];if(k)e.style.display=allowed(k)?'':'none'});
}
async function refresh(u){profile=null;window.__csProfile=null;if(!u)return;try{const s=await getDoc(doc(db,'users',u.uid));profile=s.data()||{};window.__csProfile=profile;apply()}catch{} }
onAuthStateChanged(auth,refresh);
new MutationObserver(()=>apply()).observe(document.body,{childList:true,subtree:true});