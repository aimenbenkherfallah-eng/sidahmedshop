const https = require('https');

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const verifyTurnstile = (token, remoteIp) =>
  new Promise((resolve) => {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return resolve({ success: true, skipped: true });
    }
    if (!token) {
      return resolve({ success: false, error: 'missing-captcha-token' });
    }

    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.append('remoteip', remoteIp);

    const req = https.request(
      VERIFY_URL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 8000,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve({ success: false, error: 'invalid-captcha-response' });
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'captcha-timeout' });
    });
    req.on('error', () => resolve({ success: false, error: 'captcha-network-error' }));
    req.write(body.toString());
    req.end();
  });

module.exports = { verifyTurnstile };
