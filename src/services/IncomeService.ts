import { supabase } from '../lib/supabaseClient';
import type { IncomeInsert, IncomeUpdate } from '../types/finance';

export const IncomeService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async create(payload: IncomeInsert) {
    const { data, error } = await supabase.from('incomes').insert(payload).select('*').single();
    if (error) throw error;
    return data;
  },

  async update(id: string, payload: IncomeUpdate) {
    const { data, error } = await supabase.from('incomes').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  },

  async remove(id: string) {
    const { error } = await supabase.from('incomes').delete().eq('id', id);
    if (error) throw error;
  },
};
