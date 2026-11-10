import admin from 'firebase-admin';

const COLLECTION_NAME = 'casos';

function initAdmin(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_B64;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  let jsonText: string | undefined;
  if (b64?.trim()) {
    jsonText = Buffer.from(b64.trim(), 'base64').toString('utf8');
  } else if (raw?.trim()) {
    jsonText = raw.trim().replace(/^\uFEFF/, '');
  }
  if (!jsonText) {
    throw new Error(
      'Configura FIREBASE_SERVICE_ACCOUNT_JSON_B64 o FIREBASE_SERVICE_ACCOUNT_JSON en el servidor.'
    );
  }

  let serviceAccount: admin.ServiceAccount;
  try {
    serviceAccount = JSON.parse(jsonText) as admin.ServiceAccount;
  } catch {
    try {
      serviceAccount = JSON.parse(JSON.parse(jsonText)) as admin.ServiceAccount;
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON no es un JSON válido.');
    }
  }
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
