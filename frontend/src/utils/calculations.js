export function calculateSubtotal(items = []) {
	return items.reduce((total, item) => total + Number(item.quantity || 0) * Number(item.rate || 0), 0)
}

export function calculateDiscount(subtotal, discount = 0) {
	return Math.max(0, Math.min(Number(subtotal), Number(discount)))
}

export function calculateTax(taxableValue, taxRate = 0) {
	return taxableValue * Number(taxRate) / 100
}

export function calculateCGST(taxableValue, taxRate = 0) {
	return calculateTax(taxableValue, taxRate) / 2
}

export function calculateSGST(taxableValue, taxRate = 0) {
	return calculateCGST(taxableValue, taxRate)
}

export function calculateIGST(taxableValue, taxRate = 0) {
	return calculateTax(taxableValue, taxRate)
}

export function calculateGrandTotal({ subtotal, discount = 0, cgst = 0, sgst = 0, igst = 0 }) {
	return Math.round((subtotal - calculateDiscount(subtotal, discount) + cgst + sgst + igst) * 100) / 100
}

export function calculatePaidAmount(payments = []) {
	return payments.reduce((total, payment) => total + Number(payment.amount || 0), 0)
}

export function calculateBalance(grandTotal, paidAmount) {
	return Math.max(0, Number(grandTotal) - Number(paidAmount))
}

export function calculateProfit(sellingPrice, purchasePrice, quantity = 1) {
	return (Number(sellingPrice) - Number(purchasePrice)) * Number(quantity)
}

export function calculateStockValue(products = []) {
	return products.reduce((total, product) => total + Number(product.current_stock || 0) * Number(product.purchase_price || 0), 0)
}
