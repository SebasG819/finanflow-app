import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_GMAIL_MESSAGES_PER_SYNC, remainingScanCooldown } from '../src/utils/gmailQuota.ts';

test('a full-message sync leaves room under the per-user minute quota', () => {
  assert.ok(MAX_GMAIL_MESSAGES_PER_SYNC * 60 + 5 <= 5000);
});

test('successive syncs wait at least one minute', () => {
  assert.equal(remainingScanCooldown(1000, 2000), 59000);
  assert.equal(remainingScanCooldown(1000, 61000), 0);
});
