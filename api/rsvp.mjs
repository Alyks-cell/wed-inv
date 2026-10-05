function sendJson(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (origin && host) {
    try {
      if (new URL(origin).host !== String(host).split(',')[0].trim()) {
        return sendJson(res, 403, { error: 'Request origin not allowed' });
      }
    } catch {
      return sendJson(res, 403, { error: 'Request origin not allowed' });
    }
  }

  let payload;
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return sendJson(res, 400, { error: 'Invalid request body' });
  }

  if (payload?.company) {
    return sendJson(res, 400, { error: 'Invalid submission' });
  }

  const guestName = typeof payload?.name === 'string' ? payload.name.trim() : '';
  const response = payload?.response;
  if (guestName.length < 2 || guestName.length > 100 || !['accept', 'decline'].includes(response)) {
    return sendJson(res, 400, { error: 'Enter your name and choose an RSVP response.' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabasePublishableKey) {
    return sendJson(res, 503, { error: 'RSVP service is not configured yet.' });
  }

  try {
    const result = await fetch(`${supabaseUrl}/rest/v1/rsvps`, {
      method: 'POST',
      headers: {
        apikey: supabasePublishableKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ guest_name: guestName, response })
    });

    if (!result.ok) {
      console.error('RSVP database insert failed with status:', result.status);
      return sendJson(res, 502, { error: 'Could not save your RSVP.' });
    }

    return sendJson(res, 201, { ok: true });
  } catch (error) {
    console.error('RSVP database request failed:', error?.name || 'UnknownError');
    return sendJson(res, 502, { error: 'Could not save your RSVP.' });
  }
}
