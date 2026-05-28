import type { BreakdownItem, Expense, GoalRecord, Income } from '../types/finance';
import {
  calculateCategoryBreakdown,
  calculateMonthlyTrend,
  getExpenseMetrics,
  getExpenseMonthlyAmount,
  getCurrentMonthData,
} from './financeStats';

export const sumAmounts = <T extends { amount: number }>(items: T[]) => items.reduce((total, item) => total + Number(item.amount), 0);

export { getExpenseMetrics, getExpenseMonthlyAmount };

export const getMonthlyExpenseTotal = (expenses: Expense[], reference = new Date()) =>
  getCurrentMonthData(expenses, [], reference).expenseTotal;

export const getMonthlyIncomeTotal = (incomes: Income[], reference = new Date()) =>
  getCurrentMonthData([], incomes, reference).income;

export const getTotalSaved = (goals: GoalRecord[]) => goals.reduce((total, goal) => total + Number(goal.current ?? 0), 0);

export const getMandatoryPendingMonth = (expenses: Expense[]) =>
  expenses
    .filter((expense) => expense.payment_status === 'pending' && (expense.type === 'fixed' || expense.type === 'installment'))
    .reduce((total, expense) => total + getExpenseMonthlyAmount(expense), 0);

export const getMandatoryExpenses = (expenses: Expense[]) =>
  expenses.filter((expense) => expense.payment_status === 'pending' && (expense.type === 'fixed' || expense.type === 'installment'));

export const getExpenseBreakdown = (expenses: Expense[]): BreakdownItem[] => {
  return calculateCategoryBreakdown(expenses);
};

export const getMonthlyTrends = calculateMonthlyTrend;
