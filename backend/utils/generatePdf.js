import PDFDocument from 'pdfkit'

export function generatePdf(invoice, response) {
  const document = new PDFDocument({ size: 'A4', margin: 48 })
  document.pipe(response)
  const companyName = invoice.company_name || 'JB YOUR SAFE TECHNOLOGY'
  const address = [invoice.address_line_1, invoice.address_line_2, invoice.city, invoice.state, invoice.pincode].filter(Boolean).join(', ')
  document.fontSize(22).fillColor('#12345a').text(companyName)
  document.fontSize(10).fillColor('#333').text('Business CRM & Management').moveDown()
  if (address) document.text(address)
  if (invoice.phone || invoice.email) document.text([invoice.phone, invoice.email].filter(Boolean).join(' | '))
  document.fontSize(15).text(`Tax Invoice: ${invoice.invoice_number}`, { align: 'right' })
  document.fontSize(10).text(`Invoice date: ${invoice.invoice_date || ''}`, { align: 'right' })
  document.moveDown(2).fontSize(11).text(`Customer: ${invoice.customer_name || invoice.customer_id}`)
  document.text(`GSTIN: ${invoice.customer_gstin || 'N/A'}`)
  document.moveDown().text('Invoice summary', { underline: true })
  document.moveDown().text(`Subtotal: Rs. ${invoice.subtotal}`)
  document.text(`CGST: Rs. ${invoice.cgst}`)
  document.text(`SGST: Rs. ${invoice.sgst}`)
  document.text(`IGST: Rs. ${invoice.igst}`)
  document.fontSize(14).text(`Grand total: Rs. ${invoice.grand_total}`)
  document.fontSize(10).moveDown(2).text(`© ${new Date().getFullYear()} ${companyName}. All Rights Reserved.`).end()
  return document
}
