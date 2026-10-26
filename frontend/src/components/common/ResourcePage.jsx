import { useEffect, useState } from 'react'
import { Calendar, CalendarDays, ChevronDown, Filter, MoreVertical, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'
import { createResource, deleteResource, fetchResource, updateResource } from '../../services/api'

function inputValue(field, value) {
  if (field.type === 'date' && value) return String(value).slice(0, 10)
  return value ?? ''
}

function preparePayload(endpoint, form) {
  if (endpoint !== '/purchase') return form
  const { item_product_id, item_quantity, item_rate, item_discount, item_tax_rate, ...order } = form
  return {
    ...order,
    items: item_product_id ? [{ product_id: item_product_id, quantity: item_quantity, rate: item_rate, discount: item_discount || 0, tax_rate: item_tax_rate || 0 }] : [],
  }
}

function Field({ field, value, onChange }) {
  const control = field.type === 'textarea' ? (
    <textarea rows={field.rows || 3} value={inputValue(field, value)} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} />
  ) : field.options ? (
    <select value={inputValue(field, value)} onChange={(event) => onChange(event.target.value)}>
      <option value="">Select {field.label}</option>
      {field.options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  ) : (
    <input required={field.required !== false} type={field.type || 'text'} value={inputValue(field, value)} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} min={field.min} max={field.max} />
  )
  return (
    <label>
      {field.label}{field.required !== false && <b className="required-mark">*</b>}
      {control}
      {field.help && <small className="field-help">{field.help}</small>}
    </label>
  )
}

