import bcrypt from 'bcrypt'
import { query } from './database.js'

function ensureColumns(tableName, columns) {
  const existingColumns = new Set(query(`PRAGMA table_info(${tableName})`).rows.map((column) => column.name))
  for (const [columnName, definition] of Object.entries(columns)) {
    if (!existingColumns.has(columnName)) query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`)
  }
}

/**
 * SQLite-compatible schema initialisation.
 * All tables use TEXT primary keys (UUID strings generated in JS).
 * Run once on server startup — idempotent via IF NOT EXISTS.
 */
export async function initializeDatabase() {
  try {
    const userColumns = query('PRAGMA table_info(users)').rows
    const isLegacyUserSchema = userColumns.some((column) => column.name === 'role' || (column.name === 'password' && column.notnull === 1))

    if (isLegacyUserSchema) {
      console.warn('Detected legacy user schema. Resetting authentication tables to the supported SQLite schema.')
      query('DROP TABLE IF EXISTS role_permissions')
      query('DROP TABLE IF EXISTS permissions')
      query('DROP TABLE IF EXISTS roles')
      query('DROP TABLE IF EXISTS users')
    }

    // ── Roles and permissions ──────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      )
    `)

    query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        role_id INTEGER,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        mobile TEXT,
        company TEXT NOT NULL DEFAULT 'Friendly Bill Book',
        password_hash TEXT,
        password TEXT,
        active INTEGER NOT NULL DEFAULT 1,
        last_login_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    query(`INSERT OR IGNORE INTO roles (name) VALUES ('Admin'), ('Manager'), ('Staff'), ('Accountant')`)

    query(`
      INSERT OR IGNORE INTO permissions (name, description) VALUES
        ('dashboard.read', 'View dashboard'),
        ('crm.manage', 'Manage leads and customers'),
        ('sales.manage', 'Manage sales'),
        ('purchase.manage', 'Manage purchases'),
        ('billing.manage', 'Manage billing documents'),
        ('payments.manage', 'Manage payments'),
        ('expenses.manage', 'Manage expenses'),
        ('inventory.manage', 'Manage inventory'),
        ('reports.read', 'View reports'),
        ('settings.manage', 'Manage settings')
    `)

    query(`
      INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
      SELECT roles.id, permissions.id
      FROM roles CROSS JOIN permissions
      WHERE roles.name = 'Admin'
    `)

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@friendlybillbook.local').toLowerCase()
    const adminName = process.env.ADMIN_NAME || 'Friendly Bill Book Admin'
    const adminRoleId = query("SELECT id FROM roles WHERE name = 'Admin' LIMIT 1").rows[0]?.id

    if (adminRoleId) {
      const existingAdmin = query('SELECT id FROM users WHERE email = ? LIMIT 1', [adminEmail]).rows[0]
      if (!existingAdmin) {
        const adminPassword = process.env.ADMIN_PASSWORD
        const adminHash = await bcrypt.hash(adminPassword, 12)

        query(
          `INSERT INTO users (id, role_id, name, email, company, password_hash, active)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          ['admin-system', adminRoleId, adminName, adminEmail, 'Friendly Bill Book', adminHash],
        )
      }
    }

    // ── Business Settings ──────────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS business_settings (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL DEFAULT 'Friendly Bill Book',
        logo_url TEXT,
        business_type TEXT,
        owner_name TEXT,
        address_line_1 TEXT,
        address_line_2 TEXT,
        area TEXT,
        city TEXT,
        district TEXT,
        state TEXT,
        country TEXT DEFAULT 'India',
        pincode TEXT,
        phone TEXT,
        alternate_phone TEXT,
        email TEXT,
        website TEXT,
        gstin TEXT,
        pan TEXT,
        cin TEXT,
        udyam_number TEXT,
        other_registration_number TEXT,
        gst_type TEXT,
        default_gst_rate REAL DEFAULT 18.0,
        cgst_rate REAL,
        sgst_rate REAL,
        igst_rate REAL,
        tax_registration_state TEXT,
        bank_name TEXT,
        account_holder_name TEXT,
        account_number TEXT,
        ifsc_code TEXT,
        branch_name TEXT,
        upi_id TEXT,
        invoice_prefix TEXT DEFAULT 'INV',
        quotation_prefix TEXT DEFAULT 'QT',
        proforma_prefix TEXT DEFAULT 'PI',
        delivery_challan_prefix TEXT DEFAULT 'DC',
        credit_note_prefix TEXT DEFAULT 'CN',
        debit_note_prefix TEXT DEFAULT 'DN',
        starting_number INTEGER DEFAULT 1,
        default_payment_terms TEXT,
        default_notes TEXT,
        default_terms_conditions TEXT,
        signature_url TEXT,
        authorized_person_name TEXT,
        authorized_person_designation TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    // ── Customers ──────────────────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        whatsapp TEXT,
        gstin TEXT,
        pan TEXT,
        billing_address TEXT,
        shipping_address TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        credit_limit REAL DEFAULT 0,
        outstanding_balance REAL DEFAULT 0,
        status TEXT DEFAULT 'Active',
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
    ensureColumns('customers', {
      customer_code: 'TEXT',
      company_name: 'TEXT',
      mobile: 'TEXT',
      alternate_mobile: 'TEXT',
      customer_type: "TEXT DEFAULT 'Business'",
      opening_balance: 'REAL DEFAULT 0',
    })

    // ── Suppliers ─────────────────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        supplier_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        gstin TEXT,
        pan TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        status TEXT DEFAULT 'Active',
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    // ── Products ──────────────────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        product_name TEXT NOT NULL,
        sku TEXT,
        hsn TEXT,
        unit TEXT DEFAULT 'Nos',
        item_type TEXT DEFAULT 'Product',
        category TEXT,
        brand TEXT,
        description TEXT,
        purchase_price REAL DEFAULT 0,
        selling_price REAL DEFAULT 0,
        mrp REAL DEFAULT 0,
        gst REAL DEFAULT 18,
        stock_quantity REAL DEFAULT 0,
        min_stock_level REAL DEFAULT 0,
        status TEXT DEFAULT 'Active',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
    ensureColumns('products', {
      category_id: 'TEXT',
      supplier_id: 'TEXT',
      purchase_price: 'REAL DEFAULT 0',
      opening_stock: 'REAL DEFAULT 0',
      current_stock: 'REAL DEFAULT 0',
      minimum_stock: 'REAL DEFAULT 0',
    })

    // ── Invoices ──────────────────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        invoice_number TEXT NOT NULL,
        customer_id TEXT REFERENCES customers(id),
        invoice_date TEXT,
        due_date TEXT,
        customer_gstin TEXT,
        billing_address TEXT,
        shipping_address TEXT,
        subtotal REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        cgst REAL DEFAULT 0,
        sgst REAL DEFAULT 0,
        igst REAL DEFAULT 0,
        round_off REAL DEFAULT 0,
        grand_total REAL DEFAULT 0,
        status TEXT DEFAULT 'Draft',
        notes TEXT,
        terms_conditions TEXT,
        business_snapshot TEXT,
        created_by TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    ensureColumns('invoices', { amount_paid: 'REAL DEFAULT 0' })

    // ── Invoice Items ─────────────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        product_id TEXT REFERENCES products(id),
        description TEXT NOT NULL,
        hsn_sac TEXT,
        quantity REAL NOT NULL DEFAULT 1,
        rate REAL NOT NULL DEFAULT 0,
        discount REAL DEFAULT 0,
        tax_rate REAL DEFAULT 18,
        taxable_value REAL DEFAULT 0,
        cgst REAL DEFAULT 0,
        sgst REAL DEFAULT 0,
        igst REAL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    // ── Quotations ────────────────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS quotations (
        id TEXT PRIMARY KEY,
        quotation_number TEXT NOT NULL,
        customer_id TEXT REFERENCES customers(id),
        quotation_date TEXT,
        valid_until TEXT,
        customer_gstin TEXT,
        billing_address TEXT,
        shipping_address TEXT,
        subtotal REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        cgst REAL DEFAULT 0,
        sgst REAL DEFAULT 0,
        igst REAL DEFAULT 0,
        round_off REAL DEFAULT 0,
        grand_total REAL DEFAULT 0,
        status TEXT DEFAULT 'Draft',
        notes TEXT,
        terms_conditions TEXT,
        business_snapshot TEXT,
        created_by TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    // ── Quotation Items ───────────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS quotation_items (
        id TEXT PRIMARY KEY,
        quotation_id TEXT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
        product_id TEXT REFERENCES products(id),
        description TEXT NOT NULL,
        hsn_sac TEXT,
        quantity REAL NOT NULL DEFAULT 1,
        rate REAL NOT NULL DEFAULT 0,
        discount REAL DEFAULT 0,
        tax_rate REAL DEFAULT 18,
        taxable_value REAL DEFAULT 0,
        cgst REAL DEFAULT 0,
        sgst REAL DEFAULT 0,
        igst REAL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    // ── Proforma Invoices ─────────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS proforma_invoices (
        id TEXT PRIMARY KEY,
        proforma_number TEXT NOT NULL,
        customer_id TEXT REFERENCES customers(id),
        invoice_date TEXT,
        due_date TEXT,
        customer_gstin TEXT,
        billing_address TEXT,
        shipping_address TEXT,
        subtotal REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        cgst REAL DEFAULT 0,
        sgst REAL DEFAULT 0,
        igst REAL DEFAULT 0,
        round_off REAL DEFAULT 0,
        grand_total REAL DEFAULT 0,
        total REAL DEFAULT 0,
        status TEXT DEFAULT 'Draft',
        notes TEXT,
        terms_conditions TEXT,
        created_by TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    // ── Proforma Invoice Items ────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS proforma_invoice_items (
        id TEXT PRIMARY KEY,
        proforma_id TEXT NOT NULL REFERENCES proforma_invoices(id) ON DELETE CASCADE,
        product_id TEXT REFERENCES products(id),
        description TEXT NOT NULL,
        hsn_sac TEXT,
        quantity REAL NOT NULL DEFAULT 1,
        rate REAL NOT NULL DEFAULT 0,
        discount REAL DEFAULT 0,
        tax_rate REAL DEFAULT 18,
        taxable_value REAL DEFAULT 0,
        cgst REAL DEFAULT 0,
        sgst REAL DEFAULT 0,
        igst REAL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    // ── Delivery Challans ────────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS delivery_challans (
        id TEXT PRIMARY KEY,
        challan_number TEXT NOT NULL,
        customer_id TEXT REFERENCES customers(id),
        challan_date TEXT NOT NULL DEFAULT (date('now')),
        status TEXT NOT NULL DEFAULT 'Open',
        notes TEXT,
        created_by TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    // ── Purchase Orders ───────────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id TEXT PRIMARY KEY,
        order_number TEXT NOT NULL,
        supplier_id TEXT REFERENCES suppliers(id),
        order_date TEXT,
        delivery_date TEXT,
        status TEXT DEFAULT 'Pending',
        total REAL DEFAULT 0,
        notes TEXT,
        business_snapshot TEXT,
        created_by TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    // ── Payments ──────────────────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        payment_number TEXT NOT NULL,
        customer_id TEXT REFERENCES customers(id),
        invoice_id TEXT REFERENCES invoices(id),
        payment_date TEXT,
        amount REAL DEFAULT 0,
        payment_method TEXT DEFAULT 'Cash',
        reference_number TEXT,
        notes TEXT,
        status TEXT DEFAULT 'Received',
        created_by TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    // ── Expenses ──────────────────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        expense_number TEXT NOT NULL,
        expense_date TEXT,
        category TEXT,
        description TEXT,
        amount REAL DEFAULT 0,
        gst_amount REAL DEFAULT 0,
        total_amount REAL DEFAULT 0,
        payment_method TEXT DEFAULT 'Cash',
        vendor_name TEXT,
        receipt_url TEXT,
        notes TEXT,
        status TEXT DEFAULT 'Approved',
        created_by TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    // ── Leads ─────────────────────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        lead_name TEXT NOT NULL,
        company_name TEXT,
        email TEXT,
        phone TEXT,
        whatsapp TEXT,
        source TEXT,
        status TEXT DEFAULT 'New',
        assigned_to TEXT,
        notes TEXT,
        follow_up_date TEXT,
        created_by TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
    ensureColumns('leads', {
      lead_number: 'TEXT',
      lead_date: 'TEXT',
      customer_name: 'TEXT',
      company_name: 'TEXT',
      mobile: 'TEXT',
      email: 'TEXT',
      address: 'TEXT',
      city: 'TEXT',
      service_required: 'TEXT',
      product_required: 'TEXT',
      source: 'TEXT',
      assigned_staff: 'TEXT',
      status: "TEXT DEFAULT 'New'",
      priority: "TEXT DEFAULT 'Normal'",
      expected_value: 'REAL DEFAULT 0',
      follow_up_date: 'TEXT',
      notes: 'TEXT',
      sync_status: "TEXT DEFAULT 'pending'",
      last_synced_at: 'TEXT',
      google_sheets_row_id: 'TEXT',
      sync_error_message: 'TEXT',
    })

    // ── Stock Movements ───────────────────────────────────────────────────────
    query(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id),
        movement_type TEXT NOT NULL,
        quantity REAL NOT NULL,
        reference_number TEXT,
        notes TEXT,
        created_by TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    console.log('✓ Friendly Bill Book SQLite database initialized successfully')
    console.log(`  DB: data/friendlybillbook.db`)
  } catch (error) {
    console.error('Error initializing database:', error.message)
    throw error
  }
}
