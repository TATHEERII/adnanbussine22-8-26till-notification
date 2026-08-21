import { handleAuth } from './auth.js';
import { handleRegisters } from './registers.js';
import { handlePurchases } from './purchases.js';
import { handleSales } from './sales.js';
import { handleExpenses } from './expenses.js';
import { handlePayments } from './payments.js';
import { handleApprovals } from './approvals.js';
import { handleReports } from './reports.js';
import { handleAuditLogs } from './auditLogs.js';
import { handleSettings } from './settings.js';
import { handleNotifications } from './notifications.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path.startsWith('/api/auth/')) {
        const response = await handleAuth(request, env);
        return new Response(response.body, {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const authHeader = request.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (path.startsWith('/api/registers')) return handleRegisters(request, env);
      if (path.startsWith('/api/purchases')) return handlePurchases(request, env);
      if (path.startsWith('/api/sales')) return handleSales(request, env);
      if (path.startsWith('/api/expenses')) return handleExpenses(request, env);
      if (path.startsWith('/api/payments')) return handlePayments(request, env);
      if (path.startsWith('/api/approvals')) return handleApprovals(request, env);
      if (path.startsWith('/api/reports')) return handleReports(request, env);
      if (path.startsWith('/api/audit-logs')) return handleAuditLogs(request, env);
      if (path.startsWith('/api/settings')) return handleSettings(request, env);
      if (path.startsWith('/api/notifications')) return handleNotifications(request, env);

      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
