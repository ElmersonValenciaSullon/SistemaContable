import { useState, useMemo } from 'react';
import { Search, Filter, X, TrendingUp, TrendingDown } from 'lucide-react';
import TransaccionRow from '../components/TransaccionRow';
import { formatCurrency } from '../utils/formatters';
import type { Transaction, Category, OpResult, FiltrosHistorial, TransactionType } from '../types';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  onEliminar: (id: string) => Promise<OpResult>;
  onEditar: (tx: Transaction) => void;
  busqueda: string;
  onBusqueda: (v: string) => void;
}

const FILTROS_INIT: FiltrosHistorial = {
  tipo: 'all', busqueda: '', fechaDesde: '', fechaHasta: '', categoriaId: '',
};

export default function Historial({ transactions, categories, onEliminar, onEditar, busqueda, onBusqueda }: Props) {
  const [filtros, setFiltros] = useState<FiltrosHistorial>(FILTROS_INIT);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const setF = <K extends keyof FiltrosHistorial>(k: K, v: FiltrosHistorial[K]) =>
    setFiltros(f => ({ ...f, [k]: v }));

  const filtradas = useMemo(() => transactions.filter(tx => {
    if (filtros.tipo !== 'all' && tx.type !== filtros.tipo) return false;
    if (busqueda && !tx.description.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtros.fechaDesde && tx.transaction_date < filtros.fechaDesde) return false;
    if (filtros.fechaHasta && tx.transaction_date > filtros.fechaHasta) return false;
    if (filtros.categoriaId && tx.category_id !== filtros.categoriaId) return false;
    return true;
  }), [transactions, busqueda, filtros]);

  const totalFiltrado = filtradas.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0);
  const hayFiltros = filtros.tipo !== 'all' || filtros.fechaDesde || filtros.fechaHasta || filtros.categoriaId;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 animate-fade-in">

      {/* Barra de filtros */}
      <div className="card p-4">
        {/* Fila principal */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Búsqueda móvil */}
          <div className="relative flex-1 min-w-48 md:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Buscar..." value={busqueda}
              onChange={e => onBusqueda(e.target.value)}
              className="input-base pl-9 py-2"
            />
          </div>

          {/* Toggle tipo */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5">
            {(['all', 'income', 'expense'] as const).map(t => (
              <button
                key={t}
                onClick={() => setF('tipo', t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filtros.tipo === t
                    ? t === 'income' ? 'bg-emerald-500 text-white shadow-sm'
                      : t === 'expense' ? 'bg-red-500 text-white shadow-sm'
                      : 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'all' ? 'Todos' : t === 'income' ? 'Ingresos' : 'Gastos'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`btn-ghost text-xs py-1.5 ${hayFiltros ? 'border-blue-300 text-blue-600 bg-blue-50' : ''}`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtros {hayFiltros && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
          </button>

          {hayFiltros && (
            <button onClick={() => setFiltros(FILTROS_INIT)} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
              <X className="w-3 h-3" />Limpiar
            </button>
          )}

          {/* Balance neto */}
          <div className={`ml-auto text-sm font-extrabold ${totalFiltrado >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {totalFiltrado >= 0 ? '+' : ''}{formatCurrency(totalFiltrado)}
          </div>
        </div>

        {/* Filtros avanzados */}
        {mostrarFiltros && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Desde</label>
              <input type="date" value={filtros.fechaDesde} onChange={e => setF('fechaDesde', e.target.value)} className="input-base py-2" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Hasta</label>
              <input type="date" value={filtros.fechaHasta} onChange={e => setF('fechaHasta', e.target.value)} className="input-base py-2" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Categoría</label>
              <select value={filtros.categoriaId} onChange={e => setF('categoriaId', e.target.value)} className="input-base py-2">
                <option value="">Todas</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Conteo */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-slate-400 font-medium">
          {filtradas.length} transacción{filtradas.length !== 1 ? 'es' : ''}
        </p>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            {formatCurrency(filtradas.filter(t => t.type === 'income').reduce((s,t)=>s+t.amount,0))}
          </span>
          <span className="flex items-center gap-1 text-red-500 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            {formatCurrency(filtradas.filter(t => t.type === 'expense').reduce((s,t)=>s+t.amount,0))}
          </span>
        </div>
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 font-medium">No hay transacciones con estos filtros.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map(tx => (
            <TransaccionRow key={tx.id} tx={tx} onEliminar={onEliminar} onEditar={onEditar} />
          ))}
        </div>
      )}
    </div>
  );
}
