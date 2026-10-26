import { Router } from 'express'
import { currentUser, googleLogin, login, logout, register } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()
router.post('/login', login)
router.post('/register', register)
router.post('/google', googleLogin)
router.get('/me', authMiddleware, currentUser)
router.post('/logout', authMiddleware, logout)
export default router
