import bcrypt from 'bcryptjs';
import { verifySession } from './lib.js';

export async function handleUsers(request, env) {
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

  if (method === 'GET' && url.pathname === '/api/users/lookup') {
    try {
      const users = await env.DB.prepare('SELECT id, name FROM users').all();
      return new Response(JSON.stringify(users.results || []), {
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

  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (method === 'GET' && url.pathname === '/api/users') {
    try {
      const users = await env.DB.prepare('SELECT id, username, name, email, role, status, permissions, created_at, updated_at FROM users').all();
      const parsed = (users.results || []).map((u) => ({
        ...u,
        permissions: u.permissions ? JSON.parse(u.permissions) : {},
        createdAt: u.created_at,
        updatedAt: u.updated_at,
      }));
      return new Response(JSON.stringify(parsed), {
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

  if (method === 'POST' && url.pathname === '/api/users') {
    try {
      const body = await request.json();
      const { name, username, email, password, role, status, permissions } = body;

      if (!name || !username || !email || !password) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
      if (existing) {
        return new Response(JSON.stringify({ error: 'Username already exists' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const id = `u-${Date.now()}`;
      const passwordHash = await bcrypt.hash(password, 10);

      await env.DB.prepare(
        `INSERT INTO users (id, username, password_hash, name, email, role, status, permissions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id,
        username,
        passwordHash,
        name,
        email,
        role || 'user',
        status || 'active',
        JSON.stringify(permissions || {})
      ).run();

      const created = await env.DB.prepare('SELECT id, username, name, email, role, status, permissions, created_at, updated_at FROM users WHERE id = ?').bind(id).first();
      if (!created) {
        return new Response(JSON.stringify({ error: 'Failed to create user' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const parsed = {
        ...created,
        permissions: created.permissions ? JSON.parse(created.permissions) : {},
        createdAt: created.created_at,
        updatedAt: created.updated_at,
      };

      return new Response(JSON.stringify(parsed), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (method === 'PUT' && url.pathname.startsWith('/api/users/')) {
    try {
      const id = url.pathname.split('/api/users/')[1];
      if (!id) {
        return new Response(JSON.stringify({ error: 'User ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = await request.json();
      const { name, email, role, status, permissions, password } = body;

      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        await env.DB.prepare(
        `UPDATE users SET name = ?, email = ?, role = ?, status = ?, permissions = ?, password_hash = ?, updated_at = ? WHERE id = ?`
      ).bind(
        name,
        email,
        role,
        status,
        JSON.stringify(permissions || {}),
        passwordHash,
        new Date().toISOString(),
        id
      ).run();
      } else {
        await env.DB.prepare(
          `UPDATE users SET name = ?, email = ?, role = ?, status = ?, permissions = ?, updated_at = ? WHERE id = ?`
        ).bind(
          name,
          email,
          role,
          status,
          JSON.stringify(permissions || {}),
          new Date().toISOString(),
          id
        ).run();
      }

      const updated = await env.DB.prepare('SELECT id, username, name, email, role, status, permissions, created_at, updated_at FROM users WHERE id = ?').bind(id).first();
      if (!updated) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const parsed = {
        ...updated,
        permissions: updated.permissions ? JSON.parse(updated.permissions) : {},
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      };

      return new Response(JSON.stringify(parsed), {
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

  if (method === 'DELETE' && url.pathname.startsWith('/api/users/')) {
    try {
      const id = url.pathname.split('/api/users/')[1];
      if (!id) {
        return new Response(JSON.stringify({ error: 'User ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
      return new Response(JSON.stringify({ success: true }), {
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
