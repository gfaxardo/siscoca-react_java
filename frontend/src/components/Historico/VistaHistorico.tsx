import { useState, useEffect } from 'react';
import { useCampanaStore } from '../../store/useCampanaStore';
import { HistoricoSemanal } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ListaCampanasArchivadas from '../Campanas/ListaCampanasArchivadas';
import { 
  X, 
  Download, 
  LayoutGrid, 
  List, 
  TrendingUp, 
  Search, 
  Calendar, 
  BarChart3,
  MousePointer,
  Target,
  DollarSign,
  Users,
  Car,
  RefreshCw,
  Archive,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface VistaHistoricoProps {
  onCerrar: () => void;
}

export default function VistaHistorico({ onCerrar }: VistaHistoricoProps) {
  const { historico, obtenerHistorico } = useCampanaStore();
  const [historicoFiltrado, setHistoricoFiltrado] = useState<HistoricoSemanal[]>([]);
  const [semanaFiltro, setSemanaFiltro] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');
  const [vistaActiva, setVistaActiva] = useState<'lista' | 'tarjetas'>('tarjetas');

  // Recargar histórico cuando se abre la vista
  useEffect(() => {
    console.log('VistaHistorico: Recargando histórico...');
    obtenerHistorico().then(() => {
      console.log('VistaHistorico: Histórico recargado');
    }).catch((err) => {
      console.error('VistaHistorico: Error recargando histórico:', err);
    });
  }, []);

  // Si la vista es tarjetas, mostrar ListaCampanasArchivadas
  if (vistaActiva === 'tarjetas') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-hidden animate-fadeIn">
        <div className="bg-white w-full h-full overflow-hidden flex flex-col">
          {/* Header modernizado */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 border-b border-white/10 flex-shrink-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
                >
                  <Archive className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Histórico</h2>
                  <p className="text-gray-400 text-sm">Campañas Archivadas</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Toggle de vista */}
                <div className="flex rounded-xl border-2 border-white/20 overflow-hidden bg-white/10 backdrop-blur-sm">
                  <button
                    onClick={() => setVistaActiva('tarjetas')}
                    className="px-4 py-2.5 text-sm font-bold transition-all text-white flex items-center gap-2"
                    style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Vista Tarjetas
                  </button>
                  <button
                    onClick={() => setVistaActiva('lista')}
                    className="px-4 py-2.5 text-sm font-bold transition-all text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    <List className="w-4 h-4" />
                    Vista Lista
                  </button>
                </div>

                {/* Botón cerrar */}
                <button
                  onClick={onCerrar}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  aria-label="Cerrar"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="p-4 lg:p-6">
              <ListaCampanasArchivadas />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Agrupar por semana
  useEffect(() => {
    console.log('VistaHistorico: Histórico actualizado, cantidad:', historico.length);
  }, [historico]);

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
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'INCOMPLETA':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'NO_ACTUALIZADA':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header modernizado */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 border-b border-white/10 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
              >
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white">Histórico Semanal</h2>
                <p className="text-gray-400 text-sm font-medium">
                  {historicoFiltrado.length} registro{historicoFiltrado.length !== 1 ? 's' : ''} archivado{historicoFiltrado.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Toggle de vista */}
              <div className="flex rounded-xl border-2 border-white/20 overflow-hidden bg-white/10 backdrop-blur-sm">
                <button
                  onClick={() => setVistaActiva('tarjetas')}
                  className="px-4 py-2.5 text-sm font-bold transition-all text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Tarjetas
                </button>
                <button
                  onClick={() => setVistaActiva('lista')}
                  className="px-4 py-2.5 text-sm font-bold transition-all text-white flex items-center gap-2"
                  style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
                >
                  <List className="w-4 h-4" />
                  Lista
                </button>
              </div>

              {/* Botón exportar */}
              <button
                onClick={descargarHistorico}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Exportar CSV</span>
              </button>

              {/* Botón cerrar */}
              <button
                onClick={onCerrar}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Filtros modernizados */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-6 border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Filtrar por Semana
                </label>
                <select
                  value={semanaFiltro}
                  onChange={(e) => setSemanaFiltro(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white hover:border-gray-400 font-medium text-sm"
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
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Buscar
                </label>
                <input
                  type="text"
                  placeholder="Buscar por nombre, ID, dueño..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white hover:border-gray-400 font-medium text-sm"
                />
              </div>
            </div>
          </div>

          {/* Lista de histórico */}
          {historicoFiltrado.length === 0 ? (
            <div className="text-center py-16">
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(to bottom right, #6b7280, #4b5563)' }}
              >
                <Archive className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No hay registros históricos
              </h3>
              <p className="text-gray-600 mb-4 font-medium">
                Las campañas archivadas aparecerán aquí
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Total en store: {historico.length} | Filtrados: {historicoFiltrado.length}
              </p>
              <button
                onClick={() => obtenerHistorico()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-5 h-5" />
                Recargar Histórico
              </button>
            </div>
          ) : (
            <div className="space-y-5">
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
                  <div key={semana} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                    {/* Header de semana */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-5 py-4 border-b-2 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-blue-900 text-lg">
                              Semana {semana}
                            </h3>
                            <p className="text-sm text-blue-700 font-medium">
                              {items.length} campaña{items.length !== 1 ? 's' : ''} • {format(items[0].fechaArchivo, 'dd/MM/yyyy', { locale: es })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Lista de campañas */}
                    <div className="divide-y divide-gray-200">
                      {items.map((item) => {
                        const getEstadoIcon = (estado: string) => {
                          switch (estado) {
                            case 'COMPLETA':
                              return <CheckCircle className="w-5 h-5 text-green-600" />;
                            case 'INCOMPLETA':
                              return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
                            case 'NO_ACTUALIZADA':
                              return <XCircle className="w-5 h-5 text-red-600" />;
                            default:
                              return <BarChart3 className="w-5 h-5 text-gray-600" />;
                          }
                        };

                        return (
                          <div key={item.id} className="p-5 hover:bg-gray-50 transition-colors duration-200">
                            {/* Nombre y estado */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 text-base mb-2">{item.nombre}</h4>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <span className="bg-gray-100 px-3 py-1 rounded-lg text-gray-900 font-bold">
                                    ID: {item.idCampana}
                                  </span>
                                  <span className="bg-purple-100 px-3 py-1 rounded-lg text-purple-900 font-bold flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {item.nombreDueno}
                                  </span>
                                </div>
                              </div>
                              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${obtenerColorEstado(item.estadoMetricas)} flex-shrink-0`}>
                                {getEstadoIcon(item.estadoMetricas)}
                                {item.estadoMetricas}
                              </div>
                            </div>
                            
                            {/* Métricas */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-1 mb-1">
                                  <BarChart3 className="w-3.5 h-3.5 text-gray-600" />
                                  <p className="text-gray-600 text-xs font-bold">Alcance</p>
                                </div>
                                <p className="font-bold text-gray-900">{item.alcance?.toLocaleString() || '-'}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-1 mb-1">
                                  <MousePointer className="w-3.5 h-3.5 text-gray-600" />
                                  <p className="text-gray-600 text-xs font-bold">Clics</p>
                                </div>
                                <p className="font-bold text-gray-900">{item.clics?.toLocaleString() || '-'}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-1 mb-1">
                                  <Target className="w-3.5 h-3.5 text-gray-600" />
                                  <p className="text-gray-600 text-xs font-bold">Leads</p>
                                </div>
                                <p className="font-bold text-gray-900">{item.leads?.toLocaleString() || '-'}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-1 mb-1">
                                  <DollarSign className="w-3.5 h-3.5 text-gray-600" />
                                  <p className="text-gray-600 text-xs font-bold">Costo</p>
                                </div>
                                <p className="font-bold text-gray-900">S/ {item.costoSemanal?.toFixed(2) || '-'}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-1 mb-1">
                                  <Users className="w-3.5 h-3.5 text-gray-600" />
                                  <p className="text-gray-600 text-xs font-bold">Registros</p>
                                </div>
                                <p className="font-bold text-gray-900">{item.conductoresRegistrados || '-'}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-1 mb-1">
                                  <Car className="w-3.5 h-3.5 text-gray-600" />
                                  <p className="text-gray-600 text-xs font-bold">Conductores</p>
                                </div>
                                <p className="font-bold text-gray-900">{item.conductoresPrimerViaje || '-'}</p>
                              </div>
                            </div>
                            
                            {/* Fecha de archivado */}
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Archive className="w-3.5 h-3.5" />
                                <span className="font-medium">
                                  Archivado: {format(item.fechaArchivo, 'dd/MM/yyyy HH:mm', { locale: es })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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