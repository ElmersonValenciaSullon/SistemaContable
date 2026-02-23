import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPct } from '../utils/formatters';
import MiniChart from './MiniChart';
import type { DayTrend } from '../types';

interface Props {
  title: string;
  value: number;
  change?: number;
  tipo: 'income' | 'expense' | 'balance';
  trend?: DayTrend[];
  primary?: boolean; // tarjeta azul principal
}

export default function StatCard({ title, value, change, tipo, trend, primary }: Props) {
  const isPositive = (change ?? 0) >= 0;

  if (primary) {
    return (
      <div className="stat-card-primary p-6 text-white animate-fade-in-up stagger-1">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-extrabold tracking-tight">{formatCurrency(value)}</p>
          </div>
          <div className="bg-white/15 px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider">PEN</div>
        </div>
        {trend && (
          <div className="opacity-80">
            <MiniChart data={trend} tipo="balance" height={44} />
          </div>
        )}
        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-3">
            {isPositive
              ? <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              : <TrendingDown className="w-3.5 h-3.5 text-red-300" />
            }
            <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-300' : 'text-red-300'}`}>
              {formatPct(change)}
            </span>
            <span className="text-blue-200 text-xs">vs mes anterior</span>
          </div>
        )}
      </div>
    );
  }

  const accent = tipo === 'income'
    ? { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' }
    : { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' };

  return (
    <div className="card card-hover p-5 animate-fade-in-up">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(value)}</p>
        </div>
        <div className={`w-9 h-9 rounded-xl ${accent.bg} flex items-center justify-center`}>
          <div className={`w-2.5 h-2.5 rounded-full ${accent.dot}`} />
        </div>
      </div>
      {trend && <MiniChart data={trend} tipo={tipo} height={40} />}
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          {isPositive
            ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            : <TrendingDown className="w-3.5 h-3.5 text-red-500" />
          }
          <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatPct(change)}
          </span>
          <span className="text-slate-400 text-xs">vs mes anterior</span>
        </div>
      )}
    </div>
  );
}
