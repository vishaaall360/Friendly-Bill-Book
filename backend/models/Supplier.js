import { createRepository } from './repository.js'
export const Supplier = createRepository('suppliers', ['supplier_code', 'supplier_name', 'company_name', 'mobile', 'email', 'gstin', 'pan', 'address', 'city', 'state', 'pincode', 'opening_balance', 'notes'])
