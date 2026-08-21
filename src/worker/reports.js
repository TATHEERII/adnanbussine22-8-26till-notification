import { verifySession } from './lib.js';

export async function handleReports(request, env) {
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

  if (method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const type = url.pathname.replace('/api/reports', '') || '/sales';
  const dateFrom = url.searchParams.get('date_from');
  const dateTo = url.searchParams.get('date_to');
  const registerId = url.searchParams.get('register_id');

  let dateFilter = '';
  const dateParams = [];
  if (dateFrom) {
    dateFilter += ' AND date >= ?';
    dateParams.push(dateFrom);
  }
  if (dateTo) {
    dateFilter += ' AND date <= ?';
    dateParams.push(dateTo);
  }

  const registerFilter = registerId ? ' AND register_id = ?' : '';
  const allParams = [...dateParams];
  if (registerId) allParams.push(registerId);

  if (type === '/sales') {
    let query = `SELECT * FROM sales WHERE status = '\''approved'\''${dateFilter}${registerFilter} ORDER BY date DESC`;
    const stmt = env.DB.prepare(query);
    const rows = allParams.length > 0 ? await stmt.bind(...allParams).all() : await stmt.all();
    const total = rows.results ? rows.results.reduce((sum, row) => sum + (Number(row.amount) || 0), 0) : 0;
    return new Response(JSON.stringify({ items: rows.results || [], total }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (type === '/purchases') {
    let query = `SELECT * FROM purchases WHERE status = '\''approved'\''${dateFilter}${registerFilter} ORDER BY date DESC`;
    const stmt = env.DB.prepare(query);
    const rows = allParams.length > 0 ? await stmt.bind(...allParams).all() : await stmt.all();
    const total = rows.results ? rows.results.reduce((sum, row) => sum + (Number(row.amount) || 0), 0) : 0;
    return new Response(JSON.stringify({ items: rows.results || [], total }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (type === '/expenses') {
    let query = `SELECT * FROM expenses WHERE status = '\''approved'\''${dateFilter}${registerFilter} ORDER BY date DESC`;
    const stmt = env.DB.prepare(query);
    const rows = allParams.length > 0 ? await stmt.bind(...allParams).all() : await stmt.all();
    const total = rows.results ? rows.results.reduce((sum, row) => sum + (Number(row.amount) || 0), 0) : 0;
    return new Response(JSON.stringify({ items: rows.results || [], total }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (type === '/payments') {
    let query = `SELECT * FROM payments WHERE status = '\''approved'\''${dateFilter}${registerFilter} ORDER BY date DESC`;
    const stmt = env.DB.prepare(query);
    const rows = allParams.length > 0 ? await stmt.bind(...allParams).all() : await stmt.all();
    const total = rows.results ? rows.results.reduce((sum, row) => sum + (Number(row.amount) || 0), 0) : 0;
    return new Response(JSON.stringify({ items: rows.results || [], total }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (type === '/profitloss') {
    const salesRows = await env.DB.prepare(
      `SELECT amount, date, register_id FROM sales WHERE status = '\''approved'\''${dateFilter}`
    ).all();
    const purchaseRows = await env.DB.prepare(
      `SELECT amount, date, register_id FROM purchases WHERE status = '\''approved'\''${dateFilter}`
    ).all();
    const expenseRows = await env.DB.prepare(
      `SELECT amount, date, register_id FROM expenses WHERE status = '\''approved'\''${dateFilter}`
    ).all();

    const totalSales = salesRows.results ? salesRows.results.reduce((sum, row) => sum + (Number(row.amount) || 0), 0) : 0;
    const totalPurchases = purchaseRows.results ? purchaseRows.results.reduce((sum, row) => sum + (Number(row.amount) || 0), 0) : 0;
    const totalExpenses = expenseRows.results ? expenseRows.results.reduce((sum, row) => sum + (Number(row.amount) || 0), 0) : 0;

    return new Response(JSON.stringify({
      sales: totalSales,
      purchases: totalPurchases,
      expenses: totalExpenses,
      profit: totalSales - totalPurchases - totalExpenses,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (type === '/registers') {
    let query = `SELECT * FROM registers${dateFilter ? " WHERE created_at >= ?" : ""}`;
    const stmt = env.DB.prepare(query);
    const rows = dateFrom ? await stmt.bind(dateFrom).all() : await stmt.all();
    return new Response(JSON.stringify(rows.results || []), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
