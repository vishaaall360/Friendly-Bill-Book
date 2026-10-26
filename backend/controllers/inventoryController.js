import { z } from 'zod'
import { recordStockMovement } from '../services/inventoryService.js'

const movementSchema = z.object({ product_id: z.string().uuid(), movement_type: z.enum(['in', 'out', 'adjustment']), quantity: z.coerce.number().positive(), reference_type: z.string().optional(), reference_id: z.string().uuid().optional(), notes: z.string().optional() })

export async function createStockMovement(request, response, next) {
  try { response.status(201).json(await recordStockMovement({ ...movementSchema.parse(request.body), productId: request.body.product_id, movementType: request.body.movement_type, quantity: request.body.quantity, userId: request.user.id })) } catch (error) { next(error) }
}
