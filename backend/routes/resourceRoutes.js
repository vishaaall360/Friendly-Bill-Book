import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { createCrudController } from '../controllers/crudController.js'
import { createRepository } from '../models/repository.js'
import { validationMiddleware } from '../middleware/validationMiddleware.js'

export function resourceRoutes({ table, columns, schema }) {
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