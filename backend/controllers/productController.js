import { z } from 'zod'
import { query } from '../config/database.js'

const productSchema = z.object({ product_name: z.string().min(1), sku: z.string().min(1), unit: z.string().default('pcs'), purchase_price: z.coerce.number().min(0).default(0), selling_price: z.coerce.number().min(0).default(0), gst: z.coerce.number().refine((value) => [0, 5, 12, 18, 28].includes(value)), minimum_stock: z.coerce.number().min(0).default(0) })

export async function listProducts(request, response, next) {
  try {
    const search = `%${request.query.search || ''}%`
    const result = await query('SELECT * FROM products WHERE product_name ILIKE $1 OR sku ILIKE $1 ORDER BY product_name LIMIT $2 OFFSET $3', [search, Number(request.query.limit || 25), Number(request.query.offset || 0)])
    response.json(result.rows)
  } catch (error) { next(error) }
}

export async function createProduct(request, response, next) {
  try {
    const product = productSchema.parse(request.body)
    const result = await query(`INSERT INTO products (product_name, sku, unit, purchase_price, selling_price, gst, minimum_stock) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [product.product_name, product.sku, product.unit, product.purchase_price, product.selling_price, product.gst, product.minimum_stock])
    response.status(201).json(result.rows[0])
  } catch (error) { next(error) }
}
