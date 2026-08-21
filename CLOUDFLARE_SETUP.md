# Cloudflare Backend Setup — Phase 1

## Status
- [x] Wrangler installed (v4.125.0)
- [x] KV namespaces created: SESSIONS_V2, CACHE_V2
- [x] wrangler.toml configured with actual IDs
- [x] Dependencies installed: bcryptjs, hono
- [x] Database schema applied (24 commands executed)
- [x] Worker running locally at http://127.0.0.1:8788
- [ ] Worker deployed to Cloudflare
- [ ] Frontend connected to Worker

## Your KV Namespace IDs
- SESSIONS_V2: `3708e87e2b184d8092fec26d36e78e0a`
- CACHE_V2: `2cf5def6ccde4d59a9f7dce6ef459fbd`

## Current Bindings (Local)
| Binding | Resource | Mode |
|---|---|---|
| env.SESSIONS_V2 | KV Namespace | local |
| env.CACHE_V2 | KV Namespace | local |
| env.DB | D1 Database | local |
| env.ENVIRONMENT | Environment Variable | "development" |

## Test the Worker

### 1. Health Check
```bash
curl http://127.0.0.1:8788/api/auth/me
# Expected: 401 Unauthorized
```

### 2. Login (once frontend is connected)
```bash
curl -X POST http://127.0.0.1:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. Start Frontend
```bash
npm run dev
```

## Next Steps (Phase 2)

After verifying Phase 1 works:
1. Implement each route handler in `src/worker/*.js`
2. Add JWT verification middleware to protected routes
3. Create frontend API client: `src/services/api.js`
4. Connect Login page to Worker auth endpoint
5. Migrate pages one by one to use API instead of localStorage

## Files Created/Modified
- `wrangler.toml` — Cloudflare configuration with actual KV IDs
- `src/worker/index.js` — Worker entry point with routing
- `src/worker/auth.js` — Login/logout/me with JWT + KV sessions
- `src/worker/registers.js` — Placeholder
- `src/worker/purchases.js` — Placeholder
- `src/worker/sales.js` — Placeholder
- `src/worker/expenses.js` — Placeholder
- `src/worker/payments.js` — Placeholder
- `src/worker/approvals.js` — Placeholder
- `src/worker/reports.js` — Placeholder
- `src/worker/auditLogs.js` — Placeholder
- `src/worker/settings.js` — Placeholder
- `src/worker/db/schema.sql` — D1 schema (all tables + indexes)
- `src/worker/seed.js` — Seed script for admin + settings
- `package.json` — Added wrangler scripts
- `CLOUDFLARE_SETUP.md` — This file

## Notes
- Worker uses `nodejs_compat` flag for bcryptjs compatibility
- JWT secret is `dev-secret-change-in-production` — change before deploying
- Sessions expire in 7 days in KV
- Database schema includes: users, registers, purchases, sales, expenses, payments, audit_logs, settings, notifications, sync_queue, sync_conflicts