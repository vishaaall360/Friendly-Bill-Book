/**
 * Document Sharing Service
 * Copyright © 2026 JB YOUR SAFE TECHNOLOGY. All Rights Reserved.
 * 
 * Handles sharing of business documents via WhatsApp and Gmail.
 * This is proprietary software - unauthorized use is prohibited.
 */

/**
 * Share via WhatsApp
 * Opens WhatsApp with pre-filled message
 */
export function shareViaWhatsApp(options) {
  const {
    recipientPhone,
    documentType = 'Document',
    documentNumber = '',
    documentDate = '',
    amount = 0,
    customerName = 'Valued Customer',
    documentUrl = '',
    additionalMessage = ''
  } = options

  // Validate phone number
  if (!recipientPhone) {
    return {
      success: false,
      error: 'WhatsApp number is not available. Please add it to the customer/lead record.'
    }
  }

  // Format phone number (remove any non-numeric characters and add country code if needed)
  let formattedPhone = recipientPhone.replace(/\D/g, '')
  if (!formattedPhone.startsWith('91') && !formattedPhone.startsWith('+91')) {
    formattedPhone = '91' + formattedPhone
  }

  // Create message
  const message = `Dear ${customerName},

Please find your ${documentType} from *Friendly Bill Book*.

📄 ${documentType} No: ${documentNumber}
📅 Date: ${documentDate}
💰 Amount: ₹${Number(amount || 0).toLocaleString('en-IN')}

${additionalMessage ? additionalMessage + '\n' : ''}Thank you for your business!`

  // Create WhatsApp URL
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`

  // Open in new window
  window.open(whatsappUrl, '_blank', 'width=800,height=600')

  return {
    success: true,
    message: 'Opening WhatsApp...'
  }
}

/**
 * Share via Email (Gmail)
 * Opens Gmail compose with pre-filled content
 */
export function shareViaGmail(options) {
  const {
    recipientEmail,
    documentType = 'Document',
    documentNumber = '',
    documentDate = '',
    amount = 0,
    customerName = 'Valued Customer',
    documentUrl = '',
    senderName = 'Friendly Bill Book Team',
    companyEmail = 'noreply@friendlybillbook.com',
    additionalMessage = ''
  } = options

  // Validate email
  if (!recipientEmail || !isValidEmail(recipientEmail)) {
    return {
      success: false,
      error: 'Customer email address is not available or invalid. Please add a valid email to the customer/lead record.'
    }
  }

  // Create subject
  const subject = `${documentType} ${documentNumber} - Friendly Bill Book`

  // Create email body
  const body = `Dear ${customerName},

Please find your ${documentType} from Friendly Bill Book.

${documentType} Details:
• ${documentType} No: ${documentNumber}
• Date: ${documentDate}
• Amount: ₹${Number(amount || 0).toLocaleString('en-IN')}

${additionalMessage ? additionalMessage + '\n' : ''}Thank you for your business!

Best Regards,
${senderName}
Friendly Bill Book`

  // Create Gmail URL
  const encodedSubject = encodeURIComponent(subject)
  const encodedBody = encodeURIComponent(body)
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${encodedSubject}&body=${encodedBody}`

  // Open Gmail
  window.open(gmailUrl, '_blank', 'width=800,height=600')

  return {
    success: true,
    message: 'Opening Gmail...'
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Get share button status
 * Returns whether sharing is possible and why if not
 */
export function getShareStatus(options) {
  const { whatsappNumber, email, documentNumber } = options

  const status = {
    canShareWhatsApp: !!whatsappNumber && documentNumber !== '',
    canShareEmail: !!email && isValidEmail(email) && documentNumber !== '',
    whatsappError: !whatsappNumber ? 'WhatsApp number not available' : documentNumber === '' ? 'Document not yet created' : null,
    emailError: !email ? 'Email not available' : !isValidEmail(email) ? 'Invalid email format' : documentNumber === '' ? 'Document not yet created' : null
  }

  return status
}

/**
 * Prepare WhatsApp share text for UI display
 */
export function getWhatsAppShareText(customerName, documentType, documentNumber) {
  return `Share via WhatsApp: ${customerName}'s ${documentType} (${documentNumber})`
}

/**
 * Prepare Gmail share text for UI display
 */
export function getEmailShareText(customerName, documentType, documentNumber) {
  return `Send via Email: ${customerName}'s ${documentType} (${documentNumber})`
}

export default {
  shareViaWhatsApp,
  shareViaGmail,
  getShareStatus,
  getWhatsAppShareText,
  getEmailShareText
}
