import { Plus, Search, Menu, Bell } from 'lucide-react';
import type { AppPage, TransactionType } from '../types';

interface Props {
  pagina: AppPage;
  onNueva: (t: TransactionType) => void;
  onMenuMovil: () => void;
  busqueda?: string;
  onBusqueda?: (v: string) => void;
}

const TITULOS: Record<AppPage, { titulo: string; sub: string }> = {
  dashboard: { titulo: 'Dashboard', sub: 'Resumen de tus finanzas en soles' },
  historial: { titulo: 'Historial', sub: 'Todos tus movimientos registrados' },
  categorias: { titulo: 'Categorías', sub: 'Organiza tus ingresos y gastos' },
};

export default function Topbar({ pagina, onNueva, onMenuMovil, busqueda, onBusqueda }: Props) {
  const { titulo, sub } = TITULOS[pagina];

  return (
    <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-slate-100 flex-shrink-0">
      {/* Hamburguesa móvil */}
      <button onClick={onMenuMovil} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-500">
        <Menu className="w-5 h-5" />
      </button>

      {/* Título */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-extrabold text-slate-900 leading-tight">{titulo}</h1>
        <p className="text-xs text-slate-400 hidden sm:block">{sub}</p>
      </div>

      {/* Búsqueda inline (solo historial) */}
      {pagina === 'historial' && onBusqueda !== undefined && (
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={e => onBusqueda(e.target.value)}
            className="input-base pl-9 py-2 w-52"
          />
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors relative">
          <Bell className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={() => onNueva('income')}
          className="btn-primary text-xs py-2 px-3 hidden sm:flex"
        >
          <Plus className="w-3.5 h-3.5" />
          Ingreso
        </button>
        <button
          onClick={() => onNueva('expense')}
          className="btn-ghost text-xs py-2 px-3 hidden sm:flex text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
        >
          <Plus className="w-3.5 h-3.5" />
          Gasto
        </button>
        {/* FAB móvil */}
        <button
          onClick={() => onNueva('income')}
          className="btn-primary p-2 sm:hidden"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
