import { useEffect, useMemo, useState } from 'react'
import { createResource, fetchResource, updateResource } from '../../services/api'
import { getDocumentTheme } from '../../constants/documentThemes'
import QuotationTemplates from './QuotationTemplates'
import './QuotationForm.css'

const emptyItem = {
  product_id: '',
  description: '',
  hsn: '',
  quantity: 1,
  rate: 0,
  discount: 0,
  tax_rate: '0',
}

function QuotationForm({ onSubmit, initialData = null }) {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [businessSettings, setBusinessSettings] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customerDraft, setCustomerDraft] = useState({
    customer_name: '',
    company_name: '',
    mobile: '',
    email: '',
    gstin: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })

  const [form, setForm] = useState({
    quotation_number: '',
    customer_id: '',
    quotation_date: new Date().toISOString().split('T')[0],
    valid_until: '',
    valid_for_days: 30,
    subject: '',
    items: [ { ...emptyItem } ],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: '',
    terms_conditions: '',
    template_id: null,
    template_theme: null,
    status: 'Draft',
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersResponse, productsResponse, settingsResponse, quotationResponse] = await Promise.all([
          fetchResource('/customers', { limit: 200 }),
          fetchResource('/inventory/products', { limit: 200 }),
          fetchResource('/business-settings'),
          fetchResource('/quotations', { limit: 200 }),
        ])

        setCustomers(customersResponse || [])
        setProducts(productsResponse || [])

        const settings = Array.isArray(settingsResponse) ? settingsResponse[0] : settingsResponse
        setBusinessSettings(settings || null)

        const prefix = settings?.quotation_prefix || 'QT'
        const lastNumber = (quotationResponse || []).reduce((highest, row) => {
          const match = String(row.quotation_number || '').match(/(\d+)(?!.*\d)/)
          return match ? Math.max(highest, Number(match[1])) : highest
        }, 0)

        const nextNumber = lastNumber + 1
        const generatedNumber = prefix && prefix.includes('/') ? `${prefix}${nextNumber}` : `${prefix}-${nextNumber}`

        setForm((current) => ({
          ...current,
          quotation_number: generatedNumber,
          terms_conditions: settings?.default_terms_conditions || current.terms_conditions || 'Please confirm the order with the team before dispatch.',
        }))
      } catch (loadError) {
        console.error('Unable to load quotation form data', loadError)
        setError(loadError.response?.data?.error || 'Unable to load quotation form data')
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    const savedTemplate = sessionStorage.getItem('selectedQuotationTemplate')
    if (!savedTemplate) return

    try {
      const savedTemplateData = JSON.parse(savedTemplate)
      const documentTheme = getDocumentTheme(savedTemplateData.id)
      setSelectedTemplate(documentTheme)
      setForm((current) => ({
        ...current,
        template_id: documentTheme.id,
        template_theme: documentTheme.theme,
      }))
    } catch (storageError) {
      console.warn('Unable to restore selected document theme', storageError)
    }
  }, [])

  useEffect(() => {
    if (!initialData) return

    const normalized = {
      ...initialData,
      quotation_date: initialData.quotation_date || new Date().toISOString().split('T')[0],
      valid_until: initialData.valid_until || '',
      customer_id: initialData.customer_id || '',
      items: initialData.items?.length ? initialData.items.map((item) => ({
        product_id: item.product_id || '',
        description: item.description || '',
        hsn: item.hsn || item.hsn_sac || '',
        quantity: Number(item.quantity || 1),
        rate: Number(item.rate || 0),
        discount: Number(item.discount || 0),
        tax_rate: String(item.tax_rate ?? '0'),
      })) : [{ ...emptyItem }],
      terms_conditions: initialData.terms_conditions || '',
      notes: initialData.notes || '',
      status: initialData.status || 'Draft',
    }

    setForm((current) => ({ ...current, ...normalized }))
    if (initialData.template_id) setSelectedTemplate({ id: initialData.template_id, theme: initialData.template_theme })
  }, [initialData])

  const totals = useMemo(() => {
    const summary = form.items.reduce((acc, item) => {
      const quantity = Number(item.quantity || 0)
      const rate = Number(item.rate || 0)
      const discount = Number(item.discount || 0)
      const gross = quantity * rate
      const taxable = Math.max(0, gross - discount)
      const taxRate = Number(item.tax_rate || 0)
      const taxAmount = taxable * taxRate / 100

      acc.subtotal += gross
      acc.discount += discount
      acc.taxable += taxable
      acc.tax += taxAmount
      return acc
    }, { subtotal: 0, discount: 0, taxable: 0, tax: 0 })

    return {
      ...summary,
      total: summary.taxable + summary.tax,
    }
  }, [form.items])

  useEffect(() => {
    const quotationDate = form.quotation_date ? new Date(`${form.quotation_date}T00:00:00`) : new Date()
    if (Number.isFinite(form.valid_for_days)) {
      const nextDate = new Date(quotationDate)
      nextDate.setDate(quotationDate.getDate() + Number(form.valid_for_days || 0))
      const iso = nextDate.toISOString().split('T')[0]
      if (!form.valid_until || form.valid_until === '') {
        setForm((current) => ({ ...current, valid_until: iso }))
      }
    }
  }, [form.quotation_date, form.valid_for_days])

  useEffect(() => {
    setForm((current) => ({
      ...current,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
    }))
  }, [totals])

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setForm((current) => ({
      ...current,
      template_id: template.id,
      template_theme: template.theme,
    }))
  }

  const handleAddItem = () => setForm((current) => ({ ...current, items: [...current.items, { ...emptyItem }] }))

  const handleRemoveItem = (index) => {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const handleItemChange = (index, field, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }))
  }

  const handleProductSelect = (index, productId) => {
    const selectedProduct = products.find((product) => product.id === productId)
    if (!selectedProduct) return

    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? {
        ...item,
        product_id: productId,
        description: item.description || selectedProduct.product_name || '',
        hsn: item.hsn || selectedProduct.hsn || '',
        rate: Number(item.rate || 0) || Number(selectedProduct.selling_price || 0),
        tax_rate: String(item.tax_rate || selectedProduct.gst || '0'),
      } : item),
    }))
  }

  const handleSave = async (mode = 'save') => {
    setLoading(true)
    setError('')

    const payload = {
      ...form,
      customer_id: form.customer_id || null,
      quotation_number: String(form.quotation_number || '').trim(),
      subtotal: Number(totals.subtotal || 0),
      tax: Number(totals.tax || 0),
      total: Number(totals.total || 0),
      items: form.items
        .filter((item) => item.description || item.product_id)
        .map((item) => ({
          product_id: item.product_id || null,
          description: item.description || 'Custom item',
          hsn: item.hsn || '',
          quantity: Number(item.quantity || 0),
          rate: Number(item.rate || 0),
          discount: Number(item.discount || 0),
          tax_rate: String(item.tax_rate || '0'),
          taxable_value: Math.max(0, (Number(item.quantity || 0) * Number(item.rate || 0)) - Number(item.discount || 0)),
        })),
    }

    if (!payload.customer_id) {
      setError('Please select a customer before saving the quotation.')
      setLoading(false)
      return
    }

    if (!payload.items.length) {
      setError('Please add at least one item before saving the quotation.')
      setLoading(false)
      return
    }

    try {
      if (initialData?.id) {
        await updateResource('/quotations', initialData.id, payload)
      } else {
        await createResource('/quotations', payload)
      }

      if (mode === 'save-new') {
        const nextNumber = businessSettings?.quotation_prefix ? `${businessSettings.quotation_prefix}-${Number(String(form.quotation_number).match(/(\d+)(?!.*\d)/)?.[1] || 0) + 1}` : `QT-${Date.now()}`
        setForm((current) => ({
          quotation_number: nextNumber,
          customer_id: '',
          quotation_date: new Date().toISOString().split('T')[0],
          valid_until: '',
          valid_for_days: 30,
          subject: '',
          items: [{ ...emptyItem }],
          subtotal: 0,
          tax: 0,
          total: 0,
          notes: '',
          terms_conditions: current.terms_conditions || businessSettings?.default_terms_conditions || '',
          template_id: current.template_id,
          template_theme: current.template_theme,
          status: 'Draft',
        }))
        if (onSubmit) onSubmit()
        return
      }

      if (onSubmit) onSubmit(payload)
    } catch (saveError) {
      setError(saveError.response?.data?.error || saveError.message || 'Unable to save quotation')
    } finally {
      setLoading(false)
    }
  }

  const createCustomer = async () => {
    if (!customerDraft.customer_name || !customerDraft.mobile) {
      setError('Customer name and mobile number are required.')
      return
    }

    try {
      const customer = await createResource('/customers', customerDraft)
      setCustomers((current) => [customer, ...current])
      setForm((current) => ({ ...current, customer_id: customer.id }))
      setCustomerDraft({
        customer_name: '',
        company_name: '',
        mobile: '',
        email: '',
        gstin: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
      })
      setShowCustomerForm(false)
    } catch (customerError) {
      setError(customerError.response?.data?.error || 'Unable to create customer')
    }
  }

  return (
    <div className="quotation-form-container">
      <form className="quotation-form" onSubmit={(event) => { event.preventDefault(); handleSave('save') }}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-section template-section">
          <QuotationTemplates onSelectTemplate={handleTemplateSelect} selectedTemplateId={selectedTemplate?.id} />
        </div>

        <div
          className="form-section document-themed-section"
          style={selectedTemplate?.theme ? {
            '--document-primary': selectedTemplate.theme.primary || selectedTemplate.theme.headerColor,
            '--document-secondary': selectedTemplate.theme.secondary || selectedTemplate.theme.accentColor,
            '--document-background': selectedTemplate.theme.background || '#ffffff',
            borderTopColor: selectedTemplate.theme.primary || selectedTemplate.theme.headerColor,
            borderTopWidth: '4px',
          } : {}}
        >
          <div className="section-title">Create Quotation / Estimate</div>

          <div className="form-grid header-grid">
            <label>
              <span>Quotation Prefix</span>
              <input type="text" value={businessSettings?.quotation_prefix || 'QT'} onChange={(event) => setBusinessSettings((current) => ({ ...current, quotation_prefix: event.target.value }))} />
            </label>

            <label>
              <span>Quotation Number</span>
              <input type="text" value={form.quotation_number} onChange={(event) => setForm((current) => ({ ...current, quotation_number: event.target.value }))} />
            </label>

            <label>
              <span>Quotation Date</span>
              <input type="date" value={form.quotation_date} onChange={(event) => setForm((current) => ({ ...current, quotation_date: event.target.value }))} />
            </label>

            <label>
              <span>Valid For</span>
              <input type="number" min="1" value={form.valid_for_days} onChange={(event) => setForm((current) => ({ ...current, valid_for_days: Number(event.target.value || 0) }))} />
            </label>

            <label>
              <span>Validity Date</span>
              <input type="date" value={form.valid_until} onChange={(event) => setForm((current) => ({ ...current, valid_until: event.target.value }))} />
            </label>

            <label>
              <span>PO Number</span>
              <input type="text" value={form.po_number || ''} onChange={(event) => setForm((current) => ({ ...current, po_number: event.target.value }))} placeholder="PO-001" />
            </label>

            <label>
              <span>Vehicle Number</span>
              <input type="text" value={form.vehicle_number || ''} onChange={(event) => setForm((current) => ({ ...current, vehicle_number: event.target.value }))} placeholder="KA 01 AB 1234" />
            </label>

            <label>
              <span>PO Date</span>
              <input type="date" value={form.po_date || ''} onChange={(event) => setForm((current) => ({ ...current, po_date: event.target.value }))} />
            </label>
          </div>

          <div className="bill-to-box">
            <div className="section-subtitle">Bill To</div>
            <div className="customer-select-row">
              <select value={form.customer_id} onChange={(event) => setForm((current) => ({ ...current, customer_id: event.target.value }))}>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customer_name || customer.company_name || 'Customer'}
                  </option>
                ))}
              </select>
              <button type="button" className="button button-secondary" onClick={() => setShowCustomerForm((current) => !current)}>+ Add Party</button>
            </div>

            {form.customer_id && (() => {
              const customer = customers.find((entry) => entry.id === form.customer_id)
              if (!customer) return null
              return (
                <div className="customer-preview">
                  <div><strong>{customer.customer_name}</strong> {customer.company_name ? `• ${customer.company_name}` : ''}</div>
                  <div>{customer.mobile} {customer.email ? `• ${customer.email}` : ''}</div>
                  <div>{customer.address || ''}{customer.city ? `, ${customer.city}` : ''}{customer.state ? `, ${customer.state}` : ''}</div>
                  <div>GSTIN: {customer.gstin || '—'} • State: {customer.state || '—'} • Code: {customer.pincode || '—'}</div>
                </div>
              )
            })()}

            {showCustomerForm && (
              <div className="customer-quick-form">
                <input type="text" placeholder="Customer name" value={customerDraft.customer_name} onChange={(event) => setCustomerDraft((current) => ({ ...current, customer_name: event.target.value }))} />
                <input type="text" placeholder="Business name" value={customerDraft.company_name} onChange={(event) => setCustomerDraft((current) => ({ ...current, company_name: event.target.value }))} />
                <input type="text" placeholder="Mobile" value={customerDraft.mobile} onChange={(event) => setCustomerDraft((current) => ({ ...current, mobile: event.target.value }))} />
                <input type="text" placeholder="WhatsApp" value={customerDraft.whatsapp || ''} onChange={(event) => setCustomerDraft((current) => ({ ...current, whatsapp: event.target.value }))} />
                <input type="email" placeholder="Email" value={customerDraft.email} onChange={(event) => setCustomerDraft((current) => ({ ...current, email: event.target.value }))} />
                <input type="text" placeholder="Billing address" value={customerDraft.address} onChange={(event) => setCustomerDraft((current) => ({ ...current, address: event.target.value }))} />
                <input type="text" placeholder="State" value={customerDraft.state} onChange={(event) => setCustomerDraft((current) => ({ ...current, state: event.target.value }))} />
                <input type="text" placeholder="GSTIN" value={customerDraft.gstin} onChange={(event) => setCustomerDraft((current) => ({ ...current, gstin: event.target.value }))} />
                <button type="button" className="button button-primary" onClick={createCustomer}>Save Customer</button>
              </div>
            )}
          </div>
        </div>

        <div className="form-section items-section">
          <div className="section-title">Add Item</div>
          <div className="items-table">
            <div className="items-header">
              <div>No</div>
              <div>Items</div>
              <div>HSN/SAC</div>
              <div>Qty</div>
              <div>Price / Item</div>
              <div>Discount</div>
              <div>Tax</div>
              <div>Amount</div>
              <div>Action</div>
            </div>

            {form.items.map((item, index) => (
              <div className="item-row" key={index}>
                <div className="item-no">{index + 1}</div>
                <div className="item-name-field">
                  <select value={item.product_id} onChange={(event) => handleProductSelect(index, event.target.value)}>
                    <option value="">Select product / material</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.product_name}</option>
                    ))}
                  </select>
                  <input type="text" value={item.description} onChange={(event) => handleItemChange(index, 'description', event.target.value)} placeholder="Custom item/service" />
                </div>
                <input type="text" value={item.hsn} onChange={(event) => handleItemChange(index, 'hsn', event.target.value)} placeholder="HSN" />
                <input type="number" min="0" step="1" value={item.quantity} onChange={(event) => handleItemChange(index, 'quantity', event.target.value)} />
                <input type="number" min="0" step="0.01" value={item.rate} onChange={(event) => handleItemChange(index, 'rate', event.target.value)} />
                <input type="number" min="0" step="0.01" value={item.discount} onChange={(event) => handleItemChange(index, 'discount', event.target.value)} />
                <select value={item.tax_rate} onChange={(event) => handleItemChange(index, 'tax_rate', event.target.value)}>
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
                <div className="amount-box">₹ {(Number(item.quantity || 0) * Number(item.rate || 0) - Number(item.discount || 0)).toFixed(2)}</div>
                <button type="button" className="btn-remove" onClick={() => handleRemoveItem(index)}>×</button>
              </div>
            ))}
          </div>

          <button type="button" className="button button-primary" onClick={handleAddItem}>+ Add Item</button>
        </div>

        <div className="form-section totals-section">
          <div className="totals-grid">
            <div className="total-row"><span>Subtotal</span><strong>₹ {Number(totals.subtotal || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div>
            <div className="total-row"><span>Discount</span><strong>₹ {Number(totals.discount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div>
            <div className="total-row"><span>Taxable Amount</span><strong>₹ {Number(totals.taxable || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div>
            <div className="total-row"><span>GST</span><strong>₹ {Number(totals.tax || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div>
            <div className="total-row total-final"><span>Total Amount</span><strong>₹ {Number(totals.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div>
          </div>
        </div>

        <div className="form-section">
          <label>
            <span>Notes</span>
            <textarea rows="3" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Customer instructions / delivery info" />
          </label>

          <label>
            <span>Terms & Conditions</span>
            <textarea rows="4" value={form.terms_conditions} onChange={(event) => setForm((current) => ({ ...current, terms_conditions: event.target.value }))} placeholder="Add terms" />
          </label>
        </div>

        <div className="form-section compact-actions">
          <button type="button" className="button button-secondary" onClick={() => setShowPreview((current) => !current)}>{showPreview ? 'Hide Preview' : 'Preview Mode'}</button>
          <button type="button" className="button button-secondary" onClick={() => setForm((current) => ({ ...current, status: 'Draft' }))}>Edit Mode</button>
          <button type="button" className="button button-secondary" onClick={() => setForm((current) => ({ ...current, status: 'Draft' }))}>Settings</button>
          <button type="button" className="button button-secondary" onClick={() => handleSave('save-new')} disabled={loading}>{loading ? 'Saving...' : 'Save & New'}</button>
          <button type="submit" className="button button-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>

        {showPreview && (
          <div className="form-section preview-pane">
            <div className="section-title">Quotation Preview</div>
            <div className="preview-card">
              <h3>{businessSettings?.company_name || 'JB YOUR SAFE TECHNOLOGY'}</h3>
              <p>Quotation No: {form.quotation_number}</p>
              <p>Date: {form.quotation_date}</p>
              <p>Valid Until: {form.valid_until}</p>
              <p>Customer: {customers.find((customer) => customer.id === form.customer_id)?.customer_name || 'Not selected'}</p>
              <p>Total: ₹ {Number(totals.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default QuotationForm
