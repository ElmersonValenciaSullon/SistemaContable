// ══════════════════════════════════════════════════
// TIPOS DEL SISTEMA — SistemaContable Personal
// ══════════════════════════════════════════════════

export type TransactionType = 'income' | 'expense';

// ── Entidades de base de datos ──

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  color: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category_id: string | null;
  transaction_date: string;
  notes: string | null;
  created_at: string;
  categories?: Category;
}

// ── Resumen de balance ──

export interface BalanceSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

// ── Métricas del dashboard ──

export interface DashboardMetrics {
  balance: BalanceSummary;
  // Comparación con período anterior (porcentaje)
  incomeChange: number;
  expenseChange: number;
  transactionCount: number;
  // Top categorías por gasto
  topCategories: CategoryStat[];
  // Evolución diaria últimos 7 días
  weeklyTrend: DayTrend[];
}

export interface CategoryStat {
  id: string;
  name: string;
  color: string;
  total: number;
  count: number;
  percentage: number;
}

export interface DayTrend {
  date: string;          // 'YYYY-MM-DD'
  label: string;         // 'Lun', 'Mar', etc.
  income: number;
  expense: number;
}

// ── Filtros del historial ──

export interface FiltrosHistorial {
  tipo: TransactionType | 'all';
  busqueda: string;
  fechaDesde: string;
  fechaHasta: string;
  categoriaId: string;
}

// ── Formulario de transacción ──

export interface FormTransaccion {
  type: TransactionType;
  amount: string;
  description: string;
  transaction_date: string;
  category_id: string;
  notes: string;
}

// ── Formulario de categoría ──

export interface FormCategoria {
  name: string;
  type: TransactionType;
  color: string;
}

// ── Resultado de operaciones async ──

export interface OpResult {
  success: boolean;
  error?: string;
}

// ── Páginas de la app ──

export type AppPage = 'dashboard' | 'historial' | 'categorias';
