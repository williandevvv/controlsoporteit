const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
async function requireAdmin(uid) { const p = await db.doc(`users/${uid}`).get(); if (!p.exists || p.data().role !== 'ADMIN') throw new HttpsError('permission-denied', 'Solo ADMIN puede gestionar usuarios.'); }
exports.createUser = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Inicia sesión.');
  await requireAdmin(request.auth.uid);
  const { email, password, displayName, role = 'COLABORADOR', active = true } = request.data;
  if (!email || !password || !displayName || !['ADMIN','SUPERVISOR','COLABORADOR'].includes(role)) throw new HttpsError('invalid-argument', 'Datos inválidos.');
  const user = await admin.auth().createUser({ email, password, displayName, disabled: !active });
  await db.doc(`users/${user.uid}`).set({ email, displayName, role, active, createdAt: admin.firestore.FieldValue.serverTimestamp(), createdBy: request.auth.uid });
  await db.collection('activityLogs').add({ action:'creó usuario', module:'administration', recordId:user.uid, userId:request.auth.uid, createdAt:admin.firestore.FieldValue.serverTimestamp() });
  return { uid: user.uid };
});
