import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  History,
  PieChart,
  LogOut,
  Bell,
  Search,
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatCurrency } from './utils/formatters';
import { supabase } from './lib/supabase';
import Auth from './pages/Auth';
import type { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [balance] = useState({
    total: 2450.75,
    income: 5200.00,
    expenses: 2749.25
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const recentTransactions = [
    { id: '1', type: 'income', amount: 3500, description: 'Sueldo Febrero', date: 'HOY' },
    { id: '2', type: 'expense', amount: 45.50, description: 'Almuerzo Menu', date: 'AYER' },
    { id: '3', type: 'expense', amount: 120.00, description: 'Supermercado Metro', date: '22 FEB' },
    { id: '4', type: 'income', amount: 150.00, description: 'Venta de audifonos', date: '20 FEB' },
  ];

  return (
    <div className="min-h-screen bg-background premium-gradient-bg flex text-slate-900 dark:text-slate-100">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-income/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="w-72 glass-card m-6 rounded-[2rem] hidden lg:flex flex-col p-8 space-y-10 relative z-10 border-white/50">
        <div className="flex items-center space-x-4 px-2">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 rotate-3">
            <Wallet className="text-white w-7 h-7" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground">SolConta</span>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4">Menú Principal</p>
          <a href="#" className="flex items-center space-x-3 px-5 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all scale-[1.02]">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-5 py-4 text-muted-foreground hover:bg-secondary/50 rounded-2xl font-medium transition-all hover:translate-x-1">
            <History className="w-5 h-5" />
            <span>Historial</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-5 py-4 text-muted-foreground hover:bg-secondary/50 rounded-2xl font-medium transition-all hover:translate-x-1">
            <TrendingUp className="w-5 h-5" />
            <span>Reportes</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-5 py-4 text-muted-foreground hover:bg-secondary/50 rounded-2xl font-medium transition-all hover:translate-x-1">
            <PieChart className="w-5 h-5" />
            <span>Categorías</span>
          </a>
        </nav>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-5 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl w-full font-bold transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 space-y-10 overflow-y-auto relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Panel Principal</h1>
            <p className="text-muted-foreground font-medium">Controla tus finanzas en soles con precisión.</p>
          </div>
          <div className="flex items-center space-x-4 bg-white/40 dark:bg-slate-900/40 p-2 rounded-3xl border border-white/20 backdrop-blur-sm">
            <div className="relative hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar transacción..."
                className="pl-12 pr-6 py-3 bg-transparent border-none focus:outline-none w-64 font-medium"
              />
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            <button className="p-3 relative hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all">
              <Bell className="w-6 h-6" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>
            </button>
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-sm">
              {session?.user?.email?.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Main Balance Card (Visual Polish) */}
          <div className="lg:col-span-1 glass-card p-10 bg-primary/95 text-white flex flex-col justify-between min-h-[260px] rounded-[3rem] shadow-2xl shadow-primary/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform scale-150 rotate-12 group-hover:scale-[1.7] transition-transform duration-700">
              <Wallet className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 font-bold uppercase tracking-widest text-xs">Balance Disponible</span>
                <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md">PEN</div>
              </div>
              <h2 className="text-5xl font-black tracking-tighter mb-4">
                {formatCurrency(balance.total)}
              </h2>
            </div>
            <div className="mt-8 flex gap-4 relative z-10">
              <button className="flex-1 bg-white text-primary hover:bg-slate-100 py-4 px-6 rounded-2xl text-sm font-black transition-all flex items-center justify-center shadow-lg active:scale-95">
                <Plus className="w-5 h-5 mr-2" />
                Ingreso
              </button>
              <button className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 py-4 px-6 rounded-2xl text-sm font-black transition-all flex items-center justify-center active:scale-95">
                <Plus className="w-5 h-5 mr-2 rotate-45" />
                Gasto
              </button>
            </div>
          </div>

          {/* Stats Cards (Minimalist Premium) */}
          <div className="glass-card p-8 flex flex-col justify-center space-y-6 rounded-[2.5rem] border-white/60">
            <div className="flex items-center justify-between">
              <div className="p-4 bg-income/10 rounded-2xl">
                <ArrowUpRight className="text-income w-8 h-8" />
              </div>
              <div className="bg-income/10 text-income text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">+12.5%</div>
            </div>
            <div>
              <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest mb-1">Ingresos del Mes</p>
              <p className="text-3xl font-black text-foreground tracking-tight">{formatCurrency(balance.income)}</p>
            </div>
            <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
              <div className="bg-income h-full" style={{ width: '70%' }}></div>
            </div>
          </div>

          <div className="glass-card p-8 flex flex-col justify-center space-y-6 rounded-[2.5rem] border-white/60">
            <div className="flex items-center justify-between">
              <div className="p-4 bg-expense/10 rounded-2xl">
                <ArrowDownRight className="text-expense w-8 h-8" />
              </div>
              <div className="bg-expense/10 text-expense text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">-5.2%</div>
            </div>
            <div>
              <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest mb-1">Gastos del Mes</p>
              <p className="text-3xl font-black text-foreground tracking-tight">{formatCurrency(balance.expenses)}</p>
            </div>
            <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
              <div className="bg-expense h-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        </section>

        {/* Bottom Section */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* Recent Transactions */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-2xl font-black tracking-tight flex items-center">
                Movimientos <span className="ml-3 text-sm text-primary bg-primary/10 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Recientes</span>
              </h3>
              <button className="text-primary font-bold text-sm hover:underline decoration-2 underline-offset-4">Ver Historial</button>
            </div>
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="glass-card p-5 flex items-center justify-between hover:scale-[1.01] transition-all cursor-pointer group rounded-[2rem] border-white/40">
                  <div className="flex items-center space-x-5">
                    <div className={`p-4 rounded-2xl shadow-sm ${tx.type === 'income' ? 'bg-income text-white shadow-income/20' : 'bg-expense text-white shadow-expense/20'}`}>
                      {tx.type === 'income' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-extrabold text-foreground text-lg">{tx.description}</p>
                      <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black tracking-tight ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Detalles</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Luxury Categories Section */}
          <div className="glass-card p-8 space-y-8 rounded-[3rem] border-white/80 dark:border-slate-800/80">
            <h3 className="text-2xl font-black tracking-tight">Gastos por <span className="text-primary">Categoría</span></h3>
            <div className="space-y-8">
              {[
                { name: 'Alimentación', value: 850, color: 'primary', percent: 45 },
                { name: 'Servicios', value: 420, color: 'expense', percent: 25 },
                { name: 'Transporte', value: 120, color: 'amber-500', percent: 15 }
              ].map((cat, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-end px-1">
                    <div>
                      <p className="text-lg font-extrabold text-foreground">{cat.name}</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{cat.percent}% del total</p>
                    </div>
                    <span className="font-black text-foreground">{formatCurrency(cat.value)}</span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-3 overflow-hidden p-0.5">
                    <div className={`bg-${cat.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${cat.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-5 bg-foreground text-background hover:bg-foreground/90 rounded-[1.5rem] font-black text-lg transition-all shadow-xl active:scale-[0.98]">
              Ver Análisis Completo
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
