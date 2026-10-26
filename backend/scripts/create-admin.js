import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { query } from '../config/database.js'

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') })

const adminSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().trim().min(1).default('JB YOUR SAFE TECHNOLOGY Admin'),
})

const admin = adminSchema.parse({
	email: process.env.ADMIN_EMAIL,
	password: process.env.ADMIN_PASSWORD,
	name: process.env.ADMIN_NAME,
})

try {
	const passwordHash = await bcrypt.hash(admin.password, 12)
	const result = await query(
		`INSERT INTO users (role_id, name, email, password_hash)
		 SELECT roles.id, $1, $2, $3 FROM roles WHERE roles.name = 'Admin'
		 ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, active = true
		 RETURNING email`,
		[admin.name, admin.email.toLowerCase(), passwordHash],
	)
	if (!result.rowCount) throw new Error('Admin role is missing. Start the backend once so SQLite initialization can create the default roles.')
	console.log(`Admin account ready: ${result.rows[0].email}`)
} finally {
	await pool.end()
}