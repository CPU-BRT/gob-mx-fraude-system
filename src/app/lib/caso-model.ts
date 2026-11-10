export interface Cobro {
  motivoComision: string;
  porcentaje: number;
  montoDeposito: number;
  cuentaDeposito: string;
  nombreBeneficiario: string;
  montoComisionPagar: number;
  fecha: string;
}

export interface ClaveAcceso {
  clave: string;
  consecutivo: number;
  fechaCreacion: string;
  expiracion: string;
}

export interface ConceptoAdicional {
  concepto: string;
  monto: number;
}

export interface Caso {
  folio: string;
  cliente: string;
  nombres: string;
  apellidos: string;
  tipoFraude: string;
  licenciado: string;
  recuperacion: number;
  indemnizacion: number;
  penalizacion: number;
  totalEntregar: number;
  pagoPendiente: number;
  conceptoPago: string;
  fechaCreacion: string;
  cobros?: Cobro[];
  numeroCuentaFideicomiso?: string;
  claveInterbancaria?: string;
  institucionBancaria?: string;
  titularCuenta?: string;
  conceptosAdicionales?: ConceptoAdicional[];
  claveAcceso?: ClaveAcceso;
}
