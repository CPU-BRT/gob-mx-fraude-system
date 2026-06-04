import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc, collection, getDocs } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcJG97OOHR9gmzlnfUhK3EaP3xfWDJmRE",
  authDomain: "portal-gob-mx.firebaseapp.com",
  projectId: "portal-gob-mx",
  storageBucket: "portal-gob-mx.firebasestorage.app",
  messagingSenderId: "829747147654",
  appId: "1:829747147654:web:837e2265be4401a792b207"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// IDs de documentos duplicados a eliminar
const DOCUMENTOS_A_ELIMINAR = [
  {
    id: 'UIIrE4uU6cpuPfAnvvld',
    descripcion: 'DUPLICADO de SAMK020907MMCNRRA5'
  },
  {
    id: 'SwCjcDUgFXbpSA2waYvJ',
    descripcion: 'DUPLICADO de RAHG610121MPLTRR07'
  }
];

async function verificarYEliminar() {
  console.log('🔍 VERIFICACIÓN Y ELIMINACIÓN DE DUPLICADOS\n');
  console.log('=' .repeat(60));

  // Primero verificar que los documentos existen
  console.log('\n📋 Verificando documentos antes de eliminar...\n');

  const querySnapshot = await getDocs(collection(db, 'casos'));
  const todosLosIds = new Set<string>();

  querySnapshot.forEach((docSnap) => {
    todosLosIds.add(docSnap.id);
  });

  console.log(`Total de documentos en la colección: ${todosLosIds.size}\n`);

  for (const documento of DOCUMENTOS_A_ELIMINAR) {
    const existe = todosLosIds.has(documento.id);
    console.log(`📌 ${documento.descripcion}`);
    console.log(`   ID: ${documento.id}`);
    console.log(`   ¿Existe?: ${existe ? 'SÍ' : 'NO'}`);

    if (existe) {
      try {
        console.log(`   🗑️  Eliminando...`);
        await deleteDoc(doc(db, 'casos', documento.id));
        console.log(`   ✅ ELIMINADO EXITOSAMENTE\n`);
      } catch (error) {
        console.log(`   ❌ ERROR: ${error}\n`);
      }
    } else {
      console.log(`   ⏭️  Saltando (ya no existe)\n`);
    }
  }

  // Verificación final
  console.log('=' .repeat(60));
  console.log('\n🔍 VERIFICACIÓN FINAL:\n');

  const querySnapshotFinal = await getDocs(collection(db, 'casos'));

  const CURPS = ['SAMK020907MMCNRRA5', 'RAHG610121MPLTRR07'];

  for (const curp of CURPS) {
    let count = 0;
    querySnapshotFinal.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.folio && data.folio.includes(curp)) {
        count++;
        console.log(`   ${curp}: ${data.folio} (ID: ${docSnap.id})`);
      }
    });
    console.log(`   Total para ${curp}: ${count} documento(s)\n`);
  }

  console.log('✅ Proceso completado.');
  console.log('\n📢 Los asesores ahora pueden registrar/editar estos CURPs sin errores.');

  process.exit(0);
}

verificarYEliminar().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
