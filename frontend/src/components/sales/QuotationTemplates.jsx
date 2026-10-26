import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { DOCUMENT_THEMES, DEFAULT_DOCUMENT_THEME } from '../../constants/documentThemes'
import './QuotationTemplates.css'

function QuotationTemplates({ onSelectTemplate, selectedTemplateId = null }) {
  const [showModal, setShowModal] = useState(false)
  const selectedTemplate = DOCUMENT_THEMES.find((template) => template.id === selectedTemplateId) || DEFAULT_DOCUMENT_THEME

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template)
    setShowModal(false)
  }

  return (
    <div className="document-theme-selector">
      <div className="selected-theme-display">
        <div>
          <span className="label-text">Document Theme</span>
          <p className="selected-theme-help">Apply one visual style across quotations, proforma invoices, GST invoices, and tax bills.</p>
        </div>
        <button type="button" className="button button-secondary" onClick={() => setShowModal(true)}>
          Change Theme
        </button>
      </div>

      <button
        type="button"
        className="selected-theme-chip"
        style={{ '--theme-primary': selectedTemplate.theme.primary, '--theme-background': selectedTemplate.theme.background }}
        onClick={() => setShowModal(true)}
      >
        <span className="theme-swatch" aria-hidden="true" />
        <span>{selectedTemplate.name}</span>
        <Check size={16} aria-label="Active theme" />
      </button>

      {showModal && (
        <div className="templates-modal-overlay" role="presentation" onClick={() => setShowModal(false)}>
          <div className="templates-modal" role="dialog" aria-modal="true" aria-labelledby="document-theme-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">DOCUMENT STYLE</span>
                <h3 id="document-theme-title">Choose a document theme</h3>
              </div>
              <button type="button" className="close-button" onClick={() => setShowModal(false)} aria-label="Close theme selector">
                <X size={20} />
              </button>
            </div>

            <div className="theme-options-grid">
              {DOCUMENT_THEMES.map((template) => (
                <button
                  type="button"
                  key={template.id}
                  className={`document-theme-option ${selectedTemplate.id === template.id ? 'active' : ''}`}
                  style={{
                    '--theme-primary': template.theme.primary,
                    '--theme-secondary': template.theme.secondary,
                    '--theme-accent': template.theme.accent,
                    '--theme-dark': template.theme.dark,
                    '--theme-background': template.theme.background,
                  }}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <span className="theme-option-preview">
                    <span className="theme-preview-top" />
                    <span className="theme-preview-lines"><i /><i /><i /></span>
                    <strong>Rs 14,800</strong>
                  </span>
                  <span className="theme-option-copy">
                    <strong>{template.name}</strong>
                    <span>{template.description}</span>
                  </span>
                  {selectedTemplate.id === template.id && <Check className="theme-active-check" size={18} aria-label="Selected" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { DOCUMENT_THEMES }
export default QuotationTemplates
