import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Dashboard from '../pages/dashboard/Dashboard'
import Leads from '../pages/crm/Leads'
import Customers from '../pages/crm/Customers'
import Purchase from '../pages/purchase/Purchase'
import Suppliers from '../pages/purchase/Suppliers'
import Billing from '../pages/billing/Billing'
import Payments from '../pages/payments/Payments'
import Expenses from '../pages/expenses/Expenses'
import Inventory from '../pages/inventory/Inventory'
import Reports from '../pages/reports/Reports'
import Settings from '../pages/settings/Settings'
import BusinessSettings from '../pages/settings/BusinessSettings'
import About from '../pages/settings/About'
import MarketingDetails from '../pages/sales/MarketingDetails'
import Register from '../pages/auth/Register'
import Quotations from '../pages/sales/Quotations'
import ProformaInvoices from '../pages/sales/ProformaInvoices'
import DeliveryChallans from '../pages/sales/DeliveryChallans'
import Products from '../pages/inventory/Products'
import { StockIn, StockOut } from '../pages/inventory/StockMovements'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

const pageMap = {
  'Dashboard': { component: Dashboard, path: '/dashboard' },
  'Leads / Enquiries': { component: Leads, path: '/leads' },
  'Customers': { component: Customers, path: '/customers' },
  'Suppliers': { component: Suppliers, path: '/suppliers' },
  'Quotations': { component: Quotations, path: '/quotations' },
  'Proforma Invoice': { component: ProformaInvoices, path: '/proforma-invoices' },
  'GST Invoice': { component: Billing, path: '/gst-invoices' },
  'Delivery Challan': { component: DeliveryChallans, path: '/delivery-challans' },
  'Credit Note': { component: Billing, path: '/credit-notes' },
  'Debit Note': { component: Billing, path: '/debit-notes' },
  'Purchase Orders': { component: Purchase, path: '/purchase-orders' },
  'Purchase Bills': { component: Purchase, path: '/purchase-bills' },
  'Payment Details': { component: Payments, path: '/payments' },
  'Payment In': { component: Payments, path: '/payments-in' },
  'Payment Out': { component: Payments, path: '/payments-out' },
  'Pending Payments': { component: Payments, path: '/pending-payments' },
  'Expenses': { component: Expenses, path: '/expenses' },
  'Products / Items': { component: Products, path: '/products' },
  'Stock In': { component: StockIn, path: '/stock-in' },
  'Stock Out': { component: StockOut, path: '/stock-out' },
  'Low Stock': { component: Inventory, path: '/low-stock' },
  'Sales Report': { component: Reports, path: '/reports/sales' },
  'Purchase Report': { component: Reports, path: '/reports/purchases' },
  'Expense Report': { component: Reports, path: '/reports/expenses' },
  'GST Report': { component: Reports, path: '/reports/gst' },
  'Profit & Loss': { component: Reports, path: '/reports/profit-loss' },
  'Marketing Details': { component: MarketingDetails, path: '/marketing-details' },
  'Business Settings': { component: BusinessSettings, path: '/settings/business' },
  'Invoice Settings': { component: Settings, path: '/settings/invoice' },
  'Print Settings': { component: Settings, path: '/settings/print' },
  'Manage Users': { component: Settings, path: '/settings/users' },
  'Reminders': { component: Settings, path: '/settings/reminders' },
  'Account & Plan': { component: Settings, path: '/settings/account' },
  'About': { component: About, path: '/settings/about' },
  'Inbox': { component: Dashboard, path: '/inbox' },
  'Tasks': { component: Dashboard, path: '/tasks' },
  'Export': { component: Dashboard, path: '/export' },
  'Sign Out': { component: null, path: '/signout' },
}

