import type { BreakdownItem, Expense, ExpenseMetrics, GoalRecord, Income, MonthlyTrend } from '../types/finance';

const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const colors = ['#173c9a', '#7430e6', '#45d79c', '#7a7f8a', '#d7e5ff'];

export const sumAmounts = <T extends { amount: number }>(items: T[]) => items.reduce((total, item) => total + Number(item.amount), 0);

const isSameMonth = (dateValue: string, reference = new Date()) => {
  const date = new Date(`${dateValue}T00:00:00`);
  return date.getMonth() === reference.getMonth() && date.getFullYear() === reference.getFullYear();
};

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
    progressPercent: expense.type === 'installment' && totalInstallments ? Math.round((currentInstallment / totalInstallments) * 100) : 0,
    installmentLabel: expense.type === 'installment' ? `Cuota ${currentInstallment} de ${totalInstallments}` : null,
  };
};

export const getMonthlyExpenseTotal = (expenses: Expense[], reference = new Date()) =>
  expenses
    .filter((expense) => isSameMonth(expense.date, reference))
    .reduce((total, expense) => total + getExpenseMonthlyAmount(expense), 0);

export const getMonthlyIncomeTotal = (incomes: Income[], reference = new Date()) =>
  incomes.filter((income) => isSameMonth(income.date, reference)).reduce((total, income) => total + Number(income.amount), 0);

export const getTotalSaved = (goals: GoalRecord[]) => goals.reduce((total, goal) => total + Number(goal.current ?? 0), 0);

export const getMandatoryPendingMonth = (expenses: Expense[]) =>
  expenses
    .filter((expense) => expense.payment_status === 'pending' && (expense.type === 'fixed' || expense.type === 'installment'))
    .reduce((total, expense) => total + getExpenseMonthlyAmount(expense), 0);

export const getMandatoryExpenses = (expenses: Expense[]) =>
  expenses.filter((expense) => expense.payment_status === 'pending' && (expense.type === 'fixed' || expense.type === 'installment'));

export const getExpenseBreakdown = (expenses: Expense[]): BreakdownItem[] => {
  const total = getMonthlyExpenseTotal(expenses);
  if (!total) return [];

  const grouped = expenses
    .filter((expense) => isSameMonth(expense.date))
    .reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + getExpenseMonthlyAmount(expense);
      return acc;
    }, {});

  return Object.entries(grouped).map(([name, amount], index) => ({
    name,
    value: Math.round((amount / total) * 100),
    color: colors[index % colors.length],
  }));
};

export const getMonthlyTrends = (expenses: Expense[], incomes: Income[]): MonthlyTrend[] => {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return { month: date.getMonth(), year: date.getFullYear() };
  });

  return months.map(({ month, year }) => {
    const expensesTotal = expenses
      .filter((expense) => {
        const date = new Date(`${expense.date}T00:00:00`);
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .reduce((total, expense) => total + getExpenseMonthlyAmount(expense), 0);

    const incomeTotal = incomes
      .filter((income) => {
        const date = new Date(`${income.date}T00:00:00`);
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .reduce((total, income) => total + Number(income.amount), 0);

    return {
      month: monthLabels[month],
      expenses: expensesTotal,
      income: incomeTotal,
    };
  });
};
