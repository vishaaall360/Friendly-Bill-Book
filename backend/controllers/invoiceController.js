import { z } from 'zod'
import { withTransaction } from '../config/database.js'
import { sendInvoicePdf } from '../services/invoicePdfService.js'
import { getBusinessSettingsSnapshot } from '../services/businessSettingsService.js'

export const invoiceSchema = z.object({ invoice_number: z.string().min(1), customer_id: z.string().uuid(), invoice_date: z.string().optional(), due_date: z.string().optional(), customer_gstin: z.string().optional(), billing_address: z.string().optional(), shipping_address: z.string().optional(), subtotal: z.coerce.number().min(0), discount: z.coerce.number().min(0).default(0), cgst: z.coerce.number().min(0).default(0), sgst: z.coerce.number().min(0).default(0), igst: z.coerce.number().min(0).default(0), round_off: z.coerce.number().default(0), grand_total: z.coerce.number().min(0), status: z.enum(['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled']).default('Draft'), notes: z.string().optional(), items: z.array(z.object({ product_id: z.string().uuid().optional(), description: z.string().min(1), hsn_sac: z.string().optional(), quantity: z.coerce.number().positive(), rate: z.coerce.number().min(0), discount: z.coerce.number().min(0).default(0), tax_rate: z.coerce.number().refine((value) => [0, 5, 12, 18, 28].includes(value)), taxable_value: z.coerce.number().min(0), cgst: z.coerce.number().min(0).default(0), sgst: z.coerce.number().min(0).default(0), igst: z.coerce.number().min(0).default(0) })).default([]) })

export async function createInvoice(request, response, next) {
  try {
    const invoice = invoiceSchema.parse(request.body)
    const businessSnapshot = await getBusinessSettingsSnapshot()
    const record = await withTransaction(async (client) => {
      const result = await client.query('INSERT INTO invoices (invoice_number, customer_id, invoice_date, due_date, customer_gstin, billing_address, shipping_address, subtotal, discount, cgst, sgst, igst, round_off, grand_total, status, notes, business_snapshot, created_by) VALUES ($1, $2, COALESCE($3, CURRENT_DATE), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *', [invoice.invoice_number, invoice.customer_id, invoice.invoice_date || null, invoice.due_date || null, invoice.customer_gstin || null, invoice.billing_address || null, invoice.shipping_address || null, invoice.subtotal, invoice.discount, invoice.cgst, invoice.sgst, invoice.igst, invoice.round_off, invoice.grand_total, invoice.status, invoice.notes || null, JSON.stringify(businessSnapshot), request.user.id])
      for (const item of invoice.items) {
        await client.query('INSERT INTO invoice_items (invoice_id, product_id, description, hsn_sac, quantity, rate, discount, tax_rate, taxable_value, cgst, sgst, igst) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', [result.rows[0].id, item.product_id || null, item.description, item.hsn_sac || null, item.quantity, item.rate, item.discount, item.tax_rate, item.taxable_value, item.cgst, item.sgst, item.igst])
        if (item.product_id && !['Draft', 'Cancelled'].includes(invoice.status)) await client.query('INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, created_by) VALUES ($1, $2, $3, $4, $5, $6)', [item.product_id, 'out', item.quantity, 'invoice', result.rows[0].id, request.user.id])
      }
      return result.rows[0]
    })
    response.status(201).json(record)
  } catch (error) { next(error) }
}

export async function getInvoice(request, response, next) {
  try {
    const result = await withTransaction(async (client) => {
      const invoice = await client.query('SELECT * FROM invoices WHERE id = $1', [request.params.id])
      if (!invoice.rows[0]) return null
      const items = await client.query('SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY created_at ASC', [request.params.id])
      return { ...invoice.rows[0], items: items.rows }
    })
    if (!result) return response.status(404).json({ error: 'Record not found' })
    return response.json(result)
  } catch (error) { return next(error) }
}

