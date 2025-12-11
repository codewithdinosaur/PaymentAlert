const test = require('node:test');
const assert = require('node:assert');
const { generateHmacSignature, verifySignature } = require('../utils/signature');

const secret = 'test_secret_key';

test('verifySignature returns true for valid signatures', () => {
  const payload = JSON.stringify({ foo: 'bar', timestamp: Date.now() });
  const signature = generateHmacSignature(payload, secret);

  assert.ok(verifySignature(payload, signature, secret));
});

test('verifySignature rejects tampered payloads', () => {
  const payload = JSON.stringify({ foo: 'bar' });
  const signature = generateHmacSignature(payload, secret);

  assert.strictEqual(verifySignature(payload + 'tamper', signature, secret), false);
});

test('verifySignature rejects malformed signatures', () => {
  const payload = JSON.stringify({ foo: 'bar' });

  assert.strictEqual(verifySignature(payload, 'not-a-hex-signature', secret), false);
});
