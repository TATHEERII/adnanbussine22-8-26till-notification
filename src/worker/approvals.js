import { verifySession, createAuditLog, createNotification } from './lib.js';

export async function handleApprovals(request, env) {
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

  if (method === 'GET' && url.pathname === '/api/approvals') {
    const results = [];

    const registers = await env.DB.prepare(
      "SELECT id, name, status, owner_id, created_at, 'register' as type, 'Register' as label FROM registers WHERE status = 'pending'"
    ).all();
    if (registers.results) {
      for (const r of registers.results) {
        const owner = await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(r.owner_id).first();
        results.push({ ...r, owner_name: owner ? owner.username : 'Unknown', entity_type: 'register' });
      }
    }

    const purchases = await env.DB.prepare(
      "SELECT id, purchase_number, status, created_by, created_at, 'purchase' as type, 'Purchase' as label FROM purchases WHERE status = 'pending'"
    ).all();
    if (purchases.results) {
      for (const p of purchases.results) {
        const creator = await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(p.created_by).first();
        results.push({ ...p, owner_name: creator ? creator.username : 'Unknown', entity_type: 'purchase' });
      }
    }

    const sales = await env.DB.prepare(
      "SELECT id, sale_number, status, created_by, created_at, 'sale' as type, 'Sale' as label FROM sales WHERE status = 'pending'"
    ).all();
    if (sales.results) {
      for (const s of sales.results) {
        const creator = await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(s.created_by).first();
        results.push({ ...s, owner_name: creator ? creator.username : 'Unknown', entity_type: 'sale' });
      }
    }

    const expenses = await env.DB.prepare(
      "SELECT id, expense_number, status, created_by, created_at, 'expense' as type, 'Expense' as label FROM expenses WHERE status = 'pending'"
    ).all();
    if (expenses.results) {
      for (const e of expenses.results) {
        const creator = await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(e.created_by).first();
        results.push({ ...e, owner_name: creator ? creator.username : 'Unknown', entity_type: 'expense' });
      }
    }

    const payments = await env.DB.prepare(
      "SELECT id, payment_number, status, created_by, created_at, 'payment' as type, 'Payment' as label FROM payments WHERE status = 'pending'"
    ).all();
    if (payments.results) {
      for (const p of payments.results) {
        const creator = await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(p.created_by).first();
        results.push({ ...p, owner_name: creator ? creator.username : 'Unknown', entity_type: 'payment' });
      }
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'POST' && url.pathname.endsWith('/approve')) {
    const parts = url.pathname.split('/');
    const entity = parts[3];
    const id = parts[4];

    const tables = {
      register: { table: 'registers', idCol: 'id', ownerCol: 'owner_id' },
      purchase: { table: 'purchases', idCol: 'id', ownerCol: 'created_by' },
      sale: { table: 'sales', idCol: 'id', ownerCol: 'created_by' },
      expense: { table: 'expenses', idCol: 'id', ownerCol: 'created_by' },
      payment: { table: 'payments', idCol: 'id', ownerCol: 'created_by' },
    };

    const config = tables[entity];
    if (!config) {
      return new Response(JSON.stringify({ error: 'Invalid entity type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const item = await env.DB.prepare(`SELECT * FROM ${config.table} WHERE ${config.idCol} = ?`).bind(id).first();
    if (!item) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (item[config.ownerCol] === user.id) {
      return new Response(JSON.stringify({ error: 'Cannot approve your own request' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const newStatus = entity === 'register' ? 'active' : 'approved';
    const now = new Date().toISOString();

    await env.DB.prepare(
      `UPDATE ${config.table} SET status = ?, rejection_reason = '', updated_at = ? WHERE ${config.idCol} = ?`
    ).bind(newStatus, now, id).run();

    await createAuditLog(env, {
      user: user.username,
      action: 'approve',
      module: entity.charAt(0).toUpperCase() + entity.slice(1),
      reference: id,
      description: `Approved ${entity} ${id}`,
      oldStatus: 'pending',
      newStatus: newStatus,
    });

    await createNotification(env, {
      userId: item[config.ownerCol],
      type: 'approval',
      reference: id,
      message: `Your ${entity} has been approved`,
      read: 0,
    });

    const updated = await env.DB.prepare(`SELECT * FROM ${config.table} WHERE ${config.idCol} = ?`).bind(id).first();
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'POST' && url.pathname.endsWith('/reject')) {
    const parts = url.pathname.split('/');
    const entity = parts[3];
    const id = parts[4];

    const body = await request.json().catch(() => ({}));
    const reason = body.rejection_reason || '';

    const tables = {
      register: { table: 'registers', idCol: 'id', ownerCol: 'owner_id' },
      purchase: { table: 'purchases', idCol: 'id', ownerCol: 'created_by' },
      sale: { table: 'sales', idCol: 'id', ownerCol: 'created_by' },
      expense: { table: 'expenses', idCol: 'id', ownerCol: 'created_by' },
      payment: { table: 'payments', idCol: 'id', ownerCol: 'created_by' },
    };

    const config = tables[entity];
    if (!config) {
      return new Response(JSON.stringify({ error: 'Invalid entity type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const item = await env.DB.prepare(`SELECT * FROM ${config.table} WHERE ${config.idCol} = ?`).bind(id).first();
    if (!item) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (item[config.ownerCol] === user.id) {
      return new Response(JSON.stringify({ error: 'Cannot reject your own request' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date().toISOString();

    await env.DB.prepare(
      `UPDATE ${config.table} SET status = 'rejected', rejection_reason = ?, updated_at = ? WHERE ${config.idCol} = ?`
    ).bind(reason, now, id).run();

    await createAuditLog(env, {
      user: user.username,
      action: 'reject',
      module: entity.charAt(0).toUpperCase() + entity.slice(1),
      reference: id,
      description: `Rejected ${entity} ${id}`,
      oldStatus: 'pending',
      newStatus: 'rejected',
    });

    await createNotification(env, {
      userId: item[config.ownerCol],
      type: 'approval',
      reference: id,
      message: `Your ${entity} has been rejected`,
      read: 0,
    });

    const updated = await env.DB.prepare(`SELECT * FROM ${config.table} WHERE ${config.idCol} = ?`).bind(id).first();
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
