import { ShieldCheck, LayoutDashboard, History, Tag, LogOut, ChevronRight } from 'lucide-react';
import type { AppPage } from '../types';

interface Props {
  pagina: AppPage;
  setPagina: (p: AppPage) => void;
  email: string;
  onLogout: () => void;
  collapsed?: boolean;
}

const NAV_ITEMS: { id: AppPage; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'historial', label: 'Historial', icon: <History className="w-4 h-4" /> },
  { id: 'categorias', label: 'Categorías', icon: <Tag className="w-4 h-4" /> },
];

export default function Sidebar({ pagina, setPagina, email, onLogout }: Props) {
  const inicial = email.substring(0, 2).toUpperCase();

  return (
    <aside className="flex flex-col w-60 bg-white border-r border-slate-100 h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <span className="font-extrabold text-slate-800 text-base tracking-tight">SolConta</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Menú</p>
        {NAV_ITEMS.map(item => {
          const active = pagina === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPagina(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
            </button>
          );
        })}
      </nav>

      {/* Usuario */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {inicial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-700 truncate">{email}</p>
            <p className="text-[10px] text-slate-400">Cuenta activa</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
