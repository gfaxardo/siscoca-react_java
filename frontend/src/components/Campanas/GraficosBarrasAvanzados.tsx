import { Campana } from '../../types';
import { subWeeks, startOfWeek, endOfWeek, format, getISOWeek } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistoricoSemanalCampana {
  id: string;
  idCampana: string;
  semanaISO: number;
  fechaSemana: Date;
  alcance?: number;
  clics?: number;
  leads?: number;
  costoSemanal?: number;
  costoLead?: number;
  conductoresRegistrados?: number;
  conductoresPrimerViaje?: number;
  fechaRegistro: Date;
  registradoPor: string;
}

interface GraficosBarrasAvanzadosProps {
  campana: Campana;
  historico: any[];
  historicoSemanas?: HistoricoSemanalCampana[];
}

interface DatosSemana {
  semana: string;
  numeroSemana: number;
  alcance: number;
  leads: number;
  costo: number;
  conductoresRegistrados: number;
  conductoresPrimerViaje: number;
  clics: number;
}

// Función para calcular semana ISO correctamente usando date-fns
const obtenerSemanaISO = (fecha: Date): number => {
  return getISOWeek(fecha);
};

export default function GraficosBarrasAvanzados({ campana, historico, historicoSemanas = [] }: GraficosBarrasAvanzadosProps) {
  // Obtener datos de las últimas 5 semanas
  const obtenerDatosUltimas5Semanas = (): DatosSemana[] => {
    const ahora = new Date();
    const ultimas5Semanas = Array.from({ length: 5 }, (_, i) => {
      const semana = subWeeks(ahora, 4 - i);
      const inicioSemana = startOfWeek(semana, { weekStartsOn: 1 });
      const finSemana = endOfWeek(semana, { weekStartsOn: 1 });
      
      // Calcular semanaISO PRIMERO
      const semanaISO = obtenerSemanaISO(inicioSemana);
      
      // Buscar en histórico general por semana
      const registrosSemana = historico.filter(h => {
        const fechaArchivo = new Date(h.fechaArchivo);
        return fechaArchivo >= inicioSemana && fechaArchivo <= finSemana && h.idCampana === campana.id;
      });

      // Buscar en histórico semanal específico de la campaña usando el semanaISO calculado
      const historicoSemanalSemana = historicoSemanas.filter(h => h.semanaISO === semanaISO);

      // Si no hay datos históricos, usar datos actuales de la campaña (solo para la semana actual)
      const esSemanaActual = i === 4; // La última semana es la actual
      const datosActuales = esSemanaActual ? {
        alcance: campana.alcance || 0,
        clics: campana.clics || 0,
        leads: campana.leads || 0,
        costo: campana.costoSemanal || 0,
        conductoresRegistrados: campana.conductoresRegistrados || 0,
        conductoresPrimerViaje: campana.conductoresPrimerViaje || 0
      } : { alcance: 0, clics: 0, leads: 0, costo: 0, conductoresRegistrados: 0, conductoresPrimerViaje: 0 };

      // Combinar datos del histórico semanal específico
      const datosHistoricoSemanal = historicoSemanalSemana.reduce((acc, h) => ({
        alcance: acc.alcance + (h.alcance || 0),
        clics: acc.clics + (h.clics || 0),
        leads: acc.leads + (h.leads || 0),
        costo: acc.costo + (h.costoSemanal || 0),
        conductoresRegistrados: acc.conductoresRegistrados + (h.conductoresRegistrados || 0),
        conductoresPrimerViaje: acc.conductoresPrimerViaje + (h.conductoresPrimerViaje || 0)
      }), { alcance: 0, clics: 0, leads: 0, costo: 0, conductoresRegistrados: 0, conductoresPrimerViaje: 0 });
      
      return {
        semana: format(inicioSemana, 'dd/MM', { locale: es }),
        numeroSemana: semanaISO,
        alcance: registrosSemana.reduce((sum, r) => sum + (r.alcance || 0), 0) + datosActuales.alcance + datosHistoricoSemanal.alcance,
        clics: registrosSemana.reduce((sum, r) => sum + (r.clics || 0), 0) + datosActuales.clics + datosHistoricoSemanal.clics,
        leads: registrosSemana.reduce((sum, r) => sum + (r.leads || 0), 0) + datosActuales.leads + datosHistoricoSemanal.leads,
        costo: registrosSemana.reduce((sum, r) => sum + (r.costoSemanal || 0), 0) + datosActuales.costo + datosHistoricoSemanal.costo,
        conductoresRegistrados: registrosSemana.reduce((sum, r) => sum + (r.conductoresRegistrados || 0), 0) + datosActuales.conductoresRegistrados + datosHistoricoSemanal.conductoresRegistrados,
        conductoresPrimerViaje: registrosSemana.reduce((sum, r) => sum + (r.conductoresPrimerViaje || 0), 0) + datosActuales.conductoresPrimerViaje + datosHistoricoSemanal.conductoresPrimerViaje,
      };
    });

    return ultimas5Semanas;
  };

  const datosSemanas = obtenerDatosUltimas5Semanas();

  // Función para calcular porcentaje de conversión
  const calcularPorcentaje = (valor: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100 * 100) / 100; // Redondeo a 2 decimales
  };

  // Función para calcular luminosidad de un color y decidir si usar texto claro u oscuro
  const getLuminosidad = (hex: string): number => {
    // Eliminar el # si existe
    const hexLimpio = hex.replace('#', '');
    // Convertir cada par de caracteres a número decimal
    const rgb = hexLimpio.match(/../g)?.map(v => parseInt(v, 16)) || [0, 0, 0];
    const [r, g, b] = rgb.map(v => {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const getTextoColorSegunFondo = (colorFondo: string): string => {
    const luminosidad = getLuminosidad(colorFondo);
    return luminosidad > 0.5 ? '#000000' : '#ffffff'; // Negro para fondos claros, blanco para oscuros
  };

  // Función para crear un gráfico de barras con porcentajes de conversión
  const crearGraficoBarrasConConversion = (
    datos: number[], 
    color: string, 
    titulo: string, 
    unidad: string = '', 
    datosBase?: number[]
  ) => {
    const maxValor = Math.max(...datos, 1); // Evitar división por 0

    // Calcular porcentaje si hay datos base
    const porcentaje = datosBase && datosBase.length > 0 
      ? calcularPorcentaje(datos[datos.length - 1], datosBase[datosBase.length - 1])
      : null;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center gap-2">
          <h4 className="text-xs font-semibold text-gray-700 truncate">{titulo}</h4>
          <div className="text-right flex-shrink-0">
            <span className="text-sm font-bold text-gray-900">
              {datos[datos.length - 1]?.toLocaleString() || '0'}
            </span>
            {unidad && <span className="text-xs text-gray-500 ml-1">{unidad}</span>}
            {porcentaje !== null && (
              <span className="text-xs text-gray-600 ml-2 font-medium">
                {porcentaje}%
              </span>
            )}
          </div>
        </div>
        
        {/* Gráfico de barras con altura fija y proporción correcta */}
        <div className="relative h-12 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-end justify-between h-full px-1 py-0.5">
            {datos.map((valor, index) => {
              const altura = maxValor > 0 ? (valor / maxValor) * 100 : 0;
              const esValorCero = valor === 0;
              
              return (
                <div
                  key={index}
                  className="flex flex-col items-center justify-end flex-1 mx-0.5 group"
                  style={{ height: '100%', minWidth: '6px' }}
                >
                  {/* Tooltip interactivo mejorado */}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap shadow-lg">
                    <div className="font-semibold">Semana {datosSemanas[index]?.numeroSemana || index + 1}</div>
                    <div>{titulo}: <span className="font-bold">{valor.toLocaleString()}</span> {unidad}</div>
                    {/* Triángulo del tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                  
                  {/* Barra principal */}
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 hover:opacity-90 relative cursor-pointer flex items-center justify-center ${
                      esValorCero ? 'bg-gray-200' : ''
                    }`}
                    style={{
                      height: `${Math.max(altura, esValorCero ? 8 : 4)}%`, // Mínimo 4% para valores > 0, 8% para ceros
                      backgroundColor: esValorCero ? '#e5e7eb' : color,
                      minHeight: esValorCero ? '8px' : '4px'
                    }}
                    title={`Semana ${datosSemanas[index]?.numeroSemana || index + 1}: ${valor.toLocaleString()} ${unidad}`}
                  >
                    {/* Indicador de valor dentro de la barra */}
                    {valor > 0 && altura >= 30 && (
                      <div 
                        className="text-[9px] font-bold leading-none px-0.5 text-center truncate w-full"
                        style={{ 
                          color: getTextoColorSegunFondo(esValorCero ? '#e5e7eb' : color),
                          textShadow: '0 0 2px rgba(0,0,0,0.3)'
                        }}
                      >
                        {valor >= 1000 ? `${(valor / 1000).toFixed(1)}K` : valor.toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  {/* Punto de datos */}
                  {valor > 0 && (
                    <div
                      className="w-1 h-1 rounded-full mt-1"
                      style={{ backgroundColor: color }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    );
  };

  // Verificar si hay datos para mostrar
  const tieneDatos = datosSemanas.some(semana => 
    semana.alcance > 0 || semana.leads > 0 || semana.costo > 0 || semana.conductoresRegistrados > 0 || semana.conductoresPrimerViaje > 0
  );

  if (!tieneDatos) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm" style={{ minHeight: '280px' }}>
        <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-gray-900 mb-1">Sin datos de evolución</p>
          <p className="text-xs text-gray-500 text-center max-w-xs">Los gráficos aparecerán cuando se suban métricas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-3 space-y-3 border border-gray-200 shadow-sm" style={{ minHeight: '280px' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-800">📊 Evolución (Últimas 5 semanas)</h3>
        <div className="text-xs text-gray-500">
          {datosSemanas[0]?.semana} - {datosSemanas[4]?.semana}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {/* Alcance - Base del funnel */}
        {crearGraficoBarrasConConversion(
          datosSemanas.map(s => s.alcance),
          '#3b82f6',
          'Alcance',
          ''
        )}
        
        {/* Clics - Con porcentaje de conversión desde Alcance */}
        {crearGraficoBarrasConConversion(
          datosSemanas.map(s => s.clics),
          '#10b981',
          'Clics',
          '',
          datosSemanas.map(s => s.alcance)
        )}
        
        {/* Leads - Con porcentaje de conversión desde Clics */}
        {crearGraficoBarrasConConversion(
          datosSemanas.map(s => s.leads),
          '#f59e0b',
          'Leads',
          '',
          datosSemanas.map(s => s.clics)
        )}
        
        {/* Registros - Con porcentaje de conversión desde Leads */}
        {crearGraficoBarrasConConversion(
          datosSemanas.map(s => s.conductoresRegistrados),
          '#8b5cf6',
          'Registros',
          '',
          datosSemanas.map(s => s.leads)
        )}
        
        {/* Conductores Primer Viaje - Con porcentaje de conversión desde Registros */}
        {crearGraficoBarrasConConversion(
          datosSemanas.map(s => s.conductoresPrimerViaje),
          '#06b6d4',
          'Conductores',
          '',
          datosSemanas.map(s => s.conductoresRegistrados)
        )}
        
        {/* Costo - Sin porcentaje */}
        {crearGraficoBarrasConConversion(
          datosSemanas.map(s => s.costo),
          '#ef4444',
          'Costo',
          'USD'
        )}
      </div>
    </div>
  );
}
