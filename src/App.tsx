import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Historial from './pages/Historial';
import Categorias from './pages/Categorias';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ModalTransaccion from './components/ModalTransaccion';
import { useTransactions } from './hooks/useTransactions';
import { useCategories } from './hooks/useCategories';
import type { Session } from '@supabase/supabase-js';
import type { AppPage, Transaction, TransactionType } from './types';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [pagina, setPagina] = useState<AppPage>('dashboard');
  const [menuMovil, setMenuMovil] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Estado del modal de transacción
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoModal, setTipoModal] = useState<TransactionType>('income');
  const [txEditar, setTxEditar] = useState<Transaction | null>(null);

  // ── Hooks de datos ──
  const {
    transactions, metrics, loading: txLoading,
    agregarTransaccion, editarTransaccion, eliminarTransaccion,
  } = useTransactions();
  const { categories, loading: catLoading, crearCategoria, eliminarCategoria } = useCategories();

  // ── Sesión de Supabase ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      setSessionLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (sessionLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
      <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!session) return <Auth />;

  // ── Handlers del modal ──
  const abrirModal = (tipo: TransactionType) => {
    setTipoModal(tipo);
    setTxEditar(null);
    setModalAbierto(true);
    setMenuMovil(false);
  };

  const abrirEdicion = (tx: Transaction) => {
    setTxEditar(tx);
    setModalAbierto(true);
  };

  const handleGuardar = async (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'categories'>) => {
    if (txEditar) return editarTransaccion(txEditar.id, data);
    return agregarTransaccion(data);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  return (
    <div className="h-screen flex overflow-hidden bg-[#f0f4f8]">

      {/* ── Sidebar desktop ── */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar
          pagina={pagina} setPagina={p => { setPagina(p); setBusqueda(''); }}
          email={session.user.email ?? ''} onLogout={handleLogout}
        />
      </div>

      {/* ── Sidebar móvil overlay ── */}
      {menuMovil && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMenuMovil(false)} />
          <div className="relative z-10 w-60">
            <Sidebar
              pagina={pagina} setPagina={p => { setPagina(p); setMenuMovil(false); setBusqueda(''); }}
              email={session.user.email ?? ''} onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* ── Área principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          pagina={pagina} onNueva={abrirModal}
          onMenuMovil={() => setMenuMovil(!menuMovil)}
          busqueda={busqueda} onBusqueda={setBusqueda}
        />

        {/* Página activa */}
        {pagina === 'dashboard' && (
          <Dashboard
            metrics={metrics} loading={txLoading}
            recentTxs={transactions}
            onEliminar={eliminarTransaccion}
            onEditar={abrirEdicion}
            onVerHistorial={() => setPagina('historial')}
          />
        )}
        {pagina === 'historial' && (
          <Historial
            transactions={transactions} categories={categories}
            onEliminar={eliminarTransaccion} onEditar={abrirEdicion}
            busqueda={busqueda} onBusqueda={setBusqueda}
          />
        )}
        {pagina === 'categorias' && (
          <Categorias
            categories={categories} loading={catLoading}
            onCrear={crearCategoria} onEliminar={eliminarCategoria}
          />
        )}
      </div>

      {/* ── Modal de transacción ── */}
      {modalAbierto && (
        <ModalTransaccion
          onClose={() => { setModalAbierto(false); setTxEditar(null); }}
          onGuardar={handleGuardar}
          categories={categories}
          tipoInicial={tipoModal}
          transaccionEditar={txEditar}
        />
      )}
    </div>
  );
}
