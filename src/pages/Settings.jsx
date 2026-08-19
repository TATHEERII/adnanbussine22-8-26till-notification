import FormLayout from '../components/ui/FormLayout'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'

export default function Settings() {
  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage system and business settings.</p>
      </div>
      <FormLayout title="Business Settings" subtitle="Update your business information">
        <FormSection title="Business Information">
          <Input label="Business Name" placeholder="Enter business name" />
          <Input label="Phone" placeholder="Enter phone number" />
          <Input label="Email" placeholder="Enter email address" />
          <Input label="Address" placeholder="Enter business address" />
        </FormSection>
        <FormSection title="Currency">
          <Select label="Default Currency" options={[{ value: 'USD', label: 'USD - US Dollar' }, { value: 'PKR', label: 'PKR - Pakistani Rupee' }, { value: 'INR', label: 'INR - Indian Rupee' }]} placeholder="Select currency" />
        </FormSection>
        <FormSection title="Register Numbering Format">
          <Input label="Register Prefix" placeholder="e.g. REG-" />
        </FormSection>
        <FormSection title="Transaction Numbering">
          <Input label="Purchase Prefix" placeholder="PUR-" defaultValue="PUR-" />
          <Input label="Sales Prefix" placeholder="SAL-" defaultValue="SAL-" />
          <Input label="Expense Prefix" placeholder="EXP-" defaultValue="EXP-" />
          <Input label="Payment Prefix" placeholder="PAY-" defaultValue="PAY-" />
        </FormSection>
        <div className="form-actions">
          <Button variant="secondary">Reset</Button>
          <Button>Save Settings</Button>
        </div>
      </FormLayout>
    </div>
  )
}
