import { Campana } from '../../types';
import { subWeeks, startOfWeek, endOfWeek, format } from 'date-fns';
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
}

// Función para calcular semana ISO
const obtenerSemanaISO = (fecha: Date): number => {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 + week1.getDay() + 1) / 7);
};

export default function GraficosMetricas({ campana, historico, historicoSemanas = [] }: GraficosMetricasProps) {
  // Obtener datos de las últimas 3 semanas
  const obtenerDatosUltimas3Semanas = (): DatosSemana[] => {
    const ahora = new Date();
    const ultimas3Semanas = Array.from({ length: 3 }, (_, i) => {
      const semana = subWeeks(ahora, 2 - i);
      const inicioSemana = startOfWeek(semana, { weekStartsOn: 1 });
      const finSemana = endOfWeek(semana, { weekStartsOn: 1 });
      
      // Buscar en histórico general por semana
      const registrosSemana = historico.filter(h => {
        const fechaArchivo = new Date(h.fechaArchivo);
        return fechaArchivo >= inicioSemana && fechaArchivo <= finSemana && h.idCampana === campana.id;
      });

      // Buscar en histórico semanal específico de la campaña
      const historicoSemanalSemana = historicoSemanas.filter(h => h.semanaISO === semanaISO);

      // Si no hay datos históricos, usar datos actuales de la campaña (solo para la semana actual)
      const esSemanaActual = i === 2; // La última semana es la actual
      const datosActuales = esSemanaActual ? {
        alcance: campana.alcance || 0,
        leads: campana.leads || 0,
        costo: campana.costoSemanal || 0,
        conductores: campana.conductoresRegistrados || 0
      } : { alcance: 0, leads: 0, costo: 0, conductores: 0 };

      // Combinar datos del histórico semanal específico
      const datosHistoricoSemanal = historicoSemanalSemana.reduce((acc, h) => ({
        alcance: acc.alcance + (h.alcance || 0),
        leads: acc.leads + (h.leads || 0),
        costo: acc.costo + (h.costoSemanal || 0),
        conductores: acc.conductores + (h.conductoresRegistrados || 0)
      }), { alcance: 0, leads: 0, costo: 0, conductores: 0 });

      const semanaISO = obtenerSemanaISO(inicioSemana);
      
      return {
        semana: format(inicioSemana, 'dd/MM', { locale: es }),
        numeroSemana: semanaISO,
        alcance: registrosSemana.reduce((sum, r) => sum + (r.alcance || 0), 0) + datosActuales.alcance + datosHistoricoSemanal.alcance,
        leads: registrosSemana.reduce((sum, r) => sum + (r.leads || 0), 0) + datosActuales.leads + datosHistoricoSemanal.leads,
        costo: registrosSemana.reduce((sum, r) => sum + (r.costoSemanal || 0), 0) + datosActuales.costo + datosHistoricoSemanal.costo,
        conductores: registrosSemana.reduce((sum, r) => sum + (r.conductoresRegistrados || 0), 0) + datosActuales.conductores + datosHistoricoSemanal.conductores,
      };
    });

    return ultimas3Semanas;
  };

  const datosSemanas = obtenerDatosUltimas3Semanas();

  // Función para crear un gráfico de línea simple con CSS
  const crearGraficoLinea = (datos: number[], color: string, titulo: string) => {
    const maxValor = Math.max(...datos, 1); // Evitar división por 0
    const minValor = Math.min(...datos);
    const rango = maxValor - minValor || 1;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-semibold text-gray-600">{titulo}</h4>
          <span className="text-xs text-gray-500">
            {datos[datos.length - 1]?.toLocaleString() || '0'}
          </span>
        </div>
        <div className="relative h-8 bg-gray-50 rounded">
          <svg className="w-full h-full" viewBox="0 0 100 32" preserveAspectRatio="none">
            <polyline
              points={datos.map((valor, index) => {
                const x = (index * 50) + 25;
                const y = 16 - ((valor - minValor) / rango) * 12;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {datos.map((valor, index) => {
              const x = (index * 50) + 25;
              const y = 16 - ((valor - minValor) / rango) * 12;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill={color}
                />
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          {datosSemanas.map((semana, index) => (
            <span key={index}>S{semana.numeroSemana}</span>
          ))}
        </div>
      </div>
    );
  };

  // Verificar si hay datos para mostrar
  const tieneDatos = datosSemanas.some(semana => 
    semana.alcance > 0 || semana.leads > 0 || semana.costo > 0 || semana.conductores > 0
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
        <h3 className="text-sm font-semibold text-gray-700">📈 Evolución (Últimas 3 semanas)</h3>
        <div className="text-xs text-gray-500">
          {datosSemanas[0]?.semana} - {datosSemanas[2]?.semana}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {crearGraficoLinea(
          datosSemanas.map(s => s.alcance),
          '#3b82f6',
          'Alcance'
        )}
        
        {crearGraficoLinea(
          datosSemanas.map(s => s.leads),
          '#10b981',
          'Leads'
        )}
        
        {crearGraficoLinea(
          datosSemanas.map(s => s.costo),
          '#f59e0b',
          'Costo (USD)'
        )}
        
        {crearGraficoLinea(
          datosSemanas.map(s => s.conductores),
          '#8b5cf6',
          'Conductores'
        )}
      </div>
    </div>
  );
}
