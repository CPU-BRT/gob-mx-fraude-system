"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  guardarCaso,
  buscarCasoPorFolioCompleto,
  actualizarCasoPorFolio,
  actualizarClaveAccesoPorFolio,
  generarClaveAcceso,
  obtenerUltimoConsecutivo,
  type Caso,
  type Cobro,
  type ClaveAcceso
} from "../lib/storage";

const MOTIVOS_COMISION = [
  "SIN MOTIVO",
  "CERTIFICACIÓN PLD/FT",
  "TRIANGULACIÓN",
  "CANDADO FINANCIERO",
  "DIE (DISPERSIÓN INMEDIATA EMPRESARIAL)",
  "CIE (COMISIÓN INTERBANCARIA ELECTRONICA)",
  "GUIA DE OPERACIÓN BANCARIA",
  "BLINDAJE DE CAPITAL",
  "BLINDAJE DE CUENTA",
  "DICTAMEN TÉCNICO PLD FT",
  "DICTAMEN DE APODERADO",
  "DISCREPANCIA FISCAL",
  "IVA",
  "ISR",
  "FACTOR DE ACTUALIZACIÓN",
  "ACTUALIZACIÓN DE FOLIO",
  "RETENCIÓN DE CAPITAL",
  "BLOQUEO PREVENTIVO",
  "COMISIÓN POR TRANSFERENCIA",
  "CUOTA JURÍDICA",
  "COMISIÓN POR ÉXITO",
  "UNIFICACIÓN DE FONDOS"
];

