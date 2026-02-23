export type TransactionType = 'income' | 'expense';

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

export interface BalanceSummary {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
}
