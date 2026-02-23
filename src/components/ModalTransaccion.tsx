import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { hoy } from '../utils/formatters';
import type { Category, FormTransaccion, TransactionType, Transaction, OpResult } from '../types';

interface Props {
  onClose: () => void;
  onGuardar: (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'categories'>) => Promise<OpResult>;
  categories: Category[];
  tipoInicial?: TransactionType;
  transaccionEditar?: Transaction | null;
}

const FORM_INICIAL: FormTransaccion = {
  type: 'income', amount: '', description: '',
  transaction_date: hoy(), category_id: '', notes: '',
};

export default function ModalTransaccion({ onClose, onGuardar, categories, tipoInicial = 'income', transaccionEditar }: Props) {
  const [form, setForm] = useState<FormTransaccion>(() =>
    transaccionEditar
      ? {
          type: transaccionEditar.type,
          amount: transaccionEditar.amount.toString(),
          description: transaccionEditar.description,
          transaction_date: transaccionEditar.transaction_date,
          category_id: transaccionEditar.category_id || '',
          notes: transaccionEditar.notes || '',
        }
      : { ...FORM_INICIAL, type: tipoInicial }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resetear categoría al cambiar tipo
  useEffect(() => {
    setForm(f => ({ ...f, category_id: '' }));
  }, [form.type]);

  const catsFiltradas = categories.filter(c => c.type === form.type);

  const setField = <K extends keyof FormTransaccion>(k: K, v: FormTransaccion[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const monto = parseFloat(form.amount);
    if (isNaN(monto) || monto <= 0) { setError('El monto debe ser mayor a 0'); return; }
    if (!form.description.trim()) { setError('La descripción es obligatoria'); return; }

    setLoading(true);
    const resultado = await onGuardar({
      type: form.type,
      amount: monto,
      description: form.description.trim(),
      transaction_date: form.transaction_date,
      category_id: form.category_id || null,
      notes: form.notes.trim() || null,
    });
    setLoading(false);
    if (resultado.success) { onClose(); }
    else { setError(resultado.error || 'Error al guardar'); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="card w-full max-w-md animate-fade-in-up overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            {transaccionEditar ? 'Editar Transacción' : 'Nueva Transacción'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Toggle ingreso/gasto */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            {(['income', 'expense'] as TransactionType[]).map(t => (
              <button
                key={t} type="button"
                onClick={() => setField('type', t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  form.type === t
                    ? t === 'income'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-red-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'income' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {t === 'income' ? 'Ingreso' : 'Gasto'}
              </button>
            ))}
          </div>

          {/* Monto */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monto (S/.)</label>
            <input
              type="number" step="0.01" min="0.01" required
              value={form.amount} onChange={e => setField('amount', e.target.value)}
              placeholder="0.00"
              className="input-base text-lg font-bold"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</label>
            <input
              type="text" required
              value={form.description} onChange={e => setField('description', e.target.value)}
              placeholder="Ej: Sueldo, Almuerzo, Pasaje..."
              className="input-base"
            />
          </div>

          {/* Fecha y Categoría en grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</label>
              <input
                type="date" required
                value={form.transaction_date} onChange={e => setField('transaction_date', e.target.value)}
                className="input-base"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoría</label>
              <select
                value={form.category_id} onChange={e => setField('category_id', e.target.value)}
                className="input-base"
              >
                <option value="">Sin categoría</option>
                {catsFiltradas.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notas (opcional)</label>
            <textarea
              value={form.notes} onChange={e => setField('notes', e.target.value)}
              placeholder="Detalles adicionales..."
              rows={2} className="input-base resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm py-3 px-4 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancelar</button>
            <button
              type="submit" disabled={loading}
              className={`flex-1 justify-center py-2.5 rounded-xl font-semibold text-sm text-white transition-all flex items-center gap-2
                ${form.type === 'income'
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-100'
                  : 'bg-red-500 hover:bg-red-600 shadow-md shadow-red-100'
                } disabled:opacity-60`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (transaccionEditar ? 'Guardar cambios' : `Registrar ${form.type === 'income' ? 'ingreso' : 'gasto'}`)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
