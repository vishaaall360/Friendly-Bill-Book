import { createRepository } from './repository.js'
export const Lead = createRepository('leads', ['lead_number', 'customer_name', 'company_name', 'mobile', 'email', 'status', 'priority', 'expected_value', 'follow_up_date', 'notes'])
