import { useState, useContext, createContext } from 'react'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { mockRegisters } from '../data/mockData'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [registers, setRegisters] = useLocalStorageState('importbiz_v2_registers', mockRegisters)
  const [purchases, setPurchases] = useLocalStorageState('importbiz_v2_purchases', [])
  const [sales, setSales] = useLocalStorageState('importbiz_v2_sales', [])
  const [expenses, setExpenses] = useLocalStorageState('importbiz_v2_expenses', [])
  const [payments, setPayments] = useLocalStorageState('importbiz_v2_payments', [])
  const [approvals, setApprovals] = useLocalStorageState('importbiz_v2_approvals', [])

  return (
    <DataContext.Provider value={{ registers, setRegisters, purchases, setPurchases, sales, setSales, expenses, setExpenses, payments, setPayments, approvals, setApprovals }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
