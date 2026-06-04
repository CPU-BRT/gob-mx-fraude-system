import admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

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

async function eliminarDuplicados() {
  console.log('🔍 ELIMINACIÓN DE DUPLICADOS CON ADMIN SDK\n');
  console.log('=' .repeat(60));

  for (const documento of DOCUMENTOS_A_ELIMINAR) {
    console.log(`\n📌 ${documento.descripcion}`);
    console.log(`   ID: ${documento.id}`);

    try {
      const docRef = db.collection('casos').doc(documento.id);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        console.log(`   ✓ Documento encontrado`);
        console.log(`   🗑️  Eliminando...`);
        await docRef.delete();
        console.log(`   ✅ ELIMINADO EXITOSAMENTE`);
      } else {
        console.log(`   ⏭️  No existe (ya fue eliminado)`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error}`);
    }
  }

  // Verificación final
  console.log('\n' + '=' .repeat(60));
  console.log('\n🔍 VERIFICACIÓN FINAL:\n');

  const CURPS = ['SAMK020907MMCNRRA5', 'RAHG610121MPLTRR07'];

  for (const curp of CURPS) {
    const snapshot = await db.collection('casos').get();
    let count = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.folio && data.folio.includes(curp)) {
        count++;
        console.log(`   ${curp}: ${data.folio} (ID: ${doc.id})`);
      }
    });

    console.log(`   Total para ${curp}: ${count} documento(s)\n`);
  }

  console.log('✅ LIMPIEZA COMPLETADA');
  console.log('\n📢 Los asesores ahora pueden registrar/editar estos CURPs sin errores.');

  process.exit(0);
}

eliminarDuplicados().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});
