
import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config({
  path: resolve(__dirname, '../.env'),
})

const requiredEnvironment = ['JWT_SECRET', 'ADMIN_PASSWORD']

for (const variableName of requiredEnvironment) {
  if (!process.env[variableName]?.trim()) {
    throw new Error(
      `${variableName} is required. Please create backend/.env and configure it before starting the server.`
    )
  }
}

export const environment = {
  port: Number(process.env.PORT || 5000),

  jwtSecret: process.env.JWT_SECRET,

  frontendUrls: (
    process.env.CORS_ORIGIN ||
    process.env.FRONTEND_URL ||
    'http://localhost:5173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  // Use an absolute path for uploaded files.
  uploadDir: resolve(
    process.env.UPLOAD_DIR || resolve(__dirname, '../uploads')
  ),

  // Google Sheets Sync Configuration
  googleSheetsId: process.env.GOOGLE_SHEETS_ID,
  googleAppsScriptDeploymentId:
    process.env.GOOGLE_APPS_SCRIPT_DEPLOYMENT_ID,
  googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  googleProjectId: process.env.GOOGLE_PROJECT_ID,
  googlePrivateKeyId: process.env.GOOGLE_PRIVATE_KEY_ID,
  googleClientId: process.env.GOOGLE_CLIENT_ID,

  // Email Configuration
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpFrom:
    process.env.SMTP_FROM || 'noreply@friendlybillbook.com',
}
