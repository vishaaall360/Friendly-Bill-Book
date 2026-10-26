import { createRepository } from './repository.js'
export const Payment = createRepository('payments', ['payment_number', 'customer_id', 'invoice_id', 'payment_date', 'amount', 'payment_method', 'reference_number', 'notes', 'received_by'])
