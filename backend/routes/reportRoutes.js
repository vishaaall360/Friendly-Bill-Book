import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { getReport } from '../controllers/reportController.js'

const router = Router()
router.use(authMiddleware)
router.get('/:type', getReport)
export default router