function ResourcePage({ title, description, endpoint, fields, columns, formDefaults = {} }) {
  const ledgerView = title === 'Sales Invoices' || title === 'Quotation / Estimate'
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(formDefaults)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [selected, setSelected] = useState([])
  const [datePreset, setDatePreset] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  function applyDatePreset(preset) {
    setDatePreset(preset)
    const now = new Date()
    const formatDate = (d) => d.toISOString().slice(0, 10)

    if (preset === 'today') {
      const todayStr = formatDate(now)
      setFromDate(todayStr)
      setToDate(todayStr)
    } else if (preset === 'yesterday') {
      const y = new Date()
      y.setDate(y.getDate() - 1)
      const yStr = formatDate(y)
      setFromDate(yStr)
      setToDate(yStr)
    } else if (preset === 'this_week') {
      const first = new Date(now.setDate(now.getDate() - now.getDay()))
      setFromDate(formatDate(first))
      setToDate(formatDate(new Date()))
    } else if (preset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      setFromDate(formatDate(firstDay))
      setToDate(formatDate(new Date()))
    } else if (preset === 'last_30') {
      const d = new Date()
      d.setDate(d.getDate() - 30)
      setFromDate(formatDate(d))
      setToDate(formatDate(new Date()))
    } else if (preset === 'last_365') {
      const d = new Date()
      d.setDate(d.getDate() - 365)
      setFromDate(formatDate(d))
      setToDate(formatDate(new Date()))
    } else if (preset === 'this_year') {
      const firstYear = new Date(now.getFullYear(), 0, 1)
      setFromDate(formatDate(firstYear))
      setToDate(formatDate(new Date()))
    } else if (preset === 'all') {
      setFromDate('')
      setToDate('')
    }
  }

  async function load() {
    setLoading(true)
    setError('')
    try {
      setRows(
        await fetchResource(endpoint, {
          search,
          ...(fromDate && { from_date: fromDate }),
          ...(toDate && { to_date: toDate }),
        })
      )
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to load records')
    } finally {
      setLoading(false)
    }
  }

  function runSearch() {
    void load()
  }

  useEffect(() => {
    load()
  }, [endpoint, fromDate, toDate])

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = preparePayload(endpoint, form)
      if (editing) await updateResource(endpoint, editing.id, payload)
      else await createResource(endpoint, payload)
      setForm(formDefaults)
      setEditing(null)
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to save record')
    } finally {
      setSaving(false)
    }
  }

  function editRow(row) {
    setEditing(row)
    setForm(Object.fromEntries(fields.map((field) => [field.name, row[field.name] ?? ''])))
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  async function remove(id) {
    if (!window.confirm('Delete this record?')) return
    try {
      await deleteResource(endpoint, id)
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to delete record')
    }
  }

  if (ledgerView) {
    return (
      <section className="module-page ledger-page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">FRIENDLY BILL BOOK / SALES</p>
            <h1>{title}</h1>
          </div>
          <div className="ledger-actions">
            <button className="button button-secondary" onClick={load}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="button button-primary" onClick={() => document.querySelector('.ledger-form')?.scrollIntoView({ behavior: 'smooth' })}>
              <Plus size={16} /> Create {title === 'Sales Invoices' ? 'Sales Invoice' : 'Quotation'}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="ledger-stats">
          <article className="ledger-stat active">
            <span>Total {title === 'Sales Invoices' ? 'Sales' : 'Quotation Value'}</span>
            <strong>₹ {rows.reduce((sum, row) => sum + Number(row.total || row.grand_total || 0), 0).toLocaleString('en-IN')}</strong>
          </article>
          <article className="ledger-stat">
            <span>{title === 'Sales Invoices' ? 'Paid' : 'Open'}</span>
            <strong>
              {title === 'Sales Invoices'
                ? `₹ ${rows.filter((row) => row.payment_status === 'Paid' || row.status === 'Paid').reduce((sum, row) => sum + Number(row.total || 0), 0).toLocaleString('en-IN')}`
                : rows.filter((row) => row.status !== 'Closed' && row.status !== 'Completed').length}
            </strong>
          </article>
          <article className="ledger-stat">
            <span>{title === 'Sales Invoices' ? 'Unpaid' : 'Pending / Expired'}</span>
            <strong>
              {title === 'Sales Invoices'
                ? `₹ ${rows.filter((row) => row.payment_status !== 'Paid' && row.status !== 'Paid').reduce((sum, row) => sum + Number(row.total || 0), 0).toLocaleString('en-IN')}`
                : rows.filter((row) => row.status === 'Pending' || row.status === 'Expired').length}
            </strong>
          </article>
          <article className="ledger-stat">
            <span>Cancelled</span>
            <strong>{rows.filter((row) => row.status === 'Cancelled').length || '-'}</strong>
          </article>
        </div>

        {/* Enhanced Date Range & Calendar Toolbar */}
        <div className="ledger-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border, #e2e8f0)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} color="#64748b" />
            <strong style={{ fontSize: '0.85rem', color: '#334155' }}>Date Filter:</strong>
          </div>

          <select
            value={datePreset}
            onChange={(e) => applyDatePreset(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 500 }}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_30">Last 30 Days</option>
            <option value="last_365">Last 365 Days</option>
            <option value="this_year">This Financial Year</option>
            <option value="custom">📅 Custom Date Range (Calendar)</option>
          </select>

          <label className="filter-chip" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarDays size={15} color="#0284c7" />
            <span>From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => {
                setFromDate(event.target.value)
                setDatePreset('custom')
              }}
              aria-label="From date"
            />
          </label>

          <label className="filter-chip" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(event) => {
                setToDate(event.target.value)
                setDatePreset('custom')
              }}
              aria-label="To date"
            />
          </label>

          {(fromDate || toDate) && (
            <button
              type="button"
              className="button button-secondary"
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
              onClick={() => applyDatePreset('all')}
            >
              Clear Date Filter
            </button>
          )}
        </div>

        <div className="panel table-panel ledger-table">
          <div className="panel-heading">
            <div>
              <h2>{title}</h2>
              <span>{rows.length} records returned</span>
            </div>
            <div className="table-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && load()}
                placeholder="Search..."
              />
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading records...</div>
          ) : rows.length === 0 ? (
            <div className="empty">No records found for the selected date range.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {columns.map((column) => (
                        <td key={column.key}>
                          {column.key === 'status' || column.key === 'payment_status' ? (
                            <span className={`status-badge status-${String(row[column.key] || 'draft').toLowerCase().replaceAll(' ', '-')}`}>
                              {row[column.key] ?? '-'}
                            </span>
                          ) : column.key === 'total' || column.key === 'grand_total' || column.key === 'amount' ? (
                            `₹ ${Number(row[column.key] || 0).toLocaleString('en-IN')}`
                          ) : (
                            row[column.key] ?? '-'
                          )}
                        </td>
                      ))}
                      <td>
                        <button className="icon-button danger" onClick={() => remove(row.id)} aria-label="Delete record" title="Delete">
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

        <form className="panel form-panel ledger-form" onSubmit={submit}>
          <div className="panel-heading">
            <div>
              <h2>{editing ? 'Edit' : 'New'} {title === 'Sales Invoices' ? 'Sales Invoice' : 'Quotation'}</h2>
              <span>{editing ? 'Update this record' : 'Save directly to Friendly Bill Book database'}</span>
            </div>
            {editing && (
              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  setEditing(null)
                  setForm(formDefaults)
                }}
                aria-label="Cancel edit"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {fields.map((field) => (
            <Field key={field.name} field={field} value={form[field.name]} onChange={(value) => setForm({ ...form, [field.name]: value })} />
          ))}
          <button className="button button-primary" disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update record' : 'Save record'}
          </button>
        </form>
      </section>
    )
  }

  return (
    <section className="module-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FRIENDLY BILL BOOK / WORKSPACE</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button className="button button-secondary" onClick={load}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="module-grid">
        <form className="panel form-panel" onSubmit={submit}>
          <div className="panel-heading">
            <div>
              <h2>{editing ? 'Edit' : 'New'} {title.replace(' / Enquiry', '')}</h2>
              <span>{editing ? 'Update this record' : 'Save directly to database'}</span>
            </div>
            {editing ? (
              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  setEditing(null)
                  setForm(formDefaults)
                }}
                aria-label="Cancel edit"
              >
                <X size={18} />
              </button>
            ) : (
              <Plus size={20} />
            )}
          </div>
          {fields.map((field) => (
            <Field key={field.name} field={field} value={form[field.name]} onChange={(value) => setForm({ ...form, [field.name]: value })} />
          ))}
          <button className="button button-primary" disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update record' : `Add ${title.replace(' / Enquiry', '')}`}
          </button>
        </form>

        <div className="panel table-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent records</h2>
              <span>{rows.length} records returned</span>
            </div>
            <div className="table-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && load()}
                placeholder="Search..."
              />
            </div>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          {loading ? (
            <div className="loading">Loading records...</div>
          ) : rows.length === 0 ? (
            <div className="empty">No records found. Add the first one using the form.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={rows.length > 0 && selected.length === rows.length}
                        onChange={(event) => setSelected(event.target.checked ? rows.map((row) => row.id) : [])}
                        aria-label="Select all records"
                      />
                    </th>
                    {columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(row.id)}
                          onChange={() =>
                            setSelected((current) => (current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id]))
                          }
                          aria-label="Select record"
                        />
                      </td>
                      {columns.map((column) => (
                        <td key={column.key}>
                          {column.key === 'status' ? (
                            <span className={`status-badge status-${String(row[column.key] || 'draft').toLowerCase().replaceAll(' ', '-')}`}>
                              {row[column.key] ?? '-'}
                            </span>
                          ) : (
                            row[column.key] ?? '-'
                          )}
                        </td>
                      ))}
                      <td>
                        <button className="icon-button" onClick={() => editRow(row)} aria-label="Edit record">
                          <Pencil size={16} />
                        </button>
                        <button className="icon-button danger" onClick={() => remove(row.id)} aria-label="Delete record">
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
      </div>
    </section>
  )
}

export default ResourcePage
