import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { validationMiddleware } from '../middleware/validationMiddleware.js'
import { createCrudController } from '../controllers/crudController.js'
import { createRepository } from '../models/repository.js'
import { createInvoice, deleteInvoice, getInvoice, invoicePdf, invoiceSchema, updateInvoice } from '../controllers/invoiceController.js'

const router = Router()
router.use(authMiddleware)
const controller = createCrudController(createRepository('invoices', ['invoice_number', 'customer_id', 'invoice_date', 'due_date', 'customer_gstin', 'billing_address', 'shipping_address', 'subtotal', 'discount', 'cgst', 'sgst', 'igst', 'round_off', 'grand_total', 'status', 'notes', 'created_by']))
router.get('/', controller.list)
router.get('/:id', getInvoice)
router.get('/:id/pdf', invoicePdf)
router.post('/', validationMiddleware(invoiceSchema), createInvoice)
router.put('/:id', validationMiddleware(invoiceSchema.partial()), updateInvoice)
router.delete('/:id', deleteInvoice)
export default router
