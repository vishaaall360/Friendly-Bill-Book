import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RefreshCw, Search, Pencil, Trash2, FileText, ArrowRight, FileCheck } from 'lucide-react'
import api, { fetchResource, deleteResource } from '../../services/api'
import QuotationForm from '../../components/sales/QuotationFormComplete'
import './Quotations.css'

function Quotations() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingQuotation, setEditingQuotation] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [data, custList] = await Promise.all([
        fetchResource('/quotations', { search }),
        fetchResource('/customers').catch(() => []),
      ])
      setRows(data || [])
      setCustomers(custList || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load quotations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id) {
    if (!window.confirm('Delete this quotation?')) return
    try {
      await deleteResource('/quotations', id)
      await load()
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete quotation')
    }
  }

  const handleFormSubmit = () => {
    setShowForm(false)
    setEditingQuotation(null)
    load()
  }

  async function convertToInvoice(quotation) {
    try {
      const { data } = await api.get(`/quotations/${quotation.id}`)
      sessionStorage.setItem(
        'convert_to_invoice',
        JSON.stringify({
          source_type: 'Quotation',
          source_number: quotation.quotation_number,
          customer_id: data.customer_id,
          discount: data.discount || 0,
          notes: data.notes || `Converted from Quotation #${quotation.quotation_number}`,
          terms_conditions: data.terms_conditions || '',
          items: data.items || [],
        })
      )
      navigate('/gst-invoices')
    } catch (err) {
      console.error('Conversion failed', err)
      setError('Unable to load quotation items for conversion')
    }
  }

  async function convertToProforma(quotation) {
    try {
      const { data } = await api.get(`/quotations/${quotation.id}`)
      sessionStorage.setItem(
        'convert_to_proforma',
        JSON.stringify({
          source_type: 'Quotation',
          source_number: quotation.quotation_number,
          customer_id: data.customer_id,
          discount: data.discount || 0,
          notes: data.notes || `Converted from Quotation #${quotation.quotation_number}`,
          terms_conditions: data.terms_conditions || '',
          items: data.items || [],
        })
      )
      navigate('/proforma-invoices')
    } catch (err) {
      console.error('Conversion failed', err)
      setError('Unable to load quotation items for proforma conversion')
    }
  }

  const filteredRows = rows.filter((r) => {
    if (!search) return true
    const term = search.toLowerCase()
    const cust = customers.find((c) => c.id === r.customer_id)
    return (
      (r.quotation_number || '').toLowerCase().includes(term) ||
      (cust?.customer_name || '').toLowerCase().includes(term) ||
      (r.status || '').toLowerCase().includes(term)
    )
  })

  return (
    <section className="module-page quotations-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FRIENDLY BILL BOOK / SALES</p>
          <h1>Quotations / Estimates</h1>
          <p>Prepare, track customer quotations, and convert them to GST or Proforma Invoices with 1-click.</p>
        </div>
        <div className="ledger-actions">
          <button className="button button-secondary" onClick={load}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            className="button button-primary"
            onClick={() => {
              setEditingQuotation(null)
              setShowForm(!showForm)
            }}
          >
            <Plus size={16} /> Create Quotation
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Statistics */}
      <div className="ledger-stats">
        <article className="ledger-stat active">
          <span>Total Quotation Value</span>
          <strong>₹ {rows.reduce((sum, row) => sum + Number(row.total || 0), 0).toLocaleString('en-IN')}</strong>
        </article>
        <article className="ledger-stat">
          <span>Open Quotations</span>
          <strong>{rows.filter((row) => row.status !== 'Closed' && row.status !== 'Expired').length}</strong>
        </article>
        <article className="ledger-stat">
          <span>Expired</span>
          <strong>{rows.filter((row) => row.status === 'Expired').length}</strong>
        </article>
        <article className="ledger-stat">
          <span>Accepted</span>
          <strong>{rows.filter((row) => row.status === 'Accepted').length}</strong>
        </article>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="form-section">
          <QuotationForm onSubmit={handleFormSubmit} initialData={editingQuotation} />
        </div>
      )}

      {/* Table Section */}
      <div className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h2>Quotations</h2>
            <span>{filteredRows.length} records</span>
          </div>
          <div className="table-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quotations..."
            />
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading quotations...</div>
        ) : filteredRows.length === 0 ? (
          <div className="empty">No quotations found. Create one to get started.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Quotation #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                  <th>Convert Actions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const customer = customers.find((c) => c.id === row.customer_id)
                  return (
                    <tr key={row.id}>
                      <td><strong>{row.quotation_number}</strong></td>
                      <td>{customer?.customer_name || row.customer_id}</td>
                      <td>₹ {Number(row.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td>{String(row.quotation_date || '').slice(0, 10)}</td>
                      <td>{row.valid_until ? String(row.valid_until).slice(0, 10) : '-'}</td>
                      <td>
                        <span className={`status-badge status-${(row.status || 'draft').toLowerCase().replace(/\s+/g, '-')}`}>
                          {row.status || 'Draft'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            className="button button-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => convertToInvoice(row)}
                            title="Convert quotation into a GST Tax Invoice"
                          >
                            <FileText size={13} color="#10B981" /> GST Inv <ArrowRight size={12} />
                          </button>
                          <button
                            className="button button-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => convertToProforma(row)}
                            title="Convert quotation into a Proforma Invoice"
                          >
                            <FileCheck size={13} color="#3B82F6" /> Proforma <ArrowRight size={12} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-button"
                            onClick={() => {
                              setEditingQuotation(row)
                              setShowForm(true)
                            }}
                            aria-label="Edit"
                            title="Edit quotation"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-button danger"
                            onClick={() => handleDelete(row.id)}
                            aria-label="Delete"
                            title="Delete quotation"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default Quotations