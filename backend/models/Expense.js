import { createRepository } from './repository.js'
export const Expense = createRepository('expenses', ['expense_number', 'expense_date', 'category_id', 'category', 'amount', 'payment_method', 'description', 'staff', 'attachment'])
