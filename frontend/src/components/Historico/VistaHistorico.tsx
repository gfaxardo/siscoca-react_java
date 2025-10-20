import { useState, useEffect } from 'react';
import { useCampanaStore } from '../../store/useCampanaStore';
import { HistoricoSemanal } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface VistaHistoricoProps {
  onCerrar: () => void;
}

export default function VistaHistorico({ onCerrar }: VistaHistoricoProps) {
  const { historico } = useCampanaStore();
  const [historicoFiltrado, setHistoricoFiltrado] = useState<HistoricoSemanal[]>([]);
  const [semanaFiltro, setSemanaFiltro] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');

  // Agrupar por semana
  const historicoPorSemana = historico.reduce((acc, item) => {
    const semana = item.semanaISO;
    if (!acc[semana]) {
      acc[semana] = [];
    }
    acc[semana].push(item);
    return acc;
  }, {} as Record<number, HistoricoSemanal[]>);

  const semanasDisponibles = Object.keys(historicoPorSemana)
    .map(Number)
    .sort((a, b) => b - a); // Más recientes primero

  useEffect(() => {
    let filtrado = [...historico];

    // Filtrar por semana
    if (semanaFiltro) {
      filtrado = filtrado.filter(item => item.semanaISO.toString() === semanaFiltro);
    }

    // Filtrar por búsqueda
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      filtrado = filtrado.filter(item => 
        item.nombre.toLowerCase().includes(busquedaLower) ||
        item.idCampana.toLowerCase().includes(busquedaLower) ||
        item.nombreDueno.toLowerCase().includes(busquedaLower) ||
        item.objetivo.toLowerCase().includes(busquedaLower)
      );
    }

    setHistoricoFiltrado(filtrado);
  }, [historico, semanaFiltro, busqueda]);

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'COMPLETA':
        return 'bg-green-100 text-green-800';
      case 'INCOMPLETA':
        return 'bg-yellow-100 text-yellow-800';
      case 'NO_ACTUALIZADA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const descargarHistorico = () => {
    const csv = [
      // Headers
      [
        'ID', 'Campaña', 'Semana', 'País', 'Vertical', 'Plataforma', 'Segmento',
        'Dueño', 'Objetivo', 'Alcance', 'Clics', 'Leads', 'Costo Semanal',
        'Conductores Registrados', 'Conductores Primer Viaje',
        'Costo por Conductor Registrado', 'Costo por Conductor Primer Viaje',
        'Estado Métricas', 'Fecha Archivado'
      ].join(','),
      
      // Data
      ...historicoFiltrado.map(item => [
        item.idCampana,
        `"${item.nombre}"`,
        item.semanaISO,
        item.pais,
        item.vertical,
        item.plataforma,
        item.segmento,
        item.nombreDueno,
        `"${item.objetivo}"`,
        item.alcance || 0,
        item.clics || 0,
        item.leads || 0,
        item.costoSemanal || 0,
        item.conductoresRegistrados || 0,
        item.conductoresPrimerViaje || 0,
        item.costoConductorRegistrado || 0,
        item.costoConductorPrimerViaje || 0,
        item.estadoMetricas,
        format(item.fechaArchivo, 'dd/MM/yyyy HH:mm', { locale: es })
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_semanal_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📊 Histórico Semanal</h2>
            <p className="text-sm text-gray-600 mt-1">
              {historicoFiltrado.length} registro{historicoFiltrado.length !== 1 ? 's' : ''} archivado{historicoFiltrado.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={descargarHistorico}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              📥 Exportar CSV
            </button>
            <button
              onClick={onCerrar}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Filtros */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Semana</label>
                <select
                  value={semanaFiltro}
                  onChange={(e) => setSemanaFiltro(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todas las semanas</option>
                  {semanasDisponibles.map(semana => (
                    <option key={semana} value={semana.toString()}>
                      Semana {semana} ({historicoPorSemana[semana].length} campaña{historicoPorSemana[semana].length !== 1 ? 's' : ''})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
                <input
                  type="text"
                  placeholder="Buscar por nombre, ID, dueño..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Lista de histórico */}
          {historicoFiltrado.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay registros históricos
              </h3>
              <p className="text-gray-500">
                Las campañas archivadas aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(
                historicoFiltrado.reduce((acc, item) => {
                  const semana = item.semanaISO;
                  if (!acc[semana]) acc[semana] = [];
                  acc[semana].push(item);
                  return acc;
                }, {} as Record<number, HistoricoSemanal[]>)
              )
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([semana, items]) => (
                  <div key={semana} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">
                        Semana {semana} ({items.length} campaña{items.length !== 1 ? 's' : ''})
                      </h3>
                      <p className="text-sm text-gray-600">
                        {format(items[0].fechaArchivo, 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {items.map((item) => (
                        <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{item.nombre}</h4>
                              <p className="text-sm text-gray-600">ID: {item.idCampana} | Dueño: {item.nombreDueno}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${obtenerColorEstado(item.estadoMetricas)}`}>
                              {item.estadoMetricas}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs">Alcance</p>
                              <p className="font-semibold">{item.alcance?.toLocaleString() || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Clics</p>
                              <p className="font-semibold">{item.clics?.toLocaleString() || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Leads</p>
                              <p className="font-semibold">{item.leads?.toLocaleString() || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Costo Semanal</p>
                              <p className="font-semibold">S/ {item.costoSemanal?.toFixed(2) || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Conductores</p>
                              <p className="font-semibold">{item.conductoresRegistrados || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Primer Viaje</p>
                              <p className="font-semibold">{item.conductoresPrimerViaje || '-'}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-xs text-gray-500">
                            Archivado: {format(item.fechaArchivo, 'dd/MM/yyyy HH:mm', { locale: es })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}