function Breadcrumb({ items = [] }) { return <nav aria-label="Breadcrumb">{items.join(' / ')}</nav> }
export default Breadcrumb
