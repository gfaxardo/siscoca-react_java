import { useState } from 'react';
import { Campana } from '../../types';
import { Search, Filter, X, Flag, Globe, Target, BarChart3, Smartphone, User, Clock } from 'lucide-react';

interface FiltrosCampanasProps {
  campanas: Campana[];
  onFiltrar: (campanasFiltradas: Campana[]) => void;
}

interface Filtros {
  estado: string;
  segmento: string;
  pais: string;
  vertical: string;
  plataforma: string;
  dueno: string;
  tiempoActiva: string;
  busqueda: string;
}

export default function FiltrosCampanas({ campanas, onFiltrar }: FiltrosCampanasProps) {
  const [filtros, setFiltros] = useState<Filtros>({
    estado: '',
    segmento: '',
    pais: '',
    vertical: '',
    plataforma: '',
    dueno: '',
    tiempoActiva: '',
    busqueda: ''
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const aplicarFiltros = () => {
    let campanasFiltradas = [...campanas];

    // Filtro por estado
    if (filtros.estado) {
      campanasFiltradas = campanasFiltradas.filter(c => c.estado === filtros.estado);
    }

    // Filtro por segmento
    if (filtros.segmento) {
      campanasFiltradas = campanasFiltradas.filter(c => c.segmento === filtros.segmento);
    }

    // Filtro por país
    if (filtros.pais) {
      campanasFiltradas = campanasFiltradas.filter(c => c.pais === filtros.pais);
    }

    // Filtro por vertical
    if (filtros.vertical) {
      campanasFiltradas = campanasFiltradas.filter(c => c.vertical === filtros.vertical);
    }

    // Filtro por plataforma
    if (filtros.plataforma) {
      campanasFiltradas = campanasFiltradas.filter(c => c.plataforma === filtros.plataforma);
    }

    // Filtro por dueño
    if (filtros.dueno) {
      campanasFiltradas = campanasFiltradas.filter(c => c.nombreDueno === filtros.dueno);
    }

    // Filtro por tiempo activa
    if (filtros.tiempoActiva) {
      const ahora = new Date();
      campanasFiltradas = campanasFiltradas.filter(c => {
        const diasActiva = Math.floor((ahora.getTime() - c.fechaCreacion.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filtros.tiempoActiva) {
          case '1': return diasActiva <= 1;
          case '7': return diasActiva <= 7;
          case '30': return diasActiva <= 30;
          case '90': return diasActiva <= 90;
          default: return true;
        }
      });
    }

    // Filtro por búsqueda (nombre, objetivo, etc.)
    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase();
      campanasFiltradas = campanasFiltradas.filter(c => 
        c.nombre.toLowerCase().includes(busquedaLower) ||
        c.objetivo.toLowerCase().includes(busquedaLower) ||
        c.descripcion.toLowerCase().includes(busquedaLower) ||
        c.id.toLowerCase().includes(busquedaLower)
      );
    }

    onFiltrar(campanasFiltradas);
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      segmento: '',
      pais: '',
      vertical: '',
      plataforma: '',
      dueno: '',
      tiempoActiva: '',
      busqueda: ''
    });
    onFiltrar(campanas);
  };

  // Obtener valores únicos para los selects
  const estadosUnicos = [...new Set(campanas.map(c => c.estado))];
  const segmentosUnicos = [...new Set(campanas.map(c => c.segmento))];
  const paisesUnicos = [...new Set(campanas.map(c => c.pais))];
  const verticalesUnicas = [...new Set(campanas.map(c => c.vertical))];
  const plataformasUnicas = [...new Set(campanas.map(c => c.plataforma))];
  const duenosUnicos = [...new Set(campanas.map(c => c.nombreDueno))];

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-4 lg:p-5">
      {/* Barra de búsqueda principal */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar campañas por nombre, ID, objetivo..."
            value={filtros.busqueda}
            onChange={(e) => {
              setFiltros({ ...filtros, busqueda: e.target.value });
              // Búsqueda en tiempo real
              setTimeout(() => {
                setFiltros(prev => ({ ...prev, busqueda: e.target.value }));
                aplicarFiltros();
              }, 300);
            }}
            className="w-full pl-11 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 font-medium"
          />
        </div>
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="px-5 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow hover:shadow-lg"
        >
          <Filter className="w-4 h-4" />
          {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>
        {(Object.values(filtros).some(v => v !== '')) && (
          <button
            onClick={limpiarFiltros}
            className="px-5 py-3 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow hover:shadow-lg text-white hover:scale-105"
            style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Filtros avanzados */}
      {mostrarFiltros && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Estado */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Flag className="w-4 h-4" style={{ color: '#ef0000' }} />
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium"
              >
                <option value="">Todos los estados</option>
                {estadosUnicos.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>

            {/* Segmento */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: '#ef0000' }} />
                Segmento
              </label>
              <select
                value={filtros.segmento}
                onChange={(e) => setFiltros({ ...filtros, segmento: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium"
              >
                <option value="">Todos los segmentos</option>
                {segmentosUnicos.map(segmento => (
                  <option key={segmento} value={segmento}>{segmento}</option>
                ))}
              </select>
            </div>

            {/* País */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" style={{ color: '#ef0000' }} />
                País
              </label>
              <select
                value={filtros.pais}
                onChange={(e) => setFiltros({ ...filtros, pais: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium"
              >
                <option value="">Todos los países</option>
                {paisesUnicos.map(pais => (
                  <option key={pais} value={pais}>{pais === 'PE' ? 'Perú' : 'Colombia'}</option>
                ))}
              </select>
            </div>

            {/* Vertical */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: '#ef0000' }} />
                Vertical
              </label>
              <select
                value={filtros.vertical}
                onChange={(e) => setFiltros({ ...filtros, vertical: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium"
              >
                <option value="">Todas las verticales</option>
                {verticalesUnicas.map(vertical => (
                  <option key={vertical} value={vertical}>{vertical}</option>
                ))}
              </select>
            </div>

            {/* Plataforma */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4" style={{ color: '#ef0000' }} />
                Plataforma
              </label>
              <select
                value={filtros.plataforma}
                onChange={(e) => setFiltros({ ...filtros, plataforma: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium"
              >
                <option value="">Todas las plataformas</option>
                {plataformasUnicas.map(plataforma => (
                  <option key={plataforma} value={plataforma}>{plataforma}</option>
                ))}
              </select>
            </div>

            {/* Dueño */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" style={{ color: '#ef0000' }} />
                Dueño
              </label>
              <select
                value={filtros.dueno}
                onChange={(e) => setFiltros({ ...filtros, dueno: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium"
              >
                <option value="">Todos los dueños</option>
                {duenosUnicos.map(dueno => (
                  <option key={dueno} value={dueno}>{dueno}</option>
                ))}
              </select>
            </div>

            {/* Tiempo activa */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: '#ef0000' }} />
                Tiempo
              </label>
              <select
                value={filtros.tiempoActiva}
                onChange={(e) => setFiltros({ ...filtros, tiempoActiva: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium"
              >
                <option value="">Cualquier tiempo</option>
                <option value="1">Último día</option>
                <option value="7">Última semana</option>
                <option value="30">Último mes</option>
                <option value="90">Últimos 3 meses</option>
              </select>
            </div>
          </div>

          {/* Botón aplicar filtros */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={aplicarFiltros}
              className="px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow hover:shadow-lg text-white hover:scale-105"
              style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
            >
              <Filter className="w-4 h-4" />
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

