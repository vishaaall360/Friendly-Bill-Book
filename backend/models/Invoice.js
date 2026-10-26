import { createRepository } from './repository.js'
export const Invoice = createRepository('invoices', ['invoice_number', 'customer_id', 'invoice_date', 'due_date', 'customer_gstin', 'billing_address', 'shipping_address', 'subtotal', 'discount', 'cgst', 'sgst', 'igst', 'round_off', 'grand_total', 'status', 'notes', 'created_by'])
