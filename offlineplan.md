# Offline-First Setup Plan

## Overview

Add offline capability to the Import Business Accounting app so users can create and manage transactions without internet, then sync automatically when connectivity returns.

---

## Phase 1 — Offline Detection & UI

### Step 1.1: Online/Offline Hook
- New file: `src/hooks/useOnlineStatus.js`
- Track `navigator.onLine`
- Listen to `online` / `offline` window events
- Return boolean `isOnline`

### Step 1.2: Offline Banner Component
- New file: `src/components/ui/OfflineBanner.jsx`
- Show banner at top of app when offline
- Green banner when online, amber when offline
- Auto-hide when connection returns
- Use `useOnlineStatus` hook

### Step 1.3: Integrate Banner into Layout
- Import `OfflineBanner` in `Layout.jsx`
- Render above header, full width
- z-index above everything except modals

### Step 1.4: Pending Sync Indicator
- New component: `src/components/ui/SyncIndicator.jsx`
- Show count of pending items to sync
- Show "Syncing..." spinner when active
- Show "Sync complete" toast on success
- Show error state if sync fails

---

## Phase 2 — Storage Layer Upgrade

### Step 2.1: Evaluate Current localStorage Usage
- Audit all `useLocalStorageState` calls
- List all keys: `importbiz_v2_registers`, `importbiz_v2_purchases`, etc.
- Document data size estimates per entity
- Identify which data needs offline-first vs online-only

### Step 2.2: Add IndexedDB Wrapper
- New file: `src/lib/db.js`
- Use `idb` library (lightweight, promise-based)
- Create object stores for each entity:
  - `registers`, `purchases`, `sales`, `expenses`, `payments`
  - `sync_queue` (pending operations)
  - `metadata` (lastSync timestamps, device id)
- Add CRUD helpers: `dbGetAll`, `dbPut`, `dbDelete`, `dbClear`

### Step 2.3: Create Storage Adapter
- New file: `src/lib/storage.js`
- Interface: `getItem(key)`, `setItem(key, value)`, `removeItem(key)`
- Implementation:
  - If online: use API first, fallback to localStorage
  - If offline: use IndexedDB, queue for sync
- Keep localStorage as fallback for old browsers

### Step 2.4: Migration Helper
- One-time migration from localStorage to IndexedDB
- Run on app load if IndexedDB empty but localStorage has data
- Preserve all existing data
- Show "Migrating data..." toast if needed

---

## Phase 3 — Sync Queue System

### Step 3.1: Define Sync Operation Schema
```typescript
{
  id: string (uuid),
  type: 'CREATE' | 'UPDATE' | 'DELETE',
  entity: 'registers' | 'purchases' | 'sales' | 'expenses' | 'payments',
  recordId: string,
  payload: object,
  timestamp: ISO string,
  retries: number,
  lastError: string | null
}
```

### Step 3.2: Sync Queue Storage
- Create `sync_queue` object store in IndexedDB
- Add indexes on `timestamp` and `entity`
- Operations appended in order created
- Max retries: 3 (then mark as failed)

### Step 3.3: Queue Manager
- New file: `src/lib/syncQueue.js`
- Functions:
  - `enqueue(operation)` — add to queue
  - `dequeue()` — remove oldest successful
  - `getPending()` — get all pending ops
  - `markFailed(id, error)` — increment retry count
  - `clear()` — reset queue (admin only)
- Auto-process when online detected

### Step 3.4: Conflict Detection
- Each record gets `updatedAt` timestamp
- Server returns `serverUpdatedAt` on sync
- If `local.updatedAt > server.updatedAt` and timestamps differ → conflict
- Store conflicts in `sync_conflicts` object store

---

## Phase 4 — Background Sync

### Step 4.1: Service Worker Setup
- New file: `public/sw.js`
- Register service worker in `main.jsx`
- Handle `install` and `activate` events
- Cache static assets for offline loading

### Step 4.2: Background Sync API
- Register sync event in service worker:
  ```javascript
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
      event.waitUntil(syncPendingData());
    }
  });
  ```
- Trigger sync when:
  - `online` event fires
  - App comes to foreground (visibilitychange)
  - User manually taps "Sync Now" button

### Step 4.3: Sync Engine
- New file: `src/lib/syncEngine.js`
- Main function: `syncPendingData()`
- Process queue in order (FIFO)
- For each operation:
  1. Send to Cloudflare Worker API
  2. If success: remove from queue, update local timestamp
  3. If conflict: store in conflicts, notify user
  4. If network error: keep in queue, retry later
- Emit events: `SYNC_START`, `SYNC_PROGRESS`, `SYNC_COMPLETE`, `SYNC_ERROR`

### Step 4.4: Periodic Sync (Polling Fallback)
- If Background Sync API not supported, use polling:
  - Check every 30 seconds when online
  - Process any pending queue items
  - Show sync status in indicator

---

## Phase 5 — Page-by-Page Integration

Migrate each page to use the sync-aware storage layer.

### Step 5.1: Update DataContext
- Replace direct `useLocalStorageState` with sync-aware adapter
- All writes go through `storage.setItem` → enqueue if offline
- All reads check IndexedDB first, then localStorage fallback
- Add `syncStatus` to context: `idle` | `syncing` | `error` | `conflict`

### Step 5.2: Registers Page
- Write operations: `storage.setItem('registers', data)`
- If offline: data saved to IndexedDB + queued for sync
- Show "Saved locally, will sync when online" toast
- Conflict UI: show server version vs local version

