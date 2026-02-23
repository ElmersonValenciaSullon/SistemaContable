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
  Search
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
    { id: '1', type: 'income', amount: 3500, description: 'Sueldo Febrero', date: '2026-02-23' },
    { id: '2', type: 'expense', amount: 45.50, description: 'Almuerzo Menu', date: '2026-02-22' },
    { id: '3', type: 'expense', amount: 120.00, description: 'Supermercado Metro', date: '2026-02-21' },
    { id: '4', type: 'income', amount: 150.00, description: 'Venta de audifonos', date: '2026-02-20' },
  ];

  return (
    <div className="min-h-screen bg-background premium-gradient-bg flex">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 glass-card m-4 rounded-2xl hidden md:flex flex-col p-6 space-y-8">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">SolConta</span>
        </div>

        <nav className="flex-1 space-y-1">
          <a href="#" className="flex items-center space-x-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-medium">
            <PieChart className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-secondary rounded-xl transition-colors">
            <History className="w-5 h-5" />
            <span>Historial</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-secondary rounded-xl transition-colors">
            <TrendingUp className="w-5 h-5" />
            <span>Reportes</span>
          </a>
        </nav>

        <div className="pt-6 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">¡Hola, Elmerson!</h1>
            <p className="text-muted-foreground text-sm mt-1">Aquí tienes el resumen de tus finanzas hoy.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar movimiento..."
                className="pl-10 pr-4 py-2 bg-card border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
              />
            </div>
            <button className="p-2 relative hover:bg-secondary rounded-full transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Balance Card */}
          <div className="md:col-span-1 glass-card p-6 border-none bg-primary shadow-2xl shadow-primary/30 text-white flex flex-col justify-between min-h-[180px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/70 text-sm font-medium">Balance Disponible</p>
                <h2 className="text-4xl font-bold mt-1 tracking-tight">
                  {formatCurrency(balance.total)}
                </h2>
              </div>
              <Wallet className="w-8 h-8 text-white/40" />
            </div>
            <div className="mt-4 flex space-x-4">
              <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center">
                <Plus className="w-4 h-4 mr-2" />
                Ingreso
              </button>
              <button className="flex-1 bg-black/10 hover:bg-black/20 backdrop-blur-sm py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center">
                <Plus className="w-4 h-4 mr-2 rotate-45" />
                Gasto
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="glass-card p-6 flex flex-col justify-between border-l-4 border-l-income">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-income/10 rounded-2xl">
                <TrendingUp className="text-income w-6 h-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Ingresos Mes</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(balance.income)}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-income font-medium flex items-center">
              <span>+12.5% respecto al mes anterior</span>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between border-l-4 border-l-expense">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-expense/10 rounded-2xl">
                <TrendingDown className="text-expense w-6 h-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Gastos Mes</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(balance.expenses)}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-expense font-medium flex items-center">
              <span>-5.2% respecto al mes anterior</span>
            </div>
          </div>
        </section>

        {/* Bottom Section */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold">Transacciones Recientes</h3>
              <button className="text-primary text-sm font-semibold hover:underline">Ver todas</button>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="glass-card p-4 flex items-center justify-between hover:translate-x-1 transition-transform cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-xl ${tx.type === 'income' ? 'bg-income/10' : 'bg-expense/10'}`}>
                      {tx.type === 'income' ? <TrendingUp className="text-income w-5 h-5" /> : <TrendingDown className="text-expense w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{tx.description}</p>
                      <p className="text-muted-foreground text-xs">{tx.date}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions / Categories (Fase 2 hint) */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-xl font-bold px-2">Gasto por Categoría</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Alimentación</span>
                  <span className="font-semibold">S/. 850.00</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Servicios</span>
                  <span className="font-semibold">S/. 420.00</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-expense h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transporte</span>
                  <span className="font-semibold">S/. 120.00</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 py-3 bg-secondary hover:bg-secondary/80 rounded-xl font-semibold transition-colors">
              Analizar Gastos
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
