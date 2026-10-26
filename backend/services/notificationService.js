import { query } from '../config/database.js'

export async function createNotification({ userId, type, title, message }) {
	const result = await query('INSERT INTO notifications (user_id, notification_type, title, message) VALUES ($1, $2, $3, $4) RETURNING *', [userId, type, title, message])
	return result.rows[0]
}
