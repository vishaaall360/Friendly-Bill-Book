export function notFound(message = 'Record not found') {
	const error = new Error(message)
	error.statusCode = 404
	return error
}

export function parsePagination(request) {
	const limit = Math.min(Math.max(Number(request.query.limit) || 25, 1), 100)
	const offset = Math.max(Number(request.query.offset) || 0, 0)
	return { limit, offset }
}