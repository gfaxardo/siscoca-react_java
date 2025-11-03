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
  costoConductor?: number;
  fechaRegistro: Date;
  registradoPor: string;
}

interface GraficosMetricasProps {
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
  conductores: number;
  costoConductor: number;
}

// Función para calcular semana ISO correctamente usando date-fns
const obtenerSemanaISO = (fecha: Date): number => {
  return getISOWeek(fecha);
};

export default function GraficosMetricas({ campana, historico, historicoSemanas = [] }: GraficosMetricasProps) {
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
        leads: campana.leads || 0,
        costo: campana.costoSemanal || 0,
        conductores: campana.conductoresRegistrados || 0,
        costoConductor: campana.costoConductor || 0
      } : { alcance: 0, leads: 0, costo: 0, conductores: 0, costoConductor: 0 };

      // Combinar datos del histórico semanal específico
      const datosHistoricoSemanal = historicoSemanalSemana.reduce((acc, h) => ({
        alcance: acc.alcance + (h.alcance || 0),
        leads: acc.leads + (h.leads || 0),
        costo: acc.costo + (h.costoSemanal || 0),
        conductores: acc.conductores + (h.conductoresRegistrados || 0),
        costoConductor: acc.costoConductor + (h.costoConductor || 0)
      }), { alcance: 0, leads: 0, costo: 0, conductores: 0, costoConductor: 0 });
      
      return {
        semana: format(inicioSemana, 'dd/MM', { locale: es }),
        numeroSemana: semanaISO,
        alcance: registrosSemana.reduce((sum, r) => sum + (r.alcance || 0), 0) + datosActuales.alcance + datosHistoricoSemanal.alcance,
        leads: registrosSemana.reduce((sum, r) => sum + (r.leads || 0), 0) + datosActuales.leads + datosHistoricoSemanal.leads,
        costo: registrosSemana.reduce((sum, r) => sum + (r.costoSemanal || 0), 0) + datosActuales.costo + datosHistoricoSemanal.costo,
        conductores: registrosSemana.reduce((sum, r) => sum + (r.conductoresRegistrados || 0), 0) + datosActuales.conductores + datosHistoricoSemanal.conductores,
        costoConductor: registrosSemana.reduce((sum, r) => sum + (r.costoConductor || 0), 0) + datosActuales.costoConductor + datosHistoricoSemanal.costoConductor,
      };
    });

    return ultimas5Semanas;
  };

  const datosSemanas = obtenerDatosUltimas5Semanas();

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

  // Función para crear un gráfico de barras con CSS
  const crearGraficoBarras = (datos: number[], color: string, titulo: string) => {
    const maxValor = Math.max(...datos, 1); // Evitar división por 0

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-semibold text-gray-600">{titulo}</h4>
          <span className="text-xs text-gray-500">
            {datos[datos.length - 1]?.toLocaleString() || '0'}
          </span>
        </div>
        <div className="relative h-12 bg-gray-50 rounded overflow-hidden">
          <div className="flex items-end justify-between h-full px-1">
            {datos.map((valor, index) => {
              const altura = maxValor > 0 ? (valor / maxValor) * 100 : 0;
              const semana = datosSemanas[index];
              return (
                <div
                  key={index}
                  className="group relative flex flex-col items-center justify-end flex-1 mx-0.5"
                  style={{ height: '100%' }}
                >
                  {/* Tooltip interactivo */}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap shadow-lg">
                    <div className="font-semibold">Semana {semana?.numeroSemana || index + 1}</div>
                    <div>{titulo}: <span className="font-bold">{valor.toLocaleString()}</span></div>
                    {/* Triángulo del tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                  {/* Barra */}
                  <div
                    className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80 cursor-pointer flex items-center justify-center"
                    style={{
                      height: `${Math.max(altura, 2)}%`, // Mínimo 2% para que se vea
                      backgroundColor: color,
                      minHeight: valor > 0 ? '4px' : '0px'
                    }}
                    title={`Semana ${semana?.numeroSemana || index + 1}: ${valor.toLocaleString()}`}
                  >
                    {/* Indicador de valor dentro de la barra */}
                    {valor > 0 && altura >= 30 && (
                      <div 
                        className="text-[9px] font-bold leading-none px-0.5 text-center truncate w-full"
                        style={{ 
                          color: getTextoColorSegunFondo(color),
                          textShadow: '0 0 2px rgba(0,0,0,0.3)'
                        }}
                      >
                        {valor >= 1000 ? `${(valor / 1000).toFixed(1)}K` : valor.toLocaleString()}
                      </div>
                    )}
                  </div>
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
    semana.alcance > 0 || semana.leads > 0 || semana.costo > 0 || semana.conductores > 0 || semana.costoConductor > 0
  );

  if (!tieneDatos) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <div className="text-2xl mb-2">📊</div>
        <p className="text-sm text-gray-500">Sin datos de evolución</p>
        <p className="text-xs text-gray-400">Los gráficos aparecerán cuando se suban métricas</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">📊 Evolución (Últimas 5 semanas)</h3>
        <div className="text-xs text-gray-500">
          {datosSemanas[0]?.semana} - {datosSemanas[4]?.semana}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {crearGraficoBarras(
          datosSemanas.map(s => s.alcance),
          '#3b82f6',
          'Alcance'
        )}
        
        {crearGraficoBarras(
          datosSemanas.map(s => s.leads),
          '#10b981',
          'Leads'
        )}
        
        {crearGraficoBarras(
          datosSemanas.map(s => s.costo),
          '#f59e0b',
          'Costo'
        )}
        
        {crearGraficoBarras(
          datosSemanas.map(s => s.conductores),
          '#8b5cf6',
          'Registros'
        )}
        
        {crearGraficoBarras(
          datosSemanas.map(s => s.costoConductor || 0),
          '#ef4444',
          'Costo por Conductor'
        )}
      </div>
    </div>
  );
}