export default function AdminPage() {
  const [folioCurp, setFolioCurp] = useState("");
  const [casoExistenteId, setCasoExistenteId] = useState<string | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [folioGuardado, setFolioGuardado] = useState("");
  const [buscandoFolio, setBuscandoFolio] = useState(false);

  // Nuevos estados para clave de acceso
  const [claveGenerada, setClaveGenerada] = useState<ClaveAcceso | null>(null);
  const [generandoClave, setGenerandoClave] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState<string>("");

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    tipoFraude: "",
    licenciado: "",
    recuperacion: "",
    indemnizacion: "",
    penalizacion: "",
    totalEntregar: "",
    pagoPendiente: "",
    conceptoPago: "",
    motivoComision: "SIN MOTIVO",
    porcentaje: "",
    montoDeposito: "",
    // Cuenta única de fideicomiso
    numeroCuentaFideicomiso: "",
    claveInterbancaria: "",
    institucionBancaria: "",
    titularCuenta: ""
  });

  // Conceptos adicionales opcionales
  const [conceptosAdicionales, setConceptosAdicionales] = useState<{concepto: string; monto: string}[]>([]);
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState("");
  const [montoConcepto, setMontoConcepto] = useState("");

  const LISTA_CONCEPTOS = [
    "PENALIZACIÓN",
    "GASTOS ADMINISTRATIVOS",
    "HONORARIOS LEGALES",
    "IMPUESTOS",
    "COMISIÓN POR SERVICIO",
    "GASTOS DE GESTIÓN",
    "INTERESES MORATORIOS",
    "RETENCIÓN FISCAL",
    "MULTA",
    "AJUSTE DE SALDO",
    "OTRO"
  ];

  const agregarConcepto = () => {
    if (conceptoSeleccionado && montoConcepto && parseFloat(montoConcepto) > 0) {
      setConceptosAdicionales([...conceptosAdicionales, {
        concepto: conceptoSeleccionado,
        monto: montoConcepto
      }]);
      setConceptoSeleccionado("");
      setMontoConcepto("");
    }
  };

  const eliminarConcepto = (index: number) => {
    setConceptosAdicionales(conceptosAdicionales.filter((_, i) => i !== index));
  };

  // Calcular monto de comisión automáticamente
  const montoComisionPagar = formData.montoDeposito && formData.porcentaje
    ? (parseFloat(formData.montoDeposito) * parseFloat(formData.porcentaje) / 100).toFixed(2)
    : "0.00";

  // Efecto para actualizar el tiempo restante de la clave
  useEffect(() => {
    if (!claveGenerada) {
      setTiempoRestante("");
      return;
    }

    const actualizarTiempo = () => {
      const ahora = new Date();
      const expiracion = new Date(claveGenerada.expiracion);
      const diferencia = expiracion.getTime() - ahora.getTime();

      if (diferencia <= 0) {
        setTiempoRestante("CADUCADA");
        return;
      }

      const minutos = Math.floor(diferencia / 60000);
      const segundos = Math.floor((diferencia % 60000) / 1000);
      setTiempoRestante(`${minutos}:${segundos.toString().padStart(2, '0')}`);
    };

    actualizarTiempo();
    const intervalo = setInterval(actualizarTiempo, 1000);

    return () => clearInterval(intervalo);
  }, [claveGenerada]);

  // Buscar caso cuando el asesor ingresa un folio/CURP
  const buscarCaso = async (folioIngresado: string) => {
    if (!folioIngresado.trim()) {
      limpiarFormulario();
      return;
    }

    // PERMITIR FOLIOS ANTIGUOS (mínimo 3 caracteres) Y CURPS (18 caracteres)
    if (folioIngresado.trim().length < 3) {
      alert('⚠️ El folio/CURP debe tener al menos 3 caracteres');
      return;
    }

    setBuscandoFolio(true);
    const resultado = await buscarCasoPorFolioCompleto(folioIngresado);

    if (resultado) {
      // Caso encontrado - cargar datos para agregar nuevo cobro
      setCasoExistenteId(resultado.id);
      setModoEdicion(true);
      setFormData({
        nombreCompleto: resultado.caso.cliente || `${resultado.caso.nombres || ''} ${resultado.caso.apellidos || ''}`.trim(),
        tipoFraude: resultado.caso.tipoFraude,
        licenciado: resultado.caso.licenciado,
        recuperacion: resultado.caso.recuperacion.toString(),
        indemnizacion: resultado.caso.indemnizacion.toString(),
        penalizacion: resultado.caso.penalizacion.toString(),
        totalEntregar: resultado.caso.totalEntregar.toString(),
        pagoPendiente: resultado.caso.pagoPendiente.toString(),
        conceptoPago: resultado.caso.conceptoPago,
        motivoComision: "SIN MOTIVO",
        porcentaje: "",
        montoDeposito: "",
        numeroCuentaFideicomiso: resultado.caso.numeroCuentaFideicomiso || "",
        claveInterbancaria: resultado.caso.claveInterbancaria || "",
        institucionBancaria: resultado.caso.institucionBancaria || "",
        titularCuenta: resultado.caso.titularCuenta || ""
      });
      // Cargar conceptos adicionales existentes
      if (resultado.caso.conceptosAdicionales && resultado.caso.conceptosAdicionales.length > 0) {
        setConceptosAdicionales(resultado.caso.conceptosAdicionales.map(c => ({
          concepto: c.concepto,
          monto: c.monto.toString()
        })));
      } else {
        setConceptosAdicionales([]);
      }
      console.log('📝 Cliente encontrado - Agregar nuevo cobro/comisión');
    } else {
      // Caso no encontrado - preparar para crear nuevo
      setCasoExistenteId(null);
      setModoEdicion(false);
      limpiarFormulario();
      console.log('➕ Modo creación - nuevo cliente');
    }

    setBuscandoFolio(false);
  };

  const limpiarFormulario = () => {
    setFormData({
      nombreCompleto: "",
      tipoFraude: "",
      licenciado: "",
      recuperacion: "",
      indemnizacion: "",
      penalizacion: "",
      totalEntregar: "",
      pagoPendiente: "",
      conceptoPago: "",
      motivoComision: "SIN MOTIVO",
      porcentaje: "",
      montoDeposito: "",
      numeroCuentaFideicomiso: "",
      claveInterbancaria: "",
      institucionBancaria: "",
      titularCuenta: ""
    });
    setCasoExistenteId(null);
    setModoEdicion(false);
  };

  const handleFolioBlur = () => {
    buscarCaso(folioCurp);
  };

  function copiarFolio() {
    navigator.clipboard.writeText(folioGuardado);
  }

  async function generarClaveParaFolio(folioAUsar: string): Promise<ClaveAcceso | null> {
    const folioNormalizado = folioAUsar.trim().toUpperCase();

    if (!folioNormalizado) {
      alert('⚠️ Primero ingresa un FOLIO/CURP');
      return null;
    }

    if (folioNormalizado.length < 3) {
      alert('⚠️ El FOLIO/CURP debe tener al menos 3 caracteres');
      return null;
    }

    setGenerandoClave(true);

    try {
      // Buscar el caso existente
      const resultado = await buscarCasoPorFolioCompleto(folioNormalizado);

      if (!resultado) {
        alert('⚠️ Primero debes guardar el cliente antes de generar una clave de acceso');
        return null;
      }

      // Obtener el último consecutivo
      const ultimoConsecutivo = await obtenerUltimoConsecutivo();

      // Generar nueva clave
      const nuevaClave = generarClaveAcceso(ultimoConsecutivo);

      // Actualizar todos los documentos con el mismo CURP para evitar claves distintas en duplicados
      const actualizado = await actualizarClaveAccesoPorFolio(folioNormalizado, nuevaClave);

      if (actualizado) {
        setClaveGenerada(nuevaClave);
        return nuevaClave;
      } else {
        alert('❌ Error al generar la clave de acceso');
        return null;
      }
    } catch (error) {
      console.error('Error al generar clave:', error);
      alert('❌ Error al generar la clave de acceso');
      return null;
    } finally {
      setGenerandoClave(false);
    }
  }

  // Nueva función para generar clave de acceso
  async function handleGenerarClave(folioDirecto?: string) {
    // Usar el folio pasado directamente o el del estado
    const folioAUsar = folioDirecto || folioCurp;
    await generarClaveParaFolio(folioAUsar);
  }

  function copiarClave() {
    if (claveGenerada) {
      navigator.clipboard.writeText(claveGenerada.clave);
      alert('✅ Clave copiada al portapapeles');
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowSuccess(false);
    setShowError(false);

    // Validar FOLIO/CURP
    if (!folioCurp.trim()) {
      alert('⚠️ Por favor ingresa un FOLIO/CURP válido');
      return;
    }

    if (folioCurp.trim().length < 3) {
      alert('⚠️ El FOLIO/CURP debe tener al menos 3 caracteres');
      return;
    }

    if (folioCurp.trim().length > 50) {
      alert('⚠️ El FOLIO/CURP no puede tener más de 50 caracteres');
      return;
    }

    // Validar que solo contenga letras, números y guiones
    if (!/^[A-Z0-9\-]+$/.test(folioCurp.trim())) {
      alert('⚠️ El FOLIO/CURP solo puede contener letras mayúsculas, números y guiones');
      return;
    }

    // Validar solo campos obligatorios (nombre del cliente)
    if (!formData.nombreCompleto.trim()) {
      alert('⚠️ Por favor ingresa el nombre completo del cliente');
      return;
    }

    // Los datos de comisión son OPCIONALES - solo validar si se llenaron
    const tieneComision = formData.porcentaje && parseFloat(formData.porcentaje) > 0
      && formData.montoDeposito && parseFloat(formData.montoDeposito) > 0;



    // Crear objeto de cobro
    // Si tiene datos de comisión → crear cobro con esos datos
    // Si NO tiene datos de comisión → crear cobro "vacío" para limpiar comisión anterior
    const nuevoCobro: Cobro = tieneComision ? {
      motivoComision: formData.motivoComision,
      porcentaje: parseFloat(formData.porcentaje) || 0,
      montoDeposito: parseFloat(formData.montoDeposito) || 0,
      cuentaDeposito: "",
      nombreBeneficiario: "",
      montoComisionPagar: parseFloat(montoComisionPagar),
      fecha: new Date().toISOString()
    } : {
      // Cobro "reseteador" - limpia la comisión anterior
      motivoComision: "SIN MOTIVO",
      porcentaje: 0,
      montoDeposito: 0,
      cuentaDeposito: "",
      nombreBeneficiario: "",
      montoComisionPagar: 0,
      fecha: new Date().toISOString()
    };

    const caso: Caso = {
      folio: folioCurp.trim().toUpperCase(),
      cliente: formData.nombreCompleto.trim().toUpperCase(),
      nombres: formData.nombreCompleto.trim(),
      apellidos: "",
      tipoFraude: formData.tipoFraude,
      licenciado: formData.licenciado,
      recuperacion: parseFloat(formData.recuperacion) || 0,
      indemnizacion: parseFloat(formData.indemnizacion) || 0,
      penalizacion: parseFloat(formData.penalizacion) || 0,
      totalEntregar: parseFloat(formData.totalEntregar) || 0,
      pagoPendiente: parseFloat(formData.pagoPendiente) || 0,
      conceptoPago: formData.conceptoPago,
      fechaCreacion: new Date().toISOString(),
      // Cuenta única de fideicomiso
      numeroCuentaFideicomiso: formData.numeroCuentaFideicomiso.trim(),
      claveInterbancaria: formData.claveInterbancaria.trim(),
      institucionBancaria: formData.institucionBancaria.trim(),
      titularCuenta: formData.titularCuenta.trim(),
      // Conceptos adicionales opcionales (usar array vacío, no undefined)
      conceptosAdicionales: conceptosAdicionales.length > 0
        ? conceptosAdicionales.map(c => ({ concepto: c.concepto, monto: parseFloat(c.monto) }))
        : [],
      cobros: modoEdicion ? [] : [nuevoCobro] // Siempre agregar el cobro (con datos o reseteador)
    };

    try {
      const resultadoExistente = await buscarCasoPorFolioCompleto(caso.folio);

      if (resultadoExistente) {
        // ACTUALIZAR TODOS LOS DATOS + AGREGAR NUEVO COBRO (siempre)
        const resultado = resultadoExistente;
        if (resultado) {
          const cobrosActuales = resultado.caso.cobros || [];
          // Siempre agregar el nuevo cobro (con datos o reseteador "SIN MOTIVO")
          // Así el último cobro siempre refleja la última actualización
          const nuevosCobros = [...cobrosActuales, nuevoCobro];

          // Usar los datos NUEVOS del formulario (caso) en lugar de los viejos (resultado.caso)
          const casoActualizado: Caso = {
            ...caso,  // ← Datos NUEVOS del formulario
            cobros: nuevosCobros  // ← Mantener cobros existentes o agregar nuevo
          };

          await actualizarCasoPorFolio(caso.folio, casoActualizado);
          const claveNueva = await generarClaveParaFolio(caso.folio);
          setFolioGuardado(caso.folio);
          setModoEdicion(true);
          setCasoExistenteId(resultado.id);
          setShowSuccess(true);

          // Mensaje diferente según si se agregó comisión o solo conceptos adicionales
          if (tieneComision) {
            alert(`✅ Caso actualizado exitosamente!\nCURP: ${caso.folio}\nMonto de comisión: ${montoComisionPagar} MXN\nClave de acceso: ${claveNueva?.clave || 'No generada'}\n\nTodos los datos fueron actualizados.`);
          } else {
            alert(`✅ Caso actualizado exitosamente!\nCURP: ${caso.folio}\nClave de acceso: ${claveNueva?.clave || 'No generada'}\n\nDatos actualizados. Comisión anterior limpiada.`);
          }
        }
      } else {
        // CREAR nuevo caso (siempre con un cobro, ya sea con datos o reseteador)
        caso.cobros = [nuevoCobro];

        // 🔍 DEBUG: Verificar datos antes de guardar
        console.log('📝 Nuevo cobro a guardar:', nuevoCobro);
        console.log('📝 Caso completo a guardar:', caso);
        console.log('📝 Array de cobros:', caso.cobros);

        await guardarCaso(caso);
        const claveNueva = await generarClaveParaFolio(caso.folio);
        setFolioGuardado(caso.folio);
        setShowSuccess(true);

        // Mensaje diferente según si se agregó comisión o no
        if (tieneComision) {
          alert(`✅ Cliente creado exitosamente!\nFOLIO/CURP: ${caso.folio}\nMonto de comisión: ${montoComisionPagar} MXN\nClave de acceso: ${claveNueva?.clave || 'No generada'}`);
        } else {
          alert(`✅ Cliente creado exitosamente!\nFOLIO/CURP: ${caso.folio}\nClave de acceso: ${claveNueva?.clave || 'No generada'}\n\nCliente guardado sin datos de comisión.`);
        }
      }

      // Limpiar formulario
      setFolioCurp("");
      limpiarFormulario();

    } catch (error) {
      console.error('❌ Error al guardar:', error);
      setShowError(true);
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error al guardar:\n${mensaje}`);
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-[#6B1839] text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center">
          <div className="flex items-center gap-4 pointer-events-none">
            <img
              src="https://ext.same-assets.com/2098432521/3519242953.png"
              alt="Gobierno de México"
              className="h-12 md:h-14"
            />
            <h1 className="text-xl md:text-2xl font-bold">Sistema de Administración</h1>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8 pb-6 border-b-4 border-[#6B1839]">
            <h1 className="text-4xl font-bold text-[#6B1839] mb-3">Registro de Casos de Fraude</h1>
            <p className="text-gray-600">Sistema de administración para asesores</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* CURP/FOLIO Editable */}
            <div className="bg-gradient-to-br from-[#6B1839] to-[#8B2446] rounded-xl p-6 mb-8 shadow-lg">
              <label className="block text-white/90 text-sm mb-2">
                {modoEdicion ? 'FOLIO/CURP DEL CLIENTE (Agregar nuevo cobro):' : 'INGRESA FOLIO O CURP DEL CLIENTE:'}
              </label>
              <Input
                value={folioCurp}
                onChange={(e) => setFolioCurp(e.target.value.toUpperCase())}
                onBlur={handleFolioBlur}
                placeholder="Ej: ABCD123456HDFRRL01 o FOLIO123"
                className="text-lg py-6 text-center font-bold tracking-wider text-gray-800"
                autoComplete="off"
              />
              <p className="text-white/70 text-xs mt-2 text-center">CURP de 18 caracteres o Folio antiguo (mínimo 3 caracteres)</p>
              {buscandoFolio && (
                <p className="text-white/80 text-sm mt-2 text-center">Buscando...</p>
              )}
              {modoEdicion && !buscandoFolio && (
                <p className="text-yellow-300 text-sm mt-2 text-center font-semibold">
                  Cliente encontrado - Agregando nuevo cobro/comisión
                </p>
              )}
              {!modoEdicion && folioCurp && !buscandoFolio && (
                <p className="text-green-300 text-sm mt-2 text-center font-semibold">
                  Nuevo cliente - Se creará con el primer cobro
                </p>
              )}
            </div>

            {/* Nombre Completo del Cliente */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-700 mb-2">NOMBRE COMPLETO DEL CLIENTE *</label>
              <Input
                value={formData.nombreCompleto}
                onChange={(e) => handleInputChange('nombreCompleto', e.target.value)}
                required
                placeholder="Ej: Juan Pedro Pérez López"
                className="text-lg py-6"
              />
            </div>

            {/* Tipo de Fraude y Licenciado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">TIPO DE FRAUDE *</label>
                <Input
                  value={formData.tipoFraude}
                  onChange={(e) => handleInputChange('tipoFraude', e.target.value)}
                  required
                  placeholder="Ej: Fraude bancario"
                  className="text-lg py-6"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2">LICENCIADO *</label>
                <Input
                  value={formData.licenciado}
                  onChange={(e) => handleInputChange('licenciado', e.target.value)}
                  required
                  placeholder="Nombre del licenciado"
                  className="text-lg py-6"
                />
              </div>
            </div>

            {/* Sección de Comisión - OPCIONAL */}
            <div className="bg-blue-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Datos de Comisión <span className="text-sm font-normal text-blue-600">(Opcional)</span></h3>
              <p className="text-sm text-gray-600 mb-4">Completa estos datos solo si aplica una comisión para este cliente.</p>

              {/* Motivo de Comisión */}
              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-2">MOTIVO DE COMISIÓN</label>
                <select
                  value={formData.motivoComision}
                  onChange={(e) => handleInputChange('motivoComision', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500"
                >
                  {MOTIVOS_COMISION.map((motivo) => (
                    <option key={motivo} value={motivo}>{motivo}</option>
                  ))}
                </select>
              </div>

              {/* Porcentaje y Monto de Depósito - OPCIONALES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">PORCENTAJE %</label>
                  <Input
                    value={formData.porcentaje}
                    onChange={(e) => handleInputChange('porcentaje', e.target.value)}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Ej: 5.5"
                    className="text-lg py-6"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">MONTO DE DEPÓSITO (MXN)</label>
                  <Input
                    value={formData.montoDeposito}
                    onChange={(e) => handleInputChange('montoDeposito', e.target.value)}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="text-lg py-6"
                  />
                </div>
              </div>

              {/* Monto de Comisión a Pagar (Calculado) */}
              <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-4">
                <label className="block font-semibold text-green-900 mb-2">MONTO DE COMISIÓN A PAGAR (Calculado)</label>
                <p className="text-3xl font-bold text-green-700">${montoComisionPagar} MXN</p>
              </div>

              {/* Cuenta única de fideicomiso */}
              <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-300">
                <h4 className="text-lg font-bold text-amber-900 mb-2">Cuenta única de fideicomiso</h4>

                {/* ADVERTENCIA IMPORTANTE */}
                <div className="bg-red-100 border-l-4 border-red-500 rounded-r-lg p-3 mb-4 flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-red-800 text-sm">IMPORTANTE - MANTENER ACTUALIZADO</p>
                    <p className="text-red-700 text-xs mt-1">
                      Las cuentas bancarias pueden ser bloqueadas en cualquier momento.
                      <strong> Verifica y actualiza esta información antes de cada operación.</strong>
                      Si la cuenta fue bloqueada, actualiza inmediatamente los datos.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">NÚMERO DE CUENTA:</label>
                    <Input
                      value={formData.numeroCuentaFideicomiso}
                      onChange={(e) => handleInputChange('numeroCuentaFideicomiso', e.target.value)}
                      placeholder="Ej: 0123456789"
                      className="text-lg py-6"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">CLABE INTERBANCARIA:</label>
                    <Input
                      value={formData.claveInterbancaria}
                      onChange={(e) => handleInputChange('claveInterbancaria', e.target.value)}
                      placeholder="Ej: 012345678901234567"
                      className="text-lg py-6"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">INSTITUCIÓN BANCARIA:</label>
                    <Input
                      value={formData.institucionBancaria}
                      onChange={(e) => handleInputChange('institucionBancaria', e.target.value)}
                      placeholder="Ej: BBVA, Santander, Banorte..."
                      className="text-lg py-6"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">TITULAR:</label>
                    <Input
                      value={formData.titularCuenta}
                      onChange={(e) => handleInputChange('titularCuenta', e.target.value)}
                      placeholder="Nombre del titular de la cuenta"
                      className="text-lg py-6"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Montos (deshabilitados si es modo edición) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">RECUPERACIÓN ($)</label>
                <Input
                  value={formData.recuperacion}
                  onChange={(e) => handleInputChange('recuperacion', e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="text-lg py-6"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2">INDEMNIZACIÓN ($)</label>
                <Input
                  value={formData.indemnizacion}
                  onChange={(e) => handleInputChange('indemnizacion', e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="text-lg py-6"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">TOTAL A ENTREGAR ($)</label>
                <Input
                  value={formData.totalEntregar}
                  onChange={(e) => handleInputChange('totalEntregar', e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="text-lg py-6"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2">PAGO PENDIENTE ($)</label>
                <Input
                  value={formData.pagoPendiente}
                  onChange={(e) => handleInputChange('pagoPendiente', e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="text-lg py-6"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2">CONCEPTO DE PAGO</label>
                <Input
                  value={formData.conceptoPago}
                  onChange={(e) => handleInputChange('conceptoPago', e.target.value)}
                  placeholder="Ej: Honorarios"
                  className="text-lg py-6"
                />
              </div>
            </div>

            {/* Conceptos Adicionales (Opcional) */}
            <div className="bg-purple-50 rounded-xl p-6 mb-6 border-2 border-purple-300">
              <h3 className="text-xl font-bold text-purple-900 mb-4">Conceptos Adicionales (Opcional)</h3>
              <p className="text-sm text-gray-600 mb-4">Selecciona conceptos adicionales si aplican para este cliente.</p>

              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <select
                  value={conceptoSeleccionado}
                  onChange={(e) => setConceptoSeleccionado(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-4 py-3 text-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Seleccionar concepto --</option>
                  {LISTA_CONCEPTOS.map((concepto) => (
                    <option key={concepto} value={concepto}>{concepto}</option>
                  ))}
                </select>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={montoConcepto}
                  onChange={(e) => setMontoConcepto(e.target.value)}
                  placeholder="Monto $"
                  className="w-full md:w-40 text-lg py-6"
                />
                <Button
                  type="button"
                  onClick={agregarConcepto}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
                >
                  Agregar
                </Button>
              </div>

              {/* Lista de conceptos agregados */}
              {conceptosAdicionales.length > 0 && (
                <div className="space-y-2">
                  <p className="font-semibold text-purple-900">Conceptos agregados:</p>
                  {conceptosAdicionales.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-purple-200">
                      <span className="font-medium text-gray-800">{item.concepto}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-purple-700">${parseFloat(item.monto).toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
                        <button
                          type="button"
                          onClick={() => eliminarConcepto(index)}
                          className="text-red-500 hover:text-red-700 font-bold text-xl"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-[#6B1839] to-[#8B2446] hover:opacity-90 text-white py-7 text-xl font-bold shadow-lg">
              Guardar
            </Button>

            {/* Mensaje de Éxito */}
            {showSuccess && (
              <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-6 rounded-lg relative">
                <button onClick={() => setShowSuccess(false)} className="absolute top-4 right-4 text-2xl font-bold text-green-700">×</button>
                <p className="text-green-700 font-bold text-lg mb-3">
                  {modoEdicion ? 'Cobro agregado' : 'Cliente creado'} exitosamente
                </p>
                <p className="text-sm mb-2">CURP:</p>
                <div
                  onClick={copiarFolio}
                  className="bg-white border-2 border-green-500 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition"
                >
                  <span className="text-2xl font-bold text-green-700">{folioGuardado}</span>
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">Haz clic para copiar</p>
              </div>
            )}

            {/* Mensaje de Error */}
            {showError && (
              <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700">Error al guardar. Intenta nuevamente.</p>
              </div>
            )}
          </form>

          {/* NUEVO: Sección de Clave de Acceso */}
          {modoEdicion && casoExistenteId && (
            <div className="mt-8 pt-8 border-t-4 border-[#6B1839]">
              <h3 className="text-2xl font-bold text-[#6B1839] mb-4">Generar Clave de Acceso</h3>
              <p className="text-gray-600 mb-4">
                Genera una clave de acceso temporal para que el cliente pueda consultar su información.
                La clave es válida por <strong>15 minutos</strong>. El cliente solo necesita copiar y pegar.
              </p>

              <Button
                type="button"
                onClick={() => handleGenerarClave(folioCurp)}
                disabled={generandoClave}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-xl font-bold shadow-lg"
              >
                {generandoClave ? 'Generando...' : 'Generar Clave de Acceso'}
              </Button>

              {/* Mostrar clave generada */}
              {claveGenerada && (
                <div className="mt-6 bg-green-50 border-4 border-green-500 rounded-xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-green-800 text-xl">✅ CLAVE GENERADA</h4>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      tiempoRestante === 'CADUCADA'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {tiempoRestante === 'CADUCADA' ? '❌ CADUCADA' : `⏱️ ${tiempoRestante}`}
                    </span>
                  </div>

                  {/* TEXTO LISTO PARA COPIAR - SIN ALERT */}
                  <p className="text-lg text-green-800 font-bold mb-3 text-center">📋 COPIA Y ENVÍA ESTO AL CLIENTE:</p>

                  {/* Campo de texto seleccionable para copiar fácilmente */}
                  <div className="bg-white border-4 border-green-600 rounded-xl p-6 shadow-inner">
                    <input
                      type="text"
                      readOnly
                      value={`${folioCurp} ${claveGenerada.clave}`}
                      className="w-full text-2xl md:text-3xl font-mono font-bold text-green-800 text-center bg-transparent border-none outline-none cursor-text select-all"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                  </div>

                  <p className="text-sm text-gray-600 mt-3 text-center">
                    👆 Toca el texto para seleccionarlo y copiarlo
                  </p>

                  <div className="mt-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                    <p className="text-base text-yellow-800 font-semibold text-center">
                      ⚠️ El cliente pega esto en el buscador y presiona Buscar.
                      <br />
                      <strong>Tiene 15 minutos antes de que caduque.</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botón para generar clave cuando NO está en modo edición pero ya guardó */}
          {!modoEdicion && showSuccess && folioGuardado && (
            <div className="mt-8 pt-8 border-t-4 border-[#6B1839]">
              <h3 className="text-2xl font-bold text-[#6B1839] mb-4">Generar Clave de Acceso</h3>
              <p className="text-gray-600 mb-4">
                Ahora puedes generar una clave de acceso para el cliente recién registrado.
              </p>

              <Button
                type="button"
                onClick={() => handleGenerarClave(folioGuardado)}
                disabled={generandoClave}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-xl font-bold shadow-lg"
              >
                {generandoClave ? 'Generando...' : 'Generar Clave de Acceso'}
              </Button>

              {/* Mostrar clave generada para nuevo cliente */}
              {claveGenerada && (
                <div className="mt-6 bg-green-50 border-4 border-green-500 rounded-xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-green-800 text-xl">✅ CLAVE GENERADA</h4>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      tiempoRestante === 'CADUCADA'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {tiempoRestante === 'CADUCADA' ? '❌ CADUCADA' : `⏱️ ${tiempoRestante}`}
                    </span>
                  </div>

                  {/* TEXTO LISTO PARA COPIAR - SIN ALERT */}
                  <p className="text-lg text-green-800 font-bold mb-3 text-center">📋 COPIA Y ENVÍA ESTO AL CLIENTE:</p>

                  {/* Campo de texto seleccionable para copiar fácilmente */}
                  <div className="bg-white border-4 border-green-600 rounded-xl p-6 shadow-inner">
                    <input
                      type="text"
                      readOnly
                      value={`${folioGuardado} ${claveGenerada.clave}`}
                      className="w-full text-2xl md:text-3xl font-mono font-bold text-green-800 text-center bg-transparent border-none outline-none cursor-text select-all"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                  </div>

                  <p className="text-sm text-gray-600 mt-3 text-center">
                    👆 Toca el texto para seleccionarlo y copiarlo
                  </p>

                  <div className="mt-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                    <p className="text-base text-yellow-800 font-semibold text-center">
                      ⚠️ El cliente pega esto en el buscador y presiona Buscar.
                      <br />
                      <strong>Tiene 15 minutos antes de que caduque.</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#6B1839] text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <img
            src="https://ext.same-assets.com/2098432521/3867328593.png"
            alt="Gobierno de México"
            className="h-16 mx-auto"
          />
        </div>
      </footer>
    </main>
  );
}
