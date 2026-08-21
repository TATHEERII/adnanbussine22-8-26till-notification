import { verifySession } from './lib.js';

export async function handleAuditLogs(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const user = await verifySession(request, env);

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

  if (method === 'GET' && url.pathname === '/api/audit-logs') {
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');
    const module = url.searchParams.get('module');
    const action = url.searchParams.get('action');

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (dateFrom) { query += ' AND date >= ?'; params.push(dateFrom); }
    if (dateTo) { query += ' AND date <= ?'; params.push(dateTo); }
    if (module) { query += ' AND module = ?'; params.push(module); }
    if (action) { query += ' AND action = ?'; params.push(action); }

    query += ' ORDER BY date DESC, time DESC LIMIT 200';
    const stmt = env.DB.prepare(query);
    const rows = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    return new Response(JSON.stringify(rows.results || []), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
