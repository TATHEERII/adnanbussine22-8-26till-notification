import { useLocalStorageState } from './useLocalStorageState'
import { mockAuditLogs } from '../data/mockData'

export function useAuditLog() {
  const [logs, setLogs] = useLocalStorageState('importbiz_v2_audit_logs', mockAuditLogs)

  const addLog = (entry) => {
    const newLog = {
      id: `l${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ...entry,
    }
    setLogs((prev) => [newLog, ...prev])
  }

  return { logs, setLogs, addLog }
}
