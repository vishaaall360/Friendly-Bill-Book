import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { listCustomers } from '../controllers/customerController.js'
import { createCrudController } from '../controllers/crudController.js'
import { createRepository } from '../models/repository.js'
import { customerSchema } from '../utils/schemas.js'
import { validationMiddleware } from '../middleware/validationMiddleware.js'

const router = Router()
router.use(authMiddleware)
router.get('/', listCustomers)
const controller = createCrudController(createRepository('customers', ['customer_code', 'customer_name', 'company_name', 'mobile', 'alternate_mobile', 'email', 'gstin', 'pan', 'address', 'city', 'state', 'pincode', 'customer_type', 'opening_balance', 'notes']))
router.post('/', validationMiddleware(customerSchema), controller.create)
router.get('/:id', controller.get)
router.put('/:id', validationMiddleware(customerSchema.partial()), controller.update)
router.delete('/:id', controller.remove)
export default router
