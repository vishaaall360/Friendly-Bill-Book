import { createRepository } from './repository.js'
export const Product = createRepository('products', ['product_name', 'item_type', 'sku', 'category_id', 'supplier_id', 'hsn', 'unit', 'purchase_price', 'selling_price', 'gst', 'opening_stock', 'current_stock', 'minimum_stock', 'description'])
