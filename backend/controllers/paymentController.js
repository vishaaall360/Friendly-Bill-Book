import { withTransaction } from '../config/database.js'
import { z } from 'zod'

export const paymentSchema = z.object({ customer_id: z.string().uuid(), invoice_id: z.string().uuid(), payment_number: z.string().min(1), amount: z.coerce.number().positive(), payment_method: z.enum(['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque']), payment_date: z.string().optional(), reference_number: z.string().optional(), notes: z.string().optional() })

export async function createPayment(request, response, next) {
	try {
		const payment = paymentSchema.parse(request.body)
		const record = await withTransaction(async (client) => {
			// Fetch invoice with lock
			const invoice = await client.query('SELECT id, customer_id, grand_total, amount_paid, status FROM invoices WHERE id = $1 FOR UPDATE', [payment.invoice_id])
			if (!invoice.rows[0]) { const error = new Error('Invoice not found'); error.statusCode = 404; throw error }
			if (invoice.rows[0].customer_id !== payment.customer_id) { const error = new Error('Payment customer does not match invoice customer'); error.statusCode = 400; throw error }
			const balance = Number(invoice.rows[0].grand_total) - Number(invoice.rows[0].amount_paid)
			if (payment.amount > balance) { const error = new Error('Payment amount cannot exceed invoice balance'); error.statusCode = 400; throw error }
			
			// Create payment record
			const result = await client.query('INSERT INTO payments (payment_number, customer_id, invoice_id, payment_date, amount, payment_method, reference_number, notes, received_by) VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5, $6, $7, $8, $9) RETURNING *', [payment.payment_number, payment.customer_id, payment.invoice_id, payment.payment_date || null, payment.amount, payment.payment_method, payment.reference_number || null, payment.notes || null, request.user.id])
			
			return result.rows[0]
		})
		response.status(201).json(record)
	} catch (error) { next(error) }
}

export async function updatePayment(request, response, next) {
	try {
		const payment = paymentSchema.partial().parse(request.body)
		const record = await withTransaction(async (client) => {
			const existing = await client.query('SELECT * FROM payments WHERE id = $1 FOR UPDATE', [request.params.id])
			if (!existing.rows[0]) return null
			if (payment.invoice_id && payment.invoice_id !== existing.rows[0].invoice_id) throw Object.assign(new Error('Payment invoice cannot be changed'), { statusCode: 400 })
			if (payment.customer_id && payment.customer_id !== existing.rows[0].customer_id) throw Object.assign(new Error('Payment customer cannot be changed'), { statusCode: 400 })
			const nextAmount = payment.amount ?? Number(existing.rows[0].amount)
			const invoice = await client.query('SELECT id, grand_total, amount_paid, status FROM invoices WHERE id = $1 FOR UPDATE', [existing.rows[0].invoice_id])
			const balanceWithoutPayment = Number(invoice.rows[0].amount_paid) - Number(existing.rows[0].amount)
			if (nextAmount > Number(invoice.rows[0].grand_total) - balanceWithoutPayment) throw Object.assign(new Error('Payment amount cannot exceed invoice balance'), { statusCode: 400 })
			const entries = Object.entries(payment).filter(([column]) => !['invoice_id', 'customer_id'].includes(column))
			if (entries.length) {
				const values = entries.map(([, value]) => value)
				values.push(request.params.id)
				await client.query(`UPDATE payments SET ${entries.map(([column], index) => `${column} = $${index + 1}`).join(', ')} WHERE id = $${values.length}`, values)
			}
			const amountPaid = balanceWithoutPayment + nextAmount
			await client.query("UPDATE invoices SET amount_paid = $1, status = $2, updated_at = datetime('now') WHERE id = $3", [amountPaid, amountPaid >= Number(invoice.rows[0].grand_total) ? 'Paid' : 'Partially Paid', invoice.rows[0].id])
			const updated = await client.query('SELECT * FROM payments WHERE id = $1', [request.params.id])
			return updated.rows[0]
		})
		if (!record) return response.status(404).json({ error: 'Record not found' })
		return response.json(record)
	} catch (error) { next(error) }
}

export async function deletePayment(request, response, next) {
	try {
		const deleted = await withTransaction(async (client) => {
			const existing = await client.query('SELECT * FROM payments WHERE id = $1 FOR UPDATE', [request.params.id])
			if (!existing.rows[0]) return false
			const invoice = await client.query('SELECT id, grand_total, amount_paid FROM invoices WHERE id = $1 FOR UPDATE', [existing.rows[0].invoice_id])
			await client.query('DELETE FROM payments WHERE id = $1', [request.params.id])
			const amountPaid = Math.max(0, Number(invoice.rows[0].amount_paid) - Number(existing.rows[0].amount))
			await client.query("UPDATE invoices SET amount_paid = $1, status = $2, updated_at = datetime('now') WHERE id = $3", [amountPaid, amountPaid >= Number(invoice.rows[0].grand_total) ? 'Paid' : 'Sent', invoice.rows[0].id])
			return true
		})
		if (!deleted) return response.status(404).json({ error: 'Record not found' })
		return response.status(204).end()
	} catch (error) { next(error) }
}
