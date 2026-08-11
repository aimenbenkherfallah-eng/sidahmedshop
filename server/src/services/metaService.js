const https = require('https');

const META_GRAPH_URL = 'graph.facebook.com';
const META_API_VERSION = 'v21.0';

const sendToMeta = ({ accessToken, pixelId, payload }) => {
  const body = JSON.stringify(payload);
  const path = `/v${META_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;

  const req = https.request(
    {
      hostname: META_GRAPH_URL,
      path,
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
          console.error('[Meta CAPI] error response:', data);
        } else {
          console.log('[Meta CAPI] event sent:', payload.data?.[0]?.event_name);
        }
      });
    }
  );

  req.on('timeout', () => req.destroy(new Error('Meta CAPI timeout')));
  req.on('error', (err) => console.error('[Meta CAPI] request error:', err.message));
  req.write(body);
  req.end();
};

/**
 * Send a server-side event to the Meta Conversions API.
 * `phone` is hashed with SHA-256 before transmission.
 * `eventId` matches the client-side event for deduplication.
 */
const sendMetaEvent = ({ eventName, eventId, phone, ip, userAgent, url, customData }) => {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!pixelId || !accessToken) {
    console.warn('[Meta CAPI] skipped (pixel id or access token not configured)');
    return;
  }

  const { sha256 } = require('../utils/hash');

  const userData = {
    ph: [sha256(phone)],
    client_ip_address: ip || '0.0.0.0',
    client_user_agent: userAgent || '',
  };

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        user_data: userData,
        custom_data: customData || {},
        ...(url ? { event_source_url: url } : {}),
      },
    ],
  };

  sendToMeta({ accessToken, pixelId, payload });
};

module.exports = { sendMetaEvent };
