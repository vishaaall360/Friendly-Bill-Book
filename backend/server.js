/**
 * Friendly Bill Book — Backend Server
 */

import app from './app.js'
import { environment } from './config/env.js'
import { checkDatabaseConnection, pool } from './config/database.js'
import { initializeDatabase } from './config/initializeDatabase.js'

try {
  await checkDatabaseConnection()
  await initializeDatabase()
  app.listen(environment.port, () => {
    console.log('✅  Friendly Bill Book Backend')
    console.log(`🌐  Server: http://localhost:${environment.port}`)
    console.log('💾  Database: SQLite (local file)')
  })
} catch (error) {
  console.error('❌  Failed to start server:', error.message || error)
  await pool.end()
  process.exitCode = 1
}
