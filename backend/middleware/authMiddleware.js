import jwt from 'jsonwebtoken'
import { environment } from '../config/env.js'

export function authMiddleware(request, response, next) {
	const token = request.headers.authorization?.replace('Bearer ', '')
	if (!token) return response.status(401).json({ error: 'Unauthorized access' })

	try {
		request.user = jwt.verify(token, environment.jwtSecret)
		return next()
	} catch {
		return response.status(401).json({ error: 'Unauthorized access' })
	}
}

export function requireRole(...roles) {
	return (request, response, next) => {
		if (!roles.includes(request.user.role)) return response.status(403).json({ error: 'Forbidden' })
		next()
	}
}

export function requirePermission(permission) {
	return async (request, response, next) => {
		try {
			const { query } = await import('../config/database.js')
			const result = await query('SELECT 1 FROM role_permissions JOIN permissions ON permissions.id = role_permissions.permission_id JOIN users ON users.role_id = role_permissions.role_id WHERE users.id = $1 AND permissions.name = $2', [request.user.id, permission])
			if (!result.rowCount) return response.status(403).json({ error: 'Forbidden' })
			next()
		} catch (error) { next(error) }
	}
}
