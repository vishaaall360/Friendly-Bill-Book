import { query } from '../config/database.js'
import { randomUUID } from 'crypto'

export function createRepository(table, columns) {
  const allowedColumns = new Set(columns)
  const aliasMap = {
    leads: {
      customer_name: 'lead_name',
      mobile: 'phone',
    },
  }

  function normalizeRecord(input) {
    if (!input || typeof input !== 'object') return {}
    const mapped = {}
    for (const [key, value] of Object.entries(input)) {
      const targetKey = aliasMap[table]?.[key] || key
      mapped[targetKey] = value
    }
    return mapped
  }

  return {
    async list({ search, limit = 200, offset = 0, fromDate, toDate } = {}) {
      const values = []
      const filters = []
      const dateColumn = ['invoice_date', 'order_date', 'quotation_date', 'created_at'].find((col) =>
        columns.includes(col)
      )
      // SQLite uses LIKE (case-insensitive for ASCII by default)
      if (search && columns.length) {
        const searchCols = columns.filter(
          (col) => col.endsWith('_name') || col.endsWith('_number') || col === 'sku'
        )
        if (searchCols.length) {
          values.push(`%${search}%`)
          filters.push(`(${searchCols.map((col) => `CAST(${col} AS TEXT) LIKE ?`).join(' OR ')})`)
          // LIKE with a single ? — need one placeholder per OR condition
          // Fix: push same value for each OR arm
          // Remove the one we pushed and push per-arm
          values.pop()
          searchCols.forEach(() => values.push(`%${search}%`))
          // Re-build the filter correctly
          filters.pop()
          filters.push(`(${searchCols.map((col) => `CAST(${col} AS TEXT) LIKE ?`).join(' OR ')})`)
        }
      }
      if (dateColumn && fromDate) {
        values.push(fromDate)
        filters.push(`${dateColumn} >= ?`)
      }
      if (dateColumn && toDate) {
        values.push(toDate)
        filters.push(`${dateColumn} <= ?`)
      }
      values.push(Number(limit), Number(offset))
      const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
      const result = query(
        `SELECT * FROM ${table} ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        values
      )
      return result.rows
    },

    async get(id) {
      const result = query(`SELECT * FROM ${table} WHERE id = ?`, [id])
      return result.rows[0]
    },

    async create(input) {
      const normalizedInput = normalizeRecord(input)
      const entries = Object.entries(normalizedInput).filter(
        ([col, value]) => allowedColumns.has(col) || ['lead_name', 'phone'].includes(col) && table === 'leads' && value !== undefined
      )
      if (!entries.length) throw new Error('No valid fields supplied')
      const id = randomUUID()
      const leadNumber = table === 'leads' && !entries.some(([col]) => col === 'lead_number') ? `LEAD-${Date.now().toString().slice(-8)}` : undefined
      const allEntries = [['id', id], ...entries]
      if (table === 'leads' && !allEntries.some(([col]) => col === 'lead_name')) {
        allEntries.push(['lead_name', normalizedInput.customer_name || normalizedInput.lead_name || 'New Lead'])
      }
      if (leadNumber) {
        allEntries.push(['lead_number', leadNumber])
      }
      const cols = allEntries.map(([col]) => col).join(', ')
      const placeholders = allEntries.map(() => '?').join(', ')
      const values = allEntries.map(([, v]) => v)
      const result = query(
        `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`,
        values
      )
      return result.rows[0]
    },

    async update(id, input) {
      const normalizedInput = normalizeRecord(input)
      const entries = Object.entries(normalizedInput).filter(
        ([col, value]) => allowedColumns.has(col) || ['lead_name', 'phone'].includes(col) && table === 'leads' && value !== undefined
      )
      if (!entries.length) throw new Error('No valid fields supplied')
      const setClause = entries.map(([col]) => `${col} = ?`).join(', ')
      const values = [...entries.map(([, v]) => v), id]
      const result = query(
        `UPDATE ${table} SET ${setClause} WHERE id = ? RETURNING *`,
        values
      )
      return result.rows[0]
    },

    async remove(id) {
      const result = query(`DELETE FROM ${table} WHERE id = ? RETURNING id`, [id])
      return result.rows[0]
    },
  }
}