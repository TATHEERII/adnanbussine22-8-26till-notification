# Backend Integration Plan — Cloudflare

## Overview

Migrate from localStorage to Cloudflare backend in small, reversible steps. Each step keeps the app functional. No big-bang changes.

---

## Phase 1 — Cloudflare Project Setup

### Step 1.1: Initialize Cloudflare Project
- Create Cloudflare account (free tier)
- Install Wrangler CLI: `npm install -g wrangler`
- Run `wrangler init importbiz-api` in project root
- Choose "Hello World Worker" template
- Configure `wrangler.toml` with:
  - `name = "importbiz-api"`
  - `compatibility_date = "2025-01-01"`
  - D1 database binding: `[[d1_databases]]`
  - KV namespace binding: `[[kv_namespaces]]`

### Step 1.2: Create D1 Database
- Run `wrangler d1 create importbiz-db`
- Create tables: `users`, `registers`, `purchases`, `sales`, `expenses`, `payments`, `audit_logs`, `settings`
- Run `wrangler d1 migrations create importbiz-db init`
- Write migration SQL for all tables
- Apply migration with `wrangler d1 migrations apply importbiz-db`

### Step 1.3: Seed Initial Data
- Write seed script in Worker
- Insert default admin user (username: `admin`, password: `admin123`)
- Insert settings rows
- Verify with `wrangler d1 execute importbiz-db --command "SELECT * FROM users"`

### Step 1.4: Create KV Namespaces
- Run `wrangler kv:namespace create SESSIONS`
- Run `wrangler kv:namespace create CACHE`
- Add to `wrangler.toml`

---

## Phase 2 — Backend API (Workers)

### Step 2.1: Basic Worker Structure
- Create `src/worker/index.js`
- Add CORS headers for frontend origin
- Add request logging middleware
- Add error handling middleware

### Step 2.2: Authentication API
- `POST /api/auth/login` — validate credentials, return JWT
- `POST /api/auth/logout` — invalidate session
- `GET /api/auth/me` — get current user from token
- Use Cloudflare KV for session storage (7-day TTL)
- Passwords: use simple bcrypt or argon2 (Worker-compatible)

### Step 2.3: Core CRUD API
Create REST endpoints for each entity:
- `GET/POST /api/registers`
- `GET/PUT /api/registers/:id`
- `GET/POST /api/purchases`
- `GET/PUT /api/purchases/:id`
- Same pattern for: sales, expenses, payments
- `GET /api/ledger` — aggregated approved transactions
- `GET /api/reports/*` — report aggregations
- `GET /api/audit-logs`

### Step 2.4: Approval API
- `POST /api/approvals/:id/approve`
- `POST /api/approvals/:id/reject`
- Both endpoints:
  - Verify requester ≠ approver
  - Update status in D1
  - Create audit log entry
  - Return updated object

### Step 2.5: Notification API
- `GET /api/notifications` — list pending approvals for current user
- `POST /api/notifications/mark-read` — mark as read
- Store notifications in D1 table `notifications`
- Push via Cloudflare Email or Web Push (choose one)

### Step 2.6: Settings API
- `GET /api/settings`
- `PUT /api/settings`
- Single row in D1, cached in KV for 5 minutes

---

## Phase 3 — Frontend API Layer

### Step 3.1: Create API Client
- New file: `src/services/api.js`
- Functions: `apiGet`, `apiPost`, `apiPut`, `apiDelete`
- Add JWT token from localStorage/sessionStorage
- Add 401 handling (redirect to login)
- Add error toast notifications

### Step 3.2: Create Auth Service
- New file: `src/services/auth.js`
- `login(username, password)` → calls Worker, stores token
- `logout()` → clears token, calls Worker
- `getCurrentUser()` → returns cached user or fetches from Worker
- `isAuthenticated()` → checks token validity

### Step 3.3: Create Data Services
- One service file per entity:
  - `src/services/registers.js`
  - `src/services/purchases.js`
  - `src/services/sales.js`
  - `src/services/expenses.js`
  - `src/services/payments.js`
  - `src/services/approvals.js`
  - `src/services/reports.js`
  - `src/services/auditLogs.js`
  - `src/services/notifications.js`
- Each exports CRUD functions using `apiGet/apiPost/etc`

### Step 3.4: Update DataContext
- Modify `src/context/DataContext.jsx`
- Replace `useLocalStorageState` with API calls
- Add loading states
- Add error states
- Keep fallback to localStorage if API fails (graceful degradation)

---

## Phase 4 — Page-by-Page Migration

Migrate one page at a time. Test each page before moving to next.

### Step 4.1: Login Page
- Replace mock auth with `auth.login()`
- Store JWT token in sessionStorage (not localStorage for security)
- Store user object in DataContext
- Handle 401 errors → redirect to login
- Add "Remember me" option (stores in localStorage with expiry)

