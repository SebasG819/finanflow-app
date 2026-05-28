import type { BreakdownItem, Expense, ExpenseMetrics, Income, MonthlyTrend } from '../types/finance';

const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const colors = ['#173c9a', '#7430e6', '#45d79c', '#7a7f8a', '#d7e5ff'];

const toMonthKey = (dateValue: string | Date) => {
  const date = typeof dateValue === 'string' ? new Date(`${dateValue}T00:00:00`) : dateValue;
  return `${date.getFullYear()}-${date.getMonth()}`;
};

const shiftMonth = (reference: Date, offset: number) => {
  const date = new Date(reference);
  date.setDate(1);
  date.setMonth(date.getMonth() + offset);
  return date;
};

export const isSameMonth = (dateValue: string, reference = new Date()) => toMonthKey(dateValue) === toMonthKey(reference);

export const getExpenseMonthlyAmount = (expense: Expense) =>
  Number(expense.type === 'installment' ? expense.installment_amount ?? expense.amount : expense.amount);

export const getExpenseMetrics = (expense: Expense): ExpenseMetrics => {
  const totalInstallments = expense.total_installments ?? 0;
  const currentInstallment = expense.current_installment ?? 0;
  const monthlyAmount = getExpenseMonthlyAmount(expense);
  const remainingInstallments = Math.max(totalInstallments - currentInstallment, 0);

  return {
    monthlyAmount,
    remainingAmount: expense.type === 'installment' ? monthlyAmount * remainingInstallments : 0,
    progressPercent: calculateGoalProgress(currentInstallment, totalInstallments),
    installmentLabel: expense.type === 'installment' ? `Cuota ${currentInstallment} de ${totalInstallments}` : null,
  };
};

export const getCurrentMonthData = (expenses: Expense[], incomes: Income[], reference = new Date()) => {
  const monthExpenses = expenses.filter((expense) => isSameMonth(expense.date, reference));
  const monthIncomes = incomes.filter((income) => isSameMonth(income.date, reference));
  const income = monthIncomes.reduce((total, item) => total + Number(item.amount), 0);
  const expenseTotal = monthExpenses.reduce((total, item) => total + getExpenseMonthlyAmount(item), 0);
  const mandatoryPending = expenses
    .filter((expense) => expense.payment_status === 'pending' && (expense.type === 'fixed' || expense.type === 'installment'))
    .reduce((total, expense) => total + getExpenseMonthlyAmount(expense), 0);

  return {
    expenses: monthExpenses,
    incomes: monthIncomes,
    income,
    expenseTotal,
    mandatoryPending,
  };
};

export const getPreviousMonthData = (expenses: Expense[], incomes: Income[], reference = new Date()) =>
  getCurrentMonthData(expenses, incomes, shiftMonth(reference, -1));

export const calculateMonthVariation = (current: number, previous: number) => {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
};

export const calculateSavingsPercentage = (income: number, expenses: number) => {
  if (income <= 0 || expenses <= 0) return null;
  return Math.max(Math.round(((income - expenses) / income) * 100), 0);
};

export const calculateAvailableBalance = (income: number, expenses: number) => income - expenses;

export const calculateFreeBalance = (income: number, expenses: number, mandatoryPending: number) =>
  calculateAvailableBalance(income, expenses) - mandatoryPending;

export const calculateGoalProgress = (current: number, target: number) => {
  if (target <= 0 || current <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

export const calculateCategoryBreakdown = (expenses: Expense[], reference = new Date()): BreakdownItem[] => {
  const currentExpenses = expenses.filter((expense) => isSameMonth(expense.date, reference));
  const total = currentExpenses.reduce((sum, expense) => sum + getExpenseMonthlyAmount(expense), 0);

  if (!total) return [];

  const grouped = currentExpenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] ?? 0) + getExpenseMonthlyAmount(expense);
    return acc;
  }, {});

  return Object.entries(grouped).map(([name, amount], index) => ({
    name,
    value: Math.round((amount / total) * 100),
    color: colors[index % colors.length],
  }));
};

export const calculateMonthlyTrend = (expenses: Expense[], incomes: Income[], reference = new Date()): MonthlyTrend[] =>
  Array.from({ length: 6 }, (_, index) => shiftMonth(reference, index - 5)).map((date) => {
    const monthExpenses = expenses
      .filter((expense) => isSameMonth(expense.date, date))
      .reduce((total, expense) => total + getExpenseMonthlyAmount(expense), 0);

    const monthIncome = incomes
      .filter((income) => isSameMonth(income.date, date))
      .reduce((total, income) => total + Number(income.amount), 0);

    return {
      month: monthLabels[date.getMonth()],
      expenses: monthExpenses,
      income: monthIncome,
    };
  });
