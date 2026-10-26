import { FileSearch, Plus } from 'lucide-react'

function EmptyState({ title = 'Nothing here yet', message = 'Create your first record to start managing this workspace.', actionLabel, onAction }) {
	return <div className="empty-state"><div className="empty-state-icon"><FileSearch size={23} /></div><h2>{title}</h2><p>{message}</p>{actionLabel && <button className="button button-primary" onClick={onAction}><Plus size={16} /> {actionLabel}</button>}</div>
}
export default EmptyState
