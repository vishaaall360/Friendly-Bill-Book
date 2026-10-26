export function createInvoiceNumber(sequence) { return `INV-${String(sequence).padStart(6, '0')}` }
