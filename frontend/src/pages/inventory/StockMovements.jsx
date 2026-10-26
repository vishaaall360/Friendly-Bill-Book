import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Boxes, CheckCircle2, History, PackageMinus, PackagePlus, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import api, { createResource, fetchResource } from '../../services/api'

function StockMovementWorkspace({ movementType, title, description }) {
  const isIn = movementType === 'in'
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    product_id: '',
    movement_type: movementType,
    quantity: 1,
    reference_type: isIn ? 'Purchase / Direct Inward' : 'Sales / Dispatch',
    notes: '',
  })

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [productsData, movementsData] = await Promise.all([
        fetchResource('/inventory/products', { limit: 500 }),
        fetchResource('/inventory/movements', { limit: 200 }),
      ])
      setProducts(productsData || [])
      setMovements(movementsData || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load stock movement data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [movementType])

  const selectedProduct = products.find((p) => p.id === form.product_id)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.product_id) {
      setError('Please select a product')
      return
    }

    if (!isIn && selectedProduct && Number(form.quantity) > Number(selectedProduct.current_stock || 0)) {
      if (!window.confirm(`Warning: Selected quantity (${form.quantity}) is greater than current stock (${selectedProduct.current_stock}). Proceed anyway?`)) {
        return
      }
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await createResource('/inventory/movements', {
        product_id: form.product_id,
        movement_type: movementType,
        quantity: Number(form.quantity),
        reference_type: form.reference_type,
        notes: form.notes,
      })
      setSuccess(`Stock ${isIn ? 'added' : 'deducted'} successfully!`)
      setForm({
        product_id: '',
        movement_type: movementType,
        quantity: 1,
        reference_type: isIn ? 'Purchase / Direct Inward' : 'Sales / Dispatch',
        notes: '',
      })
      await loadData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to record stock movement')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredMovements = movements.filter((m) => {
    if (m.movement_type !== movementType) return false
    if (!search) return true
    const product = products.find((p) => p.id === m.product_id)
    const term = search.toLowerCase()
    return (
      (product?.product_name || '').toLowerCase().includes(term) ||
      (product?.sku || '').toLowerCase().includes(term) ||
      (m.reference_type || '').toLowerCase().includes(term) ||
      (m.notes || '').toLowerCase().includes(term)
    )
  })

  return (
    <section className="module-page stock-movement-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">INVENTORY / {isIn ? 'STOCK IN' : 'STOCK OUT'}</p>
          <h1>{title}</h1>
          <p>{description || (isIn ? 'Record incoming goods, supplier purchases, and inward inventory updates.' : 'Record outgoing goods, dispatches, damages, and deductions.')}</p>
        </div>
        <button className="button button-secondary" onClick={loadData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success"><CheckCircle2 size={16} /> {success}</div>}

      <div className="module-grid" style={{ gridTemplateColumns: '1fr 1.6fr' }}>
        {/* Record Form */}
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{isIn ? 'INWARD ENTRY' : 'OUTWARD DISPATCH'}</p>
              <h2>{isIn ? 'Add Stock In' : 'Deduct Stock Out'}</h2>
            </div>
            {isIn ? <PackagePlus size={22} color="#10B981" /> : <PackageMinus size={22} color="#F59E0B" />}
          </div>

          <label>
            Select Product / Material <b className="required-mark">*</b>
            <select
              required
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}
            >
              <option value="">-- Choose Product / Material --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.product_name} {p.sku ? `(${p.sku})` : ''} — Stock: {p.current_stock || 0} {p.unit || 'pcs'}
                </option>
              ))}
            </select>
          </label>

          {selectedProduct && (
            <div
              style={{
                background: isIn ? '#ecfdf5' : '#fffbeb',
                border: `1px solid ${isIn ? '#a7f3d0' : '#fde68a'}`,
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong>{selectedProduct.product_name}</strong>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  SKU: {selectedProduct.sku || 'N/A'} | Unit: {selectedProduct.unit || 'pcs'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <small style={{ display: 'block', color: '#64748b' }}>Current Balance</small>
                <strong style={{ fontSize: '1.1rem', color: isIn ? '#047857' : '#b45309' }}>
                  {selectedProduct.current_stock || 0} {selectedProduct.unit || 'pcs'}
                </strong>
              </div>
            </div>
          )}

          <label>
            Quantity to {isIn ? 'Add (+)' : 'Deduct (-)'} <b className="required-mark">*</b>
            <input
              type="number"
              min="0.001"
              step="any"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="Enter quantity"
            />
          </label>

          <label>
            Reference / Reason
            <input
              type="text"
              value={form.reference_type}
              onChange={(e) => setForm({ ...form, reference_type: e.target.value })}
              placeholder="e.g. PO-001, Invoice #123, Production inward, Damage"
            />
          </label>

          <label>
            Notes / Remarks
            <textarea
              rows="2"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional notes or batch details"
            />
          </label>

          <button
            className={`button ${isIn ? 'button-primary' : 'button-primary'}`}
            style={{ backgroundColor: isIn ? '#10B981' : '#E11D48', borderColor: isIn ? '#10B981' : '#E11D48' }}
            disabled={submitting}
          >
            {submitting ? 'Recording...' : isIn ? 'Record Stock In (+)' : 'Record Stock Out (-)'}
          </button>
        </form>

        {/* History Table */}
        <div className="panel table-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent {title} Records</h2>
              <span>{filteredMovements.length} transactions</span>
            </div>
            <div className="table-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stock history..."
              />
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading stock logs...</div>
          ) : filteredMovements.length === 0 ? (
            <div className="empty">No {title} records found. Record your first transaction using the form.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>Product / Material</th>
                    <th>Quantity</th>
                    <th>Reference</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((m) => {
                    const product = products.find((p) => p.id === m.product_id)
                    return (
                      <tr key={m.id}>
                        <td>
                          <small style={{ color: '#64748b' }}>
                            {m.created_at ? new Date(m.created_at).toLocaleDateString('en-IN') : 'Today'}
                          </small>
                        </td>
                        <td>
                          <strong>{product?.product_name || m.product_id}</strong>
                          {product?.sku && <small style={{ display: 'block', color: '#94a3b8' }}>SKU: {product.sku}</small>}
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: isIn ? '#dcfce7' : '#fee2e2',
                              color: isIn ? '#166534' : '#991b1b',
                              fontWeight: 600,
                            }}
                          >
                            {isIn ? '+' : '-'}{m.quantity} {product?.unit || 'pcs'}
                          </span>
                        </td>
                        <td>{m.reference_type || '-'}</td>
                        <td>{m.notes || '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export function StockIn() {
  return (
    <StockMovementWorkspace
      movementType="in"
      title="Stock In / Inward Inventory"
      description="Add stock directly or record goods received from purchase orders and suppliers."
    />
  )
}

export function StockOut() {
  return (
    <StockMovementWorkspace
      movementType="out"
      title="Stock Out / Dispatches"
      description="Deduct stock for dispatches, customer deliveries, project usage, or damaged goods."
    />
  )
}

export default StockMovementWorkspace