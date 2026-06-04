import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// IDs de documentos duplicados a eliminar
const DOCUMENTOS_A_ELIMINAR = [
  {
    id: 'UIIrE4uU6cpuPfAnvvld',
    descripcion: 'DUPLICADO-SAMK020907MMCNRRA5-UIIrE4uU6cpuPfAnvvld'
  },
  {
    id: 'SwCjcDUgFXbpSA2waYvJ',
    descripcion: 'DUPLICADO-RAHG610121MPLTRR07-SwCjcDUgFXbpSA2waYvJ'
  }
];

async function eliminarDuplicados() {
  console.log('🗑️  ELIMINANDO DOCUMENTOS DUPLICADOS\n');
  console.log('=' .repeat(60));

  for (const documento of DOCUMENTOS_A_ELIMINAR) {
    console.log(`\n📌 Eliminando: ${documento.descripcion}`);
    console.log(`   ID: ${documento.id}`);

    try {
      await deleteDoc(doc(db, 'casos', documento.id));
      console.log(`   ✅ ELIMINADO EXITOSAMENTE`);
    } catch (error) {
      console.log(`   ❌ ERROR AL ELIMINAR: ${error}`);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('✅ Proceso de eliminación completado.');
  console.log('\nLos asesores ahora pueden registrar/editar estos CURPs sin errores.');
}

eliminarDuplicados().catch(console.error);
