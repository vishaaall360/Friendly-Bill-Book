import { useEffect, useState } from 'react'
import { Building2, Camera, FileText, Upload, AlertCircle, CheckCircle2, Loader } from 'lucide-react'
import { fetchBusinessSettings, updateBusinessSettings, uploadBusinessLogo, uploadBusinessSignature } from '../../services/api'

const resolveUploadUrl = (value) => {
  if (!value || /^https?:\/\//i.test(value)) return value
  const apiOrigin = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/api\/?$/, '')
  return `${apiOrigin}${value.startsWith('/') ? value : `/${value}`}`
}
import { useBusinessSettings } from '../../context/BusinessSettingsContext'

export default function BusinessSettings() {
  const { settings: contextSettings, updateSettingsCache } = useBusinessSettings()
  const [formData, setFormData] = useState({
    company_name: '',
    business_type: '',
    owner_name: '',
    address_line_1: '',
    address_line_2: '',
    area: '',
    city: '',
    district: '',
    state: '',
    country: 'India',
    pincode: '',
    phone: '',
    alternate_phone: '',
    email: '',
    website: '',
    gstin: '',
    pan: '',
    cin: '',
    udyam_number: '',
    other_registration_number: '',
    gst_type: '',
    default_gst_rate: 18,
    cgst_rate: 9,
    sgst_rate: 9,
    igst_rate: 18,
    tax_registration_state: '',
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    branch_name: '',
    upi_id: '',
    invoice_prefix: 'INV',
    quotation_prefix: 'QT',
    proforma_prefix: 'PI',
    delivery_challan_prefix: 'DC',
    credit_note_prefix: 'CN',
    debit_note_prefix: 'DN',
    starting_number: 1,
    default_payment_terms: '',
    default_notes: '',
    default_terms_conditions: '',
    authorized_person_name: '',
    authorized_person_designation: '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [signatureFile, setSignatureFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('company')

  const tabs = [
    { id: 'company', label: 'Company Information', icon: Building2 },
    { id: 'contact', label: 'Contact Information', icon: FileText },
    { id: 'registration', label: 'Business Registration', icon: CheckCircle2 },
    { id: 'tax', label: 'Tax Information', icon: FileText },
    { id: 'banking', label: 'Banking Information', icon: FileText },
    { id: 'documents', label: 'Document Settings', icon: FileText },
  ]

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      const data = await fetchBusinessSettings()
      setFormData(data)
      setError('')
    } catch (err) {
      setError('Failed to load business settings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleFieldChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const updated = await updateBusinessSettings(formData)
      updateSettingsCache(updated)
      setSuccess('Business settings saved successfully')

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save business settings')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setSaving(true)
      setError('')
      const result = await uploadBusinessLogo(file)
      const nextSettings = { ...result.settings, logo_url: resolveUploadUrl(result.settings.logo_url) }
      updateSettingsCache(nextSettings)
      setFormData(nextSettings)
      setSuccess('Logo uploaded successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to upload logo')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignatureUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setSaving(true)
      setError('')
      const result = await uploadBusinessSignature(file)
      updateSettingsCache(result.settings)
      setFormData(result.settings)
      setSuccess('Signature uploaded successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to upload signature')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="module-page">
        <div className="page-heading">
          <h1>Business Settings</h1>
        </div>
        <div className="loading-state">
          <Loader size={32} className="loading-spinner" />
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Business Settings</h1>
          <p>Configure your company information for all documents</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="business-settings-form">
        <div className="settings-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="settings-content">
          {/* Company Information */}
          {activeTab === 'company' && (
            <div className="settings-section">
              <h2>Company Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Business / Company Name *</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => handleFieldChange('company_name', e.target.value)}
                    placeholder="Friendly Bill Book Enterprises"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Logo</label>
                  <div className="file-upload">
                    {formData.logo_url && (
                      <div className="logo-preview">
                        <img src={formData.logo_url} alt="Company Logo" />
                      </div>
                    )}
                    <label htmlFor="logo-input" className="upload-button">
                      <Upload size={16} />
                      {formData.logo_url ? 'Change Logo' : 'Upload Logo'}
                    </label>
                    <input
                      id="logo-input"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Business Type</label>
                  <input
                    type="text"
                    value={formData.business_type}
                    onChange={(e) => handleFieldChange('business_type', e.target.value)}
                    placeholder="e.g., Fire & Safety Services"
                  />
                </div>
                <div className="form-group">
                  <label>Owner Name</label>
                  <input
                    type="text"
                    value={formData.owner_name}
                    onChange={(e) => handleFieldChange('owner_name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '2rem' }}>Address</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Address Line 1</label>
                  <input
                    type="text"
                    value={formData.address_line_1}
                    onChange={(e) => handleFieldChange('address_line_1', e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div className="form-group">
                  <label>Address Line 2</label>
                  <input
                    type="text"
                    value={formData.address_line_2}
                    onChange={(e) => handleFieldChange('address_line_2', e.target.value)}
                    placeholder="Building, suite, etc."
                  />
                </div>
                <div className="form-group">
                  <label>Area</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => handleFieldChange('area', e.target.value)}
                    placeholder="Locality"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label>District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleFieldChange('district', e.target.value)}
                    placeholder="District"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    placeholder="Maharashtra"
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleFieldChange('country', e.target.value)}
                    placeholder="India"
                  />
                </div>
                <div className="form-group">
                  <label>PIN Code</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleFieldChange('pincode', e.target.value)}
                    placeholder="400001"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {activeTab === 'contact' && (
            <div className="settings-section">
              <h2>Contact Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
                <div className="form-group">
                  <label>Alternate Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.alternate_phone}
                    onChange={(e) => handleFieldChange('alternate_phone', e.target.value)}
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleFieldChange('website', e.target.value)}
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Business Registration */}
          {activeTab === 'registration' && (
            <div className="settings-section">
              <h2>Business Registration</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>GSTIN</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => handleFieldChange('gstin', e.target.value)}
                    placeholder="27AAPCT1234H1Z0"
                  />
                </div>
                <div className="form-group">
                  <label>PAN</label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => handleFieldChange('pan', e.target.value)}
                    placeholder="AAAPA1234A"
                  />
                </div>
                <div className="form-group">
                  <label>CIN</label>
                  <input
                    type="text"
                    value={formData.cin}
                    onChange={(e) => handleFieldChange('cin', e.target.value)}
                    placeholder="U67120MH2014PTC123456"
                  />
                </div>
                <div className="form-group">
                  <label>MSME / UDYAM Number</label>
                  <input
                    type="text"
                    value={formData.udyam_number}
                    onChange={(e) => handleFieldChange('udyam_number', e.target.value)}
                    placeholder="UDYAM-MH-01-XXXXXX"
                  />
                </div>
                <div className="form-group">
                  <label>Other Registration Number</label>
                  <input
                    type="text"
                    value={formData.other_registration_number}
                    onChange={(e) => handleFieldChange('other_registration_number', e.target.value)}
                    placeholder=""
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tax Information */}
          {activeTab === 'tax' && (
            <div className="settings-section">
              <h2>Tax Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>GST Type</label>
                  <select
                    value={formData.gst_type}
                    onChange={(e) => handleFieldChange('gst_type', e.target.value)}
                  >
                    <option value="">Select GST Type</option>
                    <option value="Regular">Regular</option>
                    <option value="Composition">Composition</option>
                    <option value="Unregistered">Unregistered</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Default GST Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.default_gst_rate}
                    onChange={(e) => handleFieldChange('default_gst_rate', parseFloat(e.target.value))}
                    placeholder="18"
                  />
                </div>
                <div className="form-group">
                  <label>CGST Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cgst_rate}
                    onChange={(e) => handleFieldChange('cgst_rate', parseFloat(e.target.value))}
                    placeholder="9"
                  />
                </div>
                <div className="form-group">
                  <label>SGST Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sgst_rate}
                    onChange={(e) => handleFieldChange('sgst_rate', parseFloat(e.target.value))}
                    placeholder="9"
                  />
                </div>
                <div className="form-group">
                  <label>IGST Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.igst_rate}
                    onChange={(e) => handleFieldChange('igst_rate', parseFloat(e.target.value))}
                    placeholder="18"
                  />
                </div>
                <div className="form-group">
                  <label>Tax Registration State</label>
                  <input
                    type="text"
                    value={formData.tax_registration_state}
                    onChange={(e) => handleFieldChange('tax_registration_state', e.target.value)}
                    placeholder="Maharashtra"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Banking Information */}
          {activeTab === 'banking' && (
            <div className="settings-section">
              <h2>Banking Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => handleFieldChange('bank_name', e.target.value)}
                    placeholder="HDFC Bank"
                  />
                </div>
                <div className="form-group">
                  <label>Account Holder Name</label>
                  <input
                    type="text"
                    value={formData.account_holder_name}
                    onChange={(e) => handleFieldChange('account_holder_name', e.target.value)}
                    placeholder="Friendly Bill Book Enterprises"
                  />
                </div>
                <div className="form-group">
                  <label>Account Number</label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => handleFieldChange('account_number', e.target.value)}
                    placeholder="123456789"
                  />
                </div>
                <div className="form-group">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifsc_code}
                    onChange={(e) => handleFieldChange('ifsc_code', e.target.value)}
                    placeholder="HDFC0000001"
                  />
                </div>
                <div className="form-group">
                  <label>Branch Name</label>
                  <input
                    type="text"
                    value={formData.branch_name}
                    onChange={(e) => handleFieldChange('branch_name', e.target.value)}
                    placeholder="Downtown Branch"
                  />
                </div>
                <div className="form-group">
                  <label>UPI ID</label>
                  <input
                    type="text"
                    value={formData.upi_id}
                    onChange={(e) => handleFieldChange('upi_id', e.target.value)}
                    placeholder="business@upi"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Document Settings */}
          {activeTab === 'documents' && (
            <div className="settings-section">
              <h2>Document Settings</h2>
              
              <h3>Document Prefixes & Numbering</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Invoice Prefix</label>
                  <input
                    type="text"
                    value={formData.invoice_prefix}
                    onChange={(e) => handleFieldChange('invoice_prefix', e.target.value)}
                    placeholder="INV"
                  />
                  <small>Example: INV-0001, INV-0002</small>
                </div>
                <div className="form-group">
                  <label>Quotation Prefix</label>
                  <input
                    type="text"
                    value={formData.quotation_prefix}
                    onChange={(e) => handleFieldChange('quotation_prefix', e.target.value)}
                    placeholder="QT"
                  />
                </div>
                <div className="form-group">
                  <label>Proforma Invoice Prefix</label>
                  <input
                    type="text"
                    value={formData.proforma_prefix}
                    onChange={(e) => handleFieldChange('proforma_prefix', e.target.value)}
                    placeholder="PI"
                  />
                </div>
                <div className="form-group">
                  <label>Delivery Challan Prefix</label>
                  <input
                    type="text"
                    value={formData.delivery_challan_prefix}
                    onChange={(e) => handleFieldChange('delivery_challan_prefix', e.target.value)}
                    placeholder="DC"
                  />
                </div>
                <div className="form-group">
                  <label>Credit Note Prefix</label>
                  <input
                    type="text"
                    value={formData.credit_note_prefix}
                    onChange={(e) => handleFieldChange('credit_note_prefix', e.target.value)}
                    placeholder="CN"
                  />
                </div>
                <div className="form-group">
                  <label>Debit Note Prefix</label>
                  <input
                    type="text"
                    value={formData.debit_note_prefix}
                    onChange={(e) => handleFieldChange('debit_note_prefix', e.target.value)}
                    placeholder="DN"
                  />
                </div>
                <div className="form-group">
                  <label>Starting Number</label>
                  <input
                    type="number"
                    value={formData.starting_number}
                    onChange={(e) => handleFieldChange('starting_number', parseInt(e.target.value))}
                    placeholder="1"
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '2rem' }}>Default Document Content</h3>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Default Payment Terms</label>
                  <textarea
                    value={formData.default_payment_terms}
                    onChange={(e) => handleFieldChange('default_payment_terms', e.target.value)}
                    placeholder="Payment due within 30 days of invoice date"
                    rows={4}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Default Notes</label>
                  <textarea
                    value={formData.default_notes}
                    onChange={(e) => handleFieldChange('default_notes', e.target.value)}
                    placeholder="Thank you for your business"
                    rows={4}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Default Terms & Conditions</label>
                  <textarea
                    value={formData.default_terms_conditions}
                    onChange={(e) => handleFieldChange('default_terms_conditions', e.target.value)}
                    placeholder="1. Goods once sold will not be taken back...
