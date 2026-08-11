const crypto = require('crypto');

const sha256 = (value) =>
  crypto.createHash('sha256').update(String(value || '').trim()).digest('hex');

const generateEventId = () =>
  crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;

module.exports = { sha256, generateEventId };
