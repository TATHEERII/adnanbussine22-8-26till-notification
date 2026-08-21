import { verifySession, generateId, nowISO, createAuditLog } from './lib.js';

export async function handleRegisters(request, env) {
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

  if (method === 'GET' && url.pathname === '/api/registers') {
    const status = url.searchParams.get('status');
    const ownerId = url.searchParams.get('owner_id');

    let query = 'SELECT * FROM registers WHERE 1=1';
    const params = [];

    if (status) { query += ' AND status = ?'; params.push(status); }
    if (ownerId) { query += ' AND owner_id = ?'; params.push(ownerId); }

    query += ' ORDER BY created_at DESC';
    const stmt = env.DB.prepare(query);
    const rows = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    return new Response(JSON.stringify(rows.results || []), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'GET' && url.pathname.startsWith('/api/registers/')) {
    const id = url.pathname.split('/')[3];
    const register = await env.DB.prepare('SELECT * FROM registers WHERE id = ?').bind(id).first();
    if (!register) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(register), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'POST' && url.pathname === '/api/registers') {
    const body = await request.json();
    const id = generateId();
    const now = nowISO();

    await env.DB.prepare(
      `INSERT INTO registers (id, name, type, opening_balance, description, status, owner_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, body.name, body.type || 'General', body.opening_balance || 0, body.description || null, body.status || 'draft', user.id, now, now);

    await createAuditLog(env, {
      user: user.username,
      action: 'create',
      module: 'Registers',
      reference: id,
      description: `Created register ${body.name}`,
    });

    const newRegister = await env.DB.prepare('SELECT * FROM registers WHERE id = ?').bind(id).first();
    return new Response(JSON.stringify(newRegister), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'PUT' && url.pathname.startsWith('/api/registers/')) {
    const id = url.pathname.split('/')[3];
    const body = await request.json();
    const now = nowISO();

    const existing = await env.DB.prepare('SELECT * FROM registers WHERE id = ?').bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await env.DB.prepare(
      `UPDATE registers SET name = ?, type = ?, opening_balance = ?, description = ?, status = ?, updated_at = ?
       WHERE id = ?`
    ).bind(body.name || existing.name, body.type || existing.type, body.opening_balance ?? existing.opening_balance, body.description ?? existing.description, body.status || existing.status, now, id);

    await createAuditLog(env, {
      user: user.username,
      action: 'update',
      module: 'Registers',
      reference: id,
      description: `Updated register ${body.name || existing.name}`,
      oldStatus: existing.status,
      newStatus: body.status || existing.status,
    });

    const updated = await env.DB.prepare('SELECT * FROM registers WHERE id = ?').bind(id).first();
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
