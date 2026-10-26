import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { validationMiddleware } from '../middleware/validationMiddleware.js'
import { createCrudController } from '../controllers/crudController.js'
import { createRepository } from '../models/repository.js'
import { createPurchaseOrder, updatePurchaseOrder, purchaseOrderSchema } from '../controllers/purchaseOrderController.js'

const router = Router()
router.use(authMiddleware)
const controller = createCrudController(createRepository('purchase_orders', ['order_number', 'supplier_id', 'order_date', 'status', 'subtotal', 'discount', 'tax', 'total', 'payment_status', 'notes', 'created_by']))

router.get('/', controller.list)
router.get('/:id', controller.get)
router.post('/', validationMiddleware(purchaseOrderSchema), createPurchaseOrder)
router.put('/:id', validationMiddleware(purchaseOrderSchema.partial()), updatePurchaseOrder)
router.delete('/:id', controller.remove)

export default router
