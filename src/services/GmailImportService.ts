import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database';
import { canAutoSave, reconcileScannedImports, selectBulkSaveCandidates } from '../utils/gmailAutoSave';
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

  async ingest(userId: string, candidates: ParsedFinancialMessage[], scannedIds: string[]) {
    const existing = await this.getRecent(userId);
    const { updates, discardIds } = reconcileScannedImports(existing, candidates, scannedIds);
    if (discardIds.length > 0) {
      const { error } = await supabase.from('gmail_imports').update({ status: 'discarded', auto_save_eligible: false })
        .eq('user_id', userId).eq('status', 'pending').in('id', discardIds);
      if (error) throw error;
    }
    for (const item of updates) {
      const { error } = await supabase.from('gmail_imports').update({ auto_save_eligible: item.auto_save_eligible })
        .eq('user_id', userId).eq('status', 'pending').eq('id', item.id);
      if (error) throw error;
    }
    const knownIds = new Set(existing.map((item) => item.message_id));
    const fresh = candidates.filter((candidate) => !knownIds.has(candidate.id));
    if (fresh.length === 0) return { added: 0, autoSaved: 0, filtered: discardIds.length };

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
        auto_save_eligible: candidate.autoSaveEligible,
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

    return { added: fresh.length, autoSaved, filtered: discardIds.length };
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

  async saveClearPending(userId: string) {
    const candidates = selectBulkSaveCandidates(await this.getRecent(userId));
    let saved = 0;
    let failed = 0;

    for (const item of candidates) {
      try {
        await this.save({
          id: item.id, title: item.title, amount: item.amount!, kind: item.kind!, category: 'Otros',
        });
        saved += 1;
      } catch {
        failed += 1;
      }
    }

    return { saved, failed };
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
