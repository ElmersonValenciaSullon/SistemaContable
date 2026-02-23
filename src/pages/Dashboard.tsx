import { TrendingUp, TrendingDown, ArrowUpRight, Wallet2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import TransaccionRow from '../components/TransaccionRow';
import { formatCurrency } from '../utils/formatters';
import type { DashboardMetrics, Transaction, OpResult } from '../types';

interface Props {
  metrics: DashboardMetrics | null;
  loading: boolean;
  recentTxs: Transaction[];
  onEliminar: (id: string) => Promise<OpResult>;
  onEditar: (tx: Transaction) => void;
  onVerHistorial: () => void;
}

export default function Dashboard({ metrics, loading, recentTxs, onEliminar, onEditar, onVerHistorial }: Props) {
  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400 font-medium">Cargando tus datos...</p>
      </div>
    </div>
  );

  const { balance, incomeChange, expenseChange, topCategories, weeklyTrend } = metrics ?? {
    balance: { totalBalance: 0, totalIncome: 0, totalExpenses: 0 },
    incomeChange: 0, expenseChange: 0, topCategories: [], weeklyTrend: [],
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Balance Disponible" value={balance.totalBalance} tipo="balance"
          change={incomeChange - expenseChange} trend={weeklyTrend} primary />
        <StatCard title="Ingresos del Mes" value={balance.totalIncome}
          tipo="income" change={incomeChange} trend={weeklyTrend} />
        <StatCard title="Gastos del Mes" value={balance.totalExpenses}
          tipo="expense" change={expenseChange} trend={weeklyTrend} />
      </div>

      {/* ── Fila media ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Gráfico de barras semanal */}
        <div className="card p-5 lg:col-span-3 animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Actividad Semanal</h3>
              <p className="text-xs text-slate-400 mt-0.5">Últimos 7 días</p>
            </div>
          </div>
          {weeklyTrend.length > 0
            ? <BarChart data={weeklyTrend} />
            : <div className="flex items-center justify-center h-32 text-slate-300 text-sm">Sin movimientos esta semana</div>
          }
        </div>

        {/* Top categorías */}
        <div className="card p-5 lg:col-span-2 animate-fade-in-up stagger-3">
          <h3 className="font-bold text-slate-800 text-sm mb-4">
            Gastos por <span className="text-blue-600">Categoría</span>
          </h3>
          {topCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-300 gap-2">
              <TrendingDown className="w-8 h-8" />
              <p className="text-xs">Sin gastos categorizados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topCategories.map(cat => (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                      <span className="text-xs font-semibold text-slate-700">{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">{formatCurrency(cat.total)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${cat.percentage}%`, background: cat.color }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">{cat.percentage}% del total</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Transacciones recientes ── */}
      <div className="card p-5 animate-fade-in-up stagger-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Movimientos Recientes</h3>
            <p className="text-xs text-slate-400 mt-0.5">Últimas 10 transacciones</p>
          </div>
          <button
            onClick={onVerHistorial}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Ver todo <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTxs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-300 gap-3">
            <Wallet2 className="w-12 h-12" />
            <p className="text-sm font-medium text-slate-400">Aún no hay transacciones</p>
            <p className="text-xs text-slate-300">Usa los botones de arriba para registrar tu primer movimiento</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTxs.slice(0, 10).map(tx => (
              <TransaccionRow key={tx.id} tx={tx} onEliminar={onEliminar} onEditar={onEditar} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
