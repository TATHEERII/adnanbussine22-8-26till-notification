import { verifySession, generateId, nowISO, createAuditLog, setOptionalColumns } from './lib.js';

export async function handlePayments(request, env) {
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

  if (method === 'GET' && url.pathname === '/api/payments') {
    const status = url.searchParams.get('status');
    const registerId = url.searchParams.get('register_id');
    const type = url.searchParams.get('type');

    let query = 'SELECT * FROM payments WHERE 1=1';
    const params = [];

    if (status) { query += ' AND status = ?'; params.push(status); }
    if (registerId) { query += ' AND register_id = ?'; params.push(registerId); }
    if (type) { query += ' AND type = ?'; params.push(type); }

    query += ' ORDER BY created_at DESC';
    const stmt = env.DB.prepare(query);
    const rows = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    return new Response(JSON.stringify(rows.results || []), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'GET' && url.pathname.startsWith('/api/payments/')) {
    const id = url.pathname.split('/')[3];
    const payment = await env.DB.prepare('SELECT * FROM payments WHERE id = ?').bind(id).first();
    if (!payment) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(payment), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'POST' && url.pathname === '/api/payments') {
    const body = await request.json();
    const id = generateId();
    const now = nowISO();

    await env.DB.prepare(
      `INSERT INTO payments (id, payment_number, date, register_id, type, party_name, reference, amount, payment_method, description, status, created_by, rejection_reason, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, body.payment_number, body.date, body.register_id, body.type || 'received', body.party_name || null, body.reference || null, body.amount, body.payment_method || 'cash', body.description || null, body.status || 'draft', user.id, null, now, now).run();

    await setOptionalColumns(env, 'payments', id, { notes: body.notes });

    await createAuditLog(env, {
      user: user.username,
      action: 'create',
      module: 'Payments',
      reference: body.payment_number,
      description: `Created payment ${body.payment_number}`,
    });

    const newPayment = await env.DB.prepare('SELECT * FROM payments WHERE id = ?').bind(id).first();
    return new Response(JSON.stringify(newPayment), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'PUT' && url.pathname.startsWith('/api/payments/')) {
    const id = url.pathname.split('/')[3];
    const body = await request.json();
    const now = nowISO();

    const existing = await env.DB.prepare('SELECT * FROM payments WHERE id = ?').bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await env.DB.prepare(
      `UPDATE payments SET payment_number = ?, date = ?, register_id = ?, type = ?, party_name = ?, reference = ?, amount = ?, payment_method = ?, description = ?, status = ?, rejection_reason = ?, updated_at = ?
       WHERE id = ?`
      ).bind(body.payment_number || existing.payment_number, body.date || existing.date, body.register_id || existing.register_id, body.type || existing.type, body.party_name ?? existing.party_name, body.reference ?? existing.reference, body.amount ?? existing.amount, body.payment_method || existing.payment_method, body.description ?? existing.description, body.status || existing.status, body.rejection_reason ?? existing.rejection_reason, now, id).run();

    await setOptionalColumns(env, 'payments', id, { notes: body.notes });

    await createAuditLog(env, {
      user: user.username,
      action: 'update',
      module: 'Payments',
      reference: body.payment_number || existing.payment_number,
      description: `Updated payment ${body.payment_number || existing.payment_number}`,
      oldStatus: existing.status,
      newStatus: body.status || existing.status,
    });

    const updated = await env.DB.prepare('SELECT * FROM payments WHERE id = ?').bind(id).first();
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
