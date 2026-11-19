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

export function canAutoSave(candidate: AutoSaveCandidate, approvedSenders: string[], existing: ExistingImport[]) {
  if (!candidate.autoSaveEligible || !candidate.amount || !candidate.kind || !approvedSenders.includes(candidate.sender)) return false;
  return !existing.some((item) =>
    item.message_id !== candidate.id &&
    item.amount === candidate.amount &&
    item.kind === candidate.kind &&
    item.message_date === candidate.date,
  );
}
