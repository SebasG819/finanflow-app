import { supabase } from '../lib/supabaseClient';
import type { GoalInsert, GoalRecord, GoalUpdate } from '../types/finance';

export const GoalService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async create(payload: GoalInsert) {
    const { data, error } = await supabase.from('goals').insert(payload).select('*').single();
    if (error) throw error;
    return data;
  },

  async update(id: string, payload: GoalUpdate) {
    const { data, error } = await supabase.from('goals').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  },

  async remove(id: string) {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
  },

  async addMoney(goal: GoalRecord, amount: number) {
    if (amount <= 0) {
      throw new Error('El aporte debe ser mayor a 0.');
    }

    const nextCurrent = Number(goal.current ?? 0) + amount;
    return this.update(goal.id, { current: nextCurrent });
  },
};
