import { query } from '../config/database.js'
import { notFound } from '../utils/http.js'
import { generatePdf } from '../utils/generatePdf.js'

export async function sendInvoicePdf(invoiceId, response) {
  const result = await query('SELECT invoices.*, customers.customer_name FROM invoices JOIN customers ON customers.id = invoices.customer_id WHERE invoices.id = $1', [invoiceId])
  if (!result.rows[0]) throw notFound('Invoice not found')
  response.setHeader('Content-Type', 'application/pdf')
  response.setHeader('Content-Disposition', `attachment; filename="${result.rows[0].invoice_number}.pdf"`)
  const invoice = result.rows[0]
  return generatePdf({ ...invoice, ...(invoice.business_snapshot || {}) }, response)
}
