import { useState } from 'react';
import { useCampanaStore } from '../../store/useCampanaStore';
import { Pais, Vertical, Plataforma, Segmento } from '../../types';
import { 
  Upload, 
  X, 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  TrendingUp, 
  Loader2,
  PartyPopper,
  ChevronLeft,
  Info,
  Table
} from 'lucide-react';

interface ImportarCampanasProps {
  onCerrar: () => void;
}

interface CampanaImportada {
  id: string;
  nombre: string;
  pais: string;
  vertical: string;
  plataforma: string;
  segmento: string;
  idPlataformaExterna?: string;
  inicialesDueno: string;
  descripcionCorta: string;
  objetivo: string;
  beneficio: string;
  descripcion: string;
  tipoAterrizaje?: string;
  estado: string;
  fechaCreacion: string;
  alcance?: number;
  clics?: number;
  leads?: number;
  costoSemanal?: number;
  costoLead?: number;
  conductoresRegistrados?: number;
  conductoresPrimerViaje?: number;
  costoConductorRegistrado?: number;
  costoConductorPrimerViaje?: number;
  urlInforme?: string;
}

interface HistoricoImportado {
  FECHA_ARCHIVO: string;
  ID_CAMPANIA: string;
  NOMBRE_CAMPANIA: string;
  SEMANA_ISO: string;
  ESTADO_ACTIVIDAD: string;
  ESTADO_METRICAS: string;
  MENSAJE: string;
  ALCANCE: number;
  CLICS: number;
  LEADS: number;
  COSTO_SEMANAL: number;
  COSTO_LEAD: number;
  CONDUCTORES_REGISTRADOS: number;
  CONDUCTORES_PRIMER_VIAJE: number;
  COSTO_CONDUCTOR_REGISTRADO: number;
  COSTO_CONDUCTOR_PRIMER_VIAJE: number;
  FECHA_CREACION: string;
  ULTIMA_ACTUALIZACION: string;
  OBJETIVO: string;
  SEGMENTO: string;
  VERTICAL: string;
  BENEFICIO_PROGRAMA: string;
  DESCRIPCION: string;
  URL_INFORME: string;
}

