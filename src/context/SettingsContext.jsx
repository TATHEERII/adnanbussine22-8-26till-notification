import { useState, useContext, createContext, useEffect, useCallback } from 'react'
import { getSettings, updateSettings as saveSettings } from '../services/settings'
import { getToken } from '../services/api'
import { dbToSettings, settingsToDb } from '../services/transforms'

const defaultSettings = {
  businessName: 'Import Business',
  phone: '+92-300-1234567',
  email: 'info@importbusiness.com',
  address: '123 Business Street, Karachi, Pakistan',
  currency: 'PKR',
  registerPrefix: 'REG-',
  purchasePrefix: 'PUR-',
  salesPrefix: 'SAL-',
  expensePrefix: 'EXP-',
  paymentPrefix: 'PAY-',
  registerApproval: 'Authorized User',
  purchaseApproval: 'Authorized User',
  salesApproval: 'Authorized User',
  expenseApproval: 'Authorized User',
  paymentApproval: 'Authorized User',
}

const SettingsContext = createContext({
  settings: defaultSettings,
  setSettings: () => {},
  currencySymbol: '₨',
  settingsLoaded: false,
})

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  const currencySymbols = {
    USD: '$',
    PKR: '₨',
    INR: '₹',
    AED: 'د.إ',
    GBP: '£',
  }

  const currencySymbol = currencySymbols[settings.currency] || '$'

  const loadSettings = useCallback(async () => {
    if (!getToken()) return
    try {
      const s = await getSettings()
      if (s) setSettings(dbToSettings(s))
    } catch {
      // keep defaults if the server is unreachable
    } finally {
      setSettingsLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const saveSettingsChange = useCallback(
    async (data) => {
      const res = await saveSettings(settingsToDb(data))
      const merged = dbToSettings(res) || data
      setSettings(merged)
      return merged
    },
    []
  )

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings: saveSettingsChange,
        currencySymbol,
        settingsLoaded,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
