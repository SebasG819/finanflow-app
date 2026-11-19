import assert from 'node:assert/strict';
import test from 'node:test';
import { canAutoSave, reconcileScannedImports, selectBulkSaveCandidates } from '../src/utils/gmailAutoSave.ts';

const candidate = { id: 'new', sender: 'alertas@banco.example', amount: 45000, kind: 'expense' as const, date: '2026-11-07', autoSaveEligible: true };

test('allows a complete movement from an approved sender', () => {
  assert.equal(canAutoSave(candidate, ['alertas@banco.example'], []), true);
});

test('requires review for a new sender or ambiguous movement', () => {
  assert.equal(canAutoSave(candidate, [], []), false);
  assert.equal(canAutoSave({ ...candidate, amount: null }, [candidate.sender], []), false);
  assert.equal(canAutoSave({ ...candidate, kind: null }, [candidate.sender], []), false);
  assert.equal(canAutoSave({ ...candidate, autoSaveEligible: false }, [candidate.sender], []), false);
});

test('requires review when another sender reported the same amount and date', () => {
  assert.equal(canAutoSave(candidate, [candidate.sender], [{ message_id: 'old', sender: 'recibos@tienda.example', amount: 45000, kind: 'expense', message_date: '2026-11-07' }]), false);
});

test('requires review for a second alert from the same sender', () => {
  assert.equal(canAutoSave(candidate, [candidate.sender], [{ message_id: 'old', sender: candidate.sender, amount: 45000, kind: 'expense', message_date: '2026-11-07' }]), false);
});

test('bulk saving includes only clear pending imports without a matching movement', () => {
  const rows = [
    { id: 'a', status: 'pending', auto_save_eligible: true, amount: 45000, kind: 'expense', message_date: '2026-11-07' },
    { id: 'b', status: 'pending', auto_save_eligible: false, amount: 10000, kind: 'expense', message_date: '2026-11-07' },
    { id: 'c', status: 'saved', auto_save_eligible: true, amount: 25000, kind: 'income', message_date: '2026-11-07' },
    { id: 'd', status: 'pending', auto_save_eligible: true, amount: 25000, kind: 'income', message_date: '2026-11-07' },
    { id: 'e', status: 'pending', auto_save_eligible: true, amount: 45000, kind: 'expense', message_date: '2026-11-08' },
  ] as const;
  assert.deepEqual(selectBulkSaveCandidates(rows).map((row) => row.id), ['a', 'e']);
});

test('bulk saving skips both copies of an ambiguous duplicate', () => {
  const rows = [
    { id: 'a', status: 'pending', auto_save_eligible: true, amount: 45000, kind: 'expense', message_date: '2026-11-07' },
    { id: 'b', status: 'pending', auto_save_eligible: true, amount: 45000, kind: 'expense', message_date: '2026-11-07' },
  ] as const;
  assert.deepEqual(selectBulkSaveCandidates(rows), []);
});

test('rescanning updates clear candidates and discards old false positives only', () => {
  const imports = [
    { id: 'a', message_id: 'mail-a', status: 'pending', auto_save_eligible: false },
    { id: 'b', message_id: 'mail-b', status: 'pending', auto_save_eligible: true },
    { id: 'c', message_id: 'mail-c', status: 'saved', auto_save_eligible: false },
  ];
  const result = reconcileScannedImports(imports, [
    { id: 'mail-a', autoSaveEligible: true },
  ], ['mail-a', 'mail-b', 'mail-c']);
  assert.deepEqual(result.updates, [{ id: 'a', auto_save_eligible: true }]);
  assert.deepEqual(result.discardIds, ['b']);
});
