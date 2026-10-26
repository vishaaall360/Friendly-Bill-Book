import { useMemo, useState } from 'react'
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, X } from 'lucide-react'
import { register } from '../../services/api'

const initialForm = { name: '', email: '', mobile: '', password: '', confirmPassword: '', company: 'Friendly Bill Book', terms: true }

function Register({ onRegistered, onSignIn }) {
	const [form, setForm] = useState(initialForm)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const passwordRules = useMemo(() => ({
		length: form.password.length >= 8,
		uppercase: /[A-Z]/.test(form.password),
		lowercase: /[a-z]/.test(form.password),
		number: /[0-9]/.test(form.password),
	}), [form.password])
	const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword

	function update(name, value) { setForm((current) => ({ ...current, [name]: value })) }

	async function submit(event) {
		event.preventDefault()
		setError('')
		if (!Object.values(passwordRules).every(Boolean)) return setError('Password does not meet the required rules')
		if (!passwordsMatch) return setError('Passwords do not match')
		if (!form.terms) return setError('Please accept the Terms & Conditions and Privacy Policy')
		setLoading(true)
		try {
			const user = await register({ name: form.name, email: form.email, mobile: form.mobile, password: form.password, company: form.company })
			onRegistered(user)
		} catch (requestError) {
			setError(requestError.response?.data?.error || (requestError.request ? 'Unable to reach the authentication server' : 'Something went wrong. Please try again.'))
		} finally { setLoading(false) }
	}

	function Rule({ valid, children }) { return <span className={valid ? 'password-rule valid' : 'password-rule'}>{valid ? <Check size={14} /> : <X size={14} />}{children}</span> }

	return (
		<main className="login-screen register-screen">
			<div className="login-art">
				<div className="login-brand">
					<span className="brand-mark"><img src="/logo.svg" alt="Friendly Bill Book logo" /></span>
					<strong>Friendly Bill Book</strong>
				</div>
				<div>
					<p className="eyebrow">FRIENDLY BILL BOOK / SIGN UP</p>
					<h1>Run your billing<br />with ease &amp;<br /><em>clarity.</em></h1>
					<p>Create a secure business workspace for Friendly Bill Book.</p>
				</div>
				<small>© FRIENDLY BILL BOOK CRM &amp; BILLING</small>
			</div>
			<form className="login-card register-card" onSubmit={submit}>
				<div className="login-icon"><LockKeyhole size={21} /></div>
				<p className="eyebrow">NEW WORKSPACE ACCOUNT</p>
				<h2>Create your account</h2>
				<p className="login-muted">Set up your secure access to the Friendly Bill Book workspace.</p>
				{error && <div className="alert alert-error">{error}</div>}
				
				<div className="login-divider"><span>register with email</span></div>

				<div className="register-fields">
					<label>Full name<input value={form.name} onChange={(event) => update('name', event.target.value)} required maxLength="120" autoComplete="name" placeholder="Your full name" /></label>
					<label>Email address<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required autoComplete="email" placeholder="you@company.com" /></label>
					<label>Mobile number<input type="tel" value={form.mobile} onChange={(event) => update('mobile', event.target.value)} required pattern="\+?[1-9][0-9]{7,14}" autoComplete="tel" placeholder="+91 9876543210" /></label>
					<label>Business / Company Name<input value={form.company} onChange={(event) => update('company', event.target.value)} placeholder="Friendly Bill Book" /></label>
					<label>Password
						<div className="password-input">
							<input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => update('password', event.target.value)} required minLength="8" maxLength="128" autoComplete="new-password" placeholder="Create a password" />
							<button type="button" className="icon-button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
								{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
							</button>
						</div>
						<span className="password-rules">
							<Rule valid={passwordRules.length}>At least 8 characters</Rule>
							<Rule valid={passwordRules.uppercase}>One uppercase letter</Rule>
							<Rule valid={passwordRules.lowercase}>One lowercase letter</Rule>
							<Rule valid={passwordRules.number}>One number</Rule>
						</span>
					</label>
					<label>Confirm password
						<div className="password-input">
							<input type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} required autoComplete="new-password" placeholder="Repeat your password" />
							<button type="button" className="icon-button" onClick={() => setShowConfirmPassword((current) => !current)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
								{showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
							</button>
						</div>
						{form.confirmPassword && <span className={passwordsMatch ? 'confirm-message valid' : 'confirm-message'}>{passwordsMatch ? <Check size={14} /> : <X size={14} />}{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>}
					</label>
				</div>
				<label className="terms-check">
					<input type="checkbox" checked={form.terms} onChange={(event) => update('terms', event.target.checked)} />
					<span>I agree to the Terms &amp; Conditions and Privacy Policy</span>
				</label>
				<button className="button button-primary login-button" disabled={loading}>
					{loading ? <><LoaderCircle className="spin" size={17} /> Creating Account...</> : <>Create Account <ArrowRight size={17} /></>}
				</button>
				<p className="register-signin">Already have an account? <button type="button" onClick={onSignIn}>Sign in</button></p>
			</form>
		</main>
	)
}

export default Register