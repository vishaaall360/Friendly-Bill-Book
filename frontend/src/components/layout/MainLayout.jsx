import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Footer from '../common/Footer'
import MobileBottomNav from './MobileBottomNav'

function MainLayout({ children, activePage, onNavigate, user, onLogout, company }) {
	const [collapsed, setCollapsed] = useState(() => localStorage.getItem('friendly_billbook_sidebar_collapsed') === 'true')
	const [mobileOpen, setMobileOpen] = useState(false)
	function toggleSidebar() { setCollapsed((value) => { localStorage.setItem('friendly_billbook_sidebar_collapsed', String(!value)); return !value }) }
	return <div className="app-layout"><Sidebar activePage={activePage} onNavigate={onNavigate} collapsed={collapsed} onToggle={toggleSidebar} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} company={company} /><div className="content-shell"><Topbar user={user} company={company} activePage={activePage} onNavigate={onNavigate} onMenu={() => setMobileOpen(true)} onLogout={onLogout} /><main className="page-content">{children}</main><Footer /></div><MobileBottomNav activePage={activePage} onNavigate={onNavigate} onMore={() => setMobileOpen(true)} />{mobileOpen && <button className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}</div>
}
export default MainLayout
