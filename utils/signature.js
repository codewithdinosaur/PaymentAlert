const crypto = require('crypto');

function toHexBuffer(value) {
  return Buffer.from(value, 'hex');
}

function generateHmacSignature(payload, secret) {
  if (typeof payload !== 'string') {
    throw new Error('Payload must be a string for signature generation');
  }

  if (!secret) {
    throw new Error('Secret is required for signature generation');
  }

  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function verifySignature(payload, signature, secret) {
  if (!signature || typeof signature !== 'string') {
    return false;
  }

  try {
    const expected = generateHmacSignature(payload, secret);
    const expectedBuffer = toHexBuffer(expected);
    const providedBuffer = toHexBuffer(signature);

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  } catch (error) {
    // Invalid hex strings or missing secret should not crash the flow
    return false;
  }
}

module.exports = {
  generateHmacSignature,
  verifySignature,
};
