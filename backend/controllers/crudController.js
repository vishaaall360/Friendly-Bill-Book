import { notFound, parsePagination } from '../utils/http.js'

export function createCrudController(repository) {
	return {
		list: async (request, response, next) => {
			try { response.json(await repository.list({ ...parsePagination(request), search: request.query.search, fromDate: request.query.from_date, toDate: request.query.to_date })) } catch (error) { next(error) }
		},
		get: async (request, response, next) => {
			try { const record = await repository.get(request.params.id); if (!record) throw notFound(); response.json(record) } catch (error) { next(error) }
		},
		create: async (request, response, next) => {
			try { response.status(201).json(await repository.create(request.body)) } catch (error) { next(error) }
		},
		update: async (request, response, next) => {
			try { const record = await repository.update(request.params.id, request.body); if (!record) throw notFound(); response.json(record) } catch (error) { next(error) }
		},
		remove: async (request, response, next) => {
			try { if (!await repository.remove(request.params.id)) throw notFound(); response.status(204).end() } catch (error) { next(error) }
		},
	}
}