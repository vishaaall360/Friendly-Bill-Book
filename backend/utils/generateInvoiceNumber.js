export function generateInvoiceNumber(sequence) { return `INV-${String(sequence).padStart(6, '0')}` }
