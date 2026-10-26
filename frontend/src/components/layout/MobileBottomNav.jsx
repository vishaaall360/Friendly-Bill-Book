import { Boxes, FileText, Home, MoreHorizontal, Users } from 'lucide-react'

const items = [
	['Dashboard', 'Home', Home],
	['GST Invoice', 'Sales', FileText],
	['Customers', 'Customers', Users],
	['Products / Items', 'Inventory', Boxes],
]

function MobileBottomNav({ activePage, onNavigate, onMore }) {
	return <nav className="mobile-bottom-nav" aria-label="Primary mobile navigation">
		{items.map(([page, label, Icon]) => <button key={page} className={activePage === page ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={() => onNavigate(page)}><Icon size={19} /><span>{label}</span></button>)}
		<button className="mobile-nav-item" onClick={onMore}><MoreHorizontal size={19} /><span>More</span></button>
	</nav>
}

export default MobileBottomNav