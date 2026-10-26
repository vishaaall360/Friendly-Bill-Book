export async function sendEmail({ to, subject, text }) {
	if (!to || !subject || !text) throw new Error('Email recipient, subject, and text are required')
	return { accepted: [to], subject, text }
}
