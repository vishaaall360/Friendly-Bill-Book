/**
 * Google Sheets Synchronization Service
 * Copyright © 2026 Friendly Bill Book. All Rights Reserved.
 * 
 * Synchronizes all business records (Invoices, Quotations, Customers, Products, Leads, Payments, Expenses)
 * to Google Sheets as live cloud backup sheets.
 */

import { google } from 'googleapis'
import { environment } from '../config/env.js'
import { query } from '../config/database.js'

class GoogleSheetsService {
  constructor() {
    this.sheetsAPI = null
    this.auth = null
    this.spreadsheetId = environment.googleSheetsId
    this.isConfigured = this.validateConfiguration()
  }

  validateConfiguration() {
    const hasAnyConfiguration = Boolean(
      this.spreadsheetId ||
      environment.googleServiceAccountEmail ||
      environment.googlePrivateKey ||
      environment.googleProjectId
    )

    if (!hasAnyConfiguration) return false

    if (!this.spreadsheetId) {
      console.warn('⚠️ Google Sheets ID is missing.')
      return false
    }

    if (!environment.googleServiceAccountEmail || !environment.googlePrivateKey) {
      console.warn('⚠️ Google service account credentials not configured.')
      return false
    }

    try {
      this.auth = new google.auth.GoogleAuth({
        credentials: {
          type: 'service_account',
          project_id: environment.googleProjectId,
          private_key_id: environment.googlePrivateKeyId,
          private_key: environment.googlePrivateKey?.replace(/\\n/g, '\n'),
          client_email: environment.googleServiceAccountEmail,
          client_id: environment.googleClientId,
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs'
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      })

      this.sheetsAPI = google.sheets({ version: 'v4', auth: this.auth })
      return true
    } catch (error) {
      console.error('❌ Error initializing Google Sheets service:', error.message)
      return false
    }
  }

  async syncSheetTab(sheetTitle, headers, rows) {
    if (!this.isConfigured || !this.sheetsAPI) {
      return { success: false, reason: 'Google Sheets service account not configured' }
    }

    try {
      // Check if sheet exists, or create sheet tab
      const meta = await this.sheetsAPI.spreadsheets.get({ spreadsheetId: this.spreadsheetId })
      const existingSheet = meta.data.sheets?.find(s => s.properties?.title === sheetTitle)
      if (!existingSheet) {
        await this.sheetsAPI.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          resource: {
            requests: [{ addSheet: { properties: { title: sheetTitle } } }]
          }
        })
      }

      // Write values
      const values = [headers, ...rows]
      await this.sheetsAPI.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetTitle}!A1:Z${values.length + 10}`,
        valueInputOption: 'RAW',
        resource: { values }
      })

      return { success: true, count: rows.length }
    } catch (err) {
      console.error(`Error syncing sheet tab ${sheetTitle}:`, err.message)
      return { success: false, error: err.message }
    }
  }

  async syncAllBusinessData() {
    const summary = {}

    // 1. Invoices
    try {
      const inv = await query('SELECT * FROM invoices ORDER BY created_at DESC')
      const invHeaders = ['Invoice Number', 'Customer ID', 'Date', 'Due Date', 'Subtotal', 'Tax (CGST+SGST)', 'Discount', 'Grand Total', 'Status', 'Notes']
      const invRows = inv.rows.map(r => [
        r.invoice_number, r.customer_id, String(r.invoice_date || '').slice(0, 10), String(r.due_date || '').slice(0, 10),
        r.subtotal, Number(r.cgst || 0) + Number(r.sgst || 0), r.discount, r.grand_total, r.status, r.notes || ''
      ])
      summary.invoices = await this.syncSheetTab('Invoices', invHeaders, invRows)
    } catch (e) {
      summary.invoices = { success: false, error: e.message }
    }

    // 2. Quotations
    try {
      const quotes = await query('SELECT * FROM quotations ORDER BY created_at DESC')
      const quoteHeaders = ['Quotation #', 'Customer ID', 'Date', 'Valid Until', 'Subtotal', 'Tax', 'Total', 'Status', 'Notes']
      const quoteRows = quotes.rows.map(r => [
        r.quotation_number, r.customer_id, String(r.quotation_date || '').slice(0, 10), String(r.valid_until || '').slice(0, 10),
        r.subtotal, r.tax, r.total, r.status, r.notes || ''
      ])
      summary.quotations = await this.syncSheetTab('Quotations', quoteHeaders, quoteRows)
    } catch (e) {
      summary.quotations = { success: false, error: e.message }
    }

    // 3. Customers
    try {
      const cust = await query('SELECT * FROM customers ORDER BY created_at DESC')
      const custHeaders = ['Customer Name', 'Company Name', 'Mobile', 'Email', 'GSTIN', 'City', 'State', 'Address']
      const custRows = cust.rows.map(r => [
        r.customer_name, r.company_name, r.mobile, r.email, r.gstin, r.city, r.state, r.address
      ])
      summary.customers = await this.syncSheetTab('Customers', custHeaders, custRows)
    } catch (e) {
      summary.customers = { success: false, error: e.message }
    }

    // 4. Products / Inventory
    try {
      const prod = await query('SELECT * FROM products ORDER BY created_at DESC')
      const prodHeaders = ['Product Name', 'Item Type', 'SKU', 'Unit', 'Selling Price', 'Purchase Price', 'GST Rate', 'Current Stock', 'Min Stock']
      const prodRows = prod.rows.map(r => [
        r.product_name, r.item_type || 'Product', r.sku, r.unit, r.selling_price, r.purchase_price, r.gst, r.current_stock, r.minimum_stock
      ])
      summary.products = await this.syncSheetTab('Products', prodHeaders, prodRows)
    } catch (e) {
      summary.products = { success: false, error: e.message }
    }

    // 5. Leads / Enquiries
    try {
      const leads = await query('SELECT * FROM leads ORDER BY created_at DESC')
      const leadHeaders = ['Lead #', 'Customer Name', 'Company', 'Mobile', 'Email', 'Source', 'Product Required', 'Expected Value', 'Status']
      const leadRows = leads.rows.map(r => [
        r.lead_number, r.customer_name, r.company_name, r.mobile, r.email, r.source, r.product_required, r.expected_value, r.status
      ])
      summary.leads = await this.syncSheetTab('Leads', leadHeaders, leadRows)
    } catch (e) {
      summary.leads = { success: false, error: e.message }
    }

    // 6. Payments
    try {
      const pay = await query('SELECT * FROM payments ORDER BY created_at DESC')
      const payHeaders = ['Payment #', 'Customer ID', 'Invoice ID', 'Date', 'Amount', 'Payment Method', 'Reference', 'Notes']
      const payRows = pay.rows.map(r => [
        r.payment_number, r.customer_id, r.invoice_id, String(r.payment_date || '').slice(0, 10), r.amount, r.payment_method, r.reference_number, r.notes || ''
      ])
      summary.payments = await this.syncSheetTab('Payments', payHeaders, payRows)
    } catch (e) {
      summary.payments = { success: false, error: e.message }
    }

    // 7. Expenses
    try {
      const exp = await query('SELECT * FROM expenses ORDER BY created_at DESC')
      const expHeaders = ['Expense #', 'Date', 'Category', 'Amount', 'Payment Method', 'Description']
      const expRows = exp.rows.map(r => [
        r.expense_number, String(r.expense_date || '').slice(0, 10), r.category, r.amount, r.payment_method, r.description || ''
      ])
      summary.expenses = await this.syncSheetTab('Expenses', expHeaders, expRows)
    } catch (e) {
      summary.expenses = { success: false, error: e.message }
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      summary,
    }
  }
}

export const googleSheetsService = new GoogleSheetsService()
export default googleSheetsService
