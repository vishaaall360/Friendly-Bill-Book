import { query } from '../config/database.js'

export async function getOutstandingReport() {
	const result = await query("SELECT invoices.*, customers.customer_name, grand_total - amount_paid AS balance_due FROM invoices JOIN customers ON customers.id = invoices.customer_id WHERE status NOT IN ('Paid', 'Cancelled') ORDER BY due_date NULLS LAST")
	return result.rows
}
