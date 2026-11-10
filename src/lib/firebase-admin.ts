import admin from 'firebase-admin';

const COLLECTION_NAME = 'casos';

function initAdmin(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON no está configurada en el servidor.');
  }

  const serviceAccount = JSON.parse(raw);
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export function getAdminFirestore() {
  return initAdmin().firestore();
}

export function getCasosCollection() {
  return getAdminFirestore().collection(COLLECTION_NAME);
}
