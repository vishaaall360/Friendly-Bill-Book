import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, Camera, CheckCircle2, CreditCard, FileText, Printer, ShieldCheck, Sparkles, UserCog } from 'lucide-react'
import { DOCUMENT_THEMES, DEFAULT_DOCUMENT_THEME } from '../../constants/documentThemes'

const tabs = ['Business Settings', 'Invoice Settings', 'Print Settings', 'Manage Users', 'Reminders', 'Templates']

const initialForm = {
  companyName: 'JB YOUR SAFE TECHNOLOGY',
  companyPhone: '',
  companyEmail: '',
  panNumber: '',
  gstin: '',
  state: '',
  pincode: '',
  billingAddress: '',
  bankName: '',
  accountNo: '',
  ifscCode: '',
  invoicePrefix: 'JBF',
  terms: '1. Goods once sold will not be taken back.\n2. Payment due within 15 days.\n3. All disputes subject to the applicable jurisdiction.'
}

function Settings() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Business Settings')
  const [form, setForm] = useState(initialForm)
  const [logoName, setLogoName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [invoiceTheme, setInvoiceTheme] = useState('Stylish')
  const [footerText, setFooterText] = useState('Thank you for your business.')
  const [paperSize, setPaperSize] = useState('A4 GST Invoice')
  const [thermalTheme, setThermalTheme] = useState('Compact')
  const [showLogo, setShowLogo] = useState(true)
  const [showPartyBalance, setShowPartyBalance] = useState(false)
  const [sendBillingWhatsApp, setSendBillingWhatsApp] = useState(true)
  const [shareInvoiceOnTransaction, setShareInvoiceOnTransaction] = useState(true)
  const [paymentReminderAlerts, setPaymentReminderAlerts] = useState(true)
  const [notifyDueOrOverdue, setNotifyDueOrOverdue] = useState(true)
  const [reminderFrequency, setReminderFrequency] = useState('Daily')
  const [dueAlertDays, setDueAlertDays] = useState(3)
  const [overdueAlertDays, setOverdueAlertDays] = useState(3)
  const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_DOCUMENT_THEME.id)

  const summary = useMemo(() => ({
    company: form.companyName || 'Friendly Bill Book',
    gst: form.gstin || 'GSTIN not set',
    email: form.companyEmail || 'Business email',
    status: 'Synced'
  }), [form])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setLogoName(file.name)
    window.setTimeout(() => setUploading(false), 500)
  }

  return <section className="module-page settings-shell">
    <div className="page-heading settings-header"><div>
      <p className="eyebrow">FRIENDLY BILL BOOK / BILLING & ACCOUNTS</p>
      <h1>Business Settings</h1>
      <p>Company and GST details shown on every invoice.</p>
    </div>
      <button className="button button-secondary" type="button" onClick={() => navigate('/dashboard')}><ArrowLeft size={16} /> Back to Dashboard</button>
    </div>

    <div className="settings-card topbar-card">
      <div className="settings-user-row">
        <div className="settings-avatar">S</div>
        <div>
          <div className="settings-tag">Synced</div>
          <strong>{summary.email}</strong>
        </div>
      </div>
      <div className="settings-actions">
        <button className="button button-primary" type="button">Account</button>
      </div>
    </div>

    <div className="settings-layout">
      <aside className="settings-sidebar panel">
        <div className="panel-heading settings-panel-heading">
          <div>
            <span className="eyebrow">Workspace</span>
            <h2>Manage Business</h2>
          </div>
          <Building2 size={18} />
        </div>

        <div className="settings-nav">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={activeTab === tab ? 'settings-tab active' : 'settings-tab'}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Business Settings' && <Building2 size={15} />}
              {tab === 'Invoice Settings' && <FileText size={15} />}
              {tab === 'Print Settings' && <Printer size={15} />}
              {tab === 'Manage Users' && <UserCog size={15} />}
              {tab === 'Reminders' && <ShieldCheck size={15} />}
              {tab === 'Templates' && <Sparkles size={15} />}
              <span>{tab}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="settings-main panel">
        <div className="panel-heading settings-panel-heading">
          <div>
            <span className="eyebrow">{activeTab}</span>
            <h2>{activeTab === 'Business Settings' ? 'Company profile' : 'Workspace configuration'}</h2>
          </div>
          <CheckCircle2 size={18} />
        </div>

        {activeTab === 'Business Settings' && (
          <div className="settings-form-grid">
            <div className="logo-upload-box">
              <div className="logo-preview">
                <Camera size={22} />
              </div>
              <div>
                <p className="upload-title">Company Logo</p>
                <small>PNG or JPG · logo appears on GST invoice and PDF.</small>
              </div>
              <label className="upload-button">
                <input type="file" accept="image/png,image/jpeg" onChange={handleLogoChange} />
                {uploading ? 'Uploading...' : 'Upload'}
              </label>
            </div>

            <label>Business Name <span className="required-mark">*</span>
              <input value={form.companyName} onChange={(event) => updateField('companyName', event.target.value)} />
            </label>
            <label>Company Phone
              <input value={form.companyPhone} onChange={(event) => updateField('companyPhone', event.target.value)} placeholder="+91 00000 00000" />
            </label>
            <label>Company Email
              <input type="email" value={form.companyEmail} onChange={(event) => updateField('companyEmail', event.target.value)} placeholder="name@company.com" />
            </label>
            <label>PAN Number
              <input value={form.panNumber} onChange={(event) => updateField('panNumber', event.target.value)} placeholder="ABCDE1234F" />
            </label>
            <label>GSTIN
              <input value={form.gstin} onChange={(event) => updateField('gstin', event.target.value)} placeholder="29ABCDE1234F1Z5" />
            </label>
            <label>State
              <input value={form.state} onChange={(event) => updateField('state', event.target.value)} placeholder="State" />
            </label>
            <label>Pincode
              <input value={form.pincode} onChange={(event) => updateField('pincode', event.target.value)} placeholder="Postal code" />
            </label>
            <label className="full-width">Billing Address
              <textarea rows="3" value={form.billingAddress} onChange={(event) => updateField('billingAddress', event.target.value)} placeholder="Business address" />
            </label>
            <label>Bank Name
              <input value={form.bankName} onChange={(event) => updateField('bankName', event.target.value)} placeholder="Bank name" />
            </label>
            <label>Account No
              <input value={form.accountNo} onChange={(event) => updateField('accountNo', event.target.value)} placeholder="Account number" />
            </label>
            <label>IFSC Code
              <input value={form.ifscCode} onChange={(event) => updateField('ifscCode', event.target.value)} placeholder="IFSC code" />
            </label>
            <label>Invoice Prefix
              <input value={form.invoicePrefix} onChange={(event) => updateField('invoicePrefix', event.target.value)} />
            </label>
            <label className="full-width">Terms &amp; Conditions (One per line)
              <textarea rows="5" value={form.terms} onChange={(event) => updateField('terms', event.target.value)} placeholder="One term per line" />
            </label>
            <div className="form-actions full-width">
              <button className="button button-primary" type="button">Save Business Details</button>
            </div>
          </div>
        )}

        {activeTab === 'Invoice Settings' && (
          <div className="invoice-settings-box">
            <div className="theme-selector-block">
              <div className="field-label">Invoice Theme <span className="required-mark">*</span></div>
              <div className="theme-options">
                {['Stylish', 'Luxury', 'Advanced GST', 'Classic'].map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    className={invoiceTheme === theme ? 'theme-option selected' : 'theme-option'}
                    onClick={() => setInvoiceTheme(theme)}
                  >{theme}</button>
                ))}
              </div>
            </div>

            <label className="full-width">Footer Text
              <textarea rows="3" value={footerText} onChange={(event) => setFooterText(event.target.value)} placeholder="Add footer text for all invoices" />
            </label>

            <div className="form-actions full-width">
              <button className="button button-primary" type="button">Save Invoice Settings</button>
            </div>

            <div className="invoice-preview-card">
              <div className="preview-header-row">
                <div>
                  <p className="preview-company">Friendly Bill Book Enterprises</p>
                  <p className="preview-sub">TAX INVOICE</p>
                </div>
                <div className="preview-meta">
                  <span>Invoice No: INV-2026-0001</span>
                  <span>Date: 22 Aug 2026</span>
                </div>
              </div>

              <div className="preview-body">
                <div className="preview-billto">
                  <strong>Bill To:</strong>
                  <span>Customer Name</span>
                  <span>Business address</span>
                </div>

                <div className="preview-items">
                  <div className="preview-item-row preview-item-head">
                    <span>Item</span>
                    <span>HSN</span>
                    <span>Qty</span>
                    <span>Rate</span>
                    <span>Total</span>
                  </div>
                  <div className="preview-item-row">
                    <span>Fire Safety Product</span>
                    <span>8424</span>
                    <span>1</span>
                    <span>₹ 2,500</span>
                    <span>₹ 2,500</span>
                  </div>
                </div>

                <div className="preview-total-row">
                  <span>Grand Total:</span>
                  <strong>₹ 2,900.00</strong>
                </div>
                <div className="preview-footer">{footerText || 'Thank you for your business.'}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Print Settings' && (
          <div className="invoice-settings-box">
            <div className="theme-selector-block">
              <div className="field-label">Paper size</div>
              <div className="theme-options">
                {['A4 GST Invoice', '80mm Thermal', '58mm Thermal'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={paperSize === size ? 'theme-option selected' : 'theme-option'}
                    onClick={() => setPaperSize(size)}
                  >{size}</button>
                ))}
              </div>
            </div>

            <div className="theme-selector-block">
              <div className="field-label">Thermal Theme</div>
              <div className="theme-options">
                {['Compact', 'Simple', 'Classic'].map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    className={thermalTheme === theme ? 'theme-option selected' : 'theme-option'}
                    onClick={() => setThermalTheme(theme)}
                  >{theme}</button>
                ))}
              </div>
            </div>

            <div className="toggle-row">
              <label className="switch-block">
                <span>Show company logo</span>
                <input type="checkbox" checked={showLogo} onChange={() => setShowLogo((value) => !value)} />
              </label>
              <label className="switch-block">
                <span>Show party balance</span>
                <input type="checkbox" checked={showPartyBalance} onChange={() => setShowPartyBalance((value) => !value)} />
              </label>
            </div>

            <div className="form-actions full-width">
              <button className="button button-primary" type="button">Save Print Settings</button>
            </div>
          </div>
        )}

        {activeTab === 'Manage Users' && (
          <div className="invoice-settings-box">
            <div className="panel form-panel inner-form-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">ACCESS</span>
                  <h2>Add User</h2>
                </div>
                <UserCog size={18} />
              </div>

              <label>Full Name
                <input type="text" placeholder="Staff member name" />
              </label>
              <label>Email Address
                <input type="email" placeholder="name@company.com" />
              </label>
              <label>Role
                <select defaultValue="Manager">
                  <option>Super Admin</option>
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Accountant</option>
                  <option>Sales Staff</option>
                  <option>Purchase Staff</option>
                  <option>Delivery Staff</option>
                  <option>Viewer</option>
                </select>
              </label>

              <div className="form-actions">
                <button className="button button-primary" type="button">Invite User</button>
              </div>
            </div>

            <div className="role-list-box">
              <div className="field-label">Roles available:</div>
              <div className="role-chip-list">
                {['Super Admin', 'Admin', 'Manager', 'Accountant', 'Sales Staff', 'Purchase Staff', 'Delivery Staff', 'Viewer'].map((role) => (
                  <span key={role} className="role-chip">{role}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Reminders' && (
          <div className="invoice-settings-box">
            <div className="panel form-panel inner-form-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">COLLECTION</span>
                  <h2>Payment Reminders</h2>
                </div>
                <ShieldCheck size={18} />
              </div>

              <div className="toggle-row">
                <label className="switch-block">
                  <span>Send billing WhatsApp/SMS to party</span>
                  <input type="checkbox" checked={sendBillingWhatsApp} onChange={() => setSendBillingWhatsApp((value) => !value)} />
                </label>
                <label className="switch-block">
                  <span>Share invoices when a transaction is created</span>
                  <input type="checkbox" checked={shareInvoiceOnTransaction} onChange={() => setShareInvoiceOnTransaction((value) => !value)} />
                </label>
                <label className="switch-block">
                  <span>Payment reminder alerts</span>
                  <input type="checkbox" checked={paymentReminderAlerts} onChange={() => setPaymentReminderAlerts((value) => !value)} />
                </label>
                <label className="switch-block">
                  <span>Notify when invoices are due or overdue</span>
                  <input type="checkbox" checked={notifyDueOrOverdue} onChange={() => setNotifyDueOrOverdue((value) => !value)} />
                </label>
              </div>

              <label>Reminder frequency
                <select value={reminderFrequency} onChange={(event) => setReminderFrequency(event.target.value)}>
                  <option>Daily</option>
                  <option>Every 2 Days</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </label>

              <label>Due alert before due date (days)
                <input type="number" min="1" max="30" value={dueAlertDays} onChange={(event) => setDueAlertDays(Number(event.target.value) || 0)} />
              </label>

              <label>Overdue alert after due date (days)
                <input type="number" min="1" max="60" value={overdueAlertDays} onChange={(event) => setOverdueAlertDays(Number(event.target.value) || 0)} />
              </label>

              <div className="form-actions full-width">
                <button className="button button-primary" type="button">Save Reminder Settings</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Templates' && (
          <div className="invoice-settings-box">
            <div className="panel form-panel inner-form-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">DESIGN</span>
                  <h2>Invoice Templates</h2>
                </div>
                <Sparkles size={18} />
              </div>

              <div className="field-label">Select a template theme <span className="required-mark">*</span></div>
              <div className="template-grid">
                {DOCUMENT_THEMES.map((template) => (
                  <div
                    key={template.id}
                    className={selectedTemplate === template.id ? 'template-card selected' : 'template-card'}
                    style={{ '--theme-primary': template.theme.primary, '--theme-background': template.theme.background }}
                    onClick={() => {
                      setSelectedTemplate(template.id)
                      sessionStorage.setItem('selectedQuotationTemplate', JSON.stringify(template))
                    }}
                  >
                    <div className="template-preview">
                      <div className="template-header" style={{ background: template.theme.primary, color: template.theme.headerText }}>Tax Invoice</div>
                      <div className="template-lines">
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                    </div>
                    <div className="template-name">{template.name}</div>
                  </div>
                ))}
              </div>

              <div className="template-description">
                <strong>Selected:</strong>
                <p>{DOCUMENT_THEMES.find((template) => template.id === selectedTemplate)?.name} theme will be used for all new invoices.</p>
              </div>

              <div className="form-actions full-width">
                <button className="button button-primary" type="button">Save Template Preference</button>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'Business Settings' && activeTab !== 'Invoice Settings' && activeTab !== 'Print Settings' && activeTab !== 'Manage Users' && activeTab !== 'Reminders' && activeTab !== 'Templates' && (
          <div className="empty-state compact-empty">
            <div className="empty-state-icon"><CreditCard size={22} /></div>
            <h2>{activeTab}</h2>
            <p>This configuration panel is ready for the {activeTab.toLowerCase()} workspace settings.</p>
            <button className="button button-secondary" type="button" onClick={() => navigate('/settings/business')}>Open settings</button>
          </div>
        )}
      </div>
    </div>
  </section>
}

export default Settings