function AppRoutes({
  user,
  company,
  activePage,
  onNavigate,
  onLogin,
  onRegister,
  onLogout,
  routePath,
  loginScreen: LoginScreenComponent,
  publicHome: PublicHomeComponent
}) {
  const renderProtectedPage = (PageComponent, pageLabel, pageProps = {}) => (
    <ProtectedRoute user={user}>
      <MainLayout
        activePage={pageLabel}
        company={company}
        onNavigate={onNavigate}
        user={user}
        onLogout={onLogout}
      >
        <PageComponent {...pageProps} />
      </MainLayout>
    </ProtectedRoute>
  )

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute user={user}>
            {user ? <Navigate to="/dashboard" replace /> : <PublicHomeComponent onNavigate={onNavigate} />}
          </PublicRoute>
        }
      />
      <Route path="/login" element={<PublicRoute user={user}><LoginScreenComponent onLogin={onLogin} /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute user={user}><Register onRegistered={onRegister} onSignIn={() => onNavigate('/login')} /></PublicRoute>} />
      <Route path="/dashboard" element={renderProtectedPage(Dashboard, 'Dashboard')} />
      <Route path="/leads" element={renderProtectedPage(Leads, 'Leads / Enquiries')} />
      <Route path="/customers" element={renderProtectedPage(Customers, 'Customers')} />
      <Route path="/suppliers" element={renderProtectedPage(Suppliers, 'Suppliers')} />
      <Route path="/quotations" element={renderProtectedPage(Quotations, 'Quotations')} />
      <Route path="/proforma-invoices" element={renderProtectedPage(ProformaInvoices, 'Proforma Invoice')} />
      <Route path="/gst-invoices" element={renderProtectedPage(Billing, 'GST Invoice')} />
      <Route path="/delivery-challans" element={renderProtectedPage(DeliveryChallans, 'Delivery Challan')} />
      <Route path="/credit-notes" element={renderProtectedPage(Billing, 'Credit Note')} />
      <Route path="/debit-notes" element={renderProtectedPage(Billing, 'Debit Note')} />
      <Route path="/purchase-orders" element={renderProtectedPage(Purchase, 'Purchase Orders')} />
      <Route path="/purchase-bills" element={renderProtectedPage(Purchase, 'Purchase Bills')} />
      <Route path="/payments" element={renderProtectedPage(Payments, 'Payment Details')} />
      <Route path="/payments-in" element={renderProtectedPage(Payments, 'Payment In')} />
      <Route path="/payments-out" element={renderProtectedPage(Payments, 'Payment Out')} />
      <Route path="/pending-payments" element={renderProtectedPage(Payments, 'Pending Payments')} />
      <Route path="/expenses" element={renderProtectedPage(Expenses, 'Expenses')} />
      <Route path="/products" element={renderProtectedPage(Products, 'Products / Items')} />
      <Route path="/stock-in" element={renderProtectedPage(StockIn, 'Stock In')} />
      <Route path="/stock-out" element={renderProtectedPage(StockOut, 'Stock Out')} />
      <Route path="/low-stock" element={renderProtectedPage(Inventory, 'Low Stock')} />
      <Route path="/reports/sales" element={renderProtectedPage(Reports, 'Sales Report', { initialType: 'sales' })} />
      <Route path="/reports/purchases" element={renderProtectedPage(Reports, 'Purchase Report', { initialType: 'purchase' })} />
      <Route path="/reports/expenses" element={renderProtectedPage(Reports, 'Expense Report', { initialType: 'expenses' })} />
      <Route path="/reports/gst" element={renderProtectedPage(Reports, 'GST Report', { initialType: 'gst' })} />
      <Route path="/reports/profit-loss" element={renderProtectedPage(Reports, 'Profit & Loss', { initialType: 'profit-loss' })} />
      <Route path="/marketing-details" element={renderProtectedPage(MarketingDetails, 'Marketing Details')} />
      <Route path="/settings/business" element={renderProtectedPage(BusinessSettings, 'Business Settings')} />
      <Route path="/settings/invoice" element={renderProtectedPage(Settings, 'Invoice Settings')} />
      <Route path="/settings/print" element={renderProtectedPage(Settings, 'Print Settings')} />
      <Route path="/settings/users" element={renderProtectedPage(Settings, 'Manage Users')} />
      <Route path="/settings/reminders" element={renderProtectedPage(Settings, 'Reminders')} />
      <Route path="/settings/account" element={renderProtectedPage(Settings, 'Account & Plan')} />
      <Route path="/settings/about" element={renderProtectedPage(About, 'About')} />
      <Route path="/inbox" element={renderProtectedPage(Dashboard, 'Inbox')} />
      <Route path="/tasks" element={renderProtectedPage(Dashboard, 'Tasks')} />
      <Route path="/export" element={renderProtectedPage(Dashboard, 'Export')} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}

export { pageMap }
export default AppRoutes
