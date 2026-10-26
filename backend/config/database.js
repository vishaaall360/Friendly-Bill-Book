
/**
 * SQLite database adapter used by Friendly Bill Book.
 * Exports the same { query, checkDatabaseConnection, withTransaction } API.
 */

import { DatabaseSync } from 'node:sqlite'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Use DATABASE_PATH in production when configured.
// Otherwise, use the existing local database location.
const DB_PATH = process.env.DATABASE_PATH
  ? resolve(process.env.DATABASE_PATH)
  : join(__dirname, '..', 'data', 'friendlybillbook.db')

// Ensure the database directory exists.
mkdirSync(dirname(DB_PATH), { recursive: true })

// Open (or create) the SQLite database file.
const db = new DatabaseSync(DB_PATH)

// Performance and integrity pragmas.
try {
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA foreign_keys = ON')
  db.exec('PRAGMA synchronous = NORMAL')
} catch (error) {
  console.warn(
    'SQLite pragma initialization warning:',
    error?.message || error
  )
}

/**
 * Translate positional parameters ($1, $2, …) to SQLite parameters (?, …)
 * and convert undefined values to null.
 */
function pgToSqlite(text, values) {
  const parameterValues = []

  const sql = text
    .replace(/\$(\d+)/g, (_match, index) => {
      parameterValues.push(values[Number(index) - 1])
      return '?'
    })
    .replace(/\bILIKE\b/gi, 'LIKE')

  return {
    sql,
    values: parameterValues.length ? parameterValues : values,
  }
}

/**
 * Convert undefined parameter values to null.
 */
function sanitiseValues(values) {
  if (!Array.isArray(values)) return []

  return values.map((value) =>
    value === undefined ? null : value
  )
}

/**
 * Database-compatible query().
 * Returns { rows: [...], rowCount: number }.
 */
export function query(text, values = []) {
  const translated = pgToSqlite(text, values)
  const sql = translated.sql
  const params = sanitiseValues(translated.values)

  const trimmed = text.trimStart().toUpperCase()

  if (
    trimmed.startsWith('SELECT') ||
    trimmed.startsWith('WITH') ||
    trimmed.startsWith('PRAGMA') ||
    trimmed.startsWith('RETURNING')
  ) {
    const stmt = db.prepare(sql)
    const rows = stmt.all(...params)

    return {
      rows,
      rowCount: rows.length,
    }
  }

  // Support INSERT, UPDATE, and DELETE statements with RETURNING.
  if (/\bRETURNING\b/i.test(text)) {
    const stmt = db.prepare(sql)
    const rows = stmt.all(...params)

    return {
      rows,
      rowCount: rows.length,
    }
  }

  // DDL and DML statements without RETURNING.
  const stmt = db.prepare(sql)
  const info = stmt.run(...params)

  return {
    rows: [],
    rowCount: Number(info.changes ?? 0),
  }
}

/**
 * Check whether the SQLite database is accessible.
 */
export async function checkDatabaseConnection() {
  db.prepare('SELECT 1').get()
}

/**
 * Execute a callback inside a transaction.
 */
export async function withTransaction(callback) {
  db.exec('BEGIN IMMEDIATE')

  try {
    const result = await callback({
      query: (sql, values = []) => query(sql, values),
    })

    db.exec('COMMIT')

    return result
  } catch (error) {
    try {
      db.exec('ROLLBACK')
    } catch {
      // Ignore rollback errors.
    }

    throw error
  }
}

// Preserve compatibility with existing server shutdown code.
export const pool = {
  end: () => Promise.resolve(),
}
