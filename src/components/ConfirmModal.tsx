import { AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  descripcion: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  cargando?: boolean;
}

// Modal de confirmación antes de eliminar — previene borrados accidentales
export default function ConfirmModal({ descripcion, onConfirmar, onCancelar, cargando }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onCancelar()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-fade-in-up">
        {/* Ícono advertencia */}
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
        </div>

        {/* Texto */}
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-slate-900">¿Eliminar transacción?</h3>
          <p className="text-sm text-slate-500">
            Se eliminará permanentemente{' '}
            <span className="font-semibold text-slate-700">"{descripcion}"</span>.
            Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancelar}
            disabled={cargando}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={cargando}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-red-100"
          >
            {cargando
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
