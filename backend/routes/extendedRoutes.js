import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { createCrudController } from '../controllers/crudController.js'
import { createRepository } from '../models/repository.js'
import { validationMiddleware } from '../middleware/validationMiddleware.js'
import { createQuotation, getQuotation, updateQuotation, quotationSchema } from '../controllers/quotationController.js'
import { createProforma, getProforma, updateProforma, deleteProforma, listProformas, proformaSchema } from '../controllers/proformaController.js'

export const quotationRoutes = (() => {
	const router = Router()
	router.use(authMiddleware)
	const crud = createCrudController(createRepository('quotations', ['quotation_number', 'customer_id', 'quotation_date', 'valid_until', 'status', 'subject', 'subtotal', 'tax', 'total', 'notes', 'template_id', 'template_theme', 'created_by']))
	
	router.get('/', crud.list)
	router.get('/:id', getQuotation)
	router.post('/', validationMiddleware(quotationSchema), createQuotation)
	router.put('/:id', validationMiddleware(quotationSchema.partial()), updateQuotation)
	router.delete('/:id', crud.remove)
	
	return router
})()

export const proformaRoutes = (() => {
	const router = Router()
	router.use(authMiddleware)
	
	router.get('/', listProformas)
	router.get('/:id', getProforma)
	router.post('/', validationMiddleware(proformaSchema), createProforma)
	router.put('/:id', validationMiddleware(proformaSchema.partial()), updateProforma)
	router.delete('/:id', deleteProforma)
	
	return router
})()

export const deliveryChallanRoutes = resourceRoutes({
	table: 'delivery_challans',
	columns: ['challan_number', 'customer_id', 'challan_date', 'status', 'notes'],
})
export const followupRoutes = resourceRoutes({
	table: 'followups',
	columns: ['lead_id', 'assigned_staff', 'follow_up_date', 'status', 'notes'],
})

function resourceRoutes({ table, columns, schema }) {
	const router = Router()
	const controller = createCrudController(createRepository(table, columns))
	router.use(authMiddleware)
	router.get('/', controller.list)
	router.get('/:id', controller.get)
	router.post('/', schema ? validationMiddleware(schema) : (request, response, next) => next(), controller.create)
	router.put('/:id', schema ? validationMiddleware(schema.partial()) : (request, response, next) => next(), controller.update)
	router.delete('/:id', controller.remove)
	return router
}