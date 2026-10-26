import { withTransaction, query } from '../config/database.js'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { getBusinessSettingsSnapshot } from '../services/businessSettingsService.js'

export const quotationSchema = z.object({
  quotation_number: z.string().min(1),
  customer_id: z.string().uuid(),
  quotation_date: z.string().optional(),
  valid_until: z.string().optional(),
  status: z.enum(['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired']).default('Draft'),
  subject: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().nullable().optional(),
    description: z.string().min(1),
    hsn: z.string().optional(),
    quantity: z.coerce.number().positive(),
    rate: z.coerce.number().nonnegative(),
    discount: z.coerce.number().nonnegative().default(0),
    tax_rate: z.preprocess((value) => (value === '' || value === null || value === undefined ? '0' : value), z.union([
      z.enum(['0', '5', '12', '18', '28']),
      z.coerce.number().refine((num) => [0, 5, 12, 18, 28].includes(Number(num)), {
        message: 'Tax rate must be one of 0, 5, 12, 18, or 28',
      })
    ]).transform((value) => Number(value))).default(0),
    taxable_value: z.coerce.number().nonnegative(),
  })).min(1),
  subtotal: z.coerce.number().nonnegative().default(0),
  tax: z.coerce.number().nonnegative().default(0),
  total: z.coerce.number().nonnegative().default(0),
  notes: z.string().optional(),
  terms_conditions: z.string().optional(),
  template_theme: z.string().optional(),
})

export async function getQuotation(request, response, next) {
  try {
    const quotationResult = await query('SELECT * FROM quotations WHERE id = $1', [request.params.id])
    const quotation = quotationResult.rows[0]
    if (!quotation) return response.status(404).json({ error: 'Quotation not found' })

    const itemsResult = await query('SELECT * FROM quotation_items WHERE quotation_id = $1 ORDER BY created_at ASC', [quotation.id])
    return response.json({ ...quotation, items: itemsResult.rows })
  } catch (error) {
    next(error)
  }
}

export async function createQuotation(request, response, next) {
  try {
    const data = quotationSchema.parse(request.body)
    const { items } = data

    // Get business settings snapshot before transaction
    const businessSnapshot = await getBusinessSettingsSnapshot()

    const record = await withTransaction(async (client) => {
      // Verify customer exists
      const customer = await client.query('SELECT id FROM customers WHERE id = $1', [data.customer_id])
      if (!customer.rows[0]) {
        const error = new Error('Customer not found')
        error.statusCode = 404
        throw error
      }

      const quotationId = randomUUID()

      // Create quotation with business snapshot
      const quotationResult = await client.query(
        'INSERT INTO quotations (id, quotation_number, customer_id, quotation_date, valid_until, status, subtotal, discount, cgst, sgst, igst, round_off, grand_total, notes, terms_conditions, business_snapshot, created_by) VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *',
        [
          quotationId,
          data.quotation_number,
          data.customer_id,
          data.quotation_date || null,
          data.valid_until || null,
          data.status,
          data.subtotal,
          0,
          0,
          0,
          0,
          0,
          data.total,
          data.notes || null,
          data.terms_conditions || null,
          JSON.stringify(businessSnapshot),
          request.user.id
        ]
      )

      const quotation = quotationResult.rows[0]

      // Create quotation items
      for (const item of items) {
        const itemId = randomUUID()
        await client.query(
          'INSERT INTO quotation_items (id, quotation_id, product_id, description, hsn_sac, quantity, rate, discount, tax_rate, taxable_value, cgst, sgst, igst) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
          [
            itemId,
            quotation.id,
            item.product_id || null,
            item.description,
            item.hsn || null,
            item.quantity,
            item.rate,
            item.discount || 0,
            Number(item.tax_rate || 0),
            item.taxable_value || 0,
            0,
            0,
            0
          ]
        )
      }

      const quotationRecord = await client.query('SELECT * FROM quotations WHERE id = $1', [quotation.id])
      const itemsResult = await client.query('SELECT * FROM quotation_items WHERE quotation_id = $1 ORDER BY created_at ASC', [quotation.id])

      return { ...quotationRecord.rows[0], items: itemsResult.rows }
    })

    response.status(201).json(record)
  } catch (error) {
    next(error)
  }
}

export async function updateQuotation(request, response, next) {
  try {
    const data = quotationSchema.partial().parse(request.body)
    const quotationId = request.params.id
    const { items, ...quotationData } = data

    const record = await withTransaction(async (client) => {
      // Verify quotation exists
      const existing = await client.query('SELECT id FROM quotations WHERE id = $1', [quotationId])
      if (!existing.rows[0]) {
        const error = new Error('Quotation not found')
        error.statusCode = 404
        throw error
      }

      // Update quotation
      const entries = Object.entries(quotationData).filter(([, value]) => value !== undefined)
      if (entries.length > 0) {
        const values = entries.map(([, value]) => value)
        values.push(quotationId)
        await client.query(
          `UPDATE quotations SET ${entries.map(([col], idx) => `${col} = $${idx + 1}`).join(', ')}, updated_at = datetime('now') WHERE id = $${values.length}`,
          values
        )
      }

      // Update items if provided
      if (items) {
        await client.query('DELETE FROM quotation_items WHERE quotation_id = $1', [quotationId])
        for (const item of items) {
          const itemId = randomUUID()
          await client.query(
            'INSERT INTO quotation_items (id, quotation_id, product_id, description, hsn_sac, quantity, rate, discount, tax_rate, taxable_value, cgst, sgst, igst) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
            [
              itemId,
              quotationId,
              item.product_id || null,
              item.description,
              item.hsn || null,
              item.quantity,
              item.rate,
              item.discount || 0,
              Number(item.tax_rate || 0),
              item.taxable_value || 0,
              0,
              0,
              0
            ]
          )
        }
      }

      const quotationRecord = await client.query('SELECT * FROM quotations WHERE id = $1', [quotationId])
      const itemsResult = await client.query('SELECT * FROM quotation_items WHERE quotation_id = $1 ORDER BY created_at ASC', [quotationId])

      return { ...quotationRecord.rows[0], items: itemsResult.rows }
    })

    response.json(record)
  } catch (error) {
    next(error)
  }
}
