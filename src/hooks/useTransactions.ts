import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Transaction, BalanceSummary } from '../types';

// Hook principal para gestionar transacciones del usuario autenticado
// Compatible con el schema de Supabase con ENUM transaction_type
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<BalanceSummary>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calcula el balance a partir de la lista de transacciones
  const calcularBalance = useCallback((txs: Transaction[]): BalanceSummary => {
    const totalIncome = txs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = txs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome,
      totalExpenses,
      totalBalance: totalIncome - totalExpenses,
    };
  }, []);

  // Obtiene todas las transacciones del usuario desde Supabase
  // RLS garantiza que solo se retornan las del usuario autenticado
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('transactions')
        .select('*, categories(id, name, color, type)')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (sbError) throw sbError;

      const txs = data as Transaction[];
      setTransactions(txs);
      setBalance(calcularBalance(txs));
    } catch (err: any) {
      setError(err.message || 'Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  }, [calcularBalance]);

  // Agrega una nueva transacción
  // user_id se inyecta automáticamente vía RLS (auth.uid())
  const agregarTransaccion = useCallback(
    async (nueva: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'categories'>) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');

        const { error: sbError } = await supabase.from('transactions').insert({
          ...nueva,
          user_id: user.id,
        });

        if (sbError) throw sbError;

        await fetchTransactions();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Error al guardar la transacción' };
      }
    },
    [fetchTransactions]
  );

  // Elimina una transacción por ID
  const eliminarTransaccion = useCallback(
    async (id: string) => {
      try {
        const { error: sbError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id);

        if (sbError) throw sbError;

        await fetchTransactions();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Error al eliminar la transacción' };
      }
    },
    [fetchTransactions]
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    balance,
    loading,
    error,
    fetchTransactions,
    agregarTransaccion,
    eliminarTransaccion,
  };
}