### Step 4.2: Registers Page
- Replace `useLocalStorageState` with `registersService.getAll()`
- Replace `setRegisters` with `registersService.update()`
- Add loading spinner while fetching
- Add error toast on failure
- Test: create, edit, submit, approve, reject flows

### Step 4.3: Purchase Page
- Same pattern as Registers
- Verify only active registers appear in dropdown (fetch from API)

### Step 4.4: Sales Page
- Same pattern
- Test payment status options

### Step 4.5: Expenses Page
- Same pattern
- Test category filter with API

### Step 4.6: Payments Page
- Same pattern
- Test Cash/Bank filter

### Step 4.7: Account Ledger Page
- Replace with `ledgerService.getEntries(filters)`
- Server-side filtering (date, register, type)
- Test running balance calculation

### Step 4.8: Approvals Page
- Replace with `approvalsService.getPending()`
- Approve/Reject buttons call API endpoints
- Test real-time updates via polling (every 30 seconds)

### Step 4.9: Reports Page
- Replace with `reportsService.getSales()`, etc.
- Server-side date range filtering
- Test P/L calculation on server

### Step 4.10: Audit Log Page
- Replace with `auditLogsService.getAll()`
- Server-side filtering
- Test log creation from approval actions

### Step 4.11: Admin Users Page
- Replace with `usersService.getAll()`
- User create/update/delete via API
- Permission management via API
- Test deactivate/reactivate

### Step 4.12: Settings Page
- Replace with `settingsService.get()` / `settingsService.update()`
- Cache in KV for performance
- Test currency change propagates

### Step 4.13: Dashboard
- Replace all `useLocalStorageState` with API calls
- Fetch aggregated stats from `/api/dashboard/stats`
- Server-side date filtering
- Test P/L updates in real-time

---

## Phase 5 — Authentication & Authorization

### Step 5.1: JWT Implementation
- Worker generates JWT on login
- JWT contains: userId, role, permissions
- Frontend sends JWT in `Authorization: Bearer <token>` header
- Worker validates JWT on every protected route

### Step 5.2: Permission Middleware
- Worker checks permissions before allowing actions
- Example: `canApprovePurchase` check before approve endpoint
- Return 403 if permission denied

### Step 5.3: Session Management
- Store session in KV with 7-day TTL
- Frontend checks session validity on app load
- Auto-logout if session expired

---

## Phase 6 — Notifications

### Step 6.1: Notification System
- Create `notifications` table in D1
- When item submitted for approval → create notification for all authorized users (except creator)
- When item approved/rejected → create notification for creator
- Frontend polls `/api/notifications` every 30 seconds
- Show badge count in header bell icon

### Step 6.2: Push Notifications (Optional)
- Use Web Push API with Cloudflare
- Request permission on first login
- Send push notification on new approval request

### Step 6.3: Email Notifications (Optional)
- Use Cloudflare Email Routing
- Send email when:
  - New approval request created
  - Request approved/rejected
- Simple HTML template

---

## Phase 7 — Deployment

### Step 7.1: Deploy Worker
- Run `wrangler deploy`
- Configure custom domain (optional)
- Set environment variables in Cloudflare dashboard

### Step 7.2: Deploy Frontend
- Build frontend: `npm run build`
- Deploy to Cloudflare Pages:
  - Connect GitHub repo
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_URL=https://importbiz-api.workers.dev`

### Step 7.3: Custom Domain
- Add custom domain in Cloudflare Pages
- Configure SSL/TLS

---

## Rollback Strategy

Each phase has a rollback plan:

| Phase | Rollback |
|---|---|
| Phase 1-2 | Delete Worker, revert frontend to localStorage |
| Phase 3 | Revert DataContext to localStorage |
| Phase 4 | Revert individual page to localStorage |
| Phase 5-7 | Keep JWT optional, fallback to localStorage |

---

## Testing Strategy

After each step:
1. Test on local dev server (`npm run dev`)
2. Test with `wrangler dev` for Worker locally
3. Test on staging Worker (deploy to preview)
4. Verify all existing functionality works
5. Verify no data loss during migration
6. Test offline behavior (localStorage fallback)

---

## Estimated Timeline

| Phase | Steps | Time |
|---|---|---|
| Phase 1: Setup | 4 steps | 2-3 hours |
| Phase 2: Backend API | 6 steps | 4-6 hours |
| Phase 3: Frontend Layer | 4 steps | 2-3 hours |
| Phase 4: Page Migration | 13 steps | 6-8 hours |
| Phase 5: Auth | 3 steps | 2-3 hours |
| Phase 6: Notifications | 3 steps | 2-3 hours |
| Phase 7: Deploy | 3 steps | 1-2 hours |
| **Total** | **36 steps** | **19-28 hours** |

---

## Notes

- All API endpoints return JSON
- All dates stored as ISO strings in D1
- All amounts stored as integers (cents) or decimals
- Pagination: limit/offset for large datasets
- Caching: KV for settings, D1 for transactional data
- Backups: D1 has built-in backups, export weekly
- Monitoring: Cloudflare Workers Analytics + custom audit logs
