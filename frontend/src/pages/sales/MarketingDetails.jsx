/**
 * Marketing Details Page
 * Copyright © 2026 JB YOUR SAFE TECHNOLOGY. All Rights Reserved.
 * 
 * Real-time marketing analytics and lead pipeline dashboard.
 * This is proprietary software - unauthorized use is prohibited.
 */

import { useEffect, useState } from 'react'
import { TrendingUp, Users, Target, AlertCircle, CheckCircle2, ClipboardList, FileText, PieChart } from 'lucide-react'
import { fetchResource } from '../../services/api'

function MarketingDetails() {
  const [stats, setStats] = useState(null)
  const [leads, setLeads] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadMarketingData()
  }, [])

  async function loadMarketingData() {
    try {
      setLoading(true)
      // Fetch leads data
      const leadsRes = await fetchResource('/leads', { limit: 1000 })
      setLeads(Array.isArray(leadsRes) ? leadsRes : leadsRes.rows || [])

      // Calculate marketing stats from leads
      const leadsArray = Array.isArray(leadsRes) ? leadsRes : leadsRes.rows || []
      calculateStats(leadsArray)
    } catch (err) {
      setError('Unable to load marketing data: ' + (err.response?.data?.error || err.message))
      console.error('Error loading marketing data:', err)
    } finally {
      setLoading(false)
    }
  }

  function calculateStats(leadsArray) {
    const total = leadsArray.length
    const converted = leadsArray.filter(l => l.status === 'Won' || l.status === 'Quotation Sent').length
    const lost = leadsArray.filter(l => l.status === 'Lost').length
    const pending = leadsArray.filter(l => l.status === 'New' || l.status === 'Contacted' || l.status === 'Follow-up').length
    const expectedValue = leadsArray.reduce((sum, l) => sum + (Number(l.expected_value) || 0), 0)
    const convertedValue = leadsArray
      .filter(l => l.status === 'Won' && l.converted_customer_id)
      .reduce((sum, l) => sum + (Number(l.expected_value) || 0), 0)

    const sources = {}
    leadsArray.forEach(l => {
      const source = l.source || 'Direct'
      sources[source] = (sources[source] || 0) + 1
    })

    const priorities = {}
    leadsArray.forEach(l => {
      const priority = l.priority || 'Normal'
      priorities[priority] = (priorities[priority] || 0) + 1
    })

    setStats({
      totalLeads: total,
      convertedLeads: converted,
      lostLeads: lost,
      pendingLeads: pending,
      conversionRate: total > 0 ? ((converted / total) * 100).toFixed(1) : 0,
      expectedRevenue: expectedValue,
      actualRevenue: convertedValue,
      leadSources: sources,
      leadPriorities: priorities
    })
  }

  const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  if (loading) {
    return (
      <section className="module-page">
        <div className="page-heading">
          <p className="eyebrow">MARKETING</p>
          <h1>Marketing Details</h1>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading marketing data...</div>
      </section>
    )
  }

  return (
    <section className="module-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MARKETING</p>
          <h1>Marketing Dashboard</h1>
          <p>Lead generation, conversion, and campaign performance</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Marketing Stats Grid */}
      {stats && (
        <div className="marketing-stats-grid">
          <article className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#e8f4f8' }}>
              <Users size={20} color="#0066cc" />
            </div>
            <span>Total Leads</span>
            <strong>{stats.totalLeads}</strong>
            <small>All enquiries</small>
          </article>

          <article className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f0f8e8' }}>
              <CheckCircle2 size={20} color="#4caf50" />
            </div>
            <span>Converted</span>
            <strong>{stats.convertedLeads}</strong>
            <small>{stats.conversionRate}% conversion rate</small>
          </article>

          <article className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>
              <AlertCircle size={20} color="#ff9800" />
            </div>
            <span>Pending Follow-up</span>
            <strong>{stats.pendingLeads}</strong>
            <small>Needs action</small>
          </article>

          <article className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#ffe8e8' }}>
              <ClipboardList size={20} color="#f44336" />
            </div>
            <span>Lost</span>
            <strong>{stats.lostLeads}</strong>
            <small>{stats.totalLeads > 0 ? ((stats.lostLeads / stats.totalLeads) * 100).toFixed(1) : 0}% lost</small>
          </article>

          <article className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f3e5f5' }}>
              <TrendingUp size={20} color="#9c27b0" />
            </div>
            <span>Expected Revenue</span>
            <strong>{money(stats.expectedRevenue)}</strong>
            <small>From all leads</small>
          </article>

          <article className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>
              <Target size={20} color="#2196f3" />
            </div>
            <span>Actual Converted</span>
            <strong>{money(stats.actualRevenue)}</strong>
            <small>From won deals</small>
          </article>
        </div>
      )}

      {/* Tabs */}
      <div className="marketing-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <PieChart size={16} />
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'sources' ? 'active' : ''}`}
          onClick={() => setActiveTab('sources')}
        >
          <Target size={16} />
          Lead Sources
        </button>
        <button
          className={`tab-button ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          <ClipboardList size={16} />
          All Leads
        </button>
      </div>

      {/* Tab Content */}
      <div className="marketing-content">
        {activeTab === 'overview' && stats && (
          <div className="overview-section">
            <div className="overview-grid">
              {/* Conversion Funnel */}
              <article className="card">
                <h3>Lead Conversion Funnel</h3>
                <div className="funnel-chart">
                  <div className="funnel-item">
                    <div className="funnel-bar" style={{ width: '100%' }}>
                      <span>{stats.totalLeads}</span>
                    </div>
                    <label>Total Leads</label>
                  </div>
                  <div className="funnel-item">
                    <div className="funnel-bar" style={{ width: `${stats.totalLeads > 0 ? (stats.convertedLeads / stats.totalLeads) * 100 : 0}%` }}>
                      <span>{stats.convertedLeads}</span>
                    </div>
                    <label>Converted ({stats.conversionRate}%)</label>
                  </div>
                  <div className="funnel-item">
                    <div className="funnel-bar" style={{ width: `${stats.totalLeads > 0 ? (stats.lostLeads / stats.totalLeads) * 100 : 0}%` }}>
                      <span>{stats.lostLeads}</span>
                    </div>
                    <label>Lost ({stats.totalLeads > 0 ? ((stats.lostLeads / stats.totalLeads) * 100).toFixed(1) : 0}%)</label>
                  </div>
                  <div className="funnel-item">
                    <div className="funnel-bar" style={{ width: `${stats.totalLeads > 0 ? (stats.pendingLeads / stats.totalLeads) * 100 : 0}%` }}>
                      <span>{stats.pendingLeads}</span>
                    </div>
                    <label>Pending ({stats.totalLeads > 0 ? ((stats.pendingLeads / stats.totalLeads) * 100).toFixed(1) : 0}%)</label>
                  </div>
                </div>
              </article>

              {/* Revenue Analysis */}
              <article className="card">
                <h3>Revenue Pipeline</h3>
                <div className="revenue-analysis">
                  <div className="revenue-item">
                    <label>Expected from all leads</label>
                    <strong>{money(stats.expectedRevenue)}</strong>
                  </div>
                  <div className="revenue-divider" />
                  <div className="revenue-item">
                    <label>Already converted</label>
                    <strong style={{ color: '#4caf50' }}>{money(stats.actualRevenue)}</strong>
                  </div>
                  <div className="revenue-divider" />
                  <div className="revenue-item">
                    <label>Still pending</label>
                    <strong style={{ color: '#ff9800' }}>{money(stats.expectedRevenue - stats.actualRevenue)}</strong>
                  </div>
                </div>
              </article>
            </div>
          </div>
        )}

        {activeTab === 'sources' && stats && (
          <div className="sources-section">
            <article className="card">
              <h3>Leads by Source</h3>
              <div className="sources-grid">
                {Object.entries(stats.leadSources).map(([source, count]) => (
                  <div key={source} className="source-card">
                    <strong>{source}</strong>
                    <p className="source-count">{count}</p>
                    <small>{((count / stats.totalLeads) * 100).toFixed(1)}% of total</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="card">
              <h3>Leads by Priority</h3>
              <div className="sources-grid">
                {Object.entries(stats.leadPriorities).map(([priority, count]) => (
                  <div key={priority} className="source-card">
                    <strong>{priority}</strong>
                    <p className="source-count">{count}</p>
                    <small>{((count / stats.totalLeads) * 100).toFixed(1)}% of total</small>
                  </div>
                ))}
              </div>
            </article>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="leads-section">
            <article className="card">
              <h3>Recent Leads</h3>
              {leads.length === 0 ? (
                <div className="empty-state">
                  <ClipboardList size={32} color="#ccc" />
                  <p>No leads yet</p>
                  <small>Start adding enquiries to see them here</small>
                </div>
              ) : (
                <div className="leads-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Enquiry #</th>
                        <th>Customer</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th>Expected Value</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.slice(0, 20).map(lead => (
                        <tr key={lead.id}>
                          <td><strong>{lead.lead_number}</strong></td>
                          <td>{lead.customer_name}</td>
                          <td><small>{lead.source || 'Direct'}</small></td>
                          <td>
                            <span
                              className={`status-badge status-${lead.status.toLowerCase()}`}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td>{money(lead.expected_value)}</td>
                          <td><small>{new Date(lead.created_at).toLocaleDateString('en-IN')}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          </div>
        )}
      </div>

      <style jsx>{`
        .marketing-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
        }

        .stat-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-card strong {
          font-size: 1.75rem;
          color: #333;
        }

        .stat-card small {
          color: #666;
          font-size: 0.85rem;
        }

        .marketing-tabs {
          display: flex;
          gap: 0.5rem;
          margin: 2rem 0 1rem 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: #666;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-button:hover {
          color: #333;
        }

        .tab-button.active {
          color: #0066cc;
          border-bottom-color: #0066cc;
        }

        .marketing-content {
          margin-top: 1.5rem;
        }

        .card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .card h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1rem;
          color: #333;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .funnel-chart {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .funnel-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .funnel-bar {
          background: linear-gradient(to right, #0066cc, #00ccff);
          height: 40px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 0.9rem;
          min-width: 50px;
        }

        .funnel-item label {
          font-size: 0.85rem;
          color: #666;
        }

        .revenue-analysis {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .revenue-item {
          text-align: center;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .revenue-item label {
          display: block;
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .revenue-item strong {
          display: block;
          font-size: 1.5rem;
          color: #333;
        }

        .revenue-divider {
          height: 1px;
          background: #e0e0e0;
        }

        .sources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .source-card {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 1rem;
          text-align: center;
        }

        .source-card strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .source-count {
          font-size: 1.5rem;
          color: #0066cc;
          margin: 0.5rem 0;
        }

        .source-card small {
          color: #666;
          font-size: 0.8rem;
        }

        .leads-table {
          overflow-x: auto;
        }

        .leads-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .leads-table th {
          text-align: left;
          padding: 0.75rem;
          background: #f8f9fa;
          border-bottom: 2px solid #e0e0e0;
          font-weight: 600;
          color: #333;
        }

        .leads-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-new,
        .status-contacted {
          background: #e3f2fd;
          color: #1976d2;
        }

        .status-follow-up {
          background: #fff3e0;
          color: #f57c00;
        }

        .status-quotation\ sent {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .status-won {
          background: #e8f5e9;
          color: #388e3c;
        }

        .status-lost {
          background: #ffebee;
          color: #c62828;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #999;
        }

        .empty-state svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state p {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .marketing-stats-grid {
            grid-template-columns: 1fr;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .leads-table {
            font-size: 0.8rem;
          }

          .leads-table th,
          .leads-table td {
            padding: 0.5rem;
          }
        }
      `}</style>
    </section>
  )
}

export default MarketingDetails
