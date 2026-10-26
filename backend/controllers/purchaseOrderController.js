import { withTransaction } from '../config/database.js'
import { z } from 'zod'
import { getBusinessSettingsSnapshot } from '../services/businessSettingsService.js'

export const purchaseOrderSchema = z.object({
  order_number: z.string().min(1),
  supplier_id: z.string().uuid(),
  order_date: z.string().optional(),
  status: z.enum(['Draft', 'Confirmed', 'Completed', 'Cancelled']).default('Draft'),
  subtotal: z.coerce.number().nonnegative().default(0),
  discount: z.coerce.number().nonnegative().default(0),
  tax: z.coerce.number().nonnegative().default(0),
  total: z.coerce.number().nonnegative().default(0),
  payment_status: z.enum(['Pending', 'Partially Paid', 'Paid']).default('Pending'),
  notes: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.coerce.number().positive(),
    rate: z.coerce.number().nonnegative(),
    discount: z.coerce.number().nonnegative().default(0),
    tax_rate: z.coerce.number().nonnegative().default(0),
  })).min(1),
})

export async function createPurchaseOrder(request, response, next) {
  try {
    const data = purchaseOrderSchema.parse(request.body)
    const { items } = data

    // Get business settings snapshot before transaction
    const businessSnapshot = await getBusinessSettingsSnapshot()

    const record = await withTransaction(async (client) => {
      // Verify supplier exists
      const supplier = await client.query('SELECT id FROM suppliers WHERE id = $1', [data.supplier_id])
      if (!supplier.rows[0]) {
        const error = new Error('Supplier not found')
        error.statusCode = 404
        throw error
      }

      // Create purchase order with business snapshot
      const orderResult = await client.query(
        'INSERT INTO purchase_orders (order_number, supplier_id, order_date, status, subtotal, discount, tax, total, payment_status, notes, business_snapshot, created_by) VALUES ($1, $2, COALESCE($3, CURRENT_DATE), $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
        [
          data.order_number,
          data.supplier_id,
          data.order_date || null,
          data.status,
          data.subtotal,
          data.discount,
          data.tax,
          data.total,
          data.payment_status,
          data.notes || null,
          JSON.stringify(businessSnapshot),
          request.user.id
        ]
      )

      const order = orderResult.rows[0]

      // Create order items
      for (const item of items) {
        // Verify product exists
        const product = await client.query('SELECT id FROM products WHERE id = $1', [item.product_id])
        if (!product.rows[0]) {
          const error = new Error(`Product not found: ${item.product_id}`)
          error.statusCode = 404
          throw error
        }

        // Create order item
        await client.query(
          'INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, rate, discount, tax_rate) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            order.id,
            item.product_id,
            item.quantity,
            item.rate,
            item.discount || 0,
            item.tax_rate || 0
          ]
        )

        // Receiving stock is separate from completing the order.
        if (data.status === 'Completed') {
          await client.query(
            'INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, created_by) VALUES ($1, $2, $3, $4, $5, $6)',
            [
              item.product_id,
              'in',
              item.quantity,
              'purchase_order',
              order.id,
              request.user.id
            ]
          )
          
        }
      }

      // Fetch complete order with items
      const complete = await client.query(
        `SELECT po.*, json_agg(json_build_object(
          'id', poi.id, 'product_id', poi.product_id, 'quantity', poi.quantity,
          'rate', poi.rate, 'discount', poi.discount, 'tax_rate', poi.tax_rate
        )) AS items FROM purchase_orders po
        LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
        WHERE po.id = $1 GROUP BY po.id`,
        [order.id]
      )

      return complete.rows[0]
    })

    response.status(201).json(record)
  } catch (error) {
    next(error)
  }
}

export async function updatePurchaseOrder(request, response, next) {
  try {
    const data = purchaseOrderSchema.partial().parse(request.body)
    const orderId = request.params.id
    const { items, ...orderData } = data

    const record = await withTransaction(async (client) => {
      // Verify order exists
      const existing = await client.query('SELECT id, status FROM purchase_orders WHERE id = $1', [orderId])
      if (!existing.rows[0]) {
        const error = new Error('Purchase order not found')
        error.statusCode = 404
        throw error
      }

      const oldStatusReceivesStock = existing.rows[0].status === 'Completed'
      const newStatus = data.status || existing.rows[0].status
      const newStatusReceivesStock = newStatus === 'Completed'
      const oldItems = await client.query('SELECT product_id, quantity FROM purchase_order_items WHERE purchase_order_id = $1', [orderId])

      if (oldStatusReceivesStock && (!newStatusReceivesStock || items)) {
        await client.query('DELETE FROM stock_movements WHERE reference_type = $1 AND reference_id = $2', ['purchase_order', orderId])
        for (const oldItem of oldItems.rows) {
          await client.query('UPDATE products SET current_stock = current_stock - $1 WHERE id = $2', [oldItem.quantity, oldItem.product_id])
        }
      }

      // Update order
      const entries = Object.entries(orderData).filter(([, value]) => value !== undefined)
      if (entries.length > 0) {
        const values = entries.map(([, value]) => value)
        values.push(orderId)
        await client.query(
          `UPDATE purchase_orders SET ${entries.map(([col], idx) => `${col} = $${idx + 1}`).join(', ')}, updated_at = datetime('now') WHERE id = $${values.length}`,
          values
        )
      }

      // Update items if provided
      if (items) {
        // Delete old items
        await client.query('DELETE FROM purchase_order_items WHERE purchase_order_id = $1', [orderId])
        
        // Create new items
        for (const item of items) {
          await client.query(
            'INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, rate, discount, tax_rate) VALUES ($1, $2, $3, $4, $5, $6)',
            [
              orderId,
              item.product_id,
              item.quantity,
              item.rate,
              item.discount || 0,
              item.tax_rate || 0
            ]
          )

          if (newStatusReceivesStock) {
            await client.query(
              'INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, created_by) VALUES ($1, $2, $3, $4, $5, $6)',
              [
                item.product_id,
                'in',
                item.quantity,
                'purchase_order',
                orderId,
                request.user.id
              ]
            )
          }
        }
      }

      if (!items && !oldStatusReceivesStock && newStatusReceivesStock) {
        for (const item of oldItems.rows) {
          await client.query(
            'INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, created_by) VALUES ($1, $2, $3, $4, $5, $6)',
            [item.product_id, 'in', item.quantity, 'purchase_order', orderId, request.user.id]
          )
        }
      }

      // Fetch complete order with items
      const complete = await client.query(
        `SELECT po.*, json_agg(json_build_object(
          'id', poi.id, 'product_id', poi.product_id, 'quantity', poi.quantity,
          'rate', poi.rate, 'discount', poi.discount, 'tax_rate', poi.tax_rate
        )) AS items FROM purchase_orders po
        LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
        WHERE po.id = $1 GROUP BY po.id`,
        [orderId]
      )

      return complete.rows[0]
    })

    response.json(record)
  } catch (error) {
    next(error)
  }
}
