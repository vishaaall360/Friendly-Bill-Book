import multer from 'multer'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])

// Keep uploads in memory because the business-settings controller writes the
// validated file buffer to its final persistent location.
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => callback(null, allowedTypes.has(file.mimetype)),
})
