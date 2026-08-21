import bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';
import { verifySession as getSession } from './lib.js';

export async function handleAuth(request, env) {
  const url = new URL(request.url);
  const method = request.method;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (method === 'POST' && url.pathname === '/api/auth/login') {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      const raw = await request.text();
      return new Response(JSON.stringify({ error: 'Invalid JSON', details: e.message, raw: raw.slice(0, 100) }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { username, password } = body;

    const user = await env.DB.prepare('SELECT * FROM users WHERE username = ? AND status = ?')
      .bind(username, 'active')
      .first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      permissions: JSON.parse(user.permissions || '{}'),
    };

    const token = await sign(payload, env.JWT_SECRET || 'dev-secret-change-in-production');

    await env.SESSIONS_V2.put(token, JSON.stringify({
      userId: user.id,
      username: user.username,
      role: user.role,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
    }), { expirationTtl: 7 * 24 * 60 * 60 });

    return new Response(JSON.stringify({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: JSON.parse(user.permissions || '{}'),
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'POST' && url.pathname === '/api/auth/logout') {
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      await env.SESSIONS_V2.delete(token);
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'GET' && url.pathname === '/api/auth/me') {
    const user = await getSession(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
