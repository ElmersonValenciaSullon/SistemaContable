import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Transaction, BalanceSummary, DashboardMetrics, CategoryStat, DayTrend } from '../types';
import { subDays, format, isSameDay, startOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<BalanceSummary>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
  });
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    balance: { totalBalance: 0, totalIncome: 0, totalExpenses: 0 },
    incomeChange: 0,
    expenseChange: 0,
    transactionCount: 0,
    topCategories: [],
    weeklyTrend: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calcularTodo = useCallback(
    (txs: Transaction[]): { balance: BalanceSummary; metrics: DashboardMetrics } => {
      // 1. Balance global
      const totalIncome = txs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = txs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const bal: BalanceSummary = {
        totalIncome,
        totalExpenses,
        totalBalance: totalIncome - totalExpenses,
      };

      // 2. Tendencia semanal — últimos 7 días
      const weeklyTrend: DayTrend[] = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        // FIX: parsear transaction_date sumando T00:00:00 para evitar desfases UTC
        const dayTxs = txs.filter((t) =>
          isSameDay(new Date(t.transaction_date + 'T00:00:00'), date)
        );
        return {
          date: format(date, 'yyyy-MM-dd'),
          label: format(date, 'EEE', { locale: es }),
          income: dayTxs
            .filter((t) => t.type === 'income')
            .reduce((s, t) => s + t.amount, 0),
          expense: dayTxs
            .filter((t) => t.type === 'expense')
            .reduce((s, t) => s + t.amount, 0),
        };
      });

      // 3. Top categorías por gasto
      const catMap = new Map<
        string,
        { name: string; color: string; total: number; count: number }
      >();
      txs
        .filter((t) => t.type === 'expense' && t.categories)
        .forEach((t) => {
          const cat = t.categories!;
          const cur = catMap.get(cat.id) || {
            name: cat.name,
            color: cat.color,
            total: 0,
            count: 0,
          };
          catMap.set(cat.id, {
            ...cur,
            total: cur.total + t.amount,
            count: cur.count + 1,
          });
        });

      const topCategories: CategoryStat[] = Array.from(catMap.entries())
        .map(([id, data]) => ({
          id,
          ...data,
          percentage:
            totalExpenses > 0
              ? Math.round((data.total / totalExpenses) * 100)
              : 0,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // 4. FIX: Cambios porcentuales — mes actual vs mes anterior (income Y expense)
      const now = new Date();
      const startCurrent = startOfMonth(now);
      const startPrev = startOfMonth(subMonths(now, 1));
      const endPrev = subDays(startCurrent, 1);

      const txsCurrent = txs.filter((t) =>
        isWithinInterval(new Date(t.transaction_date + 'T00:00:00'), {
          start: startCurrent,
          end: now,
        })
      );
      const txsPrev = txs.filter((t) =>
        isWithinInterval(new Date(t.transaction_date + 'T00:00:00'), {
          start: startPrev,
          end: endPrev,
        })
      );

      const incomeCurrent = txsCurrent
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
      const incomePrev = txsPrev
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);

      // FIX: expenseChange antes estaba hardcodeado a 0
      const expenseCurrent = txsCurrent
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      const expensePrev = txsPrev
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);

      const calcChange = (cur: number, pre: number): number =>
        pre === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - pre) / pre) * 100);

      return {
        balance: bal,
        metrics: {
          balance: bal,
          incomeChange: calcChange(incomeCurrent, incomePrev),
          expenseChange: calcChange(expenseCurrent, expensePrev), // FIX: ya no es 0
          transactionCount: txs.length,
          topCategories,
          weeklyTrend,
        },
      };
    },
    []
  );

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

      const txs = (data ?? []) as Transaction[];
      const result = calcularTodo(txs);
      setTransactions(txs);
      setBalance(result.balance);
      setMetrics(result.metrics);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  }, [calcularTodo]);

  const agregarTransaccion = useCallback(
    async (
      nueva: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'categories'>
    ) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');

        const { error: sbError } = await supabase
          .from('transactions')
          .insert({ ...nueva, user_id: user.id });

        if (sbError) throw sbError;
        await fetchTransactions();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Error al guardar' };
      }
    },
    [fetchTransactions]
  );

  // FIX CRÍTICO: editarTransaccion existía en el hook pero NO se retornaba
  const editarTransaccion = useCallback(
    async (
      id: string,
      actualizada: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'categories'>
    ) => {
      try {
        const { error: sbError } = await supabase
          .from('transactions')
          .update(actualizada)
          .eq('id', id);

        if (sbError) throw sbError;
        await fetchTransactions();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Error al actualizar' };
      }
    },
    [fetchTransactions]
  );

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
        return { success: false, error: err.message || 'Error al eliminar' };
      }
    },
    [fetchTransactions]
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // FIX CRÍTICO: el return anterior NO incluía editarTransaccion ni metrics
  return {
    transactions,
    balance,
    metrics,           // ← FALTABA
    loading,
    error,
    fetchTransactions,
    agregarTransaccion,
    editarTransaccion, // ← FALTABA → causaba "is not a function"
    eliminarTransaccion,
  };
}
