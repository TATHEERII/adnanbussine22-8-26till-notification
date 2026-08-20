import { useState, useContext, createContext } from 'react'
import { useLocalStorageState } from '../hooks/useLocalStorageState'

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
})

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useLocalStorageState('importbiz_v2_settings', defaultSettings)

  const currencySymbols = {
    USD: '$',
    PKR: '₨',
    INR: '₹',
    AED: 'د.إ',
    GBP: '£',
  }

  const currencySymbol = currencySymbols[settings.currency] || '$'

  return (
    <SettingsContext.Provider value={{ settings, setSettings, currencySymbol }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
