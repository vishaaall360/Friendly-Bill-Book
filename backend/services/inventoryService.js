import { withTransaction } from '../config/database.js'

export async function recordStockMovement({ productId, movementType, quantity, referenceType, referenceId, notes, userId }) {
  return withTransaction(async (client) => {
    const result = await client.query('INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, notes, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [productId, movementType, quantity, referenceType || null, referenceId || null, notes || null, userId || null])
    const delta = movementType === 'out' ? -quantity : quantity
    const stockResult = await client.query(
      'UPDATE products SET current_stock = current_stock + $1 WHERE id = $2 AND current_stock + $1 >= 0 RETURNING current_stock',
      [delta, productId]
    )
    if (!stockResult.rowCount) {
      const error = new Error(movementType === 'out' ? 'Insufficient stock for this stock-out.' : 'Product was not found.')
      error.status = movementType === 'out' ? 400 : 404
      throw error
    }
    return result.rows[0]
  })
}
