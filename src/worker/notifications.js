import { verifySession, createAuditLog, nowISO } from './lib.js';

export async function handleNotifications(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const user = await verifySession(request, env);

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'GET' && url.pathname === '/api/notifications') {
    const unreadOnly = url.searchParams.get('unread') === 'true';
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [user.id];

    if (unreadOnly) {
      query += ' AND read = 0';
    }

    query += ' ORDER BY created_at DESC LIMIT 50';
    const stmt = env.DB.prepare(query).bind(...params);
    const rows = await stmt.all();

    return new Response(JSON.stringify(rows.results || []), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'POST' && url.pathname === '/api/notifications/mark-read') {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids : [];

    if (ids.length === 0) {
      return new Response(JSON.stringify({ error: 'No notification IDs provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const placeholders = ids.map(() => '?').join(',');
    const now = nowISO();

    await env.DB.prepare(
      `UPDATE notifications SET read = 1, updated_at = ? WHERE id IN (${placeholders}) AND user_id = ?`
     ).bind(now, ...ids, user.id).run();

    await createAuditLog(env, {
      user: user.username,
      action: 'mark_read',
      module: 'Notifications',
      description: `Marked ${ids.length} notifications as read`,
    });

    return new Response(JSON.stringify({ success: true, marked: ids.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