2. Payment terms as agreed...
3. All disputes subject to jurisdiction..."
                    rows={6}
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '2rem' }}>Authorized Signatory</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Authorized Person Name</label>
                  <input
                    type="text"
                    value={formData.authorized_person_name}
                    onChange={(e) => handleFieldChange('authorized_person_name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Authorized Person Designation</label>
                  <input
                    type="text"
                    value={formData.authorized_person_designation}
                    onChange={(e) => handleFieldChange('authorized_person_designation', e.target.value)}
                    placeholder="Director / Manager"
                  />
                </div>
                <div className="form-group">
                  <label>Signature</label>
                  <div className="file-upload">
                    {formData.signature_url && (
                      <div className="signature-preview">
                        <img src={formData.signature_url} alt="Signature" />
                      </div>
                    )}
                    <label htmlFor="signature-input" className="upload-button">
                      <Upload size={16} />
                      {formData.signature_url ? 'Change Signature' : 'Upload Signature'}
                    </label>
                    <input
                      id="signature-input"
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="settings-actions">
          <button
            type="submit"
            className="button button-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .business-settings-form {
          background: white;
          border-radius: 8px;
          overflow: hidden;
        }

        .settings-tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          overflow-x: auto;
        }

        .tab-button {
          flex-shrink: 0;
          padding: 16px 20px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
        }

        .tab-button:hover {
          color: #111827;
          background: #f3f4f6;
        }

        .tab-button.active {
          color: #0066ff;
          border-bottom-color: #0066ff;
          background: white;
        }

        .settings-content {
          padding: 32px;
        }

        .settings-section h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 24px 0;
          color: #111827;
        }

        .settings-section h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #374151;
          text-transform: uppercase;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #0066ff;
          box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
        }

        .form-group small {
          font-size: 12px;
          color: #6b7280;
        }

        .file-upload {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .logo-preview,
        .signature-preview {
          width: 120px;
          height: 120px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
          background: #f9fafb;
        }

        .logo-preview img,
        .signature-preview img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8px;
        }

        .upload-button {
          padding: 10px 16px;
          border: 1px dashed #d1d5db;
          border-radius: 6px;
          background: #f9fafb;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          transition: all 0.2s;
        }

        .upload-button:hover {
          border-color: #0066ff;
          background: #eff6ff;
          color: #0066ff;
        }

        .settings-actions {
          padding: 24px 32px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .alert {
          margin-bottom: 24px;
          padding: 12px 16px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
        }

        .alert-error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .alert-success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 60px 20px;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
