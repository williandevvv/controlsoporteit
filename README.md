# ITE Supervisor

Aplicación web responsive/PWA para control de marcajes, personas, fotos y exportación Excel. Los datos se guardan en Firebase, no en `localStorage`.

## Lo que debes hacer en Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/) y registra una aplicación **Web**.
2. Activa **Authentication → Email/Password**, **Cloud Firestore** (modo producción) y **Storage**.
3. Copia `config.js.example` como `config.js` y coloca los valores de la configuración web de Firebase.
4. Instala Firebase CLI (`npm.cmd install -g firebase-tools`), inicia sesión (`firebase login`) y copia `.firebaserc.example` a `.firebaserc`, con tu Project ID.
5. Publica las reglas: `firebase deploy --only firestore:rules,storage`.
6. En Authentication crea el primer usuario administrador. En Firestore crea `users/{UID}` con: `email`, `displayName`, `role: "ADMIN"`, `active: true`. El UID es el de Authentication.
7. Crea en Firestore `employees/william-sanchez` con `{ "name":"William Sánchez", "active":true, "areaName":"ITE", "sendaName":"Senda 1", "shiftName":"Diurno" }`.
8. Inicia localmente con `npx.cmd serve . -l 5173` o publica con `firebase deploy`.

## Seguridad y permisos

Las reglas incluidas protegen los datos también en Firebase: solo ADMIN cambia configuración/usuarios; SUPERVISOR administra personal y marcajes; COLABORADOR solo ve y registra sus propios marcajes cuando `users/{uid}.employeeId` apunta a su persona. Para creación de usuarios por el panel se recomienda una Cloud Function con Admin SDK; nunca se debe permitir al navegador asignar roles.

## Cierres de planilla

El administrador puede cambiar los días 8 y 23 desde **Administración → Configuración general**. Se almacenan como `settings/general.payrollDays`.
