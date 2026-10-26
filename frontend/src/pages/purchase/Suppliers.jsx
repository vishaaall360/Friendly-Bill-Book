import ResourcePage from '../../components/common/ResourcePage'

function Suppliers() {
	return <ResourcePage title="Suppliers" description="Manage supplier contacts, tax details, payment terms, and balances." endpoint="/suppliers" fields={[{ name: 'supplier_code', label: 'Supplier code', placeholder: 'SUP-0002' }, { name: 'supplier_name', label: 'Supplier name' }, { name: 'company_name', label: 'Company', required: false }, { name: 'mobile', label: 'Phone', type: 'tel' }, { name: 'email', label: 'Email', type: 'email', required: false }, { name: 'address', label: 'Address', type: 'textarea', required: false }, { name: 'city', label: 'City', required: false }, { name: 'state', label: 'State', required: false }, { name: 'pincode', label: 'PIN code', required: false }, { name: 'gstin', label: 'GSTIN', required: false }, { name: 'pan', label: 'PAN', required: false }, { name: 'opening_balance', label: 'Opening balance', type: 'number', min: 0, required: false }, { name: 'notes', label: 'Notes', type: 'textarea', required: false }]} columns={[{ key: 'supplier_code', label: 'Code' }, { key: 'supplier_name', label: 'Supplier' }, { key: 'company_name', label: 'Company' }, { key: 'mobile', label: 'Phone' }, { key: 'city', label: 'Location' }]} formDefaults={{ opening_balance: 0 }} />
}

export default Suppliers
