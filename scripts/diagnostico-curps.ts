import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

const CURPS_A_REVISAR = [
  'SAMK020907MMCNRRA5',
  'RAHG610121MPLTRR07'
];

async function diagnostico() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE CURPs\n');
  console.log('=' .repeat(80));

  const querySnapshot = await getDocs(collection(db, 'casos'));

  for (const curp of CURPS_A_REVISAR) {
    console.log(`\n📌 CURP: ${curp}`);
    console.log('-'.repeat(80));

    let encontrado = false;

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const folio = (data.folio || '').toString();

      // Buscar coincidencia exacta o parcial
      if (folio.toUpperCase() === curp.toUpperCase() ||
          folio.includes(curp) ||
          curp.includes(folio)) {
        encontrado = true;
        console.log(`\n✅ DOCUMENTO ENCONTRADO:`);
        console.log(`   ID: ${docSnap.id}`);
        console.log(`   Folio (raw): "${folio}"`);
        console.log(`   Folio length: ${folio.length}`);
        console.log(`   CURP length esperado: ${curp.length}`);
        console.log(`   Coincide exacto: ${folio.toUpperCase() === curp.toUpperCase()}`);
        console.log(`\n   DATOS COMPLETOS:`);
        console.log(`   - cliente: "${data.cliente || ''}"`);
        console.log(`   - nombres: "${data.nombres || ''}"`);
        console.log(`   - apellidos: "${data.apellidos || ''}"`);
        console.log(`   - tipoFraude: "${data.tipoFraude || ''}"`);
        console.log(`   - licenciado: "${data.licenciado || ''}"`);
        console.log(`   - fechaCreacion: "${data.fechaCreacion || ''}"`);
        console.log(`\n   CLAVE DE ACCESO:`);
        if (data.claveAcceso) {
          console.log(`   - clave: "${data.claveAcceso.clave}"`);
          console.log(`   - consecutivo: ${data.claveAcceso.consecutivo}`);
          console.log(`   - fechaCreacion: "${data.claveAcceso.fechaCreacion}"`);
          console.log(`   - expiracion: "${data.claveAcceso.expiracion}"`);
          const ahora = new Date();
          const exp = new Date(data.claveAcceso.expiracion);
          console.log(`   - ¿Expirada?: ${ahora > exp ? 'SÍ' : 'NO'}`);
          console.log(`   - Tiempo restante: ${Math.round((exp.getTime() - ahora.getTime()) / 1000 / 60)} minutos`);
        } else {
          console.log(`   ❌ NO TIENE CLAVE DE ACCESO`);
        }

        console.log(`\n   OTROS DATOS:`);
        console.log(`   - recuperacion: ${data.recuperacion || 0}`);
        console.log(`   - indemnizacion: ${data.indemnizacion || 0}`);
        console.log(`   - cobros: ${data.cobros ? data.cobros.length : 0} registros`);
        console.log(`   - conceptosAdicionales: ${data.conceptosAdicionales ? data.conceptosAdicionales.length : 0} registros`);
      }
    });

    if (!encontrado) {
      console.log(`   ❌ NO SE ENCONTRÓ NINGÚN DOCUMENTO CON ESTE CURP/FOLIO`);
    }
  }

  // También buscar cualquier documento con folio similar
  console.log('\n\n📋 BÚSQUEDA DE FOLIOS SIMILARES:');
  console.log('=' .repeat(80));

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const folio = (data.folio || '').toString().toUpperCase();

    for (const curp of CURPS_A_REVISAR) {
      // Buscar si alguna parte del folio contiene parte del CURP
      if (folio.includes(curp.substring(0, 10)) || curp.includes(folio.substring(0, 10))) {
        if (folio !== curp.toUpperCase()) {
          console.log(`\n⚠️  FOLIO SIMILAR ENCONTRADO:`);
          console.log(`   Buscando: ${curp}`);
          console.log(`   Encontrado: "${folio}" (ID: ${docSnap.id})`);
        }
      }
    }
  });

  console.log('\n\n✅ Diagnóstico completado.');
}

diagnostico().catch(console.error);
