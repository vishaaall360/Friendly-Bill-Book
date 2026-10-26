import { resourceRoutes } from './resourceRoutes.js'
import { expenseSchema, supplierSchema } from '../utils/schemas.js'

export const supplierRoutes = resourceRoutes({ table: 'suppliers', columns: ['supplier_code', 'supplier_name', 'company_name', 'mobile', 'email', 'gstin', 'pan', 'address', 'city', 'state', 'pincode', 'opening_balance', 'notes'], schema: supplierSchema })
export const purchaseRoutes = resourceRoutes({ table: 'purchase_orders', columns: ['order_number', 'supplier_id', 'order_date', 'status', 'subtotal', 'discount', 'tax', 'total', 'payment_status', 'notes', 'created_by'] })
export const invoiceRoutes = resourceRoutes({ table: 'invoices', columns: ['invoice_number', 'customer_id', 'invoice_date', 'due_date', 'customer_gstin', 'billing_address', 'shipping_address', 'subtotal', 'discount', 'cgst', 'sgst', 'igst', 'round_off', 'grand_total', 'status', 'notes', 'created_by'] })
export const expenseRoutes = resourceRoutes({ table: 'expenses', columns: ['expense_number', 'expense_date', 'category_id', 'category', 'amount', 'payment_method', 'description', 'staff', 'attachment'], schema: expenseSchema })