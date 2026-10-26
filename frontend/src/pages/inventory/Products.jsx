import ResourcePage from '../../components/common/ResourcePage'

function Products() {
  return (
    <ResourcePage
      title="Products / Materials"
      description="Manage pricing, stock levels, item types (Product, Raw Material, Service), suppliers, and inventory details."
      endpoint="/inventory/products"
      fields={[
        { name: 'product_name', label: 'Item / Product Name', placeholder: 'e.g. Standard Billing Software, Iron Rod, Box Pack' },
        { name: 'item_type', label: 'Item Type', options: ['Product', 'Raw Material', 'Finished Good', 'Service', 'Consumable'], default: 'Product' },
        { name: 'sku', label: 'SKU / Item Code', placeholder: 'e.g. PRD-001' },
        { name: 'hsn', label: 'HSN / SAC Code', placeholder: 'e.g. 998313 / 8424', required: false },
        { name: 'unit', label: 'Unit of Measure', options: ['pcs', 'nos', 'box', 'kg', 'ltr', 'meter', 'service', 'set', 'bag', 'hour'] },
        { name: 'selling_price', label: 'Selling Price (₹)', type: 'number', min: 0 },
        { name: 'purchase_price', label: 'Purchase Cost (₹)', type: 'number', min: 0 },
        { name: 'gst', label: 'Tax / GST Rate (%)', options: ['0', '5', '12', '18', '28'], required: false },
        { name: 'opening_stock', label: 'Opening Stock', type: 'number', min: 0, required: false },
        { name: 'current_stock', label: 'Current Stock', type: 'number', min: 0, required: false },
        { name: 'minimum_stock', label: 'Low Stock Alert Level', type: 'number', min: 0, required: false },
        { name: 'description', label: 'Description / Specifications', type: 'textarea', required: false }
      ]}
      columns={[
        { key: 'product_name', label: 'Product / Item' },
        { key: 'item_type', label: 'Type' },
        { key: 'sku', label: 'SKU / Code' },
        { key: 'unit', label: 'Unit' },
        { key: 'current_stock', label: 'Current Stock' },
        { key: 'selling_price', label: 'Selling Price (₹)' },
      ]}
      formDefaults={{
        item_type: 'Product',
        unit: 'pcs',
        gst: '18',
        purchase_price: 0,
        selling_price: 0,
        opening_stock: 0,
        current_stock: 0,
        minimum_stock: 5,
      }}
    />
  )
}

export default Products
