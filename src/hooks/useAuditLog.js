import { useState, useEffect, useCallback } from 'react'
import { getAuditLogs } from '../services/auditLogs'
import { getToken } from '../services/api'
import { dbToAuditLog } from '../services/transforms'

// Audit entries are written server-side by the Worker on every create,
// update, approve and reject action. This hook only reads them from the
// `/api/audit-logs` endpoint instead of `localStorage`.
export function useAuditLog() {
  const [logs, setLogs] = useState([])
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    if (!getToken()) return
    try {
      const data = await getAuditLogs()
      setLogs((data || []).map((l) => dbToAuditLog(l)))
    } catch {
      // keep previous logs if the server is unreachable
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Kept as a no-op so existing call sites in the pages continue to work
  // without writing to browser storage. Real audit logging happens on the
  // server.
  const addLog = useCallback(() => {}, [])

  return { logs, setLogs, addLog, refresh, loaded }
}
