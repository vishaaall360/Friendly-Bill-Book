import bcrypt from 'bcrypt'
import { z } from 'zod'
import { query } from '../config/database.js'

const createUserSchema = z.object({
	name: z.string().trim().min(1).max(120),
	email: z.string().email(),
	password: z.string().min(8).max(128),
	role: z.enum(['Admin', 'Manager', 'Staff', 'Accountant']),
})

export async function listUsers(request, response, next) {
	try {
		const result = await query(
			`SELECT users.id, users.name, users.email, roles.name AS role, users.active, users.created_at
			 FROM users JOIN roles ON roles.id = users.role_id
			 ORDER BY users.created_at DESC`,
		)
		return response.json(result.rows)
	} catch (error) {
		return next(error)
	}
}

export async function createUser(request, response, next) {
	try {
		const account = createUserSchema.parse(request.body)
		const passwordHash = await bcrypt.hash(account.password, 12)
		const result = await query(
			`INSERT INTO users (role_id, name, email, password_hash)
			 SELECT roles.id, $1, $2, $3 FROM roles WHERE roles.name = $4
			 RETURNING id, name, email, active, created_at`,
			[account.name, account.email.toLowerCase(), passwordHash, account.role],
		)
		if (!result.rowCount) return response.status(400).json({ error: 'Selected role is not available' })
		return response.status(201).json({ ...result.rows[0], role: account.role })
	} catch (error) {
		return next(error)
	}
}