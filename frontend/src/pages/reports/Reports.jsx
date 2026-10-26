import { useEffect, useState } from 'react'
import { Download, FileBarChart } from 'lucide-react'
import { fetchReport } from '../../services/api'

function Reports({ initialType = 'sales' }) {
  const [type, setType] = useState(initialType)
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { setType(initialType); setRows([]) }, [initialType])
  async function load() { try { setError(''); setRows(await fetchReport(type)) } catch (requestError) { setError(requestError.response?.data?.error || 'Unable to load report') } }
  return <section className="module-page report-print-area"><div className="page-heading"><div><p className="eyebrow">FRIENDLY BILL BOOK / REPORTS</p><h1>Reports</h1><p>Explore live financial and operational reporting.</p></div><button className="button button-primary" onClick={load}><FileBarChart size={16} /> Run report</button></div><div className="panel report-panel"><div className="report-controls"><label>Report type<select value={type} onChange={(event) => setType(event.target.value)}><option value="sales">Sales</option><option value="purchase">Purchase</option><option value="expenses">Expenses</option><option value="gst">GST</option><option value="stock">Stock</option><option value="payments">Payments</option><option value="profit-loss">Profit &amp; Loss</option></select></label><button className="button button-secondary no-print" onClick={() => rows.length && window.print()}><Download size={16} /> Print</button></div>{error && <div className="alert alert-error">{error}</div>}{rows.length ? <div className="table-wrap"><table><thead><tr>{Object.keys(rows[0]).map((key) => <th key={key}>{key.replaceAll('_', ' ')}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{Object.values(row).map((value, valueIndex) => <td key={valueIndex}>{value ?? '-'}</td>)}</tr>)}</tbody></table></div> : <div className="empty report-empty">Choose a report and run it to load live results.</div>}</div></section>
}
export default Reports
