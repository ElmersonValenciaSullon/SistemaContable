import { useState } from 'react';
import { TrendingUp, TrendingDown, Trash2, Pencil } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import ConfirmModal from './ConfirmModal';
import type { Transaction, OpResult } from '../types';

interface Props {
  tx: Transaction;
  onEliminar: (id: string) => Promise<OpResult>;
  onEditar: (tx: Transaction) => void;
}

export default function TransaccionRow({ tx, onEliminar, onEditar }: Props) {
  // FIX: reemplazar el doble-clic confirmando por un modal de confirmación
  // Antes: primer clic = fondo rojo, segundo clic = elimina (confuso + marcaba múltiples filas)
  // Ahora: un clic = abre modal "¿Eliminar esta transacción?"
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const handleConfirmar = async () => {
    setEliminando(true);
    await onEliminar(tx.id);
    setEliminando(false);
    setMostrarConfirm(false);
  };

  return (
    <>
      <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-slate-100 bg-white transition-all duration-200 hover:border-blue-100 hover:bg-blue-50/30 group">
        {/* Ícono tipo */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {tx.type === 'income'
            ? <TrendingUp className="w-[18px] h-[18px] text-emerald-600" />
            : <TrendingDown className="w-[18px] h-[18px] text-red-500" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">{tx.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-400">{formatDate(tx.transaction_date)}</span>
            {tx.categories && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: tx.categories.color + '20', color: tx.categories.color }}>
                {tx.categories.name}
              </span>
            )}
          </div>
          {tx.notes && <p className="text-xs text-slate-400 italic mt-0.5 truncate">{tx.notes}</p>}
        </div>

        {/* Monto */}
        <div className="text-right flex-shrink-0">
          <p className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
            {tx.type === 'income' ? '+' : '−'} {formatCurrency(tx.amount)}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEditar(tx)}
            className="p-1.5 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition-colors"
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMostrarConfirm(true)}
            title="Eliminar"
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {mostrarConfirm && (
        <ConfirmModal
          descripcion={tx.description}
          onConfirmar={handleConfirmar}
          onCancelar={() => setMostrarConfirm(false)}
          cargando={eliminando}
        />
      )}
    </>
  );
}
