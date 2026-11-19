import assert from 'node:assert/strict';
import test from 'node:test';
import { gmailErrorMessage } from '../src/utils/gmailErrors.ts';

test('shows the Gmail API reason for a failed request', () => {
  assert.match(gmailErrorMessage(403, {
    error: { code: 403, message: 'Gmail API has not been used in project before or it is disabled.' },
  }), /Gmail API has not been used/);
});
