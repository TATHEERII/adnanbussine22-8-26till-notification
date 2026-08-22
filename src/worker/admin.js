import { verifySession, createAuditLog, getSettings } from './lib.js';

export async function handleAdmin(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const user = await verifySession(request, env);

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'DELETE' && url.pathname === '/api/admin/reset') {
    try {
      // Delete all app data except user credentials
      await env.DB.prepare('DELETE FROM sync_conflicts').run();
      await env.DB.prepare('DELETE FROM sync_queue').run();
      await env.DB.prepare('DELETE FROM notifications').run();
      await env.DB.prepare('DELETE FROM audit_logs').run();
      await env.DB.prepare('DELETE FROM payments').run();
      await env.DB.prepare('DELETE FROM expenses').run();
      await env.DB.prepare('DELETE FROM sales').run();
      await env.DB.prepare('DELETE FROM purchases').run();
      await env.DB.prepare('DELETE FROM registers').run();
      await env.DB.prepare('DELETE FROM settings').run();

      // Re-seed default settings so the app remains usable
      const now = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO settings (id, business_name, phone, email, address, currency, register_prefix, purchase_prefix, sales_prefix, expense_prefix, payment_prefix, register_approval, purchase_approval, sales_approval, expense_approval, payment_approval, updated_at)
         VALUES (1, 'Import Business', NULL, NULL, NULL, 'PKR', 'REG-', 'PUR-', 'SAL-', 'EXP-', 'PAY-', 'Authorized User', 'Authorized User', 'Authorized User', 'Authorized User', 'Authorized User', ?)`
      ).bind(now).run();

      await createAuditLog(env, {
        user: user.username,
        action: 'reset',
        module: 'Admin',
        description: 'Reset all application data (user credentials preserved)',
      });

      return new Response(JSON.stringify({ success: true, message: 'All application data has been reset. User credentials are preserved.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
