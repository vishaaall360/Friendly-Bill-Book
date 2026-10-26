import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, FileDown, Plus, Printer, RefreshCw, Trash2, X } from 'lucide-react'
import api, { createResource, deleteResource, fetchResource } from '../../services/api'

const emptyItem = { product_id: '', description: '', hsn_sac: '', quantity: 1, rate: 0, discount: 0, tax_rate: 18 }
const initialForm = {
  invoice_number: '',
  invoice_date: new Date().toISOString().slice(0, 10),
  due_date: '',
  customer_id: '',
  customer_gstin: '',
  billing_address: '',
  shipping_address: '',
  discount: 0,
  round_off: 0,
  status: 'Draft',
  notes: '',
  terms_conditions: '',
  items: [{ ...emptyItem }],
}

const money = (value) => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function InvoiceWorkspace() {
  const [rows, setRows] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    try {
      setRows(await fetchResource('/invoices'))
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to load invoices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    fetchResource('/customers').then(setCustomers).catch(() => {})
    fetchResource('/inventory/products').then(setProducts).catch(() => {})

    // Check if coming from Quotation or Proforma conversion
    const conversionData = sessionStorage.getItem('convert_to_invoice')
    if (conversionData) {
      try {
        const parsed = JSON.parse(conversionData)
        sessionStorage.removeItem('convert_to_invoice')
        setForm((prev) => ({
          ...prev,
          invoice_number: `INV-${Date.now().toString().slice(-4)}`,
          customer_id: parsed.customer_id || '',
          customer_gstin: parsed.customer_gstin || '',
          billing_address: parsed.billing_address || '',
          shipping_address: parsed.shipping_address || '',
          discount: parsed.discount || 0,
          notes: parsed.notes || `Converted from ${parsed.source_type || 'Quotation'}: ${parsed.source_number || ''}`,
          terms_conditions: parsed.terms_conditions || '',
          items: parsed.items && parsed.items.length > 0
            ? parsed.items.map((it) => ({
                product_id: it.product_id || '',
                description: it.description || '',
                hsn_sac: it.hsn_sac || it.hsn || '',
                quantity: Number(it.quantity || 1),
                rate: Number(it.rate || 0),
                discount: Number(it.discount || 0),
                tax_rate: Number(it.tax_rate ?? 18),
              }))
            : [{ ...emptyItem }],
        }))
        setNotice(`Successfully loaded details from ${parsed.source_type || 'Quotation'} #${parsed.source_number || ''}. Review & Save below.`)
        setTimeout(() => {
          document.querySelector('.document-form')?.scrollIntoView({ behavior: 'smooth' })
        }, 300)
      } catch (err) {
        console.error('Error loading conversion data', err)
      }
    }
  }, [])

  useEffect(() => {
    const handlePdfClick = (event) => {
      const link = event.target.closest('a[href*="/invoices/"][href$="/pdf"]')
      if (!link) return
      event.preventDefault()
      const match = link.href.match(/\/invoices\/([^/]+)\/pdf$/)
      const row = rows.find((invoice) => invoice.id === match?.[1])
      if (match) downloadPdf(match[1], row?.invoice_number)
    }
    document.addEventListener('click', handlePdfClick)
    return () => document.removeEventListener('click', handlePdfClick)
  }, [rows])

  const totals = useMemo(
    () =>
      form.items.reduce(
        (summary, item) => {
          const base = Number(item.quantity || 0) * Number(item.rate || 0)
          const taxable = Math.max(0, base - Number(item.discount || 0))
          const tax = (taxable * Number(item.tax_rate || 0)) / 100
          summary.subtotal += base
          summary.discount += Number(item.discount || 0)
          summary.cgst += tax / 2
          summary.sgst += tax / 2
          summary.taxable += taxable
          return summary
        },
        { subtotal: 0, discount: 0, taxable: 0, cgst: 0, sgst: 0 }
      ),
    [form.items]
  )

  const grandTotal = Math.max(0, totals.taxable + totals.cgst + totals.sgst + Number(form.round_off || 0) - Number(form.discount || 0))

  function updateItem(index, name, value) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [name]: value } : item)),
    }))
  }

  function selectProduct(index, productId) {
    const product = products.find((item) => item.id === productId)
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              product_id: productId,
              description: product?.product_name || '',
              hsn_sac: product?.hsn || '',
              rate: product?.selling_price || 0,
              tax_rate: Number(product?.gst ?? 18),
            }
          : item
      ),
    }))
  }

  function handleCustomerSelect(customerId) {
    const customer = customers.find((c) => c.id === customerId)
    setForm((prev) => ({
      ...prev,
      customer_id: customerId,
      customer_gstin: customer?.gstin || prev.customer_gstin || '',
      billing_address: customer?.billing_address || customer?.address || prev.billing_address || '',
      shipping_address: customer?.shipping_address || customer?.address || prev.shipping_address || '',
    }))
  }

  async function startEdit(row) {
    try {
      const { data } = await api.get(`/invoices/${row.id}`)
      setEditing(data)
      setForm({
        ...initialForm,
        ...data,
        invoice_date: String(data.invoice_date || '').slice(0, 10),
        due_date: String(data.due_date || '').slice(0, 10),
        items:
          data.items?.map((item) => ({
            ...item,
            quantity: Number(item.quantity),
            rate: Number(item.rate),
            discount: Number(item.discount || 0),
            tax_rate: Number(item.tax_rate || 0),
          })) || [{ ...emptyItem }],
      })
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to load invoice details')
    }
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      subtotal: totals.subtotal,
      discount: totals.discount + Number(form.discount || 0),
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: 0,
      grand_total: grandTotal,
      items: form.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        discount: Number(item.discount || 0),
        tax_rate: Number(item.tax_rate || 0),
        taxable_value: Math.max(0, Number(item.quantity || 0) * Number(item.rate || 0) - Number(item.discount || 0)),
        cgst: (Math.max(0, Number(item.quantity || 0) * Number(item.rate || 0) - Number(item.discount || 0)) * Number(item.tax_rate || 0)) / 200,
        sgst: (Math.max(0, Number(item.quantity || 0) * Number(item.rate || 0) - Number(item.discount || 0)) * Number(item.tax_rate || 0)) / 200,
      })),
    }
    try {
      if (editing) await api.put(`/invoices/${editing.id}`, payload)
      else await createResource('/invoices', payload)
      setForm(initialForm)
      setEditing(null)
      setNotice('Invoice saved successfully!')
      await load()
      setTimeout(() => setNotice(''), 4000)
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Unable to save invoice')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this invoice?')) return
    try {
      await deleteResource('/invoices', id)
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to delete invoice')
    }
  }

  async function downloadPdf(id, invoiceNumber) {
    try {
      const { data } = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = `${invoiceNumber || 'invoice'}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      // Delay cleanup so browsers have time to begin consuming the Blob URL.
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to download invoice PDF')
    }
  }

  const filteredRows = rows.filter((r) => {
    if (!search) return true
    const term = search.toLowerCase()
    const cust = customers.find((c) => c.id === r.customer_id)
    return (
      (r.invoice_number || '').toLowerCase().includes(term) ||
      (cust?.customer_name || '').toLowerCase().includes(term) ||
      (r.status || '').toLowerCase().includes(term)
    )
  })

  return (
    <section className="module-page document-page invoice-workspace">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FRIENDLY BILL BOOK / BILLING</p>
          <h1>GST Invoices &amp; Tax Bills</h1>
          <p>Create GST-compliant invoices with automated tax calculations, HSN codes, and instant PDF exports.</p>
        </div>
        <div className="document-actions">
          <button className="button button-secondary" onClick={load}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="button button-primary" onClick={() => document.querySelector('.document-form')?.scrollIntoView({ behavior: 'smooth' })}>
            <Plus size={16} /> New invoice
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success"><CheckCircle2 size={16} /> {notice}</div>}

      <div className="panel document-list">
        <div className="panel-heading">
          <div>
            <h2>Recent GST Invoices</h2>
            <span>{filteredRows.length} records</span>
          </div>
          <div className="table-search">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..." />
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading invoices...</div>
        ) : filteredRows.length === 0 ? (
          <div className="empty">No invoices found. Create your first invoice below.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.invoice_number}</strong></td>
                    <td>{customers.find((customer) => customer.id === row.customer_id)?.customer_name || row.customer_id}</td>
                    <td>{String(row.invoice_date || '').slice(0, 10)}</td>
                    <td>₹ {money(row.grand_total)}</td>
                    <td>
                      <span className={`status-badge status-${String(row.status || 'draft').toLowerCase().replaceAll(' ', '-')}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <button className="icon-button" onClick={() => startEdit(row)} aria-label="Edit invoice">
                        Edit
                      </button>
                      <a className="icon-button" href={`${api.defaults.baseURL}/invoices/${row.id}/pdf`} target="_blank" rel="noreferrer" aria-label="Download invoice PDF">
                        <FileDown size={16} />
                      </a>
                      <button className="icon-button danger" onClick={() => remove(row.id)} aria-label="Delete invoice">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Form */}
      <form className="panel document-form" onSubmit={submit}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{editing ? 'EDIT INVOICE' : 'NEW GST INVOICE'}</p>
            <h2>{editing ? `Edit ${editing.invoice_number}` : 'Create GST Invoice'}</h2>
          </div>
          {editing && (
            <button
              type="button"
              className="icon-button"
              onClick={() => {
                setEditing(null)
                setForm(initialForm)
              }}
              aria-label="Cancel edit"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="document-fields">
          <label>
            Invoice number <b className="required-mark">*</b>
            <input required value={form.invoice_number} onChange={(event) => setForm({ ...form, invoice_number: event.target.value })} placeholder="INV-0001" />
          </label>
          <label>
            Invoice date <b className="required-mark">*</b>
            <input type="date" required value={form.invoice_date} onChange={(event) => setForm({ ...form, invoice_date: event.target.value })} />
          </label>
          <label>
            Due date
            <input type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} />
          </label>
          <label>
            Customer <b className="required-mark">*</b>
            <select required value={form.customer_id} onChange={(event) => handleCustomerSelect(event.target.value)}>
              <option value="">-- Select customer --</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.customer_name} {customer.company_name ? `- ${customer.company_name}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label>
            Customer GSTIN
            <input value={form.customer_gstin} onChange={(event) => setForm({ ...form, customer_gstin: event.target.value })} placeholder="e.g. 33AAAAA0000A1Z5" />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>
          <label>
            Billing address
            <textarea rows="2" value={form.billing_address} onChange={(event) => setForm({ ...form, billing_address: event.target.value })} placeholder="Billing address" />
          </label>
          <label>
            Shipping address
            <textarea rows="2" value={form.shipping_address} onChange={(event) => setForm({ ...form, shipping_address: event.target.value })} placeholder="Shipping address" />
          </label>
        </div>

        {/* Item Editor */}
        <div className="item-editor">
          <div className="panel-heading">
            <div>
              <h2>Item Details</h2>
              <span>Add products, quantities, rates, and GST slabs (0%, 5%, 12%, 18%, 28%).</span>
            </div>
            <button type="button" className="button button-secondary" onClick={() => setForm({ ...form, items: [...form.items, { ...emptyItem }] })}>
              <Plus size={15} /> Add item
            </button>
          </div>

          {form.items.map((item, index) => (
            <div className="item-row" key={index}>
              <select value={item.product_id} onChange={(event) => selectProduct(index, event.target.value)}>
                <option value="">-- Select Product / Service --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.product_name}
                  </option>
                ))}
              </select>
              <input required value={item.description} onChange={(event) => updateItem(index, 'description', event.target.value)} placeholder="Item Description" />
              <input value={item.hsn_sac} onChange={(event) => updateItem(index, 'hsn_sac', event.target.value)} placeholder="HSN/SAC" style={{ maxWidth: '100px' }} />
              <input type="number" min="0.001" step="any" required value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} placeholder="Qty" style={{ maxWidth: '80px' }} />
              <input type="number" min="0" step="0.01" required value={item.rate} onChange={(event) => updateItem(index, 'rate', event.target.value)} placeholder="Rate (₹)" style={{ maxWidth: '110px' }} />
              <input type="number" min="0" step="0.01" value={item.discount} onChange={(event) => updateItem(index, 'discount', event.target.value)} placeholder="Disc (₹)" style={{ maxWidth: '80px' }} />
              <select value={item.tax_rate} onChange={(event) => updateItem(index, 'tax_rate', event.target.value)} style={{ maxWidth: '100px' }}>
                <option value="0">0% GST</option>
                <option value="5">5% GST</option>
                <option value="12">12% GST</option>
                <option value="18">18% GST</option>
                <option value="28">28% GST</option>
              </select>
              <strong>₹ {money(Number(item.quantity || 0) * Number(item.rate || 0) - Number(item.discount || 0))}</strong>
              {form.items.length > 1 && (
                <button type="button" className="icon-button danger" onClick={() => setForm({ ...form, items: form.items.filter((_, itemIndex) => itemIndex !== index) })} aria-label="Remove item">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Totals Calculation */}
        <div className="totals-panel">
          <span>Subtotal <b>₹ {money(totals.subtotal)}</b></span>
          <span>Item discount <b>₹ {money(totals.discount)}</b></span>
          <span>CGST ({form.items[0]?.tax_rate ? form.items[0].tax_rate / 2 : 9}%) <b>₹ {money(totals.cgst)}</b></span>
          <span>SGST ({form.items[0]?.tax_rate ? form.items[0].tax_rate / 2 : 9}%) <b>₹ {money(totals.sgst)}</b></span>
          <span className="grand-total">Grand total (Incl. Taxes) <b>₹ {money(grandTotal)}</b></span>
        </div>

        <div className="document-fields" style={{ marginTop: '16px' }}>
          <label>
            Notes / Terms &amp; Conditions
            <textarea rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Payment terms, bank details, notes, and terms & conditions" />
          </label>
        </div>

        <div className="document-footer-actions">
          <button className="button button-primary" disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update invoice' : 'Save GST invoice'}
          </button>
          <button type="button" className="button button-secondary no-print" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
        </div>
      </form>
    </section>
  )
}

export default InvoiceWorkspace
