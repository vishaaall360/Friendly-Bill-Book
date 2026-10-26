import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { query } from '../config/database.js'
import { environment } from '../config/env.js'

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) })
const registrationSchema = z.object({
	name: z.string().trim().min(1).max(120),
	email: z.string().email(),
	mobile: z.string().trim().regex(/^\+?[1-9][0-9]{7,14}$/).optional().or(z.literal('')),
	password: z.string().min(8).max(128),
	company: z.string().optional().default('Friendly Bill Book'),
})

const googleLoginSchema = z.object({
	email: z.string().email(),
	name: z.string().nullable().optional(),
	photoUrl: z.string().nullable().optional(),
	idToken: z.string().optional(),
})

export async function login(request, response, next) {
	try {
		const credentials = loginSchema.parse(request.body)
		const result = await query(
			`SELECT users.id, users.name, users.email, users.mobile, users.company,
				COALESCE(users.password_hash, users.password) AS password_hash,
				roles.name AS role
			 FROM users
			 LEFT JOIN roles ON roles.id = users.role_id
			 WHERE lower(users.email) = $1 AND COALESCE(users.active, 1) = true`,
			[credentials.email.toLowerCase()],
		)
		const user = result.rows[0]
		if (!user || !user.password_hash || !(await bcrypt.compare(credentials.password, user.password_hash))) {
			return response.status(401).json({ error: 'Invalid email or password' })
		}
		const safeUser = { id: user.id, name: user.name, email: user.email, mobile: user.mobile, company: user.company, role: user.role || 'Staff' }
		const token = jwt.sign(safeUser, environment.jwtSecret, { expiresIn: '8h' })
		return response.json({ token, user: safeUser })
	} catch (error) {
		return next(error)
	}
}

export async function register(request, response, next) {
	try {
		const account = registrationSchema.parse(request.body)
		const passwordHash = await bcrypt.hash(account.password, 12)
		const result = await query(
			`INSERT INTO users (role_id, name, email, mobile, company, password_hash)
			 SELECT roles.id, $1, $2, $3, $4, $5 FROM roles WHERE roles.name = $6
			 RETURNING id, name, email, mobile, company`,
			[account.name, account.email.toLowerCase(), account.mobile || '', account.company || 'Friendly Bill Book', passwordHash, 'Staff'],
		)
		if (!result.rowCount) return response.status(400).json({ error: 'Selected role is not available' })
		const user = { ...result.rows[0], role: 'Staff' }
		const token = jwt.sign(user, environment.jwtSecret, { expiresIn: '8h' })
		return response.status(201).json({ success: true, message: 'Account created successfully', token, user })
	} catch (error) {
		return next(error)
	}
}

export async function googleLogin(request, response, next) {
	try {
		const { email, name } = googleLoginSchema.parse(request.body)
		const normalizedEmail = email.toLowerCase()
		const displayName = name?.trim() || normalizedEmail.split('@')[0]

		// Check if user already exists
		const existing = await query(
			`SELECT users.id, users.name, users.email, users.mobile, users.company, roles.name AS role
			 FROM users
			 LEFT JOIN roles ON roles.id = users.role_id
			 WHERE lower(users.email) = $1 AND COALESCE(users.active, 1) = true`,
			[normalizedEmail],
		)

		let safeUser
		if (existing.rowCount > 0) {
			const user = existing.rows[0]
			safeUser = { id: user.id, name: user.name, email: user.email, mobile: user.mobile, company: user.company, role: user.role }
		} else {
			// Auto create user for Google authentication
			const randomPassword = await bcrypt.hash(Math.random().toString(36) + Date.now().toString(), 10)
			const created = await query(
				`INSERT INTO users (id, role_id, name, email, mobile, company, password_hash)
				 SELECT $1, roles.id, $2, $3, $4, $5, $6 FROM roles WHERE roles.name = 'Staff'
				 RETURNING id, name, email, mobile, company`,
			[randomUUID(), displayName, normalizedEmail, '', 'Friendly Bill Book', randomPassword],
			)
			if (!created.rowCount) {
				// Fallback if role query returned nothing: find any first role
				const roleResult = await query('SELECT id FROM roles LIMIT 1')
				const roleId = roleResult.rows[0]?.id
				const fallbackCreated = await query(
					`INSERT INTO users (id, role_id, name, email, mobile, company, password_hash)
					 VALUES ($1, $2, $3, $4, $5, $6, $7)
					 RETURNING id, name, email, mobile, company`,
					[randomUUID(), roleId, displayName, normalizedEmail, '', 'Friendly Bill Book', randomPassword],
				)
				safeUser = { ...fallbackCreated.rows[0], role: 'Staff' }
			} else {
				safeUser = { ...created.rows[0], role: 'Staff' }
			}
		}

		const token = jwt.sign(safeUser, environment.jwtSecret, { expiresIn: '8h' })
		return response.json({ token, user: safeUser })
	} catch (error) {
		return next(error)
	}
}

export function currentUser(request, response) { response.json({ user: request.user }) }

export function logout(request, response) { response.status(204).send() }
