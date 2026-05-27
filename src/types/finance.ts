import type { LucideIcon } from 'lucide-react';
import type { Database } from './database';

export type TransactionKind = 'income' | 'expense';
export type ExpenseType = 'fixed' | 'installment' | 'variable';
export type PaymentStatus = 'paid' | 'pending';

export type Expense = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];
export type Income = Database['public']['Tables']['incomes']['Row'];
export type IncomeInsert = Database['public']['Tables']['incomes']['Insert'];
export type IncomeUpdate = Database['public']['Tables']['incomes']['Update'];
export type GoalRecord = Database['public']['Tables']['goals']['Row'];
export type GoalInsert = Database['public']['Tables']['goals']['Insert'];
export type GoalUpdate = Database['public']['Tables']['goals']['Update'];

export type FinanceCategory =
  | 'Alimentacion'
  | 'Transporte'
  | 'Servicios'
  | 'Ocio'
  | 'Vivienda'
  | 'Salario'
  | 'Freelance'
  | 'Ventas'
  | 'Otros'
  | 'Tecnologia'
  | 'Viajes';

export interface Transaction {
  id: string;
  title: string;
  category: FinanceCategory;
  amount: number;
  dateLabel: string;
  kind: TransactionKind;
  icon: string;
}

export interface Goal {
  id: string;
  title: string;
  category: FinanceCategory;
  target: number;
  saved: number;
  dueLabel: string;
  icon: string;
  completedAt?: string;
}

export interface MonthlyTrend {
  month: string;
  expenses: number;
  income: number;
}

export interface BreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface AppData {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  mandatoryPendingMonth: number;
  freeBalance: number;
  savingsPercent: number;
  totalSaved: number;
  expenses: Expense[];
  income: Income[];
  goals: GoalRecord[];
  trends: MonthlyTrend[];
  expenseBreakdown: BreakdownItem[];
}

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface FinanceDataState {
  expenses: Expense[];
  incomes: Income[];
  goals: GoalRecord[];
}

export interface ExpenseMetrics {
  monthlyAmount: number;
  remainingAmount: number;
  progressPercent: number;
  installmentLabel: string | null;
}
