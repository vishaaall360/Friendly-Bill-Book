
/**
 * JB YOUR SAFE TECHNOLOGY - Express Application
 * Copyright © 2026 JB YOUR SAFE TECHNOLOGY. All Rights Reserved.
 *
 * This is proprietary software. Unauthorized copying, redistribution, or
 * commercial exploitation without written permission is prohibited.
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { environment } from './config/env.js'

import authRoutes from './routes/authRoutes.js'
import businessSettingsRoutes from './routes/businessSettingsRoutes.js'
import leadRoutes from './routes/leadRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import inventoryRoutes from './routes/inventoryRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import supplierRoutes from './routes/supplierRoutes.js'
import purchaseRoutes from './routes/purchaseRoutes.js'
import invoiceRoutes from './routes/invoiceRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import expenseRoutes from './routes/expenseRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import userRoutes from './routes/userRoutes.js'

import {
  deliveryChallanRoutes,
  followupRoutes,
  proformaRoutes,
  quotationRoutes,
} from './routes/extendedRoutes.js'

import { errorMiddleware } from './middleware/errorMiddleware.js'

const app = express()

app.use(helmet())

app.use(
  cors({
    origin: environment.frontendUrls,
    credentials: true,
  })
)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
  })
)

// Serve uploaded files from the configured upload directory.
app.use('/uploads', express.static(environment.uploadDir))

app.get('/', (_request, response) => {
  response.json({
    name: 'Friendly Bill Book API',
    status: 'ok',
    health: '/api/health',
  })
})

app.get('/api/health', (_request, response) => {
  response.json({
    name: 'Friendly Bill Book API',
    status: 'ok',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/business-settings', businessSettingsRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/purchase', purchaseRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/users', userRoutes)
app.use('/api/quotations', quotationRoutes)
app.use('/api/proforma-invoices', proformaRoutes)
app.use('/api/delivery-challans', deliveryChallanRoutes)
app.use('/api/followups', followupRoutes)

app.use(errorMiddleware)

export default app
