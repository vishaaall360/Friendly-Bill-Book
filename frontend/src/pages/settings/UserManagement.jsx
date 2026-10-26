import { useEffect, useState } from 'react'
import { KeyRound, Plus, RefreshCw, Users } from 'lucide-react'
import { createUser, fetchUsers } from '../../services/api'

const initialForm = { name: '', email: '', password: '', role: 'Staff' }

function UserManagement() {
	const [users, setUsers] = useState([])
	const [form, setForm] = useState(initialForm)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	async function loadUsers() {
		setLoading(true)
		setError('')
		try { setUsers(await fetchUsers()) } catch (requestError) { setError(requestError.response?.data?.error || 'Unable to load accounts') } finally { setLoading(false) }
	}

	useEffect(() => { loadUsers() }, [])

	async function submit(event) {
		event.preventDefault()
		setSaving(true)
		setError('')
		setSuccess('')
		try {
			await createUser(form)
			setForm(initialForm)
			setSuccess('Account created successfully')
			await loadUsers()
		} catch (requestError) {
			setError(requestError.response?.data?.error || 'Unable to create account')
		} finally { setSaving(false) }
	}

	return <section className="module-page"><div className="page-heading"><div><p className="eyebrow">FRIENDLY BILL BOOK / ADMINISTRATION</p><h1>Accounts</h1><p>Create and manage secure workspace accounts.</p></div><button className="button button-secondary" onClick={loadUsers}><RefreshCw size={16} /> Refresh</button></div>
		<div className="module-grid"><form className="panel form-panel" onSubmit={submit}><div className="panel-heading"><div><h2>Create account</h2><span>Passwords are securely hashed</span></div><Plus size={20} /></div>{[['name', 'Full name', 'text', 'Team member name'], ['email', 'Email address', 'email', 'name@company.com'], ['password', 'Temporary password', 'password', 'At least 8 characters']].map(([name, label, type, placeholder]) => <label key={name}>{label}<input required minLength={name === 'password' ? 8 : undefined} type={type} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} placeholder={placeholder} /></label>)}<label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option>Admin</option><option>Manager</option><option>Staff</option><option>Accountant</option></select></label>{error && <div className="alert alert-error">{error}</div>}{success && <div className="alert alert-success">{success}</div>}<button className="button button-primary" disabled={saving}><KeyRound size={16} />{saving ? 'Creating...' : 'Create account'}</button></form>
			<div className="panel table-panel"><div className="panel-heading"><div><h2>Workspace accounts</h2><span>{users.length} accounts</span></div><Users size={20} /></div>{loading ? <div className="loading">Loading accounts...</div> : users.length === 0 ? <div className="empty">No accounts found.</div> : <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{user.active ? 'Active' : 'Inactive'}</td></tr>)}</tbody></table></div>}</div></div>
	</section>
}

export default UserManagement
