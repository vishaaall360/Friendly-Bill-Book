import React from 'react'

export function BusinessDetailsDisplay({ businessSnapshot, currentSettings }) {
  // Use snapshot if document is finalized, otherwise use current settings
  const data = businessSnapshot || currentSettings

  if (!data) {
    return <div className="business-details-placeholder">Business information not configured</div>
  }

  return (
    <div className="business-details-display">
      <div className="business-header">
        {data.logo_url && (
          <img src={data.logo_url} alt="Company Logo" className="company-logo" />
        )}
        <div className="company-info">
          <h2 className="company-name">{data.company_name}</h2>
          {data.business_type && <p className="business-type">{data.business_type}</p>}
        </div>
      </div>

      <div className="business-address">
        {data.address_line_1 && <p>{data.address_line_1}</p>}
        {data.address_line_2 && <p>{data.address_line_2}</p>}
        {data.area && <p>{data.area}</p>}
        <p>
          {data.city}
          {data.district && `, ${data.district}`}
          {data.state && `, ${data.state}`}
          {data.pincode && ` - ${data.pincode}`}
        </p>
      </div>

      <div className="business-contact">
        {data.phone && (
          <p>
            <strong>Phone:</strong> {data.phone}
          </p>
        )}
        {data.alternate_phone && (
          <p>
            <strong>Alt Phone:</strong> {data.alternate_phone}
          </p>
        )}
        {data.email && (
          <p>
            <strong>Email:</strong> <a href={`mailto:${data.email}`}>{data.email}</a>
          </p>
        )}
        {data.website && (
          <p>
            <strong>Website:</strong> <a href={data.website} target="_blank" rel="noopener noreferrer">{data.website}</a>
          </p>
        )}
      </div>

      <div className="business-registration">
        {data.gstin && (
          <p>
            <strong>GSTIN:</strong> {data.gstin}
          </p>
        )}
        {data.pan && (
          <p>
            <strong>PAN:</strong> {data.pan}
          </p>
        )}
        {data.cin && (
          <p>
            <strong>CIN:</strong> {data.cin}
          </p>
        )}
      </div>

      <div className="business-banking">
        {data.bank_name && (
          <div className="bank-section">
            <h4>Bank Details</h4>
            <p>
              <strong>Bank:</strong> {data.bank_name}
            </p>
            {data.account_holder_name && (
              <p>
                <strong>Account Holder:</strong> {data.account_holder_name}
              </p>
            )}
            {data.account_number && (
              <p>
                <strong>Account No:</strong> {data.account_number}
              </p>
            )}
            {data.ifsc_code && (
              <p>
                <strong>IFSC:</strong> {data.ifsc_code}
              </p>
            )}
          </div>
        )}

        {data.upi_id && (
          <div className="upi-section">
            <h4>UPI Details</h4>
            <p>{data.upi_id}</p>
          </div>
        )}
      </div>

      {data.default_payment_terms && (
        <div className="payment-terms">
          <h4>Payment Terms</h4>
          <p>{data.default_payment_terms}</p>
        </div>
      )}

      {data.default_terms_conditions && (
        <div className="terms-conditions">
          <h4>Terms & Conditions</h4>
          <p style={{ whiteSpace: 'pre-wrap' }}>{data.default_terms_conditions}</p>
        </div>
      )}

      {data.signature_url && (
        <div className="signature-section">
          <h4>Authorized Signature</h4>
          <img src={data.signature_url} alt="Authorized Signature" className="signature-image" />
          {data.authorized_person_name && (
            <p className="authorized-person">
              <strong>{data.authorized_person_name}</strong>
              {data.authorized_person_designation && <br />}
              {data.authorized_person_designation}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Display business details as a compact info box
export function BusinessDetailsBox({ businessSnapshot, currentSettings }) {
  const data = businessSnapshot || currentSettings

  if (!data) return null

  return (
    <div className="business-details-box">
      <div className="box-header">
        {data.logo_url && <img src={data.logo_url} alt="Logo" className="box-logo" />}
        <div>
          <h3>{data.company_name}</h3>
          {data.gstin && <p className="gst-box">GSTIN: {data.gstin}</p>}
        </div>
      </div>
      <div className="box-contact">
        {data.phone && <span>{data.phone}</span>}
        {data.email && <span>{data.email}</span>}
      </div>
    </div>
  )
}

export default BusinessDetailsDisplay
