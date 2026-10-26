import { createRepository } from './repository.js'
export const Customer = createRepository('customers', ['customer_code', 'customer_name', 'company_name', 'mobile', 'email', 'gstin', 'pan', 'address', 'city', 'state', 'pincode', 'customer_type', 'opening_balance', 'notes'])
