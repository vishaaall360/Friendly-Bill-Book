export function errorMiddleware(error, request, response, _next) {
	if (error.name === 'ZodError') return response.status(400).json({ error: 'Invalid request data', details: error.flatten() })
	if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') return response.status(503).json({ error: 'Database is unavailable. Check the SQLite database files and try again.' })
	if (error.code === '3D000') return response.status(503).json({ error: 'The configured database does not exist.' })
	if (error.code === '42P01') return response.status(503).json({ error: 'The database schema is not initialized.' })
	if (error.errcode === 2067) {
		if (error.message?.includes('users.email')) return response.status(409).json({ error: 'An account with this email already exists.' })
		return response.status(409).json({ error: 'A record with this value already exists.' })
	}
	if (error.code === '23505') {
		if (error.constraint === 'users_mobile_key') return response.status(409).json({ error: 'An account with this mobile number already exists.' })
		return response.status(409).json({ error: 'An account with this email already exists.' })
	}
	if (error.code === '23503') return response.status(400).json({ error: 'Referenced record was not found' })
	if (error.code === '23514' || error.code === '22P02') return response.status(400).json({ error: 'Invalid data supplied' })
	console.error(error)
	return response.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : 'Internal server error' })
}
