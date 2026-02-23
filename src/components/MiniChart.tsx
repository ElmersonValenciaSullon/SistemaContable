import type { DayTrend } from '../types';

interface Props {
  data: DayTrend[];
  tipo: 'income' | 'expense' | 'balance';
  height?: number;
}

// Gráfico de línea SVG ultraligero — sin dependencias externas
export default function MiniChart({ data, tipo, height = 48 }: Props) {
  if (!data.length) return null;

  const values = data.map(d =>
    tipo === 'income' ? d.income :
    tipo === 'expense' ? d.expense :
    d.income - d.expense
  );

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const W = 120;
  const H = height;
  const pad = 4;

  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return `${x},${y}`;
  });

  const polyline = pts.join(' ');
  const areaPath = `M${pts[0]} L${pts.join(' L')} L${W - pad},${H} L${pad},${H} Z`;

  const color = tipo === 'income' ? '#10b981' : tipo === 'expense' ? '#ef4444' : '#2563eb';
  const areaColor = tipo === 'income' ? '#d1fae5' : tipo === 'expense' ? '#fee2e2' : '#dbeafe';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${tipo}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={areaColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={areaColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${tipo})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Punto final */}
      <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="3" fill={color} />
    </svg>
  );
}
