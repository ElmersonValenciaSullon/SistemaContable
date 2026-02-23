import type { DayTrend } from '../types';
import { formatCurrency } from '../utils/formatters';

interface Props { data: DayTrend[]; }

// Gráfico de barras SVG para el dashboard — ingreso vs gasto por día
export default function BarChart({ data }: Props) {
  if (!data.length) return null;

  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);
  const H = 120;
  const barW = 16;
  const gap = 8;
  const groupW = barW * 2 + gap + 12;
  const W = groupW * data.length;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 28}`} className="w-full" style={{ minWidth: 280 }}>
        {data.map((d, i) => {
          const x = i * groupW + 4;
          const incH = (d.income / maxVal) * H;
          const expH = (d.expense / maxVal) * H;

          return (
            <g key={d.date}>
              {/* Barra ingreso */}
              <rect
                x={x} y={H - incH} width={barW} height={incH}
                rx={4} fill="#10b981" opacity="0.85"
                className="transition-all duration-300"
              />
              {/* Barra gasto */}
              <rect
                x={x + barW + gap} y={H - expH} width={barW} height={expH}
                rx={4} fill="#ef4444" opacity="0.75"
                className="transition-all duration-300"
              />
              {/* Label día */}
              <text
                x={x + barW + gap / 2} y={H + 18}
                textAnchor="middle"
                fontSize="10" fill="#94a3b8"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight="500"
              >
                {d.label.slice(0, 3)}
              </text>
            </g>
          );
        })}
        {/* Línea base */}
        <line x1="0" y1={H} x2={W} y2={H} stroke="#e2e8f0" strokeWidth="1" />
      </svg>

      {/* Leyenda */}
      <div className="flex items-center gap-5 mt-2 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#10b981]" />
          <span className="text-xs text-slate-500 font-medium">Ingresos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#ef4444]" />
          <span className="text-xs text-slate-500 font-medium">Gastos</span>
        </div>
      </div>
    </div>
  );
}
