import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { listProducts } from '../controllers/productController.js'
import { createCrudController } from '../controllers/crudController.js'
import { createRepository } from '../models/repository.js'
import { productSchema } from '../utils/schemas.js'
import { validationMiddleware } from '../middleware/validationMiddleware.js'
import { createStockMovement } from '../controllers/inventoryController.js'

const router = Router()
router.use(authMiddleware)
router.get('/products', listProducts)
const controller = createCrudController(createRepository('products', ['product_name', 'sku', 'category_id', 'supplier_id', 'hsn', 'unit', 'purchase_price', 'selling_price', 'gst', 'opening_stock', 'current_stock', 'minimum_stock', 'description']))
router.post('/products', validationMiddleware(productSchema), controller.create)
router.post('/movements', createStockMovement)
router.get('/movements', async (request, response, next) => {
	try { const { query } = await import('../config/database.js'); const result = await query('SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 100'); response.json(result.rows) } catch (error) { next(error) }
})
router.get('/products/:id', controller.get)
router.put('/products/:id', validationMiddleware(productSchema.partial()), controller.update)
router.delete('/products/:id', controller.remove)
export default router
