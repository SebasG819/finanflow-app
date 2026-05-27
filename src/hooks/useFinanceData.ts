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
import {
  getExpenseBreakdown,
  getMandatoryExpenses,
  getMandatoryPendingMonth,
  getMonthlyExpenseTotal,
  getMonthlyIncomeTotal,
  getMonthlyTrends,
  getTotalSaved,
} from '../utils/financeCalculations';

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
    const monthlyIncome = getMonthlyIncomeTotal(incomes);
    const monthlyExpenses = getMonthlyExpenseTotal(expenses);
    const mandatoryPendingMonth = getMandatoryPendingMonth(expenses);
    const balance = monthlyIncome - monthlyExpenses;

    return {
      balance,
      monthlyIncome,
      monthlyExpenses,
      mandatoryPendingMonth,
      mandatoryExpenses: getMandatoryExpenses(expenses),
      freeBalance: balance - mandatoryPendingMonth,
      savingsPercent: monthlyIncome ? Math.max(Math.round(((balance - mandatoryPendingMonth) / monthlyIncome) * 100), 0) : 0,
      totalSaved: getTotalSaved(goals),
      expenseBreakdown: getExpenseBreakdown(expenses),
      trends: getMonthlyTrends(expenses, incomes),
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
