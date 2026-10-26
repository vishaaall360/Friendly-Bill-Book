import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { createPayment, deletePayment, paymentSchema, updatePayment } from '../controllers/paymentController.js'
import { validationMiddleware } from '../middleware/validationMiddleware.js'
import { createCrudController } from '../controllers/crudController.js'
import { createRepository } from '../models/repository.js'

const router = Router()
router.use(authMiddleware)
const controller = createCrudController(createRepository('payments', ['payment_number', 'customer_id', 'invoice_id', 'payment_date', 'amount', 'payment_method', 'reference_number', 'notes', 'received_by']))
router.get('/', controller.list)
router.get('/:id', controller.get)
router.post('/', validationMiddleware(paymentSchema), createPayment)
router.put('/:id', validationMiddleware(paymentSchema.partial()), updatePayment)
router.delete('/:id', deletePayment)
export default router
