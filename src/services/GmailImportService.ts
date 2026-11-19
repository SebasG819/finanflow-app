import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database';
import { canAutoSave } from '../utils/gmailAutoSave';
import type { ParsedFinancialMessage } from '../utils/gmailParser';

export type GmailImport = Database['public']['Tables']['gmail_imports']['Row'];
export type GmailSenderRule = Database['public']['Tables']['gmail_sender_rules']['Row'];

export interface SaveGmailImportInput {
  id: string;
  title: string;
  amount: number;
  kind: 'expense' | 'income';
  category: string;
}

function ninetyDaysAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 90);
  return date.toISOString().slice(0, 10);
}

export const GmailImportService = {
  async getPending(userId: string): Promise<GmailImport[]> {
    const { data, error } = await supabase
      .from('gmail_imports')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1000);
    if (error) throw error;
    return data ?? [];
  },

  async getRecent(userId: string): Promise<GmailImport[]> {
    const { data, error } = await supabase
      .from('gmail_imports')
      .select('*')
      .eq('user_id', userId)
      .gte('message_date', ninetyDaysAgo())
      .order('created_at', { ascending: false })
      .limit(1000);
    if (error) throw error;
    return data ?? [];
  },

  async getRules(userId: string): Promise<GmailSenderRule[]> {
    const { data, error } = await supabase
      .from('gmail_sender_rules')
      .select('*')
      .eq('user_id', userId)
      .order('sender');
    if (error) throw error;
    return data ?? [];
  },

  async ingest(userId: string, candidates: ParsedFinancialMessage[]) {
    const existing = await this.getRecent(userId);
    const knownIds = new Set(existing.map((item) => item.message_id));
    const fresh = candidates.filter((candidate) => !knownIds.has(candidate.id));
    if (fresh.length === 0) return { added: 0, autoSaved: 0 };

    const { error } = await supabase.from('gmail_imports').upsert(
      fresh.map((candidate) => ({
        user_id: userId,
        message_id: candidate.id,
        sender: candidate.sender,
        subject: candidate.subject,
        title: candidate.title,
        amount: candidate.amount,
        kind: candidate.kind,
        message_date: candidate.date,
      })),
      { onConflict: 'user_id,message_id', ignoreDuplicates: true },
    );
    if (error) throw error;

    const rules = await this.getRules(userId);
    const approvedSenders = rules.filter((rule) => rule.auto_save).map((rule) => rule.sender);
    const allCandidates = [
      ...existing,
      ...fresh.map((candidate) => ({
        message_id: candidate.id,
        sender: candidate.sender,
        amount: candidate.amount,
        kind: candidate.kind,
        message_date: candidate.date,
      })),
    ];
    const pending = await this.getRecent(userId);
    const pendingByMessage = new Map(pending.filter((item) => item.status === 'pending').map((item) => [item.message_id, item]));
    let autoSaved = 0;

    for (const candidate of fresh) {
      const importRecord = pendingByMessage.get(candidate.id);
      if (!importRecord || !canAutoSave(candidate, approvedSenders, allCandidates)) continue;
      try {
        await this.save({
          id: importRecord.id,
          title: importRecord.title,
          amount: candidate.amount!,
          kind: candidate.kind!,
          category: 'Otros',
        });
        autoSaved += 1;
      } catch {
        // A failed automatic save stays pending for review.
      }
    }

    return { added: fresh.length, autoSaved };
  },

  async save(input: SaveGmailImportInput) {
    const { data, error } = await supabase.rpc('save_gmail_import', {
      p_import_id: input.id,
      p_title: input.title,
      p_amount: input.amount,
      p_kind: input.kind,
      p_category: input.category,
    });
    if (error) throw error;
    return data;
  },

  async discard(userId: string, id: string) {
    const { error } = await supabase.from('gmail_imports').update({ status: 'discarded' }).eq('user_id', userId).eq('id', id);
    if (error) throw error;
  },

  async setAutoSave(userId: string, sender: string, autoSave: boolean) {
    const { error } = await supabase.from('gmail_sender_rules').upsert(
      { user_id: userId, sender, auto_save: autoSave },
      { onConflict: 'user_id,sender' },
    );
    if (error) throw error;
  },

  async removeRule(userId: string, sender: string) {
    const { error } = await supabase.from('gmail_sender_rules').delete().eq('user_id', userId).eq('sender', sender);
    if (error) throw error;
  },
};
