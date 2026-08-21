import { verifySession, generateId, nowISO, createAuditLog } from './lib.js';

export async function handleExpenses(request, env) {
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

  if (method === 'GET' && url.pathname === '/api/expenses') {
    const status = url.searchParams.get('status');
    const registerId = url.searchParams.get('register_id');

    let query = 'SELECT * FROM expenses WHERE 1=1';
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

  if (method === 'GET' && url.pathname.startsWith('/api/expenses/')) {
    const id = url.pathname.split('/')[3];
    const expense = await env.DB.prepare('SELECT * FROM expenses WHERE id = ?').bind(id).first();
    if (!expense) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(expense), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'POST' && url.pathname === '/api/expenses') {
    const body = await request.json();
    const id = generateId();
    const now = nowISO();

    await env.DB.prepare(
      `INSERT INTO expenses (id, expense_number, date, register_id, category, description, amount, status, created_by, rejection_reason, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, body.expense_number, body.date, body.register_id, body.category || null, body.description || null, body.amount, body.status || 'draft', user.id, null, now, now);

    await createAuditLog(env, {
      user: user.username,
      action: 'create',
      module: 'Expenses',
      reference: body.expense_number,
      description: `Created expense ${body.expense_number}`,
    });

    const newExpense = await env.DB.prepare('SELECT * FROM expenses WHERE id = ?').bind(id).first();
    return new Response(JSON.stringify(newExpense), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'PUT' && url.pathname.startsWith('/api/expenses/')) {
    const id = url.pathname.split('/')[3];
    const body = await request.json();
    const now = nowISO();

    const existing = await env.DB.prepare('SELECT * FROM expenses WHERE id = ?').bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await env.DB.prepare(
      `UPDATE expenses SET expense_number = ?, date = ?, register_id = ?, category = ?, description = ?, amount = ?, status = ?, rejection_reason = ?, updated_at = ?
       WHERE id = ?`
    ).bind(body.expense_number || existing.expense_number, body.date || existing.date, body.register_id || existing.register_id, body.category ?? existing.category, body.description ?? existing.description, body.amount ?? existing.amount, body.status || existing.status, body.rejection_reason ?? existing.rejection_reason, now, id);

    await createAuditLog(env, {
      user: user.username,
      action: 'update',
      module: 'Expenses',
      reference: body.expense_number || existing.expense_number,
      description: `Updated expense ${body.expense_number || existing.expense_number}`,
      oldStatus: existing.status,
      newStatus: body.status || existing.status,
    });

    const updated = await env.DB.prepare('SELECT * FROM expenses WHERE id = ?').bind(id).first();
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
