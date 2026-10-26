import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { uploadMiddleware } from '../middleware/uploadMiddleware.js'
import { getSettings, updateSettings, uploadLogo, uploadSignature, syncGoogleSheets } from '../controllers/businessSettingsController.js'

const router = Router()

// All business settings routes require authentication
router.use(authMiddleware)

// Get current business settings
router.get('/', getSettings)

// Update business settings
router.put('/', updateSettings)

// Upload logo
router.post('/logo', uploadMiddleware.single('logo'), uploadLogo)

// Upload signature
router.post('/signature', uploadMiddleware.single('signature'), uploadSignature)

// Sync all data to Google Sheets
router.post('/sync-google-sheets', syncGoogleSheets)

export default router
