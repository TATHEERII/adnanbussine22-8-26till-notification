import { verifySession, getSettings } from './lib.js';

export async function handleSettings(request, env) {
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

  if (method === 'GET' && url.pathname === '/api/settings') {
    const settings = await getSettings(env);
    if (!settings) {
      return new Response(JSON.stringify({ error: 'Settings not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'PUT' && url.pathname === '/api/settings') {
    const body = await request.json();
    const now = new Date().toISOString();

    await env.DB.prepare(
      `UPDATE settings SET
       business_name = ?,
       phone = ?,
       email = ?,
       address = ?,
       currency = ?,
       register_prefix = ?,
       purchase_prefix = ?,
       sales_prefix = ?,
       expense_prefix = ?,
       payment_prefix = ?,
       register_approval = ?,
       purchase_approval = ?,
       sales_approval = ?,
       expense_approval = ?,
       payment_approval = ?,
       updated_at = ?
       WHERE id = 1`
    ).bind(
      body.business_name || 'Import Business',
      body.phone || null,
      body.email || null,
      body.address || null,
      body.currency || 'PKR',
      body.register_prefix || 'REG-',
      body.purchase_prefix || 'PUR-',
      body.sales_prefix || 'SAL-',
      body.expense_prefix || 'EXP-',
      body.payment_prefix || 'PAY-',
      body.register_approval || 'Authorized User',
      body.purchase_approval || 'Authorized User',
      body.sales_approval || 'Authorized User',
      body.expense_approval || 'Authorized User',
      body.payment_approval || 'Authorized User',
      now
    );

    const updated = await getSettings(env);
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
