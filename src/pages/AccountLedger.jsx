import { useState, useMemo } from 'react'
import { useSettings } from '../context/SettingsContext'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Table from '../components/ui/Table'
import { useData } from '../context/DataContext'
import './AccountLedger.css'

const transactionTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'Purchase', label: 'Purchase' },
  { value: 'Sale', label: 'Sale' },
  { value: 'Expense', label: 'Expense' },
  { value: 'Payment', label: 'Payment' },
]

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getTransactionTypeLabel = (type) => {
  switch (type) {
    case 'Purchase': return 'Purchase'
    case 'Sale': return 'Sale'
    case 'Expense': return 'Expense'
    case 'Payment': return 'Payment'
    default: return type
  }
}

const getTransactionVariant = (type) => {
  switch (type) {
    case 'Purchase': return 'danger'
    case 'Sale': return 'success'
    case 'Expense': return 'warning'
    case 'Payment': return 'info'
    default: return 'default'
  }
}

export default function AccountLedger() {
  const { currencySymbol } = useSettings()

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0
    return `${currencySymbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const { registers, purchases, sales, expenses, payments } = useData()

  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [registerFilter, setRegisterFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const activeRegisters = useMemo(() => {
    return registers.filter((r) => r.status === 'active')
  }, [registers])

  const registerOptions = activeRegisters.map((r) => ({
    value: r.id,
    label: r.name,
  }))

  const ledgerEntries = useMemo(() => {
    const entries = []

    activeRegisters.forEach((reg) => {
      let runningBalance = Number(reg.openingBalance) || 0

      if (registerFilter && reg.id !== registerFilter) return

      const regPurchases = (purchases || [])
        .filter((p) => p.registerId === reg.id && p.status === 'approved')
        .map((p) => ({
          id: p.id,
          date: p.date,
          register: reg.name,
          registerId: reg.id,
          referenceNumber: p.purchaseNumber,
          type: 'Purchase',
          description: p.description || p.supplierName,
          debit: Number(p.amount) || 0,
          credit: 0,
          openingBalance: runningBalance,
        }))

      const regSales = (sales || [])
        .filter((s) => s.registerId === reg.id && s.status === 'approved')
        .map((s) => ({
          id: s.id,
          date: s.date,
          register: reg.name,
          registerId: reg.id,
          referenceNumber: s.saleNumber,
          type: 'Sale',
          description: s.description || s.customerName,
          debit: 0,
          credit: Number(s.amount) || 0,
          openingBalance: runningBalance,
        }))

      const regExpenses = (expenses || [])
        .filter((e) => e.registerId === reg.id && e.status === 'approved')
        .map((e) => ({
          id: e.id,
          date: e.date,
          register: reg.name,
          registerId: reg.id,
          referenceNumber: e.expenseNumber,
          type: 'Expense',
          description: e.description,
          debit: Number(e.amount) || 0,
          credit: 0,
          openingBalance: runningBalance,
        }))

      const regPayments = (payments || [])
        .filter((pm) => pm.registerId === reg.id && pm.status === 'approved')
        .map((pm) => ({
          id: pm.id,
          date: pm.date,
          register: reg.name,
          registerId: reg.id,
          referenceNumber: pm.paymentNumber,
          type: 'Payment',
          description: pm.description || pm.partyName,
          debit: pm.type === 'Paid' ? Number(pm.amount) || 0 : 0,
          credit: pm.type === 'Received' ? Number(pm.amount) || 0 : 0,
          openingBalance: runningBalance,
        }))

      const allTransactions = [...regPurchases, ...regSales, ...regExpenses, ...regPayments]
      allTransactions.sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime()
        return a.id.localeCompare(b.id)
      })

      allTransactions.forEach((tx) => {
        runningBalance = runningBalance + tx.credit - tx.debit
        entries.push({
          ...tx,
          balance: runningBalance,
        })
      })
    })

    entries.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime()
      return a.id.localeCompare(b.id)
    })

    return entries
  }, [activeRegisters, purchases, sales, expenses, payments, registerFilter])

  const filtered = useMemo(() => {
    return ledgerEntries.filter((entry) => {
      const matchesSearch =
        !search ||
        entry.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
        entry.description.toLowerCase().includes(search.toLowerCase()) ||
        entry.register.toLowerCase().includes(search.toLowerCase())
      const matchesDate = !dateFilter || entry.date === dateFilter
      const matchesRegister = !registerFilter || entry.registerId === registerFilter
      const matchesType = !typeFilter || entry.type === typeFilter
      return matchesSearch && matchesDate && matchesRegister && matchesType
    })
  }, [ledgerEntries, search, dateFilter, registerFilter, typeFilter])

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, entry) => {
        acc.debit += Number(entry.debit) || 0
        acc.credit += Number(entry.credit) || 0
        return acc
      },
      { debit: 0, credit: 0 }
    )
  }, [filtered])

  const netBalance = totals.credit - totals.debit

  const columns = [
    { key: 'date', label: 'Date', render: (val) => <span className="ledger-date">{formatDate(val)}</span> },
    { key: 'register', label: 'Register' },
    {
      key: 'type',
      label: 'Type',
      render: (val) => <Badge variant={getTransactionVariant(val)}>{getTransactionTypeLabel(val)}</Badge>,
    },
    { key: 'referenceNumber', label: 'Reference', render: (val) => <span className="ledger-ref">{val}</span> },
    { key: 'description', label: 'Description' },
    {
      key: 'debit',
      label: 'Debit',
      render: (val) => (
        <span className="ledger-amount ledger-debit">{val > 0 ? formatCurrency(val) : '-'}</span>
      ),
    },
    {
      key: 'credit',
      label: 'Credit',
      render: (val) => (
        <span className="ledger-amount ledger-credit">{val > 0 ? formatCurrency(val) : '-'}</span>
      ),
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (val) => <span className="ledger-balance">{formatCurrency(val)}</span>,
    },
  ]

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="ledger-page">
      <div className="page-header">
        <h1 className="page-title">Account Ledger</h1>
        <p className="page-subtitle">Approved transactions only. Simple business book view.</p>
      </div>

      <div className="ledger-filter-bar">
        <Input
          placeholder="Search ledger..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ledger-search"
        />
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="ledger-filter"
        />
        <Select
          options={registerOptions}
          value={registerFilter}
          onChange={(e) => setRegisterFilter(e.target.value)}
          className="ledger-filter"
          placeholder="All Registers"
        />
        <Select
          options={transactionTypeOptions}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="ledger-filter"
          placeholder="All Types"
        />
        <Button variant="secondary" onClick={handlePrint}>Print</Button>
      </div>

      <div className="ledger-content">
        <div className="ledger-content-header">
          <h2 className="ledger-content-title">Account Ledger</h2>
          <span className="ledger-content-subtitle">Approved transactions only</span>
        </div>
        {filtered.length > 0 && (
          <div className="ledger-summary">
            <div className="ledger-summary-item">
              <span className="ledger-summary-label">Total Debit</span>
              <span className="ledger-summary-value ledger-debit">{formatCurrency(totals.debit)}</span>
            </div>
            <div className="ledger-summary-item">
              <span className="ledger-summary-label">Total Credit</span>
              <span className="ledger-summary-value ledger-credit">{formatCurrency(totals.credit)}</span>
            </div>
            <div className="ledger-summary-item">
              <span className="ledger-summary-label">Net Balance</span>
              <span className={`ledger-summary-value ${netBalance >= 0 ? 'ledger-credit' : 'ledger-debit'}`}>
                {formatCurrency(netBalance)}
              </span>
            </div>
          </div>
        )}
        <Table columns={columns} data={filtered} emptyText="No approved transactions found." cardViewOnMobile />
      </div>
    </div>
  )
}
