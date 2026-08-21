import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react'
import { useAuth } from './AuthContext'
import { getToken } from '../services/api'

import {
  getRegisters,
  createRegister as svcCreateRegister,
  updateRegister as svcUpdateRegister,
} from '../services/registers'
import {
  getPurchases,
  createPurchase as svcCreatePurchase,
  updatePurchase as svcUpdatePurchase,
} from '../services/purchases'
import {
  getSales,
  createSale as svcCreateSale,
  updateSale as svcUpdateSale,
} from '../services/sales'
import {
  getExpenses,
  createExpense as svcCreateExpense,
  updateExpense as svcUpdateExpense,
} from '../services/expenses'
import {
  getPayments,
  createPayment as svcCreatePayment,
  updatePayment as svcUpdatePayment,
} from '../services/payments'
import { approve, reject, getApprovals } from '../services/approvals'
import { getUsers } from '../services/users'

import {
  dbToRegister,
  registerToDb,
  dbToPurchase,
  purchaseToDb,
  dbToSale,
  saleToDb,
  dbToExpense,
  expenseToDb,
  dbToPayment,
  paymentToDb,
  dbToApproval,
  toDbPatch,
  SALE_DB_MAP,
  PURCHASE_DB_MAP,
  EXPENSE_DB_MAP,
  PAYMENT_DB_MAP,
  REGISTER_DB_MAP,
} from '../services/transforms'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const user = useAuth()
  const [registers, setRegisters] = useState([])
  const [purchases, setPurchases] = useState([])
  const [sales, setSales] = useState([])
  const [expenses, setExpenses] = useState([])
  const [payments, setPayments] = useState([])
  const [approvals, setApprovals] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)

  // Cached lookup maps used to enrich records read back from the API
  // (register name by id, user display name by id).
  const registerMapRef = useRef({})
  const userMapRef = useRef({})

  const refreshData = useCallback(async () => {
    if (!getToken()) return
    setLoaded(false)
    setError(null)
    try {
      const [rawRegisters, rawPurchases, rawSales, rawExpenses, rawPayments, rawApprovals] =
        await Promise.all([
          getRegisters(),
          getPurchases(),
          getSales(),
          getExpenses(),
          getPayments(),
          getApprovals(),
        ])

      const registersData = (rawRegisters || []).map((r) => dbToRegister(r))
      const registerMap = {}
      registersData.forEach((r) => {
        registerMap[r.id] = r.name
      })
      registerMapRef.current = registerMap

      // Users are only listable by admins; otherwise fall back to the
      // current session so the user's own name still resolves.
      const userMap = {}
      try {
        if (user && user.role === 'admin') {
          const users = await getUsers()
          ;(users || []).forEach((u) => {
            userMap[u.id] = u.name
          })
        }
      } catch {
        /* ignore — non-admins just get the current user below */
      }
      if (user) userMap[user.id] = user.name
      userMapRef.current = userMap

      setRegisters(registersData)
      setPurchases((rawPurchases || []).map((p) => dbToPurchase(p, registerMap, userMap)))
      setSales((rawSales || []).map((s) => dbToSale(s, registerMap, userMap)))
      setExpenses((rawExpenses || []).map((e) => dbToExpense(e, registerMap, userMap)))
      setPayments((rawPayments || []).map((pm) => dbToPayment(pm, registerMap, userMap)))
      setApprovals((rawApprovals || []).map((a) => dbToApproval(a)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoaded(true)
    }
  }, [user])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // --- Helpers that mutate the relevant slice from an API response ----
  const replaceIn = (setter, mapped) =>
    setter((prev) => prev.map((x) => (x.id === mapped.id ? mapped : x)))
  const appendTo = (setter, mapped) =>
    setter((prev) => [mapped, ...prev])

  // --- Registers -----------------------------------------------------
  const createRegister = useCallback(
    async (data) => {
      const res = await svcCreateRegister(registerToDb(data))
      appendTo(setRegisters, dbToRegister(res, userMapRef.current))
      return res
    },
    []
  )

  const updateRegister = useCallback(
    async (id, patch) => {
      const res = await svcUpdateRegister(id, toDbPatch(patch, REGISTER_DB_MAP))
      replaceIn(setRegisters, dbToRegister(res, userMapRef.current))
      return res
    },
    []
  )

  // --- Purchases -----------------------------------------------------
  const createPurchase = useCallback(
    async (data) => {
      const res = await svcCreatePurchase(purchaseToDb(data))
      appendTo(setPurchases, dbToPurchase(res, registerMapRef.current, userMapRef.current))
      return res
    },
    []
  )

  const updatePurchase = useCallback(
    async (id, patch) => {
      const res = await svcUpdatePurchase(id, toDbPatch(patch, PURCHASE_DB_MAP))
      replaceIn(setPurchases, dbToPurchase(res, registerMapRef.current, userMapRef.current))
      return res
    },
    []
  )

  // --- Sales ---------------------------------------------------------
  const createSale = useCallback(
    async (data) => {
      const res = await svcCreateSale(saleToDb(data))
      appendTo(setSales, dbToSale(res, registerMapRef.current, userMapRef.current))
      return res
    },
    []
  )

  const updateSale = useCallback(
    async (id, patch) => {
      const res = await svcUpdateSale(id, toDbPatch(patch, SALE_DB_MAP))
      replaceIn(setSales, dbToSale(res, registerMapRef.current, userMapRef.current))
      return res
    },
    []
  )

  // --- Expenses ------------------------------------------------------
  const createExpense = useCallback(
    async (data) => {
      const res = await svcCreateExpense(expenseToDb(data))
      appendTo(setExpenses, dbToExpense(res, registerMapRef.current, userMapRef.current))
      return res
    },
    []
  )

  const updateExpense = useCallback(
    async (id, patch) => {
      const res = await svcUpdateExpense(id, toDbPatch(patch, EXPENSE_DB_MAP))
      replaceIn(setExpenses, dbToExpense(res, registerMapRef.current, userMapRef.current))
      return res
    },
    []
  )

  // --- Payments ------------------------------------------------------
  const createPayment = useCallback(
    async (data) => {
      const res = await svcCreatePayment(paymentToDb(data))
      appendTo(setPayments, dbToPayment(res, registerMapRef.current, userMapRef.current))
      return res
    },
    []
  )

  const updatePayment = useCallback(
    async (id, patch) => {
      const res = await svcUpdatePayment(id, toDbPatch(patch, PAYMENT_DB_MAP))
      replaceIn(setPayments, dbToPayment(res, registerMapRef.current, userMapRef.current))
      return res
    },
    []
  )

  // --- Approvals (cross-entity) --------------------------------------
  const approveItem = useCallback(
    async (entity, id) => {
      const res = await approve(entity, id)
      // The approvals endpoint returns the updated record (snake_case).
      // Place it back into the correct slice.
      if (entity === 'register') {
        replaceIn(setRegisters, dbToRegister(res, userMapRef.current))
      } else if (entity === 'sale') {
        replaceIn(setSales, dbToSale(res, registerMapRef.current, userMapRef.current))
      } else if (entity === 'purchase') {
        replaceIn(setPurchases, dbToPurchase(res, registerMapRef.current, userMapRef.current))
      } else if (entity === 'expense') {
        replaceIn(setExpenses, dbToExpense(res, registerMapRef.current, userMapRef.current))
      } else if (entity === 'payment') {
        replaceIn(setPayments, dbToPayment(res, registerMapRef.current, userMapRef.current))
      }
      // Keep the pending-approvals badge/count in sync.
      setApprovals((prev) => prev.filter((a) => a.id !== id))
      return res
    },
    []
  )

  const rejectItem = useCallback(
    async (entity, id, reason) => {
      const res = await reject(entity, id, reason)
      if (entity === 'register') {
        replaceIn(setRegisters, dbToRegister(res, userMapRef.current))
      } else if (entity === 'sale') {
        replaceIn(setSales, dbToSale(res, registerMapRef.current, userMapRef.current))
      } else if (entity === 'purchase') {
        replaceIn(setPurchases, dbToPurchase(res, registerMapRef.current, userMapRef.current))
      } else if (entity === 'expense') {
        replaceIn(setExpenses, dbToExpense(res, registerMapRef.current, userMapRef.current))
      } else if (entity === 'payment') {
        replaceIn(setPayments, dbToPayment(res, registerMapRef.current, userMapRef.current))
      }
      setApprovals((prev) => prev.filter((a) => a.id !== id))
      return res
    },
    []
  )

  return (
    <DataContext.Provider
      value={{
        registers,
        purchases,
        sales,
        expenses,
        payments,
        approvals,
        loaded,
        error,
        refreshData,
        createRegister,
        updateRegister,
        createPurchase,
        updatePurchase,
        createSale,
        updateSale,
        createExpense,
        updateExpense,
        createPayment,
        updatePayment,
        approveItem,
        rejectItem,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
