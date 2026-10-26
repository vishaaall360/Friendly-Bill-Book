import { Navigate, useLocation } from 'react-router-dom'

function PublicRoute({ children, user }) {
  const location = useLocation()

  if (user) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />
  }

  return children
}

export default PublicRoute
