import { query } from '../config/database.js'
import { z } from 'zod'

export const businessSettingsSchema = z.object({
  company_name: z.string().min(1),
  logo_url: z.string().optional(),
  business_type: z.string().optional(),
  owner_name: z.string().optional(),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  area: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  alternate_phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  cin: z.string().optional(),
  udyam_number: z.string().optional(),
  other_registration_number: z.string().optional(),
  gst_type: z.string().optional(),
  default_gst_rate: z.coerce.number().optional(),
  cgst_rate: z.coerce.number().optional(),
  sgst_rate: z.coerce.number().optional(),
  igst_rate: z.coerce.number().optional(),
  tax_registration_state: z.string().optional(),
  bank_name: z.string().optional(),
  account_holder_name: z.string().optional(),
  account_number: z.string().optional(),
  ifsc_code: z.string().optional(),
  branch_name: z.string().optional(),
  upi_id: z.string().optional(),
  invoice_prefix: z.string().optional(),
  quotation_prefix: z.string().optional(),
  proforma_prefix: z.string().optional(),
  delivery_challan_prefix: z.string().optional(),
  credit_note_prefix: z.string().optional(),
  debit_note_prefix: z.string().optional(),
  starting_number: z.coerce.number().optional(),
  default_payment_terms: z.string().optional(),
  default_notes: z.string().optional(),
  default_terms_conditions: z.string().optional(),
  signature_url: z.string().optional(),
  authorized_person_name: z.string().optional(),
  authorized_person_designation: z.string().optional(),
})

// Get or create the default business settings
export async function getBusinessSettings() {
  try {
    const result = await query('SELECT * FROM business_settings LIMIT 1')
    
    if (result.rows.length > 0) {
      return result.rows[0]
    }

    // If no settings exist, create default ones
    const defaultSettings = await query(
      `INSERT INTO business_settings (company_name) 
       VALUES ($1) 
       RETURNING *`,
      ['Friendly Bill Book']
    )

    return defaultSettings.rows[0]
  } catch (error) {
    console.error('Error fetching business settings:', error)
    throw error
  }
}

// Update business settings
export async function updateBusinessSettings(data) {
  try {
    const validated = businessSettingsSchema.partial().parse(data)
    
    // First check if settings exist
    const existing = await query('SELECT id FROM business_settings LIMIT 1')
    
    if (existing.rows.length === 0) {
      // Create new settings
      const columns = Object.keys(validated)
      const values = Object.values(validated)
      const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ')
      const columnNames = columns.join(', ')
      
      const result = await query(
        `INSERT INTO business_settings (${columnNames}) 
         VALUES (${placeholders}) 
         RETURNING *`,
        values
      )
      return result.rows[0]
    }

    // Update existing settings
    const entries = Object.entries(validated)
    if (entries.length === 0) {
      return existing.rows[0]
    }

    const updates = entries.map(([col], idx) => `${col} = $${idx + 1}`).join(', ')
    const values = entries.map(([, value]) => value)

    const result = await query(
      `UPDATE business_settings 
       SET ${updates}, updated_at = datetime('now') 
       WHERE id = (SELECT id FROM business_settings LIMIT 1)
       RETURNING *`,
      values
    )

    return result.rows[0]
  } catch (error) {
    console.error('Error updating business settings:', error)
    throw error
  }
}

// Get settings for a document snapshot (used when creating documents)
export async function getBusinessSettingsSnapshot() {
  const settings = await getBusinessSettings()
  
  return {
    company_name: settings.company_name,
    logo_url: settings.logo_url,
    address_line_1: settings.address_line_1,
    address_line_2: settings.address_line_2,
    city: settings.city,
    state: settings.state,
    pincode: settings.pincode,
    phone: settings.phone,
    email: settings.email,
    website: settings.website,
    gstin: settings.gstin,
    pan: settings.pan,
    bank_name: settings.bank_name,
    account_number: settings.account_number,
    ifsc_code: settings.ifsc_code,
    upi_id: settings.upi_id,
    default_payment_terms: settings.default_payment_terms,
    default_notes: settings.default_notes,
    default_terms_conditions: settings.default_terms_conditions,
    signature_url: settings.signature_url,
    authorized_person_name: settings.authorized_person_name,
  }
}
