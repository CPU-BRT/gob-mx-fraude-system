"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { guardarCaso, buscarCasoPorFolioCompleto, actualizarCaso, type Caso, type Cobro } from "../lib/storage";

const MOTIVOS_COMISION = [
  "SIN MOTIVO",
  "CERTIFICACIÓN PDL FT",
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
  "UNIFICACIÓN DE FONDOS",
  "ACTUALIZACIÓN DE FOLIO"
];

export default function AdminPage() {
  const [folioCurp, setFolioCurp] = useState("");
  const [casoExistenteId, setCasoExistenteId] = useState<string | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [folioGuardado, setFolioGuardado] = useState("");
  const [buscandoFolio, setBuscandoFolio] = useState(false);

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
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
    cuentaDeposito: "",
    nombreBeneficiario: ""
  });

  // Calcular monto de comisión automáticamente
  const montoComisionPagar = formData.montoDeposito && formData.porcentaje
    ? (parseFloat(formData.montoDeposito) * parseFloat(formData.porcentaje) / 100).toFixed(2)
    : "0.00";

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
        nombres: resultado.caso.nombres,
        apellidos: resultado.caso.apellidos,
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
        cuentaDeposito: "",
        nombreBeneficiario: ""
      });
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
      nombres: "",
      apellidos: "",
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
      cuentaDeposito: "",
      nombreBeneficiario: ""
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

    // Validar campos de comisión
    if (!formData.nombres.trim()) {
      alert('⚠️ Por favor ingresa el nombre del cliente');
      return;
    }

    if (!formData.apellidos.trim()) {
      alert('⚠️ Por favor ingresa los apellidos del cliente');
      return;
    }

    if (!formData.porcentaje || parseFloat(formData.porcentaje) <= 0) {
      alert('⚠️ Por favor ingresa un porcentaje válido');
      return;
    }

    if (!formData.montoDeposito || parseFloat(formData.montoDeposito) <= 0) {
      alert('⚠️ Por favor ingresa un monto de depósito válido');
      return;
    }

    if (!formData.cuentaDeposito.trim()) {
      alert('⚠️ Por favor ingresa la cuenta de depósito');
      return;
    }

    if (!formData.nombreBeneficiario.trim()) {
      alert('⚠️ Por favor ingresa el nombre del beneficiario');
      return;
    }

    // Crear objeto de cobro
    const nuevoCobro: Cobro = {
      motivoComision: formData.motivoComision,
      porcentaje: parseFloat(formData.porcentaje) || 0,
      montoDeposito: parseFloat(formData.montoDeposito) || 0,
      cuentaDeposito: formData.cuentaDeposito,
      nombreBeneficiario: formData.nombreBeneficiario,
      montoComisionPagar: parseFloat(montoComisionPagar),
      fecha: new Date().toISOString()
    };

    const caso: Caso = {
      folio: folioCurp.trim().toUpperCase(),
      cliente: `NOMBRES: ${formData.nombres.trim().toUpperCase()} APELLIDOS: ${formData.apellidos.trim().toUpperCase()}`,
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      tipoFraude: formData.tipoFraude,
      licenciado: formData.licenciado,
      recuperacion: parseFloat(formData.recuperacion) || 0,
      indemnizacion: parseFloat(formData.indemnizacion) || 0,
      penalizacion: parseFloat(formData.penalizacion) || 0,
      totalEntregar: parseFloat(formData.totalEntregar) || 0,
      pagoPendiente: parseFloat(formData.pagoPendiente) || 0,
      conceptoPago: formData.conceptoPago,
      fechaCreacion: new Date().toISOString(),
      cobros: modoEdicion ? undefined : [nuevoCobro] // Solo agregar cobro inicial si es nuevo caso
    };

    try {
      if (modoEdicion && casoExistenteId) {
        // ACTUALIZAR TODOS LOS DATOS + AGREGAR NUEVO COBRO
        const resultado = await buscarCasoPorFolioCompleto(folioCurp);
        if (resultado) {
          const cobrosActuales = resultado.caso.cobros || [];
          const nuevosCobros = [...cobrosActuales, nuevoCobro];

          // Usar los datos NUEVOS del formulario (caso) en lugar de los viejos (resultado.caso)
          const casoActualizado: Caso = {
            ...caso,  // ← Datos NUEVOS del formulario
            cobros: nuevosCobros  // ← Agregar nuevo cobro al historial
          };

          await actualizarCaso(casoExistenteId, casoActualizado);
          setFolioGuardado(caso.folio);
          setShowSuccess(true);
          alert(`✅ Caso actualizado exitosamente!\nCURP: ${caso.folio}\nMonto de comisión: ${montoComisionPagar}\n\nTodos los datos fueron actualizados.`);
        }
      } else {
        // CREAR nuevo caso con primer cobro
        caso.cobros = [nuevoCobro];

        // 🔍 DEBUG: Verificar datos antes de guardar
        console.log('📝 Nuevo cobro a guardar:', nuevoCobro);
        console.log('📝 Caso completo a guardar:', caso);
        console.log('📝 Array de cobros:', caso.cobros);

        await guardarCaso(caso);
        setFolioGuardado(caso.folio);
        setShowSuccess(true);
        alert(`✅ Cliente creado exitosamente!\nFOLIO/CURP: ${caso.folio}\nMonto de comisión: ${montoComisionPagar} MXN`);
      }

      // Limpiar formulario
      setFolioCurp("");
      limpiarFormulario();

    } catch (error) {
      console.error('❌ Error al guardar:', error);
      setShowError(true);
      alert('❌ Error al guardar. Por favor intenta de nuevo.');
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

            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">NOMBRES *</label>
                <Input
                  value={formData.nombres}
                  onChange={(e) => handleInputChange('nombres', e.target.value)}
                  required
                  placeholder="Ej: Juan Pedro"
                  className="text-lg py-6"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2">APELLIDOS *</label>
                <Input
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  required
                  placeholder="Ej: Pérez López"
                  className="text-lg py-6"
                />
              </div>
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

            {/* Sección de Comisión */}
            <div className="bg-blue-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Datos de Comisión</h3>

              {/* Motivo de Comisión */}
              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-2">MOTIVO DE COMISIÓN *</label>
                <select
                  value={formData.motivoComision}
                  onChange={(e) => handleInputChange('motivoComision', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {MOTIVOS_COMISION.map((motivo) => (
                    <option key={motivo} value={motivo}>{motivo}</option>
                  ))}
                </select>
              </div>

              {/* Porcentaje y Monto de Depósito */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">PORCENTAJE % *</label>
                  <Input
                    value={formData.porcentaje}
                    onChange={(e) => handleInputChange('porcentaje', e.target.value)}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    placeholder="Ej: 5.5"
                    className="text-lg py-6"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">MONTO DE DEPÓSITO (MXN) *</label>
                  <Input
                    value={formData.montoDeposito}
                    onChange={(e) => handleInputChange('montoDeposito', e.target.value)}
                    type="number"
                    step="0.01"
                    min="0"
                    required
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

              {/* Cuenta de Depósito y Beneficiario */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">CUENTA DE DEPÓSITO *</label>
                  <Input
                    value={formData.cuentaDeposito}
                    onChange={(e) => handleInputChange('cuentaDeposito', e.target.value)}
                    required
                    placeholder="Ej: 1234567890"
                    className="text-lg py-6"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">NOMBRE DEL BENEFICIARIO *</label>
                  <Input
                    value={formData.nombreBeneficiario}
                    onChange={(e) => handleInputChange('nombreBeneficiario', e.target.value)}
                    required
                    placeholder="Nombre completo"
                    className="text-lg py-6"
                  />
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
                <label className="block font-semibold text-gray-700 mb-2">PENALIZACIÓN ($)</label>
                <Input
                  value={formData.penalizacion}
                  onChange={(e) => handleInputChange('penalizacion', e.target.value)}
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
