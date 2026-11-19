import assert from 'node:assert/strict';
import test from 'node:test';
import { canAutoSave } from '../src/utils/gmailAutoSave.ts';

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
