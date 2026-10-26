/**
 * Document Share Buttons Component
 * Displays WhatsApp and Email share buttons for documents
 */

import { MessageCircle, Mail } from 'lucide-react'
import { shareViaWhatsApp, shareViaGmail, getShareStatus } from '../../services/sharingService'

export function DocumentShareButtons({ 
  document,
  customer,
  documentType = 'Document'
}) {
  const shareStatus = getShareStatus({
    whatsappNumber: customer?.mobile || customer?.whatsapp_number,
    email: customer?.email,
    documentNumber: document?.document_number || document?.invoice_number || document?.quotation_number || document?.order_number
  })

  const handleWhatsAppShare = () => {
    if (!shareStatus.canShareWhatsApp) {
      alert(shareStatus.whatsappError || 'Cannot share via WhatsApp')
      return
    }

    const result = shareViaWhatsApp({
      recipientPhone: customer?.mobile || customer?.whatsapp_number,
      documentType,
      documentNumber: document?.document_number || document?.invoice_number || document?.quotation_number || document?.order_number,
      documentDate: document?.date || document?.created_at ? new Date(document?.date || document?.created_at).toLocaleDateString('en-IN') : '',
      amount: document?.total_amount || document?.grand_total || 0,
      customerName: customer?.customer_name || 'Valued Customer',
      additionalMessage: document?.notes || ''
    })

    if (!result.success) {
      alert(result.error)
    }
  }

  const handleEmailShare = () => {
    if (!shareStatus.canShareEmail) {
      alert(shareStatus.emailError || 'Cannot send via email')
      return
    }

    const result = shareViaGmail({
      recipientEmail: customer?.email,
      documentType,
      documentNumber: document?.document_number || document?.invoice_number || document?.quotation_number || document?.order_number,
      documentDate: document?.date || document?.created_at ? new Date(document?.date || document?.created_at).toLocaleDateString('en-IN') : '',
      amount: document?.total_amount || document?.grand_total || 0,
      customerName: customer?.customer_name || 'Valued Customer',
      additionalMessage: document?.notes || ''
    })

    if (!result.success) {
      alert(result.error)
    }
  }

  return (
    <div className="share-buttons-group">
      <button
        onClick={handleWhatsAppShare}
        disabled={!shareStatus.canShareWhatsApp}
        className={`btn btn-sm ${shareStatus.canShareWhatsApp ? 'btn-success' : 'btn-disabled'}`}
        title={shareStatus.whatsappError || 'Share via WhatsApp'}
      >
        <MessageCircle size={16} />
        WhatsApp
      </button>

      <button
        onClick={handleEmailShare}
        disabled={!shareStatus.canShareEmail}
        className={`btn btn-sm ${shareStatus.canShareEmail ? 'btn-info' : 'btn-disabled'}`}
        title={shareStatus.emailError || 'Send via Email'}
      >
        <Mail size={16} />
        Email
      </button>
    </div>
  )
}

export default DocumentShareButtons
