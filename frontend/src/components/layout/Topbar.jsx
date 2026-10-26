import { Bell, ChevronDown, FileText, Info, LogOut, Menu, Plus, Search, Settings, Shield, User, UserCheck, UserCircle, UserPlus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function Topbar({ user, company, activePage, onNavigate, onMenu, onLogout }) {
	const [quickOpen, setQuickOpen] = useState(false)
	const [profileOpen, setProfileOpen] = useState(false)
	const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)
	const [searchText, setSearchText] = useState('')
	
	const dropdownRef = useRef(null)

	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setQuickOpen(false)
				setProfileOpen(false)
				setSettingsMenuOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const quickActions = [
		['New Enquiry', 'Leads / Enquiries'],
		['New Customer', 'Customers'],
		['New Quotation', 'Quotations'],
		['New Proforma', 'Proforma Invoice'],
		['New GST Invoice', 'GST Invoice'],
		['New Purchase', 'Purchase Orders'],
		['Record Payment', 'Payment In'],
		['Add Expense', 'Expenses'],
		['Add Product', 'Products / Items'],
	]

	const handleGlobalSearch = () => {
		const value = searchText.trim().toLowerCase()
		if (!value) return
		const mappedPages = {
			'lead': 'Leads / Enquiries',
			'enquiry': 'Leads / Enquiries',
			'customer': 'Customers',
			'supplier': 'Suppliers',
			'quotation': 'Quotations',
			'proforma': 'Proforma Invoice',
			'invoice': 'GST Invoice',
			'gst': 'GST Invoice',
			'payment': 'Payment Details',
			'expense': 'Expenses',
			'product': 'Products / Items',
			'material': 'Products / Items',
			'inventory': 'Products / Items',
			'stock': 'Stock In',
			'setting': 'Business Settings',
		}
		const match = Object.entries(mappedPages).find(([keyword]) => value.includes(keyword))
		onNavigate(match ? match[1] : 'Dashboard')
	}

	return (
		<header className="topbar" ref={dropdownRef}>
			<button className="icon-button menu-button" onClick={onMenu} aria-label="Open menu">
				<Menu size={21} />
			</button>

			<div className="mobile-brand">
				<span className="mobile-brand-mark"><img src="/logo.svg" alt="Logo" /></span>
				<strong>Friendly Bill Book</strong>
			</div>

			<div className="breadcrumbs">
				<span>{company || 'Friendly Bill Book'}</span>
				<b>/</b>
				<strong>{activePage}</strong>
			</div>

			<div className="topbar-search">
				<Search size={17} />
				<input
					value={searchText}
					onChange={(event) => setSearchText(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							event.preventDefault()
							handleGlobalSearch()
						}
					}}
					placeholder="Search customers, invoices, products..."
					aria-label="Global search"
				/>
				<button type="button" className="icon-button topbar-search-button" onClick={handleGlobalSearch} aria-label="Search records">
					<Search size={17} />
				</button>
			</div>

			<div className="topbar-actions">
				{/* Quick Add */}
				<div className="quick-add-wrap">
					<button className="button button-primary quick-add" onClick={() => { setQuickOpen(!quickOpen); setProfileOpen(false); setSettingsMenuOpen(false); }}>
						<Plus size={16} /> Quick Add <ChevronDown size={14} />
					</button>
					{quickOpen && (
						<div className="quick-menu">
							{quickActions.map(([label, page]) => (
								<button
									key={label}
									onClick={() => {
										onNavigate(page)
										setQuickOpen(false)
									}}
								>
									{label}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Settings Menu Button */}
				<div style={{ position: 'relative' }}>
					<button
						className="icon-button"
						title="Quick Settings"
						onClick={() => {
							setSettingsMenuOpen(!settingsMenuOpen)
							setProfileOpen(false)
							setQuickOpen(false)
						}}
					>
						<Settings size={19} />
					</button>
					{settingsMenuOpen && (
						<div className="quick-menu settings-quick-dropdown" style={{ right: 0, top: '100%', minWidth: '220px', zIndex: 1000 }}>
							<button onClick={() => { onNavigate('Business Settings'); setSettingsMenuOpen(false); }}>
								<Settings size={16} /> Business Settings
							</button>
							<button onClick={() => { onNavigate('Invoice Settings'); setSettingsMenuOpen(false); }}>
								<FileText size={16} /> Invoice &amp; Print Settings
							</button>
							<button onClick={() => { onNavigate('Manage Users'); setSettingsMenuOpen(false); }}>
								<UserPlus size={16} /> Manage Users
							</button>
							<button onClick={() => { onNavigate('Account & Plan'); setSettingsMenuOpen(false); }}>
								<Shield size={16} /> Account &amp; Plan
							</button>
							<button onClick={() => { onNavigate('About'); setSettingsMenuOpen(false); }}>
								<Info size={16} /> About Friendly Bill Book
							</button>
						</div>
					)}
				</div>

				{/* Notification */}
				<button className="icon-button notification" title="Notifications">
					<Bell size={19} />
					<i />
				</button>

				{/* User Profile Menu */}
				<div style={{ position: 'relative' }}>
					<button
						className="user-menu user-menu-button"
						title="Open profile options"
						onClick={() => {
							setProfileOpen(!profileOpen)
							setSettingsMenuOpen(false)
							setQuickOpen(false)
						}}
					>
						<span className="avatar">{user?.name?.slice(0, 1)?.toUpperCase() || 'F'}</span>
						<span className="user-copy">
							<strong>{user?.name || 'Admin User'}</strong>
							<small>{user?.role || 'Administrator'}</small>
						</span>
						<ChevronDown size={14} />
					</button>

					{profileOpen && (
						<div className="quick-menu profile-dropdown" style={{ right: 0, top: '100%', minWidth: '250px', zIndex: 1000, padding: '8px' }}>
							<div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border, #e2e8f0)', marginBottom: '6px' }}>
								<p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{user?.name || 'Admin User'}</p>
								<small style={{ color: '#64748b', wordBreak: 'break-all' }}>{user?.email || 'admin@friendlybillbook.com'}</small>
								<div style={{ marginTop: '4px' }}>
									<span className="badge" style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#e0f2fe', color: '#0369a1' }}>
										{user?.company || 'Friendly Bill Book'}
									</span>
								</div>
							</div>

							<button onClick={() => { onNavigate('Business Settings'); setProfileOpen(false); }}>
								<Settings size={16} /> Business Profile
							</button>
							<button onClick={() => { onNavigate('Manage Users'); setProfileOpen(false); }}>
								<UserCheck size={16} /> Staff &amp; Team
							</button>
							<button onClick={() => { onNavigate('Invoice Settings'); setProfileOpen(false); }}>
								<FileText size={16} /> Invoice Preferences
							</button>
							<button onClick={() => { onNavigate('About'); setProfileOpen(false); }}>
								<Info size={16} /> About Application
							</button>

							<div style={{ borderTop: '1px solid var(--border, #e2e8f0)', marginTop: '6px', paddingTop: '6px' }}>
								<button
									style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer' }}
									onClick={() => {
										setProfileOpen(false)
										onLogout()
									}}
								>
									<LogOut size={16} /> Sign Out
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</header>
	)
}

export default Topbar
