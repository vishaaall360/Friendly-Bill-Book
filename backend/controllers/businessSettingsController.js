
import {
  getBusinessSettings,
  updateBusinessSettings,
  businessSettingsSchema,
} from '../services/businessSettingsService.js'

import { googleSheetsService } from '../services/googleSheetsService.js'
import { environment } from '../config/env.js'
import path from 'node:path'
import fs from 'node:fs'

export async function getSettings(request, response, next) {
  try {
    const settings = await getBusinessSettings()
    response.json(settings)
  } catch (error) {
    next(error)
  }
}

export async function updateSettings(request, response, next) {
  try {
    const data = businessSettingsSchema.partial().parse(request.body)
    const settings = await updateBusinessSettings(data)
    response.json(settings)
  } catch (error) {
    next(error)
  }
}

export async function uploadLogo(request, response, next) {
  try {
    if (!request.file) {
      const error = new Error('No file uploaded')
      error.statusCode = 400
      throw error
    }

    const uploadsDir = path.join(environment.uploadDir, 'business')
    fs.mkdirSync(uploadsDir, { recursive: true })

    const extension =
      path.extname(request.file.originalname).toLowerCase() || '.png'

    const filename = `logo-${Date.now()}${extension}`
    const filepath = path.join(uploadsDir, filename)

    fs.writeFileSync(filepath, request.file.buffer)

    const logoUrl = `/uploads/business/${filename}`
    const settings = await updateBusinessSettings({ logo_url: logoUrl })

    response.json({
      success: true,
      logoUrl,
      settings,
    })
  } catch (error) {
    next(error)
  }
}

export async function uploadSignature(request, response, next) {
  try {
    if (!request.file) {
      const error = new Error('No file uploaded')
      error.statusCode = 400
      throw error
    }

    const uploadsDir = path.join(environment.uploadDir, 'business')
    fs.mkdirSync(uploadsDir, { recursive: true })

    const extension =
      path.extname(request.file.originalname).toLowerCase() || '.png'

    const filename = `signature-${Date.now()}${extension}`
    const filepath = path.join(uploadsDir, filename)

    fs.writeFileSync(filepath, request.file.buffer)

    const signatureUrl = `/uploads/business/${filename}`
    const settings = await updateBusinessSettings({
      signature_url: signatureUrl,
    })

    response.json({
      success: true,
      signatureUrl,
      settings,
    })
  } catch (error) {
    next(error)
  }
}

export async function syncGoogleSheets(request, response, next) {
  try {
    const result = await googleSheetsService.syncAllBusinessData()
    response.json(result)
  } catch (error) {
    next(error)
  }
}
