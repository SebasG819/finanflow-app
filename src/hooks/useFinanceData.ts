import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ExpenseService } from '../services/ExpenseService';
import { GoalService } from '../services/GoalService';
import { IncomeService } from '../services/IncomeService';
import type {
  Expense,
  ExpenseInsert,
  ExpenseUpdate,
  GoalInsert,
  GoalRecord,
  GoalUpdate,
  Income,
  IncomeInsert,
  IncomeUpdate,
} from '../types/finance';
import { getMandatoryExpenses, getTotalSaved } from '../utils/financeCalculations';
import {
  calculateAvailableBalance,
  calculateCategoryBreakdown,
  calculateFreeBalance,
  calculateMonthVariation,
  calculateMonthlyTrend,
  calculateSavingsPercentage,
  getCurrentMonthData,
  getPreviousMonthData,
} from '../utils/financeStats';

export const useFinanceData = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [nextExpenses, nextIncomes, nextGoals] = await Promise.all([
        ExpenseService.getAll(user.id),
        IncomeService.getAll(user.id),
        GoalService.getAll(user.id),
      ]);

      setExpenses(nextExpenses);
      setIncomes(nextIncomes);
      setGoals(nextGoals);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No se pudieron cargar tus datos.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createExpense = useCallback(
    async (payload: Omit<ExpenseInsert, 'user_id'>) => {
      if (!user) throw new Error('No hay usuario autenticado.');
      await ExpenseService.create({ ...payload, user_id: user.id });
      await refresh();
    },
    [refresh, user],
  );

  const updateExpense = useCallback(
    async (id: string, payload: ExpenseUpdate) => {
      await ExpenseService.update(id, payload);
      await refresh();
    },
    [refresh],
  );

  const removeExpense = useCallback(
    async (id: string) => {
      await ExpenseService.remove(id);
      await refresh();
    },
    [refresh],
  );

  const markInstallmentPaid = useCallback(
    async (expense: Expense) => {
      await ExpenseService.markInstallmentPaid(expense);
      await refresh();
    },
    [refresh],
  );

  const createIncome = useCallback(
    async (payload: Omit<IncomeInsert, 'user_id'>) => {
      if (!user) throw new Error('No hay usuario autenticado.');
      await IncomeService.create({ ...payload, user_id: user.id });
      await refresh();
    },
    [refresh, user],
  );

  const updateIncome = useCallback(
    async (id: string, payload: IncomeUpdate) => {
      await IncomeService.update(id, payload);
      await refresh();
    },
    [refresh],
  );

  const removeIncome = useCallback(
    async (id: string) => {
      await IncomeService.remove(id);
      await refresh();
    },
    [refresh],
  );

  const createGoal = useCallback(
    async (payload: Omit<GoalInsert, 'user_id'>) => {
      if (!user) throw new Error('No hay usuario autenticado.');
      await GoalService.create({ ...payload, user_id: user.id });
      await refresh();
    },
    [refresh, user],
  );

  const updateGoal = useCallback(
    async (id: string, payload: GoalUpdate) => {
      await GoalService.update(id, payload);
      await refresh();
    },
    [refresh],
  );

  const removeGoal = useCallback(
    async (id: string) => {
      await GoalService.remove(id);
      await refresh();
    },
    [refresh],
  );

  const addGoalMoney = useCallback(
    async (goal: GoalRecord, amount: number) => {
      await GoalService.addMoney(goal, amount);
      await refresh();
    },
    [refresh],
  );

  const summary = useMemo(() => {
    const currentMonth = getCurrentMonthData(expenses, incomes);
    const previousMonth = getPreviousMonthData(expenses, incomes);
    const balance = calculateAvailableBalance(currentMonth.income, currentMonth.expenseTotal);

    return {
      balance,
      monthlyIncome: currentMonth.income,
      monthlyExpenses: currentMonth.expenseTotal,
      mandatoryPendingMonth: currentMonth.mandatoryPending,
      mandatoryExpenses: getMandatoryExpenses(expenses),
      freeBalance: calculateFreeBalance(currentMonth.income, currentMonth.expenseTotal, currentMonth.mandatoryPending),
      savingsPercent: calculateSavingsPercentage(currentMonth.income, currentMonth.expenseTotal),
      incomeVariation: calculateMonthVariation(currentMonth.income, previousMonth.income),
      expenseVariation: calculateMonthVariation(currentMonth.expenseTotal, previousMonth.expenseTotal),
      balanceVariation: calculateMonthVariation(balance, calculateAvailableBalance(previousMonth.income, previousMonth.expenseTotal)),
      hasIncome: currentMonth.incomes.length > 0,
      hasExpenses: currentMonth.expenses.length > 0,
      hasSavingsData: currentMonth.income > 0 && currentMonth.expenseTotal > 0,
      hasTrendData: expenses.length > 0 || incomes.length > 0,
      totalSaved: getTotalSaved(goals),
      expenseBreakdown: calculateCategoryBreakdown(expenses),
      trends: calculateMonthlyTrend(expenses, incomes),
    };
  }, [expenses, goals, incomes]);

  return {
    expenses,
    incomes,
    goals,
    loading,
    error,
    summary,
    refresh,
    createExpense,
    updateExpense,
    removeExpense,
    markInstallmentPaid,
    createIncome,
    updateIncome,
    removeIncome,
    createGoal,
    updateGoal,
    removeGoal,
    addGoalMoney,
  };
};
