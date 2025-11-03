import { useState } from 'react';
import { useCampanaStore } from '../../store/useCampanaStore';
import { Pais, Vertical, Plataforma, Segmento } from '../../types';

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

    if (tipoImportacion === 'historico') {
      // Importar histórico
      try {
        const resultado = await importarHistorico(historicoImportado);
        if (resultado.exito) {
          exitosas = historicoImportado.length;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📊 Importar Campañas</h2>
            <p className="text-sm text-gray-600 mt-1">
              Importa campañas desde Google Sheets o archivos CSV
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {paso === 'seleccion' && (
            <div className="space-y-6">
              {/* Instrucciones */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Instrucciones de Importación</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Exporta tus campañas de Google Sheets como CSV</li>
                  <li>Descarga la plantilla de ejemplo para ver el formato</li>
                  <li>Sube el archivo CSV con tus campañas</li>
                  <li>Revisa la vista previa antes de importar</li>
                  <li>Confirma la importación</li>
                </ol>
              </div>

              {/* Botón descargar plantilla */}
              <div className="text-center">
                <button
                  onClick={descargarPlantilla}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  📄 Descargar Plantilla CSV
                </button>
              </div>

              {/* Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Selecciona archivo CSV o Excel
                  </p>
                  <p className="text-sm text-gray-500">
                    Formatos: CSV, XLSX, XLS
                  </p>
                </label>
              </div>
            </div>
          )}

          {paso === 'preview' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">✅ Archivo Procesado</h3>
            <p className="text-sm text-green-800">
              {tipoImportacion === 'historico' 
                ? `Se encontraron ${historicoImportado.length} registros históricos para importar`
                : `Se encontraron ${campanasImportadas.length} campañas para importar`
              }
            </p>
            <p className="text-xs text-green-700 mt-1">
              Tipo detectado: {tipoImportacion === 'historico' ? '📊 Histórico Semanal' : '🎯 Campañas'}
            </p>
          </div>

              {errores.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">❌ Errores Encontrados</h3>
                  <ul className="text-sm text-red-800 space-y-1">
                    {errores.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Vista previa */}
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {tipoImportacion === 'historico' ? (
                        <>
                          <th className="px-3 py-2 text-left">ID</th>
                          <th className="px-3 py-2 text-left">Campaña</th>
                          <th className="px-3 py-2 text-left">Semana</th>
                          <th className="px-3 py-2 text-left">Leads</th>
                          <th className="px-3 py-2 text-left">Costo</th>
                          <th className="px-3 py-2 text-left">Estado</th>
                        </>
                      ) : (
                        <>
                          <th className="px-3 py-2 text-left">ID</th>
                          <th className="px-3 py-2 text-left">Nombre</th>
                          <th className="px-3 py-2 text-left">País</th>
                          <th className="px-3 py-2 text-left">Vertical</th>
                          <th className="px-3 py-2 text-left">Plataforma</th>
                          <th className="px-3 py-2 text-left">Dueño</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {tipoImportacion === 'historico' ? (
                      <>
                        {historicoImportado.slice(0, 10).map((registro, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="px-3 py-2">{registro.ID_CAMPANIA}</td>
                            <td className="px-3 py-2 font-medium">{registro.NOMBRE_CAMPANIA}</td>
                            <td className="px-3 py-2">{registro.SEMANA_ISO}</td>
                            <td className="px-3 py-2">{registro.LEADS}</td>
                            <td className="px-3 py-2">${registro.COSTO_SEMANAL} USD</td>
                            <td className="px-3 py-2">{registro.ESTADO_METRICAS}</td>
                          </tr>
                        ))}
                        {historicoImportado.length > 10 && (
                          <tr>
                            <td colSpan={6} className="p-3 text-center text-gray-500 text-sm">
                              ... y {historicoImportado.length - 10} registros más
                            </td>
                          </tr>
                        )}
                      </>
                    ) : (
                      <>
                        {campanasImportadas.slice(0, 10).map((campana, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="px-3 py-2">{campana.id}</td>
                            <td className="px-3 py-2 font-medium">{campana.nombre}</td>
                            <td className="px-3 py-2">{campana.pais}</td>
                            <td className="px-3 py-2">{campana.vertical}</td>
                            <td className="px-3 py-2">{campana.plataforma}</td>
                            <td className="px-3 py-2">{campana.inicialesDueno}</td>
                          </tr>
                        ))}
                        {campanasImportadas.length > 10 && (
                          <tr>
                            <td colSpan={6} className="p-3 text-center text-gray-500 text-sm">
                              ... y {campanasImportadas.length - 10} campañas más
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setPaso('seleccion')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={importarCampanas}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Importar {tipoImportacion === 'historico' ? historicoImportado.length : campanasImportadas.length} {tipoImportacion === 'historico' ? 'Registros Históricos' : 'Campañas'}
                </button>
              </div>
            </div>
          )}

          {paso === 'importando' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Importando Campañas...
              </h3>
              <p className="text-gray-500">
                Por favor espera mientras se procesan las campañas
              </p>
            </div>
          )}

          {paso === 'completado' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Importación Completada
                </h3>
                <p className="text-gray-500">
                  Se importaron {campanasImportadas.length - errores.length} de {campanasImportadas.length} campañas
                </p>
              </div>

              {errores.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">❌ Errores en Importación</h3>
                  <ul className="text-sm text-red-800 space-y-1 max-h-40 overflow-y-auto">
                    {errores.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={onCerrar}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
