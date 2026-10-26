import { Check, Eye } from 'lucide-react'
import { DOCUMENT_THEMES } from '../../constants/documentThemes'
import './TemplateGallery.css'

function ThemeDocumentPreview({ theme }) {
  return (
    <div
      className="theme-document-preview"
      style={{
        '--theme-primary': theme.primary,
        '--theme-secondary': theme.secondary,
        '--theme-accent': theme.accent,
        '--theme-dark': theme.dark,
        '--theme-background': theme.background,
      }}
    >
      <div className="theme-document-header">
        <strong>FRIENDLY BILL BOOK</strong>
        <span>TAX INVOICE</span>
      </div>
      <div className="theme-document-meta"><span>Bill To: Customer Name</span><span>No. INV-1042</span></div>
      <div className="theme-document-table">
        <span>DESCRIPTION</span><span>QTY</span><span>AMOUNT</span>
        <i /><i /><i />
        <i /><i /><i />
      </div>
      <div className="theme-document-total"><span>GRAND TOTAL</span><strong>Rs 14,800</strong></div>
    </div>
  )
}

function TemplateGallery({ onSelect, selectedId = null }) {
  return (
    <div className="template-gallery">
      <div className="gallery-header">
        <span className="eyebrow">DOCUMENT STYLE SYSTEM</span>
        <h2>Choose a document theme</h2>
        <p>One visual language for quotations, proforma invoices, GST invoices, and tax bills.</p>
      </div>

      <div className="templates-grid">
        {DOCUMENT_THEMES.map((template) => (
          <article
            key={template.id}
            className={`gallery-card ${selectedId === template.id ? 'selected' : ''}`}
            style={{ '--theme-primary': template.theme.primary, '--theme-background': template.theme.background }}
          >
            <div className="card-preview">
              <ThemeDocumentPreview theme={template.theme} />
            </div>
            <div className="card-info">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
            </div>
            <div className="card-actions">
              <button type="button" className="btn-preview" title={`Preview ${template.name}`}>
                <Eye size={16} /> Preview
              </button>
              <button type="button" className="btn-select" onClick={() => onSelect(template)}>
                {selectedId === template.id ? <><Check size={16} /> Selected</> : 'Use This Theme'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default TemplateGallery
