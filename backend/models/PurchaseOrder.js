import { createRepository } from './repository.js'
export const PurchaseOrder = createRepository('purchase_orders', ['order_number', 'supplier_id', 'order_date', 'status', 'subtotal', 'discount', 'tax', 'total', 'payment_status', 'notes', 'created_by'])
