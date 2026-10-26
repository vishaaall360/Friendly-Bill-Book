import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, ArrowUpRight, Boxes, ClipboardList, FileText, IndianRupee, Users, Wallet, CheckCircle2, TrendingUp } from 'lucide-react'
import { fetchDashboard } from '../../services/api'

const stats = [
  ['total_sales', 'Total sales', IndianRupee],
  ['pending_amount', 'Pending payments', Activity],
  ['total_purchase', 'Total purchases', IndianRupee],
  ['total_expenses', 'Total expenses', Wallet],
  ['current_stock_value', 'Current stock value', Boxes],
  ['total_customers', 'Total customers', Users],
  ['total_leads', 'Total enquiries', ClipboardList],
  ['pending_quotations', 'Open quotations', FileText],
]

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadDashboard() {
    setLoading(true)
    setError('')
    try {
      setData(await fetchDashboard())
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to load dashboard. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const metricValue = (key) => {
    if (loading) return 'Loading...'
    if (!data || data[key] === null || data[key] === undefined) return '₹ 0'
    return ['total_sales', 'pending_amount', 'total_purchase', 'total_expenses', 'current_stock_value'].includes(key)
      ? money(data[key])
      : Number(data[key]).toLocaleString('en-IN')
  }

  return (
    <section className="module-page dashboard-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FRIENDLY BILL BOOK / OVERVIEW</p>
          <h1>Good morning, here is your business pulse.</h1>
          <p>Live business activity, sales metrics, and inventory overview.</p>
        </div>
        <div className="date-chip">Today <ArrowUpRight size={15} /></div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}{' '}
          <button className="button button-secondary" type="button" onClick={loadDashboard} disabled={loading}>
            Retry
          </button>
        </div>
      )}

      <div className="stat-grid">
        {stats.map(([key, label, Icon]) => (
          <article className="stat-card" key={key}>
            <div className="stat-icon"><Icon size={18} /></div>
            <span>{label}</span>
            <strong>{metricValue(key)}</strong>
            <small>Live system metric</small>
          </article>
        ))}
      </div>

      <div className="dashboard-band">
        <div className="panel accent-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">BUSINESS OPERATIONS</span>
              <h2>Keep the essentials moving</h2>
            </div>
            <TrendingUp size={20} />
          </div>
          <p>Manage customer relationships, sales invoices, proforma bills, quotations, inventory, and automated backups from your Friendly Bill Book workspace.</p>
        </div>

        <div className="panel checklist">
          <span className="eyebrow">ATTENTION &amp; SIGNALS</span>
          <h2>Today’s focus</h2>
          <div>
            <b>
              <AlertTriangle size={16} /> {loading ? 'Checking...' : data?.low_stock_products ?? 0} low stock products
            </b>
            <b>
              <FileText size={16} /> {loading ? 'Checking...' : data?.pending_quotations ?? 0} pending quotations
            </b>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Dashboard