export async function updateInvoice(request, response, next) {
  try {
    const invoice = invoiceSchema.partial().parse(request.body)
    const record = await withTransaction(async (client) => {
      const existing = await client.query('SELECT status FROM invoices WHERE id = $1 FOR UPDATE', [request.params.id])
      if (!existing.rows[0]) return null
      const oldStatusActive = !['Draft', 'Cancelled'].includes(existing.rows[0].status)
      const newStatus = invoice.status || existing.rows[0].status
      const newStatusActive = !['Draft', 'Cancelled'].includes(newStatus)
      if (oldStatusActive && (!newStatusActive || invoice.items)) {
        const oldItems = await client.query('SELECT product_id, quantity FROM invoice_items WHERE invoice_id = $1 AND product_id IS NOT NULL', [request.params.id])
        await client.query('DELETE FROM stock_movements WHERE reference_type = $1 AND reference_id = $2', ['invoice', request.params.id])
        for (const item of oldItems.rows) await client.query('UPDATE products SET current_stock = current_stock + $1 WHERE id = $2', [item.quantity, item.product_id])
      }
      const entries = Object.entries(invoice).filter(([column]) => column !== 'items')
      const values = entries.map(([, value]) => value)
      let updated
      if (entries.length) {
        values.push(request.params.id)
        updated = await client.query(`UPDATE invoices SET ${entries.map(([column], index) => `${column} = $${index + 1}`).join(', ')} WHERE id = $${values.length} RETURNING *`, values)
      } else {
        updated = await client.query('SELECT * FROM invoices WHERE id = $1', [request.params.id])
      }
      if (!updated.rows[0]) return null
      if (invoice.items) {
        await client.query('DELETE FROM invoice_items WHERE invoice_id = $1', [request.params.id])
        for (const item of invoice.items) {
          await client.query('INSERT INTO invoice_items (invoice_id, product_id, description, hsn_sac, quantity, rate, discount, tax_rate, taxable_value, cgst, sgst, igst) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', [request.params.id, item.product_id || null, item.description, item.hsn_sac || null, item.quantity, item.rate, item.discount || 0, item.tax_rate, item.taxable_value, item.cgst || 0, item.sgst || 0, item.igst || 0])
          if (item.product_id && newStatusActive) await client.query('INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, created_by) VALUES ($1, $2, $3, $4, $5, $6)', [item.product_id, 'out', item.quantity, 'invoice', request.params.id, request.user.id])
        }
      }
      if (!invoice.items && !oldStatusActive && newStatusActive) {
        const currentItems = await client.query('SELECT product_id, quantity FROM invoice_items WHERE invoice_id = $1 AND product_id IS NOT NULL', [request.params.id])
        for (const item of currentItems.rows) await client.query('INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, created_by) VALUES ($1, $2, $3, $4, $5, $6)', [item.product_id, 'out', item.quantity, 'invoice', request.params.id, request.user.id])
      }
      return updated.rows[0]
    })
    if (!record) return response.status(404).json({ error: 'Record not found' })
    return response.json(record)
  } catch (error) { return next(error) }
}

export async function invoicePdf(request, response, next) { try { await sendInvoicePdf(request.params.id, response) } catch (error) { next(error) } }

export async function deleteInvoice(request, response, next) {
  try {
    const deleted = await withTransaction(async (client) => {
      const invoice = await client.query('SELECT status FROM invoices WHERE id = $1 FOR UPDATE', [request.params.id])
      if (!invoice.rows[0]) return false
      if (!['Draft', 'Cancelled'].includes(invoice.rows[0].status)) {
        const items = await client.query('SELECT product_id, quantity FROM invoice_items WHERE invoice_id = $1 AND product_id IS NOT NULL', [request.params.id])
        for (const item of items.rows) await client.query('UPDATE products SET current_stock = current_stock + $1 WHERE id = $2', [item.quantity, item.product_id])
        await client.query('DELETE FROM stock_movements WHERE reference_type = $1 AND reference_id = $2', ['invoice', request.params.id])
      }
      await client.query('DELETE FROM invoices WHERE id = $1', [request.params.id])
      return true
    })
    if (!deleted) return response.status(404).json({ error: 'Record not found' })
    return response.status(204).end()
  } catch (error) { return next(error) }
}