### Step 5.3: Purchase Page
- Same pattern
- Only active registers available offline (cached list)

### Step 5.4: Sales Page
- Same pattern

### Step 5.5: Expenses Page
- Same pattern

### Step 5.6: Payments Page
- Same pattern

### Step 5.7: Account Ledger
- Read-only offline (cached approved transactions)
- Show "Last synced: timestamp"
- New entries appear after sync

### Step 5.8: Approvals Page
- Show pending approvals from local queue
- Approve/reject actions queued if offline
- Show "Will sync approval when online"

### Step 5.9: Reports Page
- Show cached report data when offline
- Indicate data may be stale
- Refresh button to re-fetch if online

### Step 5.10: Dashboard
- Show offline stats from local data
- Show "Synced X minutes ago" timestamp
- P/L updates from local approved data only

### Step 5.11: Audit Log
- Local actions logged immediately
- Sync audit log entries with server
- Show unsynced entries with amber dot

### Step 5.12: Admin Users
- User management requires online
- Show "Admin features require internet" if offline
- Cache user list for viewing

### Step 5.13: Settings
- Settings cached locally
- Changes queued for sync
- Show "Settings will sync when online"

---

## Phase 6 — Conflict Resolution UI

### Step 6.1: Conflict Detection
- When sync returns 409 Conflict
- Store conflicting records in `sync_conflicts` store
- Show badge count in SyncIndicator

### Step 6.2: Conflict Resolution Modal
- New file: `src/components/ui/ConflictModal.jsx`
- Show side-by-side: Local vs Server version
- Highlight differences
- Options:
  - "Keep Mine" (local wins, overwrite server)
  - "Keep Server" (server wins, overwrite local)
  - "Merge Manually" (open edit form with both versions)

### Step 6.3: Conflict History
- Track resolved conflicts in audit log
- Show conflict resolution actions

---

## Phase 7 — Testing & Polish

### Step 7.1: Offline Testing
- Test with DevTools Network tab offline
- Test with airplane mode
- Test with WiFi on/off toggling
- Test partial connectivity (flaky network)

### Step 7.2: Sync Testing
- Create data offline
- Go online
- Verify sync completes
- Verify data appears on other devices
- Test conflict scenarios

### Step 7.3: Data Integrity
- Verify no data loss during sync
- Verify no duplicate records
- Verify timestamps correct
- Verify ledger calculations correct after sync

### Step 7.4: Performance Testing
- Test with 1000+ records
- Test IndexedDB performance
- Test sync queue performance
- Test memory usage

### Step 7.5: Edge Cases
- App closed during sync
- App updated during sync
- Multiple tabs open
- Browser data cleared
- Storage quota exceeded

---

## Implementation Order (Recommended)

| Order | Step | Priority | Effort |
|---|---|---|---|
| 1 | Step 1.1-1.4 | High | 1 day |
| 2 | Step 2.1-2.4 | High | 2-3 days |
| 3 | Step 3.1-3.4 | High | 2-3 days |
| 4 | Step 4.1-4.4 | High | 2-3 days |
| 5 | Step 5.1-5.13 | Medium | 3-4 days |
| 6 | Step 6.1-6.3 | Medium | 2-3 days |
| 7 | Step 7.1-7.5 | High | 1-2 days |

**Total: 11-19 days**

---

## When to Build This

**Recommended timeline:**
1. Complete frontend (all 13 pages) — DONE
2. Complete Cloudflare backend (Phase 1-3 of backendplan.md)
3. Build offline layer ON TOP of backend API
4. Integrate pages one by one (Phase 4 of backendplan.md + Phase 5 of this plan)

**Why this order:**
- Backend API provides authoritative server state
- Offline layer syncs to that authoritative state
- Conflict resolution is clearer when server is source of truth
- Don't build offline-first before backend exists

---

## Files to Create

### New Components
- `src/components/ui/OfflineBanner.jsx`
- `src/components/ui/SyncIndicator.jsx`
- `src/components/ui/ConflictModal.jsx`

### New Libraries
- `src/lib/db.js` — IndexedDB wrapper
- `src/lib/storage.js` — storage adapter
- `src/lib/syncQueue.js` — queue management
- `src/lib/syncEngine.js` — sync orchestration

### New Hooks
- `src/hooks/useOnlineStatus.js`

### Modified Files
- `src/main.jsx` — service worker registration
- `src/context/DataContext.jsx` — sync-aware
- `src/App.jsx` — offline banner, sync provider
- All page files — use sync-aware storage

---

## Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Local DB | IndexedDB | Larger storage, async API, structured data |
| Sync trigger | Background Sync API + polling fallback | Reliable across browsers |
| Conflict strategy | Manual resolution | Complex business data, user knows context |
| Queue storage | IndexedDB | Survives browser restart, larger capacity |
| Service Worker | Cache-first for assets, network-first for API | Fast loading, fresh data when possible |
| Authentication | JWT in sessionStorage | Secure, works with service worker |

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Data loss during sync | Queue operations before sending, confirm success before removing |
| Conflict storms | Batch sync, show resolution UI, allow bulk actions |
| Storage quota exceeded | Monitor usage, warn user, offer cleanup |
| Battery drain from polling | Use Background Sync API, exponential backoff |
| Service Worker complexity | Use Workbox library, test thoroughly |
| Browser compatibility | Fallback to localStorage + polling for old browsers |
