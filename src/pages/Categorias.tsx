import { useState } from 'react';
import { Plus, Tag, Trash2, Loader2, AlertCircle } from 'lucide-react';
import type { Category, FormCategoria, TransactionType, OpResult } from '../types';

interface Props {
  categories: Category[];
  onCrear: (f: FormCategoria) => Promise<OpResult>;
  onEliminar: (id: string) => Promise<OpResult>;
  loading: boolean;
}

const COLORES_PRESET = [
  '#2563eb','#10b981','#ef4444','#f59e0b','#8b5cf6',
  '#06b6d4','#ec4899','#84cc16','#f97316','#6366f1',
];

const FORM_INIT: FormCategoria = { name: '', type: 'expense', color: '#2563eb' };

export default function Categorias({ categories, onCrear, onEliminar, loading }: Props) {
  const [form, setForm] = useState<FormCategoria>(FORM_INIT);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const ingresos = categories.filter(c => c.type === 'income');
  const gastos = categories.filter(c => c.type === 'expense');

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }
    setGuardando(true);
    setError(null);
    const res = await onCrear({ ...form, name: form.name.trim() });
    setGuardando(false);
    if (res.success) { setForm(FORM_INIT); }
    else { setError(res.error || 'Error al crear categoría'); }
  };

  const handleEliminar = async (id: string) => {
    if (confirmId !== id) { setConfirmId(id); return; }
    setEliminandoId(id);
    await onEliminar(id);
    setEliminandoId(null);
    setConfirmId(null);
  };

  const CatList = ({ cats, tipo }: { cats: Category[], tipo: TransactionType }) => (
    <div className="card p-5 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-5 rounded-full ${tipo === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <h3 className="font-bold text-slate-800 text-sm">
          {tipo === 'income' ? 'Ingresos' : 'Gastos'}
        </h3>
        <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {cats.length}
        </span>
      </div>
      {cats.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-slate-300 gap-2">
          <Tag className="w-8 h-8" />
          <p className="text-xs text-slate-400">Sin categorías aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cats.map(cat => (
            <div key={cat.id} className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all group
              ${confirmId === cat.id ? 'border-red-200 bg-red-50' : 'border-slate-100 hover:border-slate-200 bg-white'}
            `}>
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: cat.color }} />
              <span className="flex-1 text-sm font-semibold text-slate-700">{cat.name}</span>
              <button
                onClick={() => handleEliminar(cat.id)}
                disabled={eliminandoId === cat.id}
                title={confirmId === cat.id ? 'Confirmar eliminación' : 'Eliminar'}
                className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                  confirmId === cat.id
                    ? 'opacity-100 bg-red-500 text-white hover:bg-red-600'
                    : 'hover:bg-red-50 text-slate-400 hover:text-red-500'
                }`}
              >
                {eliminandoId === cat.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Trash2 className="w-3.5 h-3.5" />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Formulario de nueva categoría */}
        <div className="card p-6 animate-fade-in-up">
          <h3 className="font-bold text-slate-800 text-sm mb-5 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            Nueva Categoría
          </h3>
          <form onSubmit={handleCrear} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Nombre */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre</label>
                <input
                  type="text" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Alimentación, Transporte..."
                  className="input-base"
                />
              </div>
              {/* Tipo */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as TransactionType }))}
                  className="input-base"
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLORES_PRESET.map(c => (
                  <button
                    key={c} type="button"
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-7 h-7 rounded-lg transition-all ${
                      form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ background: c }}
                  />
                ))}
                <input
                  type="color" value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="w-7 h-7 rounded-lg cursor-pointer border-2 border-slate-200"
                  title="Color personalizado"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={guardando} className="btn-primary">
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {guardando ? 'Guardando...' : 'Crear categoría'}
            </button>
          </form>
        </div>

        {/* Listas */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CatList cats={ingresos} tipo="income" />
            <CatList cats={gastos} tipo="expense" />
          </div>
        )}
      </div>
    </div>
  );
}
