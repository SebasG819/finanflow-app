import assert from 'node:assert/strict';
import test from 'node:test';
import { readPlainText } from '../src/utils/gmailMime.ts';

test('reads a nested UTF-8 plain-text Gmail part', () => {
  const encoded = Buffer.from('Compra por $45.900 en Bogotá').toString('base64url');
  assert.equal(readPlainText({ mimeType: 'multipart/alternative', parts: [{ mimeType: 'text/plain', body: { data: encoded } }] }), 'Compra por $45.900 en Bogotá');
});

test('does not treat HTML as plain text', () => {
  assert.equal(readPlainText({ mimeType: 'text/html', body: { data: 'PGI+' } }), '');
});
