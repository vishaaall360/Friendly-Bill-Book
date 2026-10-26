import { Router } from 'express'
import { createUser, listUsers } from '../controllers/userController.js'
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js'

const router = Router()
router.use(authMiddleware, requireRole('Admin'))
router.get('/', listUsers)
router.post('/', createUser)

export default router