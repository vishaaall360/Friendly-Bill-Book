import { query } from '../config/database.js'

const reports = {
  sales: `SELECT strftime('%Y-%m-01', invoice_date) AS month, COALESCE(sum(grand_total), 0) AS total FROM invoices WHERE status <> 'Cancelled' AND date(invoice_date) BETWEEN COALESCE(date($1), date('1900-01-01')) AND COALESCE(date($2), date('2999-12-31')) GROUP BY month ORDER BY month`,
  purchase: `SELECT strftime('%Y-%m-01', order_date) AS month, COALESCE(sum(total), 0) AS total FROM purchase_orders WHERE status <> 'Cancelled' AND date(order_date) BETWEEN COALESCE(date($1), date('1900-01-01')) AND COALESCE(date($2), date('2999-12-31')) GROUP BY month ORDER BY month`,
  expenses: `SELECT strftime('%Y-%m-01', expense_date) AS month, COALESCE(sum(amount), 0) AS total FROM expenses WHERE date(expense_date) BETWEEN COALESCE(date($1), date('1900-01-01')) AND COALESCE(date($2), date('2999-12-31')) GROUP BY month ORDER BY month`,
  stock: `SELECT product_name, sku, COALESCE(current_stock, stock_quantity, 0) AS current_stock, COALESCE(minimum_stock, min_stock_level, 0) AS minimum_stock, COALESCE(current_stock, stock_quantity, 0) * COALESCE(purchase_price, 0) AS stock_value FROM products ORDER BY product_name`,
  gst: `SELECT strftime('%Y-%m-01', invoice_date) AS month, COALESCE(sum(cgst), 0) AS cgst, COALESCE(sum(sgst), 0) AS sgst, COALESCE(sum(igst), 0) AS igst FROM invoices WHERE status <> 'Cancelled' AND date(invoice_date) BETWEEN COALESCE(date($1), date('1900-01-01')) AND COALESCE(date($2), date('2999-12-31')) GROUP BY month ORDER BY month`,
  payments: `SELECT payment_number, payment_date, customer_id, invoice_id, amount, payment_method, reference_number FROM payments WHERE date(payment_date) BETWEEN COALESCE(date($1), date('1900-01-01')) AND COALESCE(date($2), date('2999-12-31')) ORDER BY payment_date DESC`,
  'profit-loss': `WITH sales AS (SELECT strftime('%Y-%m-01', invoice_date) AS month, COALESCE(sum(grand_total), 0) AS sales FROM invoices WHERE status <> 'Cancelled' AND date(invoice_date) BETWEEN COALESCE(date($1), date('1900-01-01')) AND COALESCE(date($2), date('2999-12-31')) GROUP BY month), purchases AS (SELECT strftime('%Y-%m-01', order_date) AS month, COALESCE(sum(total), 0) AS purchases FROM purchase_orders WHERE status <> 'Cancelled' AND date(order_date) BETWEEN COALESCE(date($1), date('1900-01-01')) AND COALESCE(date($2), date('2999-12-31')) GROUP BY month), expense_data AS (SELECT strftime('%Y-%m-01', expense_date) AS month, COALESCE(sum(amount), 0) AS expenses FROM expenses WHERE date(expense_date) BETWEEN COALESCE(date($1), date('1900-01-01')) AND COALESCE(date($2), date('2999-12-31')) GROUP BY month), months AS (SELECT month FROM sales UNION SELECT month FROM purchases UNION SELECT month FROM expense_data) SELECT months.month, COALESCE(sales.sales, 0) AS sales, COALESCE(purchases.purchases, 0) AS purchases, COALESCE(expense_data.expenses, 0) AS expenses, COALESCE(sales.sales, 0) - COALESCE(purchases.purchases, 0) - COALESCE(expense_data.expenses, 0) AS profit FROM months LEFT JOIN sales USING(month) LEFT JOIN purchases USING(month) LEFT JOIN expense_data USING(month) ORDER BY months.month`,
}

export async function getReport(request, response, next) {
  try {
    const sql = reports[request.params.type]
    if (!sql) return response.status(404).json({ error: 'Report not found' })
    const result = await query(sql, [request.query.from || null, request.query.to || null])
    response.json(result.rows)
  } catch (error) { next(error) }
}
