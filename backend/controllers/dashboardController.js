import { query } from '../config/database.js'

export async function getDashboard(request, response, next) {
	try {
		const result = await query(`SELECT
			(SELECT count(*) FROM leads) AS total_leads,
			(SELECT count(*) FROM customers) AS total_customers,
			(SELECT COALESCE(sum(grand_total), 0) FROM invoices WHERE status <> 'Cancelled') AS total_sales,
			(SELECT COALESCE(sum(total), 0) FROM purchase_orders WHERE status <> 'Cancelled') AS total_purchase,
			(SELECT count(*) FROM invoices) AS total_invoices,
			(SELECT COALESCE(sum(grand_total), 0) FROM invoices) AS paid_amount,
			(SELECT COALESCE(sum(CASE WHEN status <> 'Cancelled' THEN grand_total ELSE 0 END), 0) FROM invoices) AS pending_amount,
			(SELECT COALESCE(sum(amount), 0) FROM expenses) AS total_expenses,
			(SELECT COALESCE(sum(grand_total), 0) FROM invoices WHERE status <> 'Cancelled' AND date(invoice_date) = date('now')) AS today_sales,
			(SELECT COALESCE(sum(grand_total), 0) FROM invoices WHERE status <> 'Cancelled' AND date(invoice_date) >= date('now', 'start of month')) AS monthly_sales,
			(SELECT COALESCE(sum(amount), 0) FROM expenses WHERE date(expense_date) = date('now')) AS today_expenses,
			(SELECT COALESCE(sum(amount), 0) FROM expenses WHERE date(expense_date) >= date('now', 'start of month')) AS monthly_expenses,
			(SELECT count(*) FROM quotations WHERE status IN ('Draft', 'Sent')) AS pending_quotations,
			(SELECT count(*) FROM purchase_orders WHERE status IN ('Draft', 'Confirmed')) AS pending_purchase_orders,
			(SELECT COALESCE(sum(stock_quantity * purchase_price), 0) FROM products) AS current_stock_value,
			(SELECT count(*) FROM products WHERE stock_quantity <= min_stock_level) AS low_stock_products`)
		response.json(result.rows[0])
	} catch (error) { next(error) }
}