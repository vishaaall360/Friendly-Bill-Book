import { z } from 'zod'
import { withTransaction, query } from '../config/database.js'
import { getBusinessSettingsSnapshot } from '../services/businessSettingsService.js'

export const proformaSchema = z.object({
  proforma_number: z.string().min(1),
  customer_id: z.string().uuid(),
  invoice_date: z.string().optional(),
  due_date: z.string().optional(),
  customer_gstin: z.string().optional(),
  billing_address: z.string().optional(),
  shipping_address: z.string().optional(),
  subtotal: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  cgst: z.coerce.number().min(0).default(0),
  sgst: z.coerce.number().min(0).default(0),
  igst: z.coerce.number().min(0).default(0),
  round_off: z.coerce.number().default(0),
  grand_total: z.coerce.number().min(0).default(0),
  total: z.coerce.number().min(0).optional(),
  status: z.enum(['Draft', 'Sent', 'Accepted', 'Converted', 'Cancelled']).default('Draft'),
  notes: z.string().optional(),
  terms_conditions: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().optional(),
    description: z.string().min(1),
    hsn_sac: z.string().optional(),
    quantity: z.coerce.number().positive(),
    rate: z.coerce.number().min(0),
    discount: z.coerce.number().min(0).default(0),
    tax_rate: z.coerce.number().refine((val) => [0, 5, 12, 18, 28].includes(val)).default(18),
    taxable_value: z.coerce.number().min(0).default(0),
    cgst: z.coerce.number().min(0).default(0),
    sgst: z.coerce.number().min(0).default(0),
    igst: z.coerce.number().min(0).default(0),
  })).default([])
})

export async function listProformas(request, response, next) {
  try {
    const { search } = request.query
    let sql = 'SELECT * FROM proforma_invoices'
    const params = []
    if (search) {
      params.push(`%${search}%`)
      sql += ' WHERE proforma_number ILIKE $1'
    }
    sql += ' ORDER BY created_at DESC'
    const result = await query(sql, params)
    return response.json(result.rows)
  } catch (error) {
    next(error)
  }
}

export async function createProforma(request, response, next) {
  try {
    const proforma = proformaSchema.parse(request.body)
    const businessSnapshot = await getBusinessSettingsSnapshot()
    const grandTotal = proforma.grand_total || proforma.total || 0

    const record = await withTransaction(async (client) => {
      const result = await client.query(
        `INSERT INTO proforma_invoices (
          proforma_number, customer_id, invoice_date, due_date, customer_gstin,
          billing_address, shipping_address, subtotal, discount, cgst, sgst, igst,
          round_off, grand_total, total, status, notes, terms_conditions, business_snapshot, created_by
        ) VALUES ($1, $2, COALESCE($3, CURRENT_DATE), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *`,
        [
          proforma.proforma_number,
          proforma.customer_id,
          proforma.invoice_date || null,
          proforma.due_date || null,
          proforma.customer_gstin || null,
          proforma.billing_address || null,
          proforma.shipping_address || null,
          proforma.subtotal,
          proforma.discount,
          proforma.cgst,
          proforma.sgst,
          proforma.igst,
          proforma.round_off,
          grandTotal,
          grandTotal,
          proforma.status,
          proforma.notes || null,
          proforma.terms_conditions || null,
          JSON.stringify(businessSnapshot),
          request.user.id
        ]
      )

      for (const item of proforma.items) {
        await client.query(
          `INSERT INTO proforma_invoice_items (
            proforma_id, product_id, description, hsn_sac, quantity, rate,
            discount, tax_rate, taxable_value, cgst, sgst, igst
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            result.rows[0].id,
            item.product_id || null,
            item.description,
            item.hsn_sac || null,
            item.quantity,
            item.rate,
            item.discount,
            item.tax_rate,
            item.taxable_value,
            item.cgst,
            item.sgst,
            item.igst
          ]
        )
      }
      return result.rows[0]
    })

    response.status(201).json(record)
  } catch (error) {
    next(error)
  }
}

export async function getProforma(request, response, next) {
  try {
    const result = await withTransaction(async (client) => {
      const proforma = await client.query('SELECT * FROM proforma_invoices WHERE id = $1', [request.params.id])
      if (!proforma.rows[0]) return null
      const items = await client.query('SELECT * FROM proforma_invoice_items WHERE proforma_id = $1 ORDER BY created_at ASC', [request.params.id])
      return { ...proforma.rows[0], items: items.rows }
    })
    if (!result) return response.status(404).json({ error: 'Proforma invoice not found' })
    return response.json(result)
  } catch (error) {
    next(error)
  }
}

export async function updateProforma(request, response, next) {
  try {
    const proforma = proformaSchema.partial().parse(request.body)

    const record = await withTransaction(async (client) => {
      const existing = await client.query('SELECT id FROM proforma_invoices WHERE id = $1', [request.params.id])
      if (!existing.rows[0]) return null

      const entries = Object.entries(proforma).filter(([column]) => column !== 'items')
      const values = entries.map(([, value]) => value)
      let updated
      if (entries.length) {
        values.push(request.params.id)
        updated = await client.query(
          `UPDATE proforma_invoices SET ${entries.map(([column], index) => `${column} = $${index + 1}`).join(', ')} WHERE id = $${values.length} RETURNING *`,
          values
        )
      } else {
        updated = await client.query('SELECT * FROM proforma_invoices WHERE id = $1', [request.params.id])
      }

      if (proforma.items) {
        await client.query('DELETE FROM proforma_invoice_items WHERE proforma_id = $1', [request.params.id])
        for (const item of proforma.items) {
          await client.query(
            `INSERT INTO proforma_invoice_items (
              proforma_id, product_id, description, hsn_sac, quantity, rate,
              discount, tax_rate, taxable_value, cgst, sgst, igst
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              request.params.id,
              item.product_id || null,
              item.description,
              item.hsn_sac || null,
              item.quantity,
              item.rate,
              item.discount || 0,
              item.tax_rate || 18,
              item.taxable_value || 0,
              item.cgst || 0,
              item.sgst || 0,
              item.igst || 0
            ]
          )
        }
      }

      return updated.rows[0]
    })

    if (!record) return response.status(404).json({ error: 'Proforma invoice not found' })
    return response.json(record)
  } catch (error) {
    next(error)
  }
}

export async function deleteProforma(request, response, next) {
  try {
    const result = await query('DELETE FROM proforma_invoices WHERE id = $1 RETURNING id', [request.params.id])
    if (!result.rowCount) return response.status(404).json({ error: 'Proforma invoice not found' })
    return response.status(204).end()
  } catch (error) {
    next(error)
  }
}
