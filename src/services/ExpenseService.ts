import { supabase } from '../lib/supabaseClient';
import type { Expense, ExpenseInsert, ExpenseUpdate } from '../types/finance';

export const ExpenseService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async create(payload: ExpenseInsert) {
    const { data, error } = await supabase.from('expenses').insert(payload).select('*').single();
    if (error) throw error;
    return data;
  },

  async update(id: string, payload: ExpenseUpdate) {
    const { data, error } = await supabase.from('expenses').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  },

  async remove(id: string) {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  },

  async markInstallmentPaid(expense: Expense) {
    if (expense.type !== 'installment') {
      throw new Error('Este gasto no es una compra a cuotas.');
    }

    const totalInstallments = expense.total_installments ?? 0;
    const nextInstallment = Math.min((expense.current_installment ?? 0) + 1, totalInstallments);

    return this.update(expense.id, {
      current_installment: nextInstallment,
      payment_status: nextInstallment >= totalInstallments ? 'paid' : 'pending',
    });
  },
};
