import { BarChart3, Boxes, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, CreditCard, FileText, Gauge, LogOut, Mail, Settings, Truck, UserPlus, Users, Wallet, CheckSquare, Download, X, Info, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const groups = [
	['MAIN', [['Dashboard', Gauge]]],
	['CRM', [['Leads / Enquiries', ClipboardList], ['Customers', Users], ['Suppliers', Truck]]],
	['BILLING', [['Quotations', FileText], ['Proforma Invoice', FileText], ['GST Invoice', FileText], ['Delivery Challan', Truck], ['Credit Note', FileText], ['Debit Note', FileText]]],
	['PURCHASE', [['Purchase Orders', ClipboardList], ['Purchase Bills', FileText]]],
	['PAYMENTS', [['Payment Details', CreditCard], ['Payment In', CreditCard], ['Payment Out', Wallet], ['Pending Payments', CreditCard]]],
	['EXPENSES', [['Expenses', Wallet]]],
	['INVENTORY', [['Products / Items', Boxes], ['Stock In', Boxes], ['Stock Out', Boxes], ['Low Stock', Boxes]]],
	['REPORTS', [['Sales Report', BarChart3], ['Purchase Report', BarChart3], ['Expense Report', BarChart3], ['GST Report', BarChart3], ['Profit & Loss', BarChart3], ['Marketing Details', TrendingUp]]],
	['SETTINGS', [['Business Settings', Settings], ['Invoice Settings', FileText], ['Print Settings', Settings], ['Manage Users', UserPlus], ['Reminders', Mail], ['Account & Plan', Settings], ['About', Info]]],
	['WORKSPACE', [['Inbox', Mail], ['Tasks', CheckSquare], ['Export', Download], ['Sign Out', LogOut]]],
]

function Sidebar({ activePage, onNavigate, collapsed, onToggle, mobileOpen, onClose, company }) {
	const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(groups.map(([heading]) => [heading, true])))
	const collapsibleGroups = new Set(['BILLING', 'PURCHASE', 'PAYMENTS', 'EXPENSES', 'INVENTORY'])
	return (
		<aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-open' : ''}`} aria-label="Main navigation">
			<div className="brand">
				<span className="brand-mark"><img src="/logo.svg" alt="Friendly Bill Book logo" /></span>
				{!collapsed && (
					<span>
						<strong>{company || 'FRIENDLY BILL BOOK'}</strong>
						<small>Smart Business Billing</small>
					</span>
				)}
				<button className="mobile-close" onClick={onClose} aria-label="Close menu"><X size={19} /></button>
			</div>
			<nav>
				{groups.map(([heading, items]) => (
					<div className="nav-group" key={heading}>
						{!collapsed && (
							<button
								className={`nav-heading ${collapsibleGroups.has(heading) ? 'nav-heading-toggle' : ''}`}
								onClick={() => collapsibleGroups.has(heading) && setOpenGroups((current) => ({ ...current, [heading]: !current[heading] }))}
							>
								{heading}
								{collapsibleGroups.has(heading) && <ChevronDown className={openGroups[heading] ? '' : 'nav-heading-chevron-closed'} size={14} />}
							</button>
						)}
						{(collapsed || !collapsibleGroups.has(heading) || openGroups[heading]) &&
							items.map(([label, Icon]) => (
								<button
									key={label}
									className={activePage === label ? 'nav-item active' : 'nav-item'}
									onClick={() => { onNavigate(label); onClose() }}
									title={collapsed ? label : undefined}
								>
									<Icon size={18} />
									<span>{!collapsed && label}</span>
								</button>
							))}
					</div>
				))}
			</nav>
			<button className="collapse-button" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
				{collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
			</button>
		</aside>
	)
}

export default Sidebar
