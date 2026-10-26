import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { listLeads, syncLeadToSheets, syncPendingLeads, retryFailedSync, getSyncStatus } from '../controllers/leadController.js'
import { createCrudController } from '../controllers/crudController.js'
import { createRepository } from '../models/repository.js'
import { leadSchema } from '../utils/schemas.js'
import { validationMiddleware } from '../middleware/validationMiddleware.js'

const router = Router()
router.use(authMiddleware)
router.get('/', listLeads)
const controller = createCrudController(createRepository('leads', ['lead_number', 'lead_date', 'customer_name', 'company_name', 'mobile', 'email', 'address', 'city', 'service_required', 'product_required', 'source', 'assigned_staff', 'status', 'priority', 'expected_value', 'follow_up_date', 'notes']))
router.post('/', validationMiddleware(leadSchema), controller.create)
router.get('/:id', controller.get)
router.put('/:id', validationMiddleware(leadSchema.partial()), controller.update)
router.delete('/:id', controller.remove)

// Google Sheets Sync Endpoints
router.post('/:id/sync-to-sheets', syncLeadToSheets)
router.get('/:id/sync-status', getSyncStatus)
router.post('/sync-pending/all', syncPendingLeads)
router.post('/:id/retry-sync', retryFailedSync)

export default router
