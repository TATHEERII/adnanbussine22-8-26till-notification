import { verifySession, generateId, nowISO, createAuditLog } from './lib.js';

export async function handleSales(request, env) {
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

  if (method === 'GET' && url.pathname === '/api/sales') {
    const status = url.searchParams.get('status');
    const registerId = url.searchParams.get('register_id');

    let query = 'SELECT * FROM sales WHERE 1=1';
    const params = [];

    if (status) { query += ' AND status = ?'; params.push(status); }
    if (registerId) { query += ' AND register_id = ?'; params.push(registerId); }

    query += ' ORDER BY created_at DESC';
    const stmt = env.DB.prepare(query);
    const rows = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    return new Response(JSON.stringify(rows.results || []), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'GET' && url.pathname.startsWith('/api/sales/')) {
    const id = url.pathname.split('/')[3];
    const sale = await env.DB.prepare('SELECT * FROM sales WHERE id = ?').bind(id).first();
    if (!sale) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(sale), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'POST' && url.pathname === '/api/sales') {
    const body = await request.json();
    const id = generateId();
    const now = nowISO();

    await env.DB.prepare(
      `INSERT INTO sales (id, sale_number, date, register_id, customer_name, description, amount, payment_status, status, created_by, rejection_reason, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, body.sale_number, body.date, body.register_id, body.customer_name || null, body.description || null, body.amount, body.payment_status || 'unpaid', body.status || 'draft', user.id, null, now, now);

    await createAuditLog(env, {
      user: user.username,
      action: 'create',
      module: 'Sales',
      reference: body.sale_number,
      description: `Created sale ${body.sale_number}`,
    });

    const newSale = await env.DB.prepare('SELECT * FROM sales WHERE id = ?').bind(id).first();
    return new Response(JSON.stringify(newSale), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'PUT' && url.pathname.startsWith('/api/sales/')) {
    const id = url.pathname.split('/')[3];
    const body = await request.json();
    const now = nowISO();

    const existing = await env.DB.prepare('SELECT * FROM sales WHERE id = ?').bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await env.DB.prepare(
      `UPDATE sales SET sale_number = ?, date = ?, register_id = ?, customer_name = ?, description = ?, amount = ?, payment_status = ?, status = ?, rejection_reason = ?, updated_at = ?
       WHERE id = ?`
    ).bind(body.sale_number || existing.sale_number, body.date || existing.date, body.register_id || existing.register_id, body.customer_name ?? existing.customer_name, body.description ?? existing.description, body.amount ?? existing.amount, body.payment_status || existing.payment_status, body.status || existing.status, body.rejection_reason ?? existing.rejection_reason, now, id);

    await createAuditLog(env, {
      user: user.username,
      action: 'update',
      module: 'Sales',
      reference: body.sale_number || existing.sale_number,
      description: `Updated sale ${body.sale_number || existing.sale_number}`,
      oldStatus: existing.status,
      newStatus: body.status || existing.status,
    });

    const updated = await env.DB.prepare('SELECT * FROM sales WHERE id = ?').bind(id).first();
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
