/**
 * Friendly Bill Book - Application
 * Copyright © 2026 Friendly Bill Book. All Rights Reserved.
 */

import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, BarChart3, Boxes, CheckCircle2, CreditCard, FileText, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { BusinessSettingsProvider } from './context/BusinessSettingsContext'
import ResourcePage from './components/common/ResourcePage'
import { fetchCurrentUser, getStoredUser, login, logout } from './services/api'
import Register from './pages/auth/Register'
import AppRoutes, { pageMap } from './routes/AppRoutes'

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onLogin({ email, password })
    } catch (requestError) {
      setError(requestError.response?.data?.error || (requestError.request ? 'Unable to reach the authentication server' : 'Unable to sign in'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-screen">
      <div className="login-topbar">
        <div className="reference-brand">
          <span className="reference-brand-mark"><img src="/logo.svg" alt="Friendly Bill Book logo" /></span>
          <span><strong>FRIENDLY BILL BOOK</strong><small>Business Management Suite</small></span>
        </div>
        <span className="secure-label"><LockKeyhole size={14} /> Secure workspace</span>
      </div>

      <section className="login-center">
        <div className="login-welcome">
          <span className="welcome-icon"><img src="/logo.svg" alt="Friendly Bill Book logo" /></span>
          <p className="eyebrow">FRIENDLY BILL BOOK</p>
          <h1>Friendly Billing<br /><em>For growing businesses</em></h1>
          <p>Track sales, purchases, payments, stock, leads, and documents in one connected business workspace.</p>
        </div>

        <form className="login-card" onSubmit={submit}>
          <div className="login-card-heading">
            <div className="login-icon"><LockKeyhole size={20} /></div>
            <div>
              <p className="eyebrow">WELCOME BACK</p>
              <h2>Login to Dashboard</h2>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <label>
            Email address
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@company.com" autoComplete="email" />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength="6" placeholder="Enter your password" autoComplete="current-password" />
          </label>

          <button className="button button-primary login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Login to Dashboard'}<ArrowRight size={17} />
          </button>

          <p className="register-signin">
            New here? <button type="button" onClick={() => { window.history.pushState({}, '', '/register'); window.dispatchEvent(new PopStateEvent('popstate')) }}>Create an account</button>
          </p>
        </form>
      </section>

      <footer className="login-footer">
        <span>© FRIENDLY BILL BOOK</span>
        <span>Secure Business CRM &amp; Billing</span>
      </footer>
    </main>
  )
}

function PublicHome({ onNavigate }) {
  const features = [
    ['GST invoicing', 'Create polished GST and non-GST invoices with clear tax breakdowns.', FileText],
    ['Live inventory', 'Track products, stock levels, reorder signals, and movement in one place.', Boxes],
    ['Payment control', 'Keep collections, pending balances, and payment history visible every day.', CreditCard],
    ['Business insights', 'Understand sales, expenses, customers, and operations from one dashboard.', BarChart3],
  ]

  return (
    <main className="public-home">
      <header className="public-nav">
        <div className="reference-brand">
          <span className="reference-brand-mark"><img src="/logo.svg" alt="Friendly Bill Book logo" /></span>
          <span><strong>FRIENDLY BILL BOOK</strong><small>Business management suite</small></span>
        </div>
        <nav>
          <button onClick={() => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
          <button onClick={() => document.querySelector('#workflow')?.scrollIntoView({ behavior: 'smooth' })}>How it works</button>
          <button className="button button-secondary" onClick={() => onNavigate('/login')}>Sign in</button>
        </nav>
      </header>

      <section className="public-hero">
        <div className="hero-copy">
          <span className="hero-kicker"><ShieldCheck size={15} /> Built for startups and small businesses</span>
          <h1>Run your business with <em>clarity.</em></h1>
          <p>Friendly Bill Book connects enquiries, customers, quotations, invoices, inventory, payments, and reports in a single, easy-to-use workspace.</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => onNavigate('/register')}>Start free <ArrowRight size={17} /></button>
            <button className="text-action" onClick={() => onNavigate('/login')}>Already have an account <ArrowRight size={16} /></button>
          </div>
          <div className="hero-proof">
            <CheckCircle2 size={16} /> Free business workspace <span /> <CheckCircle2 size={16} /> GST-ready invoicing <span /> <CheckCircle2 size={16} /> Lightweight setup
          </div>
        </div>
        <div className="hero-preview">
          <div className="preview-top">
            <span><i /> <i /> <i /></span>
            <small>FRIENDLY BILL BOOK / OVERVIEW</small>
          </div>
          <div className="preview-title">
            <span>Good morning</span>
            <b>Business pulse</b>
          </div>
          <div className="preview-metrics">
            <div><small>Total sales</small><strong>Live data</strong><span>Updates from your invoices</span></div>
            <div><small>Pending payments</small><strong>Live data</strong><span>Updates from your payment records</span></div>
          </div>
          <div className="preview-chart">
            <div className="chart-bars"><i /><i /><i /><i /><i /><i /><i /></div>
            <div><small>Sales overview</small><strong>₹ 1.24L</strong></div>
          </div>
          <div className="preview-list">
            <span><b>Recent invoices</b><small>View all</small></span>
            <p><i className="green-dot" /> Retail billing <b>Live data</b></p>
            <p><i className="orange-dot" /> Product invoice <b>Live data</b></p>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <span>One connected workspace for every business</span>
        <b>Sales</b><b>Billing</b><b>Inventory</b><b>Payments</b><b>Reports</b>
      </section>

      <section className="feature-section" id="features">
        <div className="section-heading">
          <span className="eyebrow">ONE CALM WORKSPACE</span>
          <h2>Everything your team needs<br />to keep moving.</h2>
          <p>Simple enough for daily work. Structured enough to grow with your business.</p>
        </div>
        <div className="feature-grid">
          {features.map(([title, text, Icon], index) => (
            <article className="feature-card" key={title}>
              <span className="feature-number">0{index + 1}</span>
              <div className="feature-icon"><Icon size={21} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
              <button onClick={() => onNavigate('/register')}>Explore workspace <ArrowRight size={15} /></button>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section" id="workflow">
        <div>
          <span className="eyebrow">FROM FIRST CONTACT TO PAYMENT</span>
          <h2>A clearer path from enquiry to growth.</h2>
          <p>Capture the enquiry, prepare the quote, raise the invoice, and keep the payment visible from one connected place.</p>
          <button className="button button-primary" onClick={() => onNavigate('/register')}>Create your free workspace <ArrowRight size={17} /></button>
        </div>
        <div className="workflow-steps">
          <span><b>01</b> Lead</span><i /> <span><b>02</b> Quote</span><i /> <span><b>03</b> Invoice</span><i /> <span><b>04</b> Payment</span>
        </div>
      </section>

      <footer className="public-footer">
        <div className="reference-brand">
          <span className="reference-brand-mark"><Sparkles size={18} /></span>
          <span><strong>FRIENDLY BILL BOOK</strong><small>Simple billing and CRM for modern businesses</small></span>
        </div>
        <span>Simple billing and management for modern businesses.</span>
        <span>© FRIENDLY BILL BOOK</span>
      </footer>
    </main>
  )
}

function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(getStoredUser)
  const [checkingSession, setCheckingSession] = useState(Boolean(localStorage.getItem('friendly_billbook_token')))
  const [activePage, setActivePage] = useState('Dashboard')
  const [company, setCompany] = useState(() => localStorage.getItem('friendly_billbook_company') || 'Friendly Bill Book')

  useEffect(() => {
    if (!checkingSession) return
    fetchCurrentUser()
      .then(setUser)
      .catch(() => {
        logout()
        setUser(null)
      })
      .finally(() => setCheckingSession(false))
  }, [checkingSession])

  useEffect(() => {
    if (user && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/dashboard', { replace: true })
    }
    if (!user && !checkingSession && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/', { replace: true })
    }
  }, [user, checkingSession, location.pathname, navigate])

  const handleNavigate = async (pageOrPath) => {
    if (pageOrPath === 'Sign Out') {
      await logout()
      setUser(null)
      navigate('/login', { replace: true })
      return
    }

    if (pageOrPath.startsWith('/')) {
      setActivePage(pageOrPath === '/dashboard' ? 'Dashboard' : 'Dashboard')
      navigate(pageOrPath)
      return
    }

    const route = pageMap[pageOrPath]?.path || '/dashboard'
    setActivePage(pageOrPath)
    navigate(route)
  }

  if (checkingSession) return <div className="login-screen" aria-busy="true"><p>Checking your session...</p></div>

  return (
    <BusinessSettingsProvider>
      <AppRoutes
        user={user}
        company={company}
        activePage={activePage}
        onNavigate={handleNavigate}
        loginScreen={LoginScreen}
        publicHome={PublicHome}
        onLogin={async (credentials) => {
          const loggedInUser = await login(credentials)
          setUser(loggedInUser)
          navigate('/dashboard', { replace: true })
        }}
        onRegister={(createdUser) => {
          setUser(createdUser)
          navigate('/dashboard', { replace: true })
        }}
        onLogout={async () => {
          await logout()
          setUser(null)
          navigate('/login', { replace: true })
        }}
      />
    </BusinessSettingsProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export { ResourcePage }
export default App
