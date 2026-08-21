export function generateId() {
  return crypto.randomUUID();
}

export function nowISO() {
  return new Date().toISOString();
}

export function today() {
  return new Date().toISOString().split('T')[0];
}

export function timeNow() {
  return new Date().toTimeString().split(' ')[0];
}

export async function verifySession(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const session = await env.SESSIONS_V2.get(token, 'json');
  if (!session) return null;

  const user = await env.DB.prepare(
    'SELECT id, username, name, email, role, permissions FROM users WHERE id = ?'
  )
    .bind(session.userId)
    .first();

  if (!user) return null;

  return {
    ...user,
    permissions: JSON.parse(user.permissions || '{}'),
  };
}

export async function createAuditLog(env, data) {
  const id = generateId();
  await env.DB.prepare(
    `INSERT INTO audit_logs (id, user, action, module, reference, register, date, time, description, old_status, new_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    data.user,
    data.action,
    data.module,
    data.reference || null,
    data.register || null,
    today(),
    timeNow(),
    data.description || null,
    data.oldStatus || null,
    data.newStatus || null
  );
}

export async function createNotification(env, data) {
  const id = generateId();
  await env.DB.prepare(
    `INSERT INTO notifications (id, user_id, type, reference, message, read)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    data.userId,
    data.type,
    data.reference || null,
    data.message,
    data.read || 0
  );
}

export async function getSettings(env) {
  const settings = await env.DB.prepare('SELECT * FROM settings WHERE id = 1').first();
  return settings || null;
}
