import axios from 'axios'

const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')
const normalizedApiBaseUrl = apiBaseUrl.endsWith('/api') ? apiBaseUrl : `${apiBaseUrl}/api`

const api = axios.create({ baseURL: normalizedApiBaseUrl })

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('friendly_billbook_token')
	if (token) config.headers.Authorization = `Bearer ${token}`
	return config
})

export async function login(credentials) {
	const { data } = await api.post('/auth/login', credentials)
	localStorage.setItem('friendly_billbook_token', data.token)
	localStorage.setItem('friendly_billbook_user', JSON.stringify(data.user))
	return data.user
}

export async function register(payload) {
	const { data } = await api.post('/auth/register', payload)
	localStorage.setItem('friendly_billbook_token', data.token)
	localStorage.setItem('friendly_billbook_user', JSON.stringify(data.user))
	return data.user
}

export async function logout() {
	try {
		await api.post('/auth/logout')
	} catch {
	} finally {
		localStorage.removeItem('friendly_billbook_token')
		localStorage.removeItem('friendly_billbook_user')
	}
}

export function getStoredUser() {
	try { return JSON.parse(localStorage.getItem('friendly_billbook_user') || 'null') } catch { return null }
}

export async function fetchCurrentUser() {
	const { data } = await api.get('/auth/me')
	localStorage.setItem('friendly_billbook_user', JSON.stringify(data.user))
	return data.user
}

export async function fetchDashboard() {
	const { data } = await api.get('/dashboard')
	return data
}

export async function fetchReport(type, params = {}) {
	const { data } = await api.get(`/reports/${type}`, { params })
	return data
}

export async function fetchResource(endpoint, params = {}) {
	const { data } = await api.get(endpoint, { params })
	return data
}

export async function createResource(endpoint, payload) {
	const { data } = await api.post(endpoint, payload)
	return data
}

export async function updateResource(endpoint, id, payload) {
	const { data } = await api.put(`${endpoint}/${id}`, payload)
	return data
}

export async function fetchUsers() {
	const { data } = await api.get('/users')
	return data
}

export async function createUser(account) {
	const { data } = await api.post('/users', account)
	return data
}

export async function deleteResource(endpoint, id) {
	await api.delete(`${endpoint}/${id}`)
}

const resolveUploadUrl = (value) => {
	if (!value || /^https?:\/\//i.test(value)) return value
	const apiOrigin = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/api\/?$/, '')
	return `${apiOrigin}${value.startsWith('/') ? value : `/${value}`}`
}

export async function fetchBusinessSettings() {
	const { data } = await api.get('/business-settings')
	return { ...data, logo_url: resolveUploadUrl(data.logo_url), signature_url: resolveUploadUrl(data.signature_url) }
}

export async function updateBusinessSettings(settings) {
	const { data } = await api.put('/business-settings', settings)
	return data
}

export async function uploadBusinessLogo(file) {
	const formData = new FormData()
	formData.append('logo', file)
	const { data } = await api.post('/business-settings/logo', formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	})
	return { ...data, settings: { ...data.settings, logo_url: resolveUploadUrl(data.settings?.logo_url) } }
}

export async function uploadBusinessSignature(file) {
	const formData = new FormData()
	formData.append('signature', file)
	const { data } = await api.post('/business-settings/signature', formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	})
	return data
}

// Google Sheets Sync APIs
export async function syncLeadToSheets(leadId) {
	const { data } = await api.post(`/leads/${leadId}/sync-to-sheets`)
	return data
}

export async function getSyncStatus(leadId) {
	const { data } = await api.get(`/leads/${leadId}/sync-status`)
	return data
}

export async function syncPendingLeads() {
	const { data } = await api.post('/leads/sync-pending/all')
	return data
}

export async function syncAllToGoogleSheets() {
	const { data } = await api.post('/business-settings/sync-google-sheets')
	return data
}

export async function retryFailedSync(leadId) {
	const { data } = await api.post(`/leads/${leadId}/retry-sync`)
	return data
}

export default api
