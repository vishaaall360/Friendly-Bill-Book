import { z } from 'zod'
import { query } from '../config/database.js'

const customerSchema = z.object({
	customer_name: z.string().min(1),
	mobile: z.string().min(7),
	email: z.string().email().optional().or(z.literal('')),
	company_name: z.string().optional(),
	gstin: z.string().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	pincode: z.string().optional(),
})

export async function listCustomers(request, response, next) {
	try {
		const search = `%${request.query.search || ''}%`
		const result = await query('SELECT * FROM customers WHERE customer_name ILIKE $1 OR company_name ILIKE $1 OR mobile ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [search, Number(request.query.limit || 25), Number(request.query.offset || 0)])
		response.json(result.rows)
	} catch (error) { next(error) }
}

export async function createCustomer(request, response, next) {
	try {
		const customer = customerSchema.parse(request.body)
		const result = await query('INSERT INTO customers (customer_name, mobile, email, company_name, gstin, address, city, state, pincode) VALUES ($1, $2, NULLIF($3, \'\'), $4, $5, $6, $7, $8, $9) RETURNING *', [customer.customer_name, customer.mobile, customer.email || '', customer.company_name || null, customer.gstin || null, customer.address || null, customer.city || null, customer.state || null, customer.pincode || null])
		response.status(201).json(result.rows[0])
	} catch (error) { next(error) }
}
