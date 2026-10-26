import { Navigate, useLocation } from 'react-router-dom'

function ProtectedRoute({ children, user }) {
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