export default function ImportarCampanas({ onCerrar }: ImportarCampanasProps) {
  const { crearCampana, importarHistorico } = useCampanaStore();
  const [campanasImportadas, setCampanasImportadas] = useState<CampanaImportada[]>([]);
  const [historicoImportado, setHistoricoImportado] = useState<HistoricoImportado[]>([]);
  const [errores, setErrores] = useState<string[]>([]);
  const [mensajeResultado, setMensajeResultado] = useState<string | null>(null);
  const [paso, setPaso] = useState<'seleccion' | 'preview' | 'importando' | 'completado'>('seleccion');
  const [tipoImportacion, setTipoImportacion] = useState<'campanas' | 'historico' | 'auto'>('auto');

  const manejarSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivoSeleccionado = e.target.files?.[0];
    if (!archivoSeleccionado) return;

    if (!archivoSeleccionado.name.match(/\.(csv|xlsx|xls)$/i)) {
      alert('❌ Solo se permiten archivos CSV, XLSX o XLS');
      return;
    }

    procesarArchivo(archivoSeleccionado);
  };

  const procesarArchivo = async (archivo: File) => {
    try {
      const texto = await leerArchivo(archivo);
      
      // Detectar tipo de archivo por headers
      const lineas = texto.split('\n').filter(linea => linea.trim());
      const headers = lineas[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Detectar si es histórico por headers específicos
      const esHistorico = headers.includes('FECHA_ARCHIVO') && headers.includes('SEMANA_ISO');
      
      if (esHistorico) {
        setTipoImportacion('historico');
        const historico = parsearHistorico(texto);
        setHistoricoImportado(historico);
      } else {
        setTipoImportacion('campanas');
        const campanas = parsearCampanas(texto);
        setCampanasImportadas(campanas);
      }
      
      setPaso('preview');
    } catch (error) {
      alert(`❌ Error procesando archivo: ${error}`);
    }
  };

  const leerArchivo = (archivo: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(archivo);
    });
  };

  const parsearHistorico = (texto: string): HistoricoImportado[] => {
    const lineas = texto.split('\n').filter(linea => linea.trim());
    const headers = lineas[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const historico: HistoricoImportado[] = [];
    const errores: string[] = [];

    for (let i = 1; i < lineas.length; i++) {
      const valores = parsearLineaCSV(lineas[i]);
      
      if (valores.length !== headers.length) {
        errores.push(`Línea ${i + 1}: Número de columnas incorrecto`);
        continue;
      }

      const registro: any = {};
      headers.forEach((header, index) => {
        let valor = valores[index].replace(/"/g, '').trim();
        
        // Convertir números
        if (['ALCANCE', 'CLICS', 'LEADS', 'COSTO_SEMANAL', 'COSTO_LEAD', 'CONDUCTORES_REGISTRADOS', 'CONDUCTORES_PRIMER_VIAJE', 'COSTO_CONDUCTOR_REGISTRADO', 'COSTO_CONDUCTOR_PRIMER_VIAJE', 'SEMANA_ISO'].includes(header)) {
          const numeroValor = parseFloat(valor.replace(/[$,]/g, '')) || 0;
          registro[header] = numeroValor;
        } else {
          registro[header] = valor;
        }
      });

      // Validar datos requeridos
      if (!registro.ID_CAMPANIA || !registro.NOMBRE_CAMPANIA) {
        errores.push(`Línea ${i + 1}: Faltan datos requeridos (ID o Nombre)`);
        continue;
      }

      historico.push(registro as HistoricoImportado);
    }

    setErrores(errores);
    setMensajeResultado(null);
    return historico;
  };

  const parsearCampanas = (texto: string): CampanaImportada[] => {
    const lineas = texto.split('\n').filter(linea => linea.trim());
    const headers = lineas[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const campanas: CampanaImportada[] = [];
    const errores: string[] = [];

    for (let i = 1; i < lineas.length; i++) {
      const valores = parsearLineaCSV(lineas[i]);
      
      if (valores.length !== headers.length) {
        errores.push(`Línea ${i + 1}: Número de columnas incorrecto`);
        continue;
      }

      const campana: any = {};
      headers.forEach((header, index) => {
        campana[header] = valores[index].replace(/"/g, '').trim();
      });

      // Validar datos requeridos
      if (!campana.id || !campana.nombre || !campana.objetivo) {
        errores.push(`Línea ${i + 1}: Faltan datos requeridos (id, nombre, objetivo)`);
        continue;
      }

      campanas.push(campana as CampanaImportada);
    }

    setErrores(errores);
    return campanas;
  };

  const parsearLineaCSV = (linea: string): string[] => {
    const valores: string[] = [];
    let valorActual = '';
    let entreComillas = false;

    for (let i = 0; i < linea.length; i++) {
      const char = linea[i];
      
      if (char === '"') {
        entreComillas = !entreComillas;
      } else if (char === ',' && !entreComillas) {
        valores.push(valorActual);
        valorActual = '';
      } else {
        valorActual += char;
      }
    }
    
    valores.push(valorActual);
    return valores;
  };

  const importarCampanas = async () => {
    setPaso('importando');
    const erroresImportacion: string[] = [];
    let exitosas = 0;
    setMensajeResultado(null);

    if (tipoImportacion === 'historico') {
      // Importar histórico
      try {
        const resultado = await importarHistorico(historicoImportado);
        if (resultado.exito) {
          exitosas = historicoImportado.length;
          setMensajeResultado(resultado.mensaje);
          if (resultado.errores && resultado.errores.length > 0) {
            erroresImportacion.push(...resultado.errores);
          }
        } else {
          erroresImportacion.push(resultado.mensaje);
        }
      } catch (error) {
        erroresImportacion.push(`Error importando histórico: ${error}`);
      }
    } else {
      // Importar campañas
      for (const campana of campanasImportadas) {
        try {
          // Convertir datos al formato del formulario
          const datosFormulario = {
            pais: (campana.pais as Pais) || 'PE',
            vertical: (campana.vertical as Vertical) || 'MOTOPER',
            plataforma: (campana.plataforma as Plataforma) || 'FB',
            segmento: (campana.segmento as Segmento) || 'Adquisición',
            idPlataformaExterna: campana.idPlataformaExterna,
            inicialesDueno: campana.inicialesDueno || 'XX',
            descripcionCorta: campana.descripcionCorta || 'Importada',
            objetivo: campana.objetivo,
            beneficio: campana.beneficio || 'Beneficio por definir',
            descripcion: campana.descripcion || campana.objetivo,
            tipoAterrizaje: (campana.tipoAterrizaje as 'FORMS' | 'WHATSAPP' | 'URL' | 'LANDING' | 'APP' | 'CALL_CENTER' | 'EMAIL' | 'OTRO') || 'FORMS',
            nombreDueno: campana.inicialesDueno || 'Dueño Importado'
          };

          const resultado = await crearCampana(datosFormulario, campana.id);
          if (resultado.exito) {
            exitosas++;
          } else {
            erroresImportacion.push(`${campana.nombre}: ${resultado.mensaje}`);
          }
        } catch (error) {
          erroresImportacion.push(`${campana.nombre}: Error - ${error}`);
        }
      }
    }

    setErrores(erroresImportacion);
    setPaso('completado');
  };

  const descargarPlantilla = () => {
    const headers = [
      'id', 'nombre', 'pais', 'vertical', 'plataforma', 'segmento', 
      'idPlataformaExterna', 'inicialesDueno', 'descripcionCorta', 
      'objetivo', 'beneficio', 'descripcion', 'estado', 'fechaCreacion',
      'alcance', 'clics', 'leads', 'costoSemanal', 'costoLead',
      'conductoresRegistrados', 'conductoresPrimerViaje', 
      'costoConductorRegistrado', 'costoConductorPrimerViaje', 'urlInforme'
    ];

    const ejemplo = [
      '001', 'PE-MOTOPER-FB-ADQ-001-GF-Verano2025', 'PE', 'MOTOPER', 'FB', 'Adquisición',
      '123456789', 'GF', 'Verano2025', 'Aumentar registros de conductores', 
      'Bono de bienvenida $50 USD', 'Campaña de verano', 'Pendiente', '2025-01-01',
      '100000', '5000', '500', '2500', '5', '250', '150', '10', '16.67', 'https://facebook.com/report/123'
    ];

    const csv = [headers.join(','), ejemplo.join(',')].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_importacion_campanas.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header moderno */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
              >
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">
                  Importar Datos
                </h2>
                <p className="text-gray-400 text-sm font-medium">
                  Importa campañas e histórico desde archivos CSV/Excel
                </p>
              </div>
            </div>
            <button
              onClick={onCerrar}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              aria-label="Cerrar modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          {paso === 'seleccion' && (
            <div className="space-y-6">
              {/* Instrucciones */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
                  <Info className="w-5 h-5" style={{ color: '#3b82f6' }} />
                  Instrucciones de Importación
                </h3>
                <ol className="text-sm text-blue-800 space-y-3 list-none">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                    <span className="font-medium pt-0.5">Exporta tus campañas de Google Sheets como CSV</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                    <span className="font-medium pt-0.5">Descarga la plantilla de ejemplo para ver el formato correcto</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                    <span className="font-medium pt-0.5">Sube el archivo CSV con tus campañas o histórico</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">4</span>
                    <span className="font-medium pt-0.5">Revisa la vista previa antes de importar</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">5</span>
                    <span className="font-medium pt-0.5">Confirma la importación</span>
                  </li>
                </ol>
              </div>

              {/* Botón descargar plantilla */}
              <div className="text-center">
                <button
                  onClick={descargarPlantilla}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-3 transform hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  Descargar Plantilla CSV
                </button>
                <p className="text-xs text-gray-600 mt-3 font-medium">Usa esta plantilla como guía para estructurar tus datos</p>
              </div>

              {/* Upload */}
              <div className="border-2 border-dashed border-gray-300 hover:border-primary-400 rounded-2xl p-12 text-center transition-all duration-200 bg-gradient-to-br from-gray-50 to-gray-100">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={manejarSeleccionArchivo}
                  className="hidden"
                  id="file-import"
                />
                <label
                  htmlFor="file-import"
                  className="cursor-pointer"
                >
                  <div 
                    className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
                  >
                    <Upload className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-3">
                    Selecciona archivo CSV o Excel
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    Formatos soportados: <span className="font-bold text-gray-900">CSV, XLSX, XLS</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    El sistema detectará automáticamente si es un archivo de campañas o histórico
                  </p>
                </label>
              </div>
            </div>
          )}

          {paso === 'preview' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-2 text-lg">Archivo Procesado Correctamente</h3>
                <p className="text-sm text-green-800 font-medium mb-2">
                  {tipoImportacion === 'historico' 
                    ? `Se encontraron ${historicoImportado.length} registros históricos para importar`
                    : `Se encontraron ${campanasImportadas.length} campañas para importar`
                  }
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold">
                  {tipoImportacion === 'historico' ? <TrendingUp className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                  Tipo detectado: {tipoImportacion === 'historico' ? 'Histórico Semanal' : 'Campañas'}
                </div>
              </div>
            </div>
          </div>

              {errores.length > 0 && (
                <div className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-red-900 mb-3 text-lg">Errores Encontrados</h3>
                      <ul className="text-sm text-red-800 space-y-2 font-medium">
                        {errores.map((error, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-600">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Vista previa */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center gap-2">
                  <Table className="w-5 h-5" style={{ color: '#ef0000' }} />
                  <h3 className="font-bold text-gray-900 text-lg">Vista Previa de Datos</h3>
                  <span className="ml-auto text-sm text-gray-600 font-medium">
                    Mostrando primeros {Math.min(10, tipoImportacion === 'historico' ? historicoImportado.length : campanasImportadas.length)} de {tipoImportacion === 'historico' ? historicoImportado.length : campanasImportadas.length} registros
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10 border-b-2 border-gray-200">
                      <tr>
                      {tipoImportacion === 'historico' ? (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Campaña</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Semana</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Leads</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Costo</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Estado</th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Nombre</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">País</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Vertical</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Plataforma</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Dueño</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tipoImportacion === 'historico' ? (
                      <>
                        {historicoImportado.slice(0, 10).map((registro, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-700 font-medium">{registro.ID_CAMPANIA}</td>
                            <td className="px-4 py-3 font-bold text-gray-900">{registro.NOMBRE_CAMPANIA}</td>
                            <td className="px-4 py-3 text-gray-700 font-medium">{registro.SEMANA_ISO}</td>
                            <td className="px-4 py-3 text-gray-700 font-medium">{registro.LEADS}</td>
                            <td className="px-4 py-3 font-bold text-gray-900">${registro.COSTO_SEMANAL} USD</td>
                            <td className="px-4 py-3">
                              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold">
                                {registro.ESTADO_METRICAS}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {historicoImportado.length > 10 && (
                          <tr className="bg-gray-50">
                            <td colSpan={6} className="p-4 text-center text-gray-600 text-sm font-medium">
                              ... y {historicoImportado.length - 10} registros más
                            </td>
                          </tr>
                        )}
                      </>
                    ) : (
                      <>
                        {campanasImportadas.slice(0, 10).map((campana, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-700 font-medium">{campana.id}</td>
                            <td className="px-4 py-3 font-bold text-gray-900">{campana.nombre}</td>
                            <td className="px-4 py-3 text-gray-700 font-medium">{campana.pais}</td>
                            <td className="px-4 py-3 text-gray-700 font-medium">{campana.vertical}</td>
                            <td className="px-4 py-3 text-gray-700 font-medium">{campana.plataforma}</td>
                            <td className="px-4 py-3 font-bold text-gray-900">{campana.inicialesDueno}</td>
                          </tr>
                        ))}
                        {campanasImportadas.length > 10 && (
                          <tr className="bg-gray-50">
                            <td colSpan={6} className="p-4 text-center text-gray-600 text-sm font-medium">
                              ... y {campanasImportadas.length - 10} campañas más
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setPaso('seleccion')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-bold transition-all duration-200 shadow hover:shadow-md flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Volver
                </button>
                <button
                  onClick={importarCampanas}
                  className="px-8 py-3 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
                >
                  <Upload className="w-5 h-5" />
                  Importar {tipoImportacion === 'historico' ? historicoImportado.length : campanasImportadas.length} {tipoImportacion === 'historico' ? 'Registros' : 'Campañas'}
                </button>
              </div>
            </div>
          )}

          {paso === 'importando' && (
            <div className="text-center py-16">
              <Loader2 className="w-20 h-20 animate-spin text-primary-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Importando Datos...
              </h3>
              <p className="text-gray-600 font-medium text-base">
                Por favor espera mientras se procesan {tipoImportacion === 'historico' ? 'los registros históricos' : 'las campañas'}
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {paso === 'completado' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <div 
                  className="w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl"
                  style={{ background: 'linear-gradient(to bottom right, #22c55e, #16a34a)' }}
                >
                  <PartyPopper className="w-14 h-14 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  ¡Importación Completada!
                </h3>
                <p className="text-gray-700 text-lg font-medium">
                  {mensajeResultado ??
                    (tipoImportacion === 'historico'
                      ? `Se importaron exitosamente ${historicoImportado.length - errores.length} de ${historicoImportado.length} registros históricos`
                      : `Se importaron exitosamente ${campanasImportadas.length - errores.length} de ${campanasImportadas.length} campañas`)}
                </p>
                {errores.length === 0 && (
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-bold">
                    <CheckCircle className="w-5 h-5" />
                    Sin errores
                  </div>
                )}
              </div>

              {errores.length > 0 && (
                <div className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-red-900 mb-3 text-lg">
                        Errores en Importación ({errores.length})
                      </h3>
                      <ul className="text-sm text-red-800 space-y-2 max-h-48 overflow-y-auto font-medium">
                        {errores.map((error, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-600">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-6 border-t border-gray-200">
                <button
                  onClick={onCerrar}
                  className="px-10 py-4 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                  style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
                >
                  <CheckCircle className="w-5 h-5" />
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
