import { useState } from 'react'
import FormLayout from '../components/ui/FormLayout'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import './Settings.css'

const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'PKR', label: 'PKR - Pakistani Rupee' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'GBP', label: 'GBP - British Pound' },
]

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

export default function Settings() {
  const [settings, setSettings] = useLocalStorageState('importbiz_v2_settings', defaultSettings)
  const [formData, setFormData] = useState({ ...settings })
  const [saved, setSaved] = useState(false)

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    setSettings(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    setFormData({ ...defaultSettings })
    setSettings(defaultSettings)
    setSaved(false)
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage system and business settings.</p>
      </div>

      <FormLayout title="Business Settings" subtitle="Update your business information">
        <FormSection title="Business Information">
          <Input
            label="Business Name"
            placeholder="Enter business name"
            value={formData.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
          />
          <Input
            label="Phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
          <Input
            label="Email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <Input
            label="Address"
            placeholder="Enter business address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </FormSection>

        <FormSection title="Currency">
          <Select
            label="Default Currency"
            options={currencyOptions}
            value={formData.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
          />
        </FormSection>

        <FormSection title="Register Numbering Format">
          <Input
            label="Register Prefix"
            placeholder="e.g. REG-"
            value={formData.registerPrefix}
            onChange={(e) => handleChange('registerPrefix', e.target.value)}
          />
        </FormSection>

        <FormSection title="Transaction Numbering">
          <Input
            label="Purchase Prefix"
            placeholder="PUR-"
            value={formData.purchasePrefix}
            onChange={(e) => handleChange('purchasePrefix', e.target.value)}
          />
          <Input
            label="Sales Prefix"
            placeholder="SAL-"
            value={formData.salesPrefix}
            onChange={(e) => handleChange('salesPrefix', e.target.value)}
          />
          <Input
            label="Expense Prefix"
            placeholder="EXP-"
            value={formData.expensePrefix}
            onChange={(e) => handleChange('expensePrefix', e.target.value)}
          />
          <Input
            label="Payment Prefix"
            placeholder="PAY-"
            value={formData.paymentPrefix}
            onChange={(e) => handleChange('paymentPrefix', e.target.value)}
          />
        </FormSection>

        <FormSection title="Approval Settings">
          <div className="approval-settings">
            <div className="approval-setting-item">
              <span className="approval-setting-label">Register approval</span>
              <Badge variant="info">{formData.registerApproval}</Badge>
            </div>
            <div className="approval-setting-item">
              <span className="approval-setting-label">Purchase approval</span>
              <Badge variant="info">{formData.purchaseApproval}</Badge>
            </div>
            <div className="approval-setting-item">
              <span className="approval-setting-label">Sales approval</span>
              <Badge variant="info">{formData.salesApproval}</Badge>
            </div>
            <div className="approval-setting-item">
              <span className="approval-setting-label">Expense approval</span>
              <Badge variant="info">{formData.expenseApproval}</Badge>
            </div>
            <div className="approval-setting-item">
              <span className="approval-setting-label">Payment approval</span>
              <Badge variant="info">{formData.paymentApproval}</Badge>
            </div>
          </div>
          <p className="approval-note">All approvals are performed by authorized users. Admin does not approve financial transactions.</p>
        </FormSection>

        <div className="form-actions">
          <Button variant="secondary" onClick={handleReset}>Reset</Button>
          <Button onClick={handleSave}>
            {saved ? 'Saved!' : 'Save Settings'}
          </Button>
        </div>
      </FormLayout>
    </div>
  )
}
