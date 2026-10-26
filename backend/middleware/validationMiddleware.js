export function validationMiddleware(schema) {
	return (request, response, next) => {
		const result = schema.safeParse(request.body)
		if (!result.success) return response.status(400).json({ error: 'Invalid request data', details: result.error.flatten() })
		request.body = result.data
		next()
	}
}
