const https = require('https');

const TIKTOK_API_HOST = 'business-api.tiktok.com';
const TIKTOK_API_PATH = '/open_api/v1.3/event/track/';

const sendToTikTok = (payload) => {
  const body = JSON.stringify(payload);

  const req = https.request(
    {
      hostname: TIKTOK_API_HOST,
      path: TIKTOK_API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 10000,
    },
    (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 400) {
          console.error('[TikTok Events API] error response:', data);
        } else {
          console.log('[TikTok Events API] event sent:', payload.data?.[0]?.event);
        }
      });
    }
  );

  req.on('timeout', () => req.destroy(new Error('TikTok API timeout')));
  req.on('error', (err) => console.error('[TikTok Events API] request error:', err.message));
  req.write(body);
  req.end();
};

/**
 * Send a server-side event to the TikTok Events API.
 * `phone` is hashed with SHA-256 before transmission.
 * `eventId` matches the client-side event for deduplication.
 */
const sendTikTokEvent = ({ eventId, eventName, phone, ip, userAgent, url, properties }) => {
  const pixelId = process.env.TIKTOK_PIXEL_ID;
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  if (!pixelId || !accessToken) {
    console.warn('[TikTok Events API] skipped (pixel id or access token not configured)');
    return;
  }

  const { sha256 } = require('../utils/hash');

  const payload = {
    event_source: 'web',
    event_source_id: pixelId,
    data: [
      {
        event_id: eventId,
        event: eventName,
        event_time: Math.floor(Date.now() / 1000),
        user: {
          phone: sha256(phone),
          ip,
          user_agent: userAgent,
        },
        page: {
          url: url || '',
          referrer: '',
        },
        properties: properties || {},
      },
    ],
  };

  const signedPayload = {
    ...payload,
    access_token: accessToken,
  };

  sendToTikTok(signedPayload);
};

module.exports = { sendTikTokEvent };
