import { createRepository } from './repository.js'
export const StockMovement = createRepository('stock_movements', ['product_id', 'movement_type', 'quantity', 'reference_type', 'reference_id', 'notes', 'created_by'])
