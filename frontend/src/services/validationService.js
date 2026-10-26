/**
 * Validation Service
 * Copyright © 2026 JB YOUR SAFE TECHNOLOGY. All Rights Reserved.
 * 
 * Comprehensive validation for business and customer data.
 * This is proprietary software - unauthorized use is prohibited.
 */

/**
 * Validate Indian GSTIN format (15 characters)
 * Format: 29ABCDE1234F1Z5
 */
export function validateGSTIN(gstin) {
  if (!gstin) return { valid: false, error: 'GSTIN is required' }
  
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  
  if (!gstinRegex.test(gstin.toUpperCase())) {
    return {
      valid: false,
      error: 'Invalid GSTIN format. Expected format: 29ABCDE1234F1Z5 (15 characters)'
    }
  }
  
  return { valid: true }
}

/**
 * Validate Indian PAN format (10 characters)
 * Format: ABCDE1234F
 */
export function validatePAN(pan) {
  if (!pan) return { valid: false, error: 'PAN is required' }
  
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  
  if (!panRegex.test(pan.toUpperCase())) {
    return {
      valid: false,
      error: 'Invalid PAN format. Expected format: ABCDE1234F (10 characters)'
    }
  }
  
  return { valid: true }
}

/**
 * Validate Indian phone number (10 digits, starting with 6-9)
 */
export function validatePhone(phone) {
  if (!phone) return { valid: false, error: 'Phone number is required' }
  
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length !== 10) {
    return {
      valid: false,
      error: 'Phone number must be 10 digits'
    }
  }
  
  if (!/^[6-9]/.test(cleaned)) {
    return {
      valid: false,
      error: 'Phone number must start with 6-9'
    }
  }
  
  return { valid: true }
}

/**
 * Validate WhatsApp number (similar to phone, but more flexible)
 */
export function validateWhatsAppNumber(number) {
  if (!number) return { valid: false, error: 'WhatsApp number is required' }
  
  const cleaned = number.replace(/\D/g, '')
  
  if (cleaned.length < 10) {
    return {
      valid: false,
      error: 'WhatsApp number must be at least 10 digits'
    }
  }
  
  return { valid: true }
}

/**
 * Validate email address
 */
export function validateEmail(email) {
  if (!email) return { valid: false, error: 'Email is required' }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Invalid email format'
    }
  }
  
  return { valid: true }
}

/**
 * Validate bank IFSC code (11 characters)
 * Format: ABCD0123456
 */
export function validateIFSC(ifsc) {
  if (!ifsc) return { valid: false, error: 'IFSC code is required' }
  
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
  
  if (!ifscRegex.test(ifsc.toUpperCase())) {
    return {
      valid: false,
      error: 'Invalid IFSC code format. Expected format: ABCD0123456 (11 characters)'
    }
  }
  
  return { valid: true }
}

/**
 * Validate UPI ID
 * Format: username@bankname
 */
export function validateUPI(upi) {
  if (!upi) return { valid: false, error: 'UPI ID is required' }
  
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/
  
  if (!upiRegex.test(upi.toLowerCase())) {
    return {
      valid: false,
      error: 'Invalid UPI format. Expected format: username@bankname'
    }
  }
  
  return { valid: true }
}

/**
 * Validate Indian postal code (6 digits)
 */
export function validatePincode(pincode) {
  if (!pincode) return { valid: false, error: 'Postal code is required' }
  
  const pincodeRegex = /^[1-9]{1}[0-9]{5}$/
  
  if (!pincodeRegex.test(pincode)) {
    return {
      valid: false,
      error: 'Invalid postal code. Expected 6 digits starting with 1-9'
    }
  }
  
  return { valid: true }
}

/**
 * Validate bank account number (10-18 digits)
 */
export function validateAccountNumber(accountNumber) {
  if (!accountNumber) return { valid: false, error: 'Account number is required' }
  
  const cleaned = accountNumber.replace(/\D/g, '')
  
  if (cleaned.length < 10 || cleaned.length > 18) {
    return {
      valid: false,
      error: 'Account number should be 10-18 digits'
    }
  }
  
  return { valid: true }
}

/**
 * Validate business name (minimum 3 characters)
 */
export function validateBusinessName(name) {
  if (!name) return { valid: false, error: 'Business name is required' }
  
  if (name.trim().length < 3) {
    return {
      valid: false,
      error: 'Business name must be at least 3 characters'
    }
  }
  
  return { valid: true }
}

/**
 * Validate amount (positive number)
 */
export function validateAmount(amount) {
  const num = Number(amount)
  
  if (isNaN(num)) {
    return {
      valid: false,
      error: 'Amount must be a valid number'
    }
  }
  
  if (num < 0) {
    return {
      valid: false,
      error: 'Amount cannot be negative'
    }
  }
  
  return { valid: true }
}

/**
 * Validate CIN (Corporate Identification Number) - 21 characters
 */
export function validateCIN(cin) {
  if (!cin) return { valid: false, error: 'CIN is required' }
  
  const cinRegex = /^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/
  
  if (!cinRegex.test(cin.toUpperCase())) {
    return {
      valid: false,
      error: 'Invalid CIN format. Expected 21 characters'
    }
  }
  
  return { valid: true }
}

/**
 * Validate website URL
 */
export function validateWebsite(website) {
  if (!website) return { valid: true } // Optional field
  
  try {
    new URL(website)
    return { valid: true }
  } catch {
    return {
      valid: false,
      error: 'Invalid website URL format'
    }
  }
}

/**
 * Get validation messages in user-friendly format
 */
export function getFieldValidationMessage(fieldName, fieldValue, fieldType) {
  const validationMap = {
    'gstin': validateGSTIN,
    'pan': validatePAN,
    'phone': validatePhone,
    'mobile': validatePhone,
    'whatsapp': validateWhatsAppNumber,
    'email': validateEmail,
    'ifsc': validateIFSC,
    'upi': validateUPI,
    'pincode': validatePincode,
    'postal_code': validatePincode,
    'account_number': validateAccountNumber,
    'business_name': validateBusinessName,
    'company_name': validateBusinessName,
    'amount': validateAmount,
    'cin': validateCIN,
    'website': validateWebsite
  }
  
  const validator = validationMap[fieldType?.toLowerCase()] || validationMap[fieldName?.toLowerCase()]
  
  if (!validator) {
    return { valid: true }
  }
  
  return validator(fieldValue)
}

export default {
  validateGSTIN,
  validatePAN,
  validatePhone,
  validateWhatsAppNumber,
  validateEmail,
  validateIFSC,
  validateUPI,
  validatePincode,
  validateAccountNumber,
  validateBusinessName,
  validateAmount,
  validateCIN,
  validateWebsite,
  getFieldValidationMessage
}
