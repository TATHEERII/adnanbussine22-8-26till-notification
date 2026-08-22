import { useState, useEffect, useCallback, useRef } from 'react'
import { getAuditLogs } from '../services/auditLogs'
import { getToken } from '../services/api'
import { dbToAuditLog } from '../services/transforms'

// Audit entries are written server-side by the Worker on every create,
// update, approve and reject action. This hook only reads them from the
// `/api/audit-logs` endpoint instead of `localStorage`.
export function useAuditLog() {
  const [logs, setLogs] = useState([])
  const [loaded, setLoaded] = useState(false)
  const isRefreshingRef = useRef(false)
  const pollTimerRef = useRef(null)

  const refresh = useCallback(async () => {
    if (!getToken()) return
    if (isRefreshingRef.current) return
    isRefreshingRef.current = true
    setLoaded(false)
    try {
      const data = await getAuditLogs()
      setLogs((data || []).map((l) => dbToAuditLog(l)))
    } catch {
      // keep previous logs if the server is unreachable
    } finally {
      setLoaded(true)
      isRefreshingRef.current = false
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Poll audit logs every 3 seconds while the tab is visible so new entries
  // appear automatically across devices.
  useEffect(() => {
    const startPolling = () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      pollTimerRef.current = setInterval(() => {
        refresh()
      }, 3000)
    }

    const stopPolling = () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }

    if (document.visibilityState === 'visible') {
      startPolling()
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh()
        startPolling()
      } else {
        stopPolling()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      stopPolling()
    }
  }, [refresh])

  // Kept as a no-op so existing call sites in the pages continue to work
  // without writing to browser storage. Real audit logging happens on the
  // server.
  const addLog = useCallback(() => {}, [])

  return { logs, setLogs, addLog, refresh, loaded }
}
