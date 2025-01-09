import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

function LoginRoute({ children }) {
   const { isAuthenticated, loading } = useSelector((state) => state.auth)

   if (loading) return null

   if (isAuthenticated) {
      return <Navigate to="/" />
   }

   return children
}

export default LoginRoute
