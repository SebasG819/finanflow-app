interface AutoSaveCandidate {
  id: string;
  sender: string;
  amount: number | null;
  kind: 'expense' | 'income' | null;
  date: string;
  autoSaveEligible: boolean;
}

interface ExistingImport {
  message_id: string;
  sender: string;
  amount: number | null;
  kind: 'expense' | 'income' | null;
  message_date: string;
}

interface BulkImport {
  id: string;
  status: string;
  auto_save_eligible: boolean;
  amount: number | null;
  kind: 'expense' | 'income' | null;
  message_date: string;
}

export function selectBulkSaveCandidates<T extends BulkImport>(imports: readonly T[]): T[] {
  const matches = new Map<string, number>();
  const key = (item: BulkImport) => `${item.kind}:${item.amount}:${item.message_date}`;

  for (const item of imports) {
    if (item.amount && item.kind) matches.set(key(item), (matches.get(key(item)) ?? 0) + 1);
  }

  return imports.filter((item) =>
    item.status === 'pending' && item.auto_save_eligible &&
    item.amount !== null && item.amount > 0 && item.kind !== null &&
    matches.get(key(item)) === 1,
  );
}

export function reconcileScannedImports(
  imports: readonly { id: string; message_id: string; status: string; auto_save_eligible: boolean }[],
  candidates: readonly { id: string; autoSaveEligible: boolean }[],
  scannedIds: readonly string[],
) {
  const scanned = new Set(scannedIds);
  const current = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const updates: Array<{ id: string; auto_save_eligible: boolean }> = [];
  const discardIds: string[] = [];

  for (const item of imports) {
    if (item.status !== 'pending' || !scanned.has(item.message_id)) continue;
    const candidate = current.get(item.message_id);
    if (!candidate) discardIds.push(item.id);
    else if (candidate.autoSaveEligible !== item.auto_save_eligible) {
      updates.push({ id: item.id, auto_save_eligible: candidate.autoSaveEligible });
    }
  }

  return { updates, discardIds };
}

export function canAutoSave(candidate: AutoSaveCandidate, approvedSenders: string[], existing: ExistingImport[]) {
  if (!candidate.autoSaveEligible || !candidate.amount || !candidate.kind || !approvedSenders.includes(candidate.sender)) return false;
  return !existing.some((item) =>
    item.message_id !== candidate.id &&
    item.amount === candidate.amount &&
    item.kind === candidate.kind &&
    item.message_date === candidate.date,
  );
}